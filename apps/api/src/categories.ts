import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor} from "./auth.js";

type Category=RowDataPacket & {id:string;name:string};
const validId=(v:unknown):v is string=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(v);
const nameOf=(v:unknown)=>typeof v==="string"&&v.trim().length>0&&v.trim().length<=100?v.trim().replace(/\\s+/g," "):null;
const error=(reply:FastifyReply,code:number,message:string)=>reply.code(code).send({error:message});
export async function categoryExists(name:string):Promise<boolean>{
 const [rows]=await pool.execute<RowDataPacket[]>("SELECT id FROM categories WHERE name=? LIMIT 1",[name]);
 return rows.length>0;
}
export function registerCategories(app:FastifyInstance){
 app.get("/api/v1/studio/categories",async(req,reply)=>{
  const actor=await requireActor(req,reply);if(!actor)return;
  const [rows]=await pool.query<Category[]>("SELECT c.id,c.name,(SELECT COUNT(*) FROM series s WHERE s.category=c.name) AS usageCount FROM categories c ORDER BY c.name");
  return {categories:rows};
 });
 app.post<{Body:{name?:unknown}}>("/api/v1/studio/categories",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return error(reply,403,"forbidden");
  const name=nameOf(req.body?.name);if(!name)return error(reply,400,"invalid_category");
  if(await categoryExists(name))return error(reply,409,"category_exists");
  const id=randomUUID();
  try{await pool.execute("INSERT INTO categories(id,name) VALUES(?,?)",[id,name]);}
  catch(e){if((e as {code?:string}).code==="ER_DUP_ENTRY")return error(reply,409,"category_exists");throw e;}
  await pool.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",[randomUUID(),actor.id,"category.created","category",id]);
  return reply.code(201).send({id,name});
 });
 app.put<{Params:{id:string};Body:{name?:unknown}}>("/api/v1/studio/categories/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return error(reply,403,"forbidden");
  const id=req.params.id,name=nameOf(req.body?.name);
  if(!validId(id)||!name)return error(reply,400,"invalid_category");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [existing]=await con.execute<Category[]>("SELECT name FROM categories WHERE id=? FOR UPDATE",[id]);
   if(!existing.length){await con.rollback();return error(reply,404,"category_not_found");}
   await con.execute("UPDATE categories SET name=? WHERE id=?",[name,id]);
   await con.execute("UPDATE series SET category=? WHERE category=?",[name,existing[0].name]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",[randomUUID(),actor.id,"category.updated","category",id]);
   await con.commit();
  }catch(e){await con.rollback();if((e as {code?:string}).code==="ER_DUP_ENTRY")return error(reply,409,"category_exists");throw e;}
  finally{con.release();}
  return {ok:true,id,name};
 });
 app.delete<{Params:{id:string}}>("/api/v1/studio/categories/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return error(reply,403,"forbidden");
  const id=req.params.id;if(!validId(id))return error(reply,400,"invalid_id");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [found]=await con.execute<Category[]>("SELECT name FROM categories WHERE id=? FOR UPDATE",[id]);
   if(!found.length){await con.rollback();return error(reply,404,"category_not_found");}
   const [used]=await con.execute<RowDataPacket[]>("SELECT id FROM series WHERE category=? LIMIT 1",[found[0].name]);
   if(used.length){await con.rollback();return error(reply,409,"category_in_use");}
   await con.execute("DELETE FROM categories WHERE id=?",[id]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",[randomUUID(),actor.id,"category.deleted","category",id]);
   await con.commit();
  }catch(e){await con.rollback();throw e;}finally{con.release();}
  return {ok:true};
 });
}
