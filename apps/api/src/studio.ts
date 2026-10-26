import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor,type Actor} from "./auth.js";
import {hashPassword,normalizeEmail,validateArtwork} from "./security.js";
type Row=RowDataPacket & Record<string,any>;
async function rows(sql:string,values:unknown[]=[]):Promise<Row[]>{
  const [result]=await pool.execute<RowDataPacket[]>(sql,values);
  return result as Row[];
}
const fail=(reply:FastifyReply,code=403)=>reply.code(code).send({error:code===403?"forbidden":code===404?"not_found":"bad_request"});
const validId=(value:unknown):value is string=>typeof value==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(value);
const text=(s:unknown,max:number)=>typeof s==="string"&&s.trim().length>0&&s.trim().length<=max?s.trim():null;
async function log(user:string,action:string,target:string,id:string){
  await pool.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",[randomUUID(),user,action,target,id]);
}
export async function teamManager(actor:Actor,teamId:string){
  if(actor.isAdmin)return true;
  return (await rows("SELECT 1 FROM team_members WHERE user_id=? AND team_id=? AND role='manager'",[actor.id,teamId])).length>0;
}
export async function seriesPermission(actor:Actor,sid:string,kind:"read"|"edit"|"publish"){
  if(actor.isAdmin)return true;
  if((await rows(`SELECT 1 FROM series_teams st JOIN team_members m ON m.team_id=st.team_id
    WHERE st.series_id=? AND m.user_id=? AND m.role='manager' LIMIT 1`,[sid,actor.id])).length)return true;
  const grants=await rows(`SELECT g.permission,m.role FROM series_grants g
     JOIN team_members m ON m.team_id=g.team_id AND m.user_id=g.user_id
     JOIN series_teams st ON st.series_id=g.series_id AND st.team_id=g.team_id
     WHERE g.series_id=? AND g.user_id=? AND m.role IN ('editor','publisher')`,[sid,actor.id]);
  if(kind==="read")return grants.length>0;
  if(kind==="publish")return grants.some(g=>g.permission==="publish"&&g.role==="publisher");
  return grants.some(g=>g.permission==="edit"||g.permission==="publish");
}
export function registerStudio(app:FastifyInstance){
  app.get("/api/v1/studio/bootstrap",async(req,reply)=>{
    reply.header("Cache-Control","no-store");
    const user=await requireActor(req,reply);if(!user)return;
    const teams=await rows(user.isAdmin?"SELECT id,name,description FROM teams ORDER BY name":
      "SELECT t.id,t.name,t.description FROM teams t JOIN team_members m ON m.team_id=t.id WHERE m.user_id=?",[...(user.isAdmin?[]:[user.id])]);
    const all=await rows("SELECT id,title,slug,category,summary,poster,banner,featured,visibility FROM series ORDER BY title");
    const permitted=[];
    for(const s of all)if(await seriesPermission(user,s.id,"read"))permitted.push(s);
    const ids=permitted.map(s=>String(s.id));
    const q=(arr:string[])=>arr.map(()=>"?").join(",");
    const links=ids.length?await rows("SELECT series_id,team_id FROM series_teams WHERE series_id IN("+q(ids)+")",ids):[];
    const seasons=ids.length?await rows("SELECT id,series_id,number,title,status FROM seasons WHERE series_id IN("+q(ids)+")",ids):[];
    const seasonIds=seasons.map(x=>String(x.id));
    const episodes=seasonIds.length?await rows("SELECT id,season_id,number,title,summary,youtube_id,thumbnail,release_at,end_at,status,duration FROM episodes WHERE season_id IN("+q(seasonIds)+")",seasonIds):[];
    const members=await rows(user.isAdmin?"SELECT m.team_id,m.user_id,m.role,u.name,u.email FROM team_members m JOIN users u ON u.id=m.user_id":
      `SELECT m.team_id,m.user_id,m.role,u.name,u.email FROM team_members m JOIN users u ON u.id=m.user_id
      WHERE m.user_id=? OR EXISTS (SELECT 1 FROM team_members own WHERE own.team_id=m.team_id AND own.user_id=? AND own.role='manager')`,user.isAdmin?[]:[user.id,user.id]);
    const dt=(v:unknown)=>v?String(v).replace(" ","T").slice(0,19)+"Z":"";
    const [bannerRows,sectionRows]=user.isAdmin?await Promise.all([
      rows("SELECT id,title,subtitle,image,mobile_image,target_series_id,start_at,end_at,active,display_order FROM banners ORDER BY display_order"),
      rows("SELECT id,title,kind,active FROM home_sections ORDER BY display_order")
    ]):[[],[]];
    return {
      user:{id:user.id,email:user.email,name:user.name,isAdmin:user.isAdmin},
      teams,
      members:members.map(m=>({id:m.user_id,teamId:m.team_id,role:m.role,name:m.name,email:m.email})),
      series:permitted.map(s=>({id:s.id,title:s.title,slug:s.slug,category:s.category,summary:s.summary,poster:s.poster,banner:s.banner,featured:!!s.featured,visibility:s.visibility,teamIds:links.filter(x=>x.series_id===s.id).map(x=>x.team_id)})),
      seasons:seasons.map(s=>({id:s.id,seriesId:s.series_id,number:s.number,title:s.title,status:s.status})),
      episodes:episodes.map(e=>({id:e.id,seasonId:e.season_id,number:e.number,title:e.title,summary:e.summary,
        youtube:e.youtube_id||"",thumbnail:e.thumbnail,releaseAt:dt(e.release_at),endAt:dt(e.end_at),status:e.status,duration:e.duration})),
      banners:bannerRows.map(b=>({id:b.id,title:b.title,subtitle:b.subtitle,image:b.image,mobileImage:b.mobile_image||"",
        target:b.target_series_id,startAt:dt(b.start_at),endAt:dt(b.end_at),active:!!b.active,order:b.display_order})),
      homeSections:sectionRows.map(h=>({id:h.id,title:h.title,kind:h.kind,active:!!h.active}))
    };
  });
  app.post<{Body:{name?:unknown;email?:unknown;password?:unknown}}>("/api/v1/studio/users",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!actor.isAdmin)return fail(reply);
    const name=text(req.body?.name,160),email=normalizeEmail(req.body?.email),password=req.body?.password;
    if(!name||!email||typeof password!=="string"||password.length<12||password.length>128)return fail(reply,400);
    if((await rows("SELECT 1 FROM users WHERE email=?",[email])).length)return reply.code(409).send({error:"email_exists"});
    const id=randomUUID();
    await pool.execute("INSERT INTO users(id,email,name,password_hash) VALUES(?,?,?,?)",[id,email,name,await hashPassword(password)]);
    await log(actor.id,"user.created","user",id);
    return reply.code(201).send({id,name,email});
  });
  app.put<{Params:{teamId:string};Body:{email?:unknown;role?:unknown}}>("/api/v1/studio/teams/:teamId/members",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const teamId=req.params.teamId,email=normalizeEmail(req.body?.email),role=req.body?.role;
    if(!validId(teamId))return fail(reply,404);
    if(!await teamManager(actor,teamId))return fail(reply);
    if(!email||!["manager","editor","publisher","viewer"].includes(String(role)))return fail(reply,400);
    if(role==="manager"&&!actor.isAdmin)return fail(reply);
    const existing=await rows("SELECT id FROM users WHERE email=? AND active=1",[email]);
    if(!existing.length)return fail(reply,404);
    if(!(await rows("SELECT 1 FROM teams WHERE id=?",[teamId])).length)return fail(reply,404);
    await pool.execute("INSERT INTO team_members(team_id,user_id,role) VALUES(?,?,?) ON DUPLICATE KEY UPDATE role=VALUES(role)",[teamId,existing[0].id,role]);
    await log(actor.id,"member.assigned","team",teamId);
    return {ok:true};
  });
  app.put<{Params:{id:string};Body:{teamId?:unknown;userId?:unknown;permission?:unknown}}>("/api/v1/studio/series/:id/grants",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const sid=req.params.id,teamId=req.body?.teamId,userId=req.body?.userId,perm=req.body?.permission;
    if(!validId(sid)||!validId(teamId)||!validId(userId)||!["edit","publish"].includes(String(perm)))return fail(reply,400);
    if(!await teamManager(actor,teamId))return fail(reply);
    const linked=await rows("SELECT 1 FROM series_teams WHERE series_id=? AND team_id=?",[sid,teamId]);
    const member=await rows("SELECT role FROM team_members WHERE user_id=? AND team_id=?",[userId,teamId]);
    if(!linked.length||!member.length)return fail(reply,404);
    if(member[0].role==="viewer"||(perm==="publish"&&member[0].role!=="publisher"))return fail(reply);
    await pool.execute("INSERT IGNORE INTO series_grants(series_id,team_id,user_id,permission) VALUES(?,?,?,?)",[sid,teamId,userId,perm]);
    await log(actor.id,"series.grant","series",sid);
    return {ok:true};
  });
  app.put<{Params:{id:string};Body:Record<string,unknown>}>("/api/v1/studio/series/:id",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const sid=req.params.id;if(!validId(sid))return fail(reply,404);
    if(!await seriesPermission(actor,sid,"edit"))return fail(reply);
    if(!(await rows("SELECT id FROM series WHERE id=?",[sid])).length)return fail(reply,404);
    const payload=req.body||{},allowed=["title","category","summary","poster","banner",...(actor.isAdmin?["featured"]:[])];
    if(Object.keys(payload).some(k=>!allowed.includes(k)))return fail(reply);
    const title=text(payload.title,180),category=text(payload.category,100),
      summary=typeof payload.summary==="string"&&payload.summary.length<=10000?payload.summary:null,
      poster=validateArtwork(payload.poster),banner=validateArtwork(payload.banner);
    if(!title||!category||summary===null||!poster||!banner)return fail(reply,400);
    const sql="UPDATE series SET title=?,category=?,summary=?,poster=?,banner=?"+(actor.isAdmin?",featured=?":"")+" WHERE id=?";
    const vals=actor.isAdmin?[title,category,summary,poster,banner,Boolean(payload.featured),sid]:[title,category,summary,poster,banner,sid];
    await pool.execute(sql,vals);
    await log(actor.id,"series.updated","series",sid);
    return {ok:true,id:sid};
  });
  app.post<{Params:{id:string};Body:{visibility?:unknown}}>("/api/v1/studio/series/:id/visibility",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const sid=req.params.id;if(!validId(sid))return fail(reply,404);
    const visibility=req.body?.visibility;
    if(!["draft","public","suspended"].includes(String(visibility)))return fail(reply,400);
    if(!await seriesPermission(actor,sid,"publish"))return fail(reply);
    await pool.execute("UPDATE series SET visibility=? WHERE id=?",[visibility,sid]);
    await log(actor.id,"series.visibility","series",sid);
    return {ok:true};
  });
}
