import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor,type Actor} from "./auth.js";
import {seriesPermission} from "./studio.js";
type Row=RowDataPacket&Record<string,any>;
type Kind="series"|"season"|"episode"|"banner";
const types=["series","season","episode","banner"];
const validId=(v:unknown):v is string=>typeof v==="string"&&/^[A-Za-z0-9_-]{1,36}$/.test(v);
const fail=(reply:FastifyReply,status:number,error:string)=>reply.code(status).send({error});
const utc=(x:unknown)=>x instanceof Date?x.toISOString():typeof x==="string"&&x?x.replace(" ","T")+"Z":null;
async function query(sql:string,args:unknown[]=[]):Promise<Row[]>{
 const [r]=await pool.execute<RowDataPacket[]>(sql,args);return r as Row[];
}
async function target(kind:Kind,id:string){
 const sql=kind==="series"?"SELECT id AS seriesId FROM series WHERE id=?":
  kind==="season"?"SELECT series_id AS seriesId FROM seasons WHERE id=?":
  kind==="episode"?"SELECT s.series_id AS seriesId FROM episodes e JOIN seasons s ON s.id=e.season_id WHERE e.id=?":
  "SELECT target_series_id AS seriesId FROM banners WHERE id=?";
 const rows=await query(sql,[id]);
 return rows.length?String(rows[0].seriesId):null;
}
async function permitted(actor:Actor,kind:Kind,sid:string,permission:"read"|"edit"|"publish"){
 return kind==="banner"?actor.isAdmin:seriesPermission(actor,sid,permission);
}
const tableFor=(kind:Kind)=>({series:"series",season:"seasons",episode:"episodes",banner:"banners"}[kind]);

export function registerEditorialReview(app:FastifyInstance){
 app.get<{Params:{kind:string;id:string};Querystring:{limit?:string}}>(
 "/api/v1/studio/editorial/:kind/:id/history",async(req,reply)=>{
  reply.header("Cache-Control","no-store");
  const actor=await requireActor(req,reply);if(!actor)return;
  const {kind,id}=req.params;
  if(!types.includes(kind)||!validId(id))return fail(reply,400,"invalid_resource");
  const sid=await target(kind as Kind,id);
  if(!sid&&!actor.isAdmin)return fail(reply,404,"not_found");
  if(sid&&!await permitted(actor,kind as Kind,sid,"read"))return fail(reply,403,"forbidden");
  const n=Math.min(100,Math.max(1,Number.parseInt(req.query.limit||"30",10)||30));
  const versions=await query("SELECT id,operation,snapshot,created_at FROM editorial_versions WHERE target_type=? AND target_id=? ORDER BY id DESC LIMIT "+n,[kind,id]);
  const reviews=await query("SELECT r.id,r.version_id,r.state,r.message,r.decision_note,r.submitted_at,r.reviewed_at,sub.name AS submitted_by_name,rev.name AS reviewed_by_name FROM editorial_reviews r JOIN users sub ON sub.id=r.submitted_by LEFT JOIN users rev ON rev.id=r.reviewed_by WHERE r.target_type=? AND r.target_id=? ORDER BY r.submitted_at DESC LIMIT "+n,[kind,id]);
  return {versions:versions.map(v=>({id:Number(v.id),operation:v.operation,
    snapshot:typeof v.snapshot==="string"?JSON.parse(v.snapshot):v.snapshot,createdAt:utc(v.created_at)})),
    reviews:reviews.map(r=>({id:r.id,versionId:Number(r.version_id),state:r.state,
     message:r.message,decisionNote:r.decision_note,submittedAt:utc(r.submitted_at),
     reviewedAt:utc(r.reviewed_at),submittedBy:r.submitted_by_name,reviewedBy:r.reviewed_by_name}))};
 });
 app.post<{Params:{kind:string;id:string};Body:{message?:unknown}}>(
 "/api/v1/studio/editorial/:kind/:id/submit",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  const {kind,id}=req.params;
  if(!types.includes(kind)||!validId(id))return fail(reply,400,"invalid_resource");
  const sid=await target(kind as Kind,id);
  if(!sid)return fail(reply,404,"not_found");
  if(!await permitted(actor,kind as Kind,sid,"edit"))return fail(reply,403,"forbidden");
  const message=req.body?.message??"";
  if(typeof message!=="string"||message.length>1000)return fail(reply,400,"invalid_message");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [current]=await con.execute<RowDataPacket[]>(
    "SELECT id FROM "+tableFor(kind as Kind)+" WHERE id=? FOR UPDATE",[id]);
   if(!current.length){await con.rollback();return fail(reply,404,"not_found");}
   const [versions]=await con.execute<RowDataPacket[]>(
    "SELECT id FROM editorial_versions WHERE target_type=? AND target_id=? ORDER BY id DESC LIMIT 1",[kind,id]);
   if(!versions.length){await con.rollback();return fail(reply,409,"no_revision");}
   const version=Number((versions[0] as Row).id);
   const [pending]=await con.execute<RowDataPacket[]>(
    "SELECT id,version_id FROM editorial_reviews WHERE target_type=? AND target_id=? AND state='pending' FOR UPDATE",[kind,id]);
   if((pending as Row[]).some(x=>Number(x.version_id)===version)){
    await con.rollback();return fail(reply,409,"already_pending");
   }
   await con.execute("UPDATE editorial_reviews SET state='stale',reviewed_at=UTC_TIMESTAMP(3) WHERE target_type=? AND target_id=? AND state='pending'",[kind,id]);
   const rid=randomUUID();
   await con.execute("INSERT INTO editorial_reviews(id,target_type,target_id,version_id,submitted_by,message) VALUES(?,?,?,?,?,?)",
    [rid,kind,id,version,actor.id,message.trim()]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
    [randomUUID(),actor.id,"editorial.submitted",kind,id]);
   await con.commit();return reply.code(201).send({id:rid,versionId:version});
  }catch(error){await con.rollback();throw error;}finally{con.release();}
 });
 app.post<{Params:{id:string};Body:{decision?:unknown;note?:unknown}}>(
 "/api/v1/studio/editorial/reviews/:id/decision",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!validId(req.params.id))return fail(reply,400,"invalid_id");
  const decision=req.body?.decision,note=req.body?.note??"";
  if(!["approve","reject"].includes(String(decision))||typeof note!=="string"||note.length>1000)
   return fail(reply,400,"invalid_decision");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [rows]=await con.execute<RowDataPacket[]>("SELECT * FROM editorial_reviews WHERE id=? FOR UPDATE",[req.params.id]);
   if(!rows.length){await con.rollback();return fail(reply,404,"review_not_found");}
   const rev=rows[0] as Row,kind=String(rev.target_type) as Kind,id=String(rev.target_id);
   if(rev.state!=="pending"){await con.rollback();return fail(reply,409,"review_not_pending");}
   const sid=await target(kind,id);
   if(!sid){await con.rollback();return fail(reply,404,"not_found");}
   if(!await permitted(actor,kind,sid,"publish")){await con.rollback();return fail(reply,403,"publish_denied");}
   if(rev.submitted_by===actor.id&&!actor.isAdmin){
    await con.rollback();return fail(reply,403,"self_review_forbidden");
   }
   // Serialize decisions against edits of the same item.
   await con.execute("SELECT id FROM "+tableFor(kind)+" WHERE id=? FOR UPDATE",[id]);
   const [latest]=await con.execute<RowDataPacket[]>(
    "SELECT id FROM editorial_versions WHERE target_type=? AND target_id=? ORDER BY id DESC LIMIT 1",[kind,id]);
   if(!latest.length||Number((latest[0] as Row).id)!==Number(rev.version_id)){
    await con.execute("UPDATE editorial_reviews SET state='stale',reviewed_at=UTC_TIMESTAMP(3) WHERE id=?",[req.params.id]);
    await con.commit();return fail(reply,409,"review_stale");
   }
   if(decision==="approve"){
    if(kind==="episode"){
     const [dates]=await con.execute<RowDataPacket[]>("SELECT release_at FROM episodes WHERE id=?",[id]);
     if(!(dates[0] as Row)?.release_at){await con.rollback();return fail(reply,409,"episode_missing_release_date");}
     await con.execute("UPDATE episodes SET status='published' WHERE id=?",[id]);
    }else if(kind==="season")await con.execute("UPDATE seasons SET status='published' WHERE id=?",[id]);
    else if(kind==="series")await con.execute("UPDATE series SET visibility='public' WHERE id=?",[id]);
    else await con.execute("UPDATE banners SET active=1 WHERE id=?",[id]);
   }
   await con.execute("UPDATE editorial_reviews SET state=?,reviewed_by=?,decision_note=?,reviewed_at=UTC_TIMESTAMP(3) WHERE id=?",
    [decision==="approve"?"approved":"rejected",actor.id,note.trim(),req.params.id]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
    [randomUUID(),actor.id,decision==="approve"?"editorial.approved":"editorial.rejected",kind,id]);
   await con.commit();return {ok:true,state:decision==="approve"?"approved":"rejected"};
  }catch(error){await con.rollback();throw error;}finally{con.release();}
 });
}
