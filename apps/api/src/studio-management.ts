import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor,type Actor} from "./auth.js";
import {teamManager,seriesPermission} from "./studio.js";
import {hashPassword,normalizeEmail,validateArtwork} from "./security.js";
type Obj=Record<string,unknown>;
type Row=RowDataPacket & Record<string,unknown>;
async function records(query:string,args:unknown[]=[]):Promise<Row[]> {
  const [rows]=await pool.execute<RowDataPacket[]>(query,args);
  return rows as Row[];
}
const err=(reply:FastifyReply,code:number,msg:string)=>reply.code(code).send({error:msg});
const txt=(v:unknown,max=180)=>typeof v==="string"&&v.trim().length>0&&v.trim().length<=max?v.trim():null;
const description=(v:unknown)=>typeof v==="string"&&v.length<=10000?v:null;
const goodId=(x:unknown):x is string=>typeof x==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(x);
const safePath=(v:unknown)=>v===""||v==null?null:validateArtwork(v);
const identifier=(title:string)=>title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,160);
const integer=(v:unknown,min=1,max=10000)=>Number.isInteger(Number(v))&&Number(v)>=min&&Number(v)<=max?Number(v):null;
function dateParam(v:unknown):string|null|undefined {
  if(v==null||v==="")return null;
  if(typeof v!=="string"||!(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)))return undefined;
  const d=new Date(v);
  return Number.isFinite(d.getTime())?d.toISOString().slice(0,23).replace("T"," "):undefined;
}
export function youtubeId(v:unknown):string|null|undefined{
  if(v==null||v==="")return null;
  if(typeof v!=="string"||v.length>512)return undefined;
  const s=v.trim();
  if(/^[a-zA-Z0-9_-]{11}$/.test(s))return s;
  try {
    const u=new URL(s);
    if(!["https:","http:"].includes(u.protocol) || u.username || u.password)return undefined;
    let id="";
    if(u.hostname==="youtu.be") id=u.pathname.slice(1).split("/")[0];
    else if(["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(u.hostname)){
      if(u.pathname==="/watch")id=u.searchParams.get("v")||"";
      else if(/^\/(embed|shorts|live)\/[^/]+/.test(u.pathname))id=u.pathname.split("/")[2]||"";
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:undefined;
  }catch{return undefined;}
}
const audit=async(userId:string,action:string,type:string,id:string)=>{
  await pool.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",[randomUUID(),userId,action,type,id]);
};
async function writableTeam(user:Actor,teamIds:string[]) {
  if(user.isAdmin)return true;
  if(!teamIds.length)return false;
  for(const id of teamIds) if(!await teamManager(user,id))return false;
  return true;
}
async function seasonSeries(seasonId:string):Promise<string|null>{
  const r=await records("SELECT series_id FROM seasons WHERE id=? LIMIT 1",[seasonId]);
  return r.length?String(r[0].series_id):null;
}
export function registerStudioManagement(app:FastifyInstance) {
  app.post<{Body:Obj}>("/api/v1/studio/teams",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!actor.isAdmin)return err(reply,403,"forbidden");
    const name=txt(req.body?.name,160),info=description(req.body?.description);
    if(!name||info===null)return err(reply,400,"invalid_team");
    const id=randomUUID();
    await pool.execute("INSERT INTO teams(id,name,description) VALUES(?,?,?)",[id,name,info]);
    await audit(actor.id,"team.created","team",id);
    return reply.code(201).send({id,name});
  });
  app.put<{Params:{id:string};Body:Obj}>("/api/v1/studio/teams/:id",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!goodId(req.params.id))return err(reply,400,"invalid_id");
    if(!await teamManager(actor,req.params.id))return err(reply,403,"forbidden");
    const name=txt(req.body?.name,160),info=description(req.body?.description);
    if(!name||info===null)return err(reply,400,"invalid_team");
    const [out]=await pool.execute<any>("UPDATE teams SET name=?,description=? WHERE id=?",[name,info,req.params.id]);
    if(!out.affectedRows)return err(reply,404,"not_found");
    await audit(actor.id,"team.updated","team",req.params.id);
    return {ok:true};
  });
  // Create a password-protected account and immediately add it to one team.
  // Existing accounts must be linked through the separately authorized membership endpoint.
  app.post<{Body:Obj}>("/api/v1/studio/members",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!actor.isAdmin)return err(reply,403,"forbidden");
    const email=normalizeEmail(req.body?.email),name=txt(req.body?.name,160);
    const password=req.body?.password,teamId=req.body?.teamId,role=req.body?.role;
    if(!email||!name||typeof password!=="string"||password.length<12||password.length>128||
       !goodId(teamId)||!["manager","editor","publisher","viewer"].includes(String(role)))return err(reply,400,"invalid_member");
    if(!(await records("SELECT id FROM teams WHERE id=?",[teamId])).length)return err(reply,404,"team_not_found");
    if((await records("SELECT id FROM users WHERE email=?",[email])).length)return err(reply,409,"email_exists_link_existing_account");
    const id=randomUUID(),hash=await hashPassword(password),con=await pool.getConnection();
    try{
      await con.beginTransaction();
      await con.execute("INSERT INTO users(id,email,name,password_hash) VALUES(?,?,?,?)",[id,email,name,hash]);
      await con.execute("INSERT INTO team_members(team_id,user_id,role) VALUES(?,?,?)",[teamId,id,role]);
      await con.commit();
    }catch(error){await con.rollback();throw error;}
    finally{con.release();}
    await audit(actor.id,"member.created","user",id);
    return reply.code(201).send({id,email,name,teamId,role});
  });
  app.put<{Params:{id:string};Body:Obj}>("/api/v1/studio/members/:id",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!actor.isAdmin)return err(reply,403,"forbidden");
    const id=req.params.id,teamId=req.body?.teamId,role=req.body?.role,name=txt(req.body?.name,160);
    if(!goodId(id)||!goodId(teamId)||!name||!["manager","editor","publisher","viewer"].includes(String(role)))return err(reply,400,"invalid_member");
    const con=await pool.getConnection();
    try{
      await con.beginTransaction();
      const [member]=await con.execute<RowDataPacket[]>("SELECT 1 FROM team_members WHERE team_id=? AND user_id=?",[teamId,id]);
      if(!member.length){await con.rollback();return err(reply,404,"membership_not_found");}
      await con.execute("UPDATE users SET name=? WHERE id=?",[name,id]);
      await con.execute("UPDATE team_members SET role=? WHERE team_id=? AND user_id=?",[role,teamId,id]);
      await con.commit();
    }catch(error){await con.rollback();throw error;}
    finally{con.release();}
    await audit(actor.id,"member.updated","user",id);
    return {ok:true};
  });
  app.post<{Body:Obj}>("/api/v1/studio/series",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const data=req.body||{};
    const title=txt(data.title,180),category=txt(data.category,100),summary=description(data.summary);
    const poster=safePath(data.poster),banner=safePath(data.banner);
    const teamIds=Array.isArray(data.teamIds)?[...new Set(data.teamIds)]:[];
    const visibility=data.visibility??"draft";
    if(!title||!category||summary===null||!poster||!banner||
       !teamIds.length||teamIds.length>20||teamIds.some(x=>!goodId(x))||
       !["draft","public"].includes(String(visibility)))return err(reply,400,"invalid_series");
    if(!await writableTeam(actor,teamIds as string[]))return err(reply,403,"forbidden");
    if(visibility==="public"&&!actor.isAdmin)return err(reply,403,"publishing_requires_authorization");
    const teamRows=await records("SELECT id FROM teams WHERE id IN ("+teamIds.map(()=>"?").join(",")+")",teamIds);
    if(teamRows.length!==teamIds.length)return err(reply,400,"unknown_team");
    const slug=identifier(title);
    if(!slug)return err(reply,400,"invalid_title");
    if((await records("SELECT id FROM series WHERE slug=? LIMIT 1",[slug])).length)return err(reply,409,"slug_exists");
    const id=randomUUID(),con=await pool.getConnection();
    try{
      await con.beginTransaction();
      await con.execute("INSERT INTO series(id,title,slug,category,summary,poster,banner,featured,visibility) VALUES(?,?,?,?,?,?,?,?,?)",
        [id,title,slug,category,summary,poster,banner,actor.isAdmin&&data.featured===true,visibility]);
      for(const teamId of teamIds)await con.execute("INSERT INTO series_teams(series_id,team_id) VALUES(?,?)",[id,teamId]);
      await con.commit();
    }catch(error){await con.rollback();throw error;}
    finally{con.release();}
    await audit(actor.id,"series.created","series",id);
    return reply.code(201).send({id,slug});
  });
  app.post<{Body:Obj}>("/api/v1/studio/seasons",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const seriesId=req.body?.seriesId,title=txt(req.body?.title,160),number=integer(req.body?.number,1,999);
    if(!goodId(seriesId)||!title||number===null)return err(reply,400,"invalid_season");
    if(!await seriesPermission(actor,seriesId,"edit"))return err(reply,403,"forbidden");
    if(!(await records("SELECT id FROM series WHERE id=?",[seriesId])).length)return err(reply,404,"series_not_found");
    if((await records("SELECT id FROM seasons WHERE series_id=? AND number=?",[seriesId,number])).length)return err(reply,409,"season_exists");
    const id=randomUUID();
    await pool.execute("INSERT INTO seasons(id,series_id,number,title) VALUES(?,?,?,?)",[id,seriesId,number,title]);
    await audit(actor.id,"season.created","season",id);
    return reply.code(201).send({id});
  });
  app.put<{Params:{id:string};Body:Obj}>("/api/v1/studio/seasons/:id",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const id=req.params.id,title=txt(req.body?.title,160),number=integer(req.body?.number,1,999);
    if(!goodId(id)||!title||number===null)return err(reply,400,"invalid_season");
    const old=await records("SELECT series_id FROM seasons WHERE id=? LIMIT 1",[id]);
    if(!old.length)return err(reply,404,"season_not_found");
    if(!await seriesPermission(actor,String(old[0].series_id),"edit"))return err(reply,403,"forbidden");
    if(req.body?.seriesId && req.body.seriesId!==old[0].series_id)return err(reply,400,"series_change_not_supported");
    const dupe=await records("SELECT id FROM seasons WHERE series_id=? AND number=? AND id<>?",[old[0].series_id,number,id]);
    if(dupe.length)return err(reply,409,"season_exists");
    await pool.execute("UPDATE seasons SET title=?,number=? WHERE id=?",[title,number,id]);
    await audit(actor.id,"season.updated","season",id);
    return {ok:true};
  });
  const episodeInput=async (body:Obj)=>{
    const seasonId=body.seasonId,title=txt(body.title,180),summary=description(body.summary);
    const number=integer(body.number,1,9999),duration=integer(body.duration??20,1,1440);
    const status=body.status??"draft",thumbnail=safePath(body.thumbnail),youtube=youtubeId(body.youtube);
    const start=dateParam(body.releaseAt),end=dateParam(body.endAt);
    if(!goodId(seasonId)||!title||summary===null||number===null||duration===null||
       !["draft","scheduled","published","suspended"].includes(String(status))||
       thumbnail===null&&!((body.thumbnail??"")==="")||youtube===undefined||start===undefined||end===undefined||
       (start&&end&&end<=start)||(["published","scheduled"].includes(String(status))&&!start))return null;
    return {seasonId,title,summary,number,duration,status:String(status),thumbnail:thumbnail||"assets/episode-01.svg",youtube,start,end};
  };
  app.post<{Body:Obj}>("/api/v1/studio/episodes",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const data=await episodeInput(req.body||{});
    if(!data)return err(reply,400,"invalid_episode");
    const sid=await seasonSeries(data.seasonId);if(!sid)return err(reply,404,"season_not_found");
    if(!await seriesPermission(actor,sid,"edit"))return err(reply,403,"forbidden");
    if(data.status==="published"&&!await seriesPermission(actor,sid,"publish"))return err(reply,403,"publish_denied");
    if((await records("SELECT id FROM episodes WHERE season_id=? AND number=?",[data.seasonId,data.number])).length)return err(reply,409,"episode_number_exists");
    const id=randomUUID();
    await pool.execute("INSERT INTO episodes(id,season_id,number,title,summary,youtube_id,thumbnail,release_at,end_at,status,duration) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      [id,data.seasonId,data.number,data.title,data.summary,data.youtube,data.thumbnail,data.start,data.end,data.status,data.duration]);
    await audit(actor.id,"episode.created","episode",id);
    return reply.code(201).send({id});
  });
  app.put<{Params:{id:string};Body:Obj}>("/api/v1/studio/episodes/:id",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    const id=req.params.id;if(!goodId(id))return err(reply,400,"invalid_id");
    const original=await records("SELECT season_id,status FROM episodes WHERE id=?",[id]);
    if(!original.length)return err(reply,404,"episode_not_found");
    const data=await episodeInput(req.body||{});
    if(!data||original[0].season_id!==data.seasonId)return err(reply,400,"invalid_episode");
    const sid=await seasonSeries(data.seasonId);if(!sid)return err(reply,404,"season_not_found");
    if(!await seriesPermission(actor,sid,"edit"))return err(reply,403,"forbidden");
    if(data.status==="published"&&!await seriesPermission(actor,sid,"publish"))return err(reply,403,"publish_denied");
    const dupe=await records("SELECT id FROM episodes WHERE season_id=? AND number=? AND id<>?",[data.seasonId,data.number,id]);
    if(dupe.length)return err(reply,409,"episode_number_exists");
    await pool.execute("UPDATE episodes SET number=?,title=?,summary=?,youtube_id=?,thumbnail=?,release_at=?,end_at=?,status=?,duration=? WHERE id=?",
      [data.number,data.title,data.summary,data.youtube,data.thumbnail,data.start,data.end,data.status,data.duration,id]);
    await audit(actor.id,"episode.updated","episode",id);
    return {ok:true};
  });
  app.get("/api/v1/studio/settings",async(req,reply)=>{
    const actor=await requireActor(req,reply);if(!actor)return;
    if(!actor.isAdmin)return err(reply,403,"forbidden");
    const settings=await records("SELECT site_name,site_description,autoplay,contact_email FROM settings WHERE id=1");
    return settings.length?{
      siteName:settings[0].site_name,siteDescription:settings[0].site_description,
      autoplay:!!settings[0].autoplay,contactEmail:settings[0].contact_email||""
    }:{siteName:"CenaLivre",siteDescription:"",autoplay:false,contactEmail:""};
  });
  app.put<{Body:Obj}>("/api/v1/studio/settings",async(req,reply)=>{
    const actor=await requireActor(req,reply,true);if(!actor)return;
    if(!actor.isAdmin)return err(reply,403,"forbidden");
    const title=txt(req.body?.siteName,100),summary=description(req.body?.siteDescription);
    const email=req.body?.contactEmail===""||req.body?.contactEmail==null?"":normalizeEmail(req.body?.contactEmail);
    if(!title||summary===null||email===null||typeof req.body?.autoplay!=="boolean")return err(reply,400,"invalid_settings");
    await pool.execute("INSERT INTO settings(id,site_name,site_description,autoplay,contact_email) VALUES(1,?,?,?,?) ON DUPLICATE KEY UPDATE site_name=VALUES(site_name),site_description=VALUES(site_description),autoplay=VALUES(autoplay),contact_email=VALUES(contact_email)",
      [title,summary,req.body.autoplay,email]);
    await audit(actor.id,"settings.updated","settings","1");
    return {ok:true};
  });
}
