import {randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {requireActor} from "./auth.js";

type Row=RowDataPacket&Record<string,any>;
const fail=(reply:FastifyReply,n:number,code:string)=>reply.code(n).send({error:code});
const validId=(v:unknown):v is string=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,36}$/.test(v);
const clean=(v:unknown)=>typeof v==="string"&&v.trim().length>=2&&v.trim().length<=100?v.trim():null;
const slug=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,115);

export function registerCategories(app:FastifyInstance){
 app.get("/api/v1/studio/categories",async(req,reply)=>{
  reply.header("Cache-Control","no-store");
  if(!await requireActor(req,reply))return;
  const [rows]=await pool.execute<RowDataPacket[]>("SELECT c.id,c.name,c.slug,(SELECT COUNT(*) FROM series s WHERE s.category=c.name) AS usage_count FROM categories c ORDER BY c.name");
  return {categories:(rows as Row[]).map(r=>({id:r.id,name:r.name,slug:r.slug,count:Number(r.usage_count)}))};
 });
 app.post<{Body:{name?:unknown}}>("/api/v1/studio/categories",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return fail(reply,403,"forbidden");
  const value=clean(req.body?.name);if(!value||!slug(value))return fail(reply,400,"invalid_category");
  const [dupes]=await pool.execute<RowDataPacket[]>("SELECT id FROM categories WHERE name=? OR slug=? LIMIT 1",[value,slug(value)]);
  if(dupes.length)return fail(reply,409,"category_exists");
  const id=randomUUID();
  await pool.execute("INSERT INTO categories(id,name,slug) VALUES(?,?,?)",[id,value,slug(value)]);
  return reply.code(201).send({id,name:value});
 });
 app.put<{Params:{id:string};Body:{name?:unknown}}>("/api/v1/studio/categories/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return fail(reply,403,"forbidden");
  if(!validId(req.params.id))return fail(reply,400,"invalid_id");
  const value=clean(req.body?.name);if(!value||!slug(value))return fail(reply,400,"invalid_category");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [cats]=await con.execute<RowDataPacket[]>("SELECT name FROM categories WHERE id=? FOR UPDATE",[req.params.id]);
   if(!cats.length){await con.rollback();return fail(reply,404,"category_not_found");}
   const old=String((cats[0] as Row).name);
   const [dupes]=await con.execute<RowDataPacket[]>("SELECT id FROM categories WHERE (name=? OR slug=?) AND id<>? LIMIT 1",[value,slug(value),req.params.id]);
   if(dupes.length){await con.rollback();return fail(reply,409,"category_exists");}
   await con.execute("UPDATE categories SET name=?,slug=? WHERE id=?",[value,slug(value),req.params.id]);
   await con.execute("UPDATE series SET category=? WHERE category=?",[value,old]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
    [randomUUID(),actor.id,"category.updated","category",req.params.id]);
   await con.commit();return {ok:true};
  }catch(error){await con.rollback();throw error;}finally{con.release();}
 });
 app.delete<{Params:{id:string}}>("/api/v1/studio/categories/:id",async(req,reply)=>{
  const actor=await requireActor(req,reply,true);if(!actor)return;
  if(!actor.isAdmin)return fail(reply,403,"forbidden");
  if(!validId(req.params.id))return fail(reply,400,"invalid_id");
  const con=await pool.getConnection();
  try{
   await con.beginTransaction();
   const [cats]=await con.execute<RowDataPacket[]>("SELECT name FROM categories WHERE id=? FOR UPDATE",[req.params.id]);
   if(!cats.length){await con.rollback();return fail(reply,404,"category_not_found");}
   const [used]=await con.execute<RowDataPacket[]>("SELECT id FROM series WHERE category=? LIMIT 1",[(cats[0] as Row).name]);
   if(used.length){await con.rollback();return fail(reply,409,"category_in_use");}
   await con.execute("DELETE FROM categories WHERE id=?",[req.params.id]);
   await con.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
    [randomUUID(),actor.id,"category.deleted","category",req.params.id]);
   await con.commit();return {ok:true};
  }catch(error){await con.rollback();throw error;}finally{con.release();}
 });
}