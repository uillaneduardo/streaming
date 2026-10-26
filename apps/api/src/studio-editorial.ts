import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor} from "./auth.js";
import {seriesPermission} from "./studio.js";
type Row=RowDataPacket&Record<string,any>;
type EditorialResource="banners"|"sections";
const validId=(s:unknown):s is string=>typeof s==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(s);
const list=(ids:string[])=>ids.map(()=>"?").join(",");
const reject=(reply:FastifyReply,status:number,error:string)=>reply.code(status).send({error});
const parseIds=(value:unknown):string[]|null=>{
 if(!Array.isArray(value)||!value.length||value.length>100||value.some(id=>!validId(id))||
  new Set(value).size!==value.length)return null;
 return [...value].sort();
};
const sectionKinds=["featured","latest","upcoming","all"];
const cleanSection=(raw:Record<string,unknown>)=>{
 const title=raw.title,kind=raw.kind,active=raw.active;
 if(typeof title!=="string"||!title.trim()||title.length>160||
    !sectionKinds.includes(String(kind))||typeof active!=="boolean")return null;
 return {title:title.trim(),kind:String(kind),active};
};
const utcDate=(value:unknown):string|null|undefined=>{
 if(value==null||value==="")return null;
 if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))return undefined;
 const d=new Date(value);
 return Number.isFinite(d.getTime())?d.toISOString().slice(0,23).replace("T"," "):undefined;
};
async function audit(con:any,actorId:string,action:string,target:string,id:string){
 await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
  [randomUUID(),actorId,action,target,id]);
}
export function registerStudioEditorial(app:FastifyInstance){
 app.post<{Body:Record<string,unknown>}>("/api/v1/studio/sections",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return reject(reply,403,"forbidden");
  const data=cleanSection(req.body||{});
  if(!data)return reject(reply,400,"invalid_section");
  const id=randomUUID();
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [max]=await con.execute<RowDataPacket[]>("SELECT COALESCE(MAX(display_order),0) AS pos FROM home_sections");
   await con.execute("INSERT INTO home_sections(id,title,kind,active,display_order) VALUES(?,?,?,?,?)",
    [id,data.title,data.kind,data.active,Number(max[0]?.pos||0)+1]);
   await audit(con,actor.id,"section.created","home_section",id);
   await con.commit();
  }catch(error){await con.rollback();throw error;}finally{con.release();}
  return reply.code(201).send({id});
 });
 app.put<{Params:{id:string};Body:Record<string,unknown>}>("/api/v1/studio/sections/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return reject(reply,403,"forbidden");
  if(!validId(req.params.id))return reject(reply,400,"invalid_id");
  const data=cleanSection(req.body||{});
  if(!data)return reject(reply,400,"invalid_section");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [rows]=await con.execute<RowDataPacket[]>("SELECT id FROM home_sections WHERE id=? FOR UPDATE",[req.params.id]);
   if(!rows.length){await con.rollback();return reject(reply,404,"section_not_found");}
   await con.execute("UPDATE home_sections SET title=?,kind=?,active=? WHERE id=?",
    [data.title,data.kind,data.active,req.params.id]);
   await audit(con,actor.id,"section.updated","home_section",req.params.id);
   await con.commit();
  }catch(error){await con.rollback();throw error;}finally{con.release();}
  return {ok:true};
 });
 app.delete<{Params:{id:string}}>("/api/v1/studio/sections/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return reject(reply,403,"forbidden");
  if(!validId(req.params.id))return reject(reply,400,"invalid_id");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [rows]=await con.execute<RowDataPacket[]>("SELECT id FROM home_sections WHERE id=? FOR UPDATE",[req.params.id]);
   if(!rows.length){await con.rollback();return reject(reply,404,"section_not_found");}
   await con.execute("DELETE FROM home_sections WHERE id=?",[req.params.id]);
   await audit(con,actor.id,"section.deleted","home_section",req.params.id);
   await con.commit();
  }catch(error){await con.rollback();throw error;}finally{con.release();}
  return {ok:true};
 });
 app.put<{Body:{ids?:unknown}}>("/api/v1/studio/sections/order",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return reject(reply,403,"forbidden");
  const ids=parseIds(req.body?.ids);
  if(!ids)return reject(reply,400,"invalid_ids");
  const ordered=req.body?.ids as string[];
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [current]=await con.execute<RowDataPacket[]>("SELECT id FROM home_sections ORDER BY id FOR UPDATE");
   if(current.length!==ordered.length||current.some(row=>!ids.includes(String(row.id)))){
    await con.rollback();return reject(reply,409,"sections_changed");
   }
   for(let i=0;i<ordered.length;i++)
     await con.execute("UPDATE home_sections SET display_order=? WHERE id=?",[i+1,ordered[i]]);
   await audit(con,actor.id,"sections.reordered","home_sections","all");
   await con.commit();
  }catch(error){await con.rollback();throw error;}finally{con.release();}
  return {ok:true};
 });
 app.delete<{Params:{id:string}}>("/api/v1/studio/banners/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return reject(reply,403,"forbidden");
  if(!validId(req.params.id))return reject(reply,400,"invalid_id");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [rows]=await con.execute<RowDataPacket[]>("SELECT id FROM banners WHERE id=? FOR UPDATE",[req.params.id]);
   if(!rows.length){await con.rollback();return reject(reply,404,"banner_not_found");}
   await con.execute("DELETE FROM banners WHERE id=?",[req.params.id]);
   await audit(con,actor.id,"banner.deleted","banner",req.params.id);
   await con.commit();
  }catch(error){await con.rollback();throw error;}finally{con.release();}
  return {ok:true};
 });
 app.post<{Body:{resource?:unknown;action?:unknown;ids?:unknown;active?:unknown}}>(
  "/api/v1/studio/editorial/bulk",async(req,reply)=>{
   const actor=await requireActor(req,reply,true);if(!actor)return;
   if(!actor.isAdmin)return reject(reply,403,"forbidden");
   const resource=req.body?.resource,action=req.body?.action,ids=parseIds(req.body?.ids);
   if(!["banners","sections"].includes(String(resource))||
     !["delete","set_active"].includes(String(action))||!ids||
     (action==="set_active"&&typeof req.body?.active!=="boolean")||
     (action==="delete"&&req.body?.active!==undefined))
    return reject(reply,400,"invalid_bulk_request");
   const kind=resource as EditorialResource,table=kind==="banners"?"banners":"home_sections";
   const target=kind==="banners"?"banner":"home_section";
   const con=await pool.getConnection();
   try{
    await con.beginTransaction();
    const [rows]=await con.execute<RowDataPacket[]>(
     "SELECT id FROM "+table+" WHERE id IN ("+list(ids)+") ORDER BY id FOR UPDATE",ids);
    if(rows.length!==ids.length){await con.rollback();return reject(reply,404,"item_not_found");}
    if(action==="delete")
     await con.execute("DELETE FROM "+table+" WHERE id IN ("+list(ids)+")",ids);
    else
     await con.execute("UPDATE "+table+" SET active=? WHERE id IN ("+list(ids)+")",
      [req.body.active,...ids]);
    for(const id of ids)
     await audit(con,actor.id,kind+"."+(action==="delete"?"deleted":"visibility.updated"),target,id);
    await con.commit();
    return {ok:true,count:ids.length};
   }catch(error){await con.rollback();throw error;}finally{con.release();}
  });
 app.post<{Body:{ids?:unknown;releaseAt?:unknown;endAt?:unknown}}>(
  "/api/v1/studio/calendar/reschedule",async(req,reply)=>{
   const actor=await requireActor(req,reply,true);if(!actor)return;
   const ids=parseIds(req.body?.ids);
   const release=utcDate(req.body?.releaseAt),end=utcDate(req.body?.endAt);
   if(!ids||!release||end===undefined||(end&&end<=release))
    return reject(reply,400,"invalid_schedule");
   const con=await pool.getConnection();
   try{
    await con.beginTransaction();
    const [rows]=await con.execute<RowDataPacket[]>(
     "SELECT e.id,e.status,se.series_id AS seriesId FROM episodes e JOIN seasons se ON se.id=e.season_id WHERE e.id IN ("+list(ids)+") ORDER BY e.id FOR UPDATE",ids);
    if(rows.length!==ids.length){await con.rollback();return reject(reply,404,"item_not_found");}
    for(const row of rows as Row[]){
     if(!await seriesPermission(actor,String(row.seriesId),"edit")){
      await con.rollback();return reject(reply,403,"forbidden");
     }
     if(row.status==="published"&&!await seriesPermission(actor,String(row.seriesId),"publish")){
      await con.rollback();return reject(reply,403,"publish_denied");
     }
    }
    await con.execute("UPDATE episodes SET release_at=?,end_at=? WHERE id IN ("+list(ids)+")",
     [release,end,...ids]);
    for(const id of ids)await audit(con,actor.id,"episode.rescheduled","episode",id);
    await con.commit();
    return {ok:true,count:ids.length};
   }catch(error){await con.rollback();throw error;}finally{con.release();}
  });
}
