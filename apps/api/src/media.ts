import {createHash,randomUUID} from "node:crypto";
import {mkdir,readFile,writeFile,unlink} from "node:fs/promises";
import path from "node:path";
import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {actor,requireActor,type Actor} from "./auth.js";
const storage=process.env.MEDIA_DIR||"/srv/media";
const MAX_BYTES=20*1024*1024;
const kinds=["poster","banner","thumbnail","icon","logo","other"];
const formats=["png","jpeg","webp","gif"];
type Row=RowDataPacket&Record<string,any>;
const list=async(sql:string,args:unknown[]=[]):Promise<Row[]>=>{
 const [r]=await pool.execute<RowDataPacket[]>(sql,args);return r as Row[];
};
const error=(reply:FastifyReply,code:number,reason:string)=>reply.code(code).send({error:reason});
const safeId=(s:unknown):s is string=>typeof s==="string"&&/^[0-9a-f-]{36}$/i.test(s);
const words=(s:unknown,max:number)=>typeof s==="string"&&s.trim().length>0&&s.trim().length<=max?s.trim():null;
const normalizeTags=(v:unknown):string[]|null=>{
 if(!Array.isArray(v)||v.length>12)return null;
 const tags=v.map(s=>typeof s==="string"?s.trim().toLowerCase():"");
 return tags.some(t=>!t||t.length>32||! /^[\p{L}\p{N} _-]+$/u.test(t))?null:[...new Set(tags)];
};
const mediaRow=(r:Row)=>({id:r.id,name:r.name,originalName:r.original_name,kind:r.kind,
 tags:JSON.parse(r.tags_json||"[]"),mime:r.mime_type,size:Number(r.byte_size),
 url:"/api/v1/media/files/"+r.id,teamId:r.team_id,createdAt:String(r.created_at)});
function signature(data:Buffer):{type:string,mime:string,ext:string}|null{
 if(data.length<16)return null;
 if(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {type:"png",mime:"image/png",ext:"png"};
 if(data[0]===255&&data[1]===216&&data[2]===255)return {type:"jpeg",mime:"image/jpeg",ext:"jpg"};
 if(data.toString("ascii",0,4)==="RIFF"&&data.toString("ascii",8,12)==="WEBP")return {type:"webp",mime:"image/webp",ext:"webp"};
 if(["GIF87a","GIF89a"].includes(data.toString("ascii",0,6)))return {type:"gif",mime:"image/gif",ext:"gif"};
 return null;
}
async function audit(user:string,action:string,id:string){
 await pool.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
 [randomUUID(),user,action,"media",id]);
}
async function access(user:Actor,team:string|null,write=false):Promise<boolean>{
 if(user.isAdmin)return true;
 if(!team)return false;
 const rows=await list("SELECT role FROM team_members WHERE user_id=? AND team_id=?",[user.id,team]);
 return rows.some(r=>write?["manager","editor","publisher"].includes(String(r.role)):true);
}
async function uploadOptions(){
 const rows=await list("SELECT max_file_mb,max_files,allowed_types FROM media_upload_settings WHERE id=1");
 const r=rows[0];
 return {maxFileMb:Number(r?.max_file_mb??8),maxFiles:Number(r?.max_files??500),
  allowedTypes:String(r?.allowed_types||"png,jpeg,webp,gif").split(",").filter(x=>formats.includes(x))};
}
function getHeader(raw:unknown,max=255):string{return typeof raw==="string"&&raw.length<=max?raw:"";}
function parseMeta(request:FastifyRequest){
 const h=request.headers;
 let name="";try{name=decodeURIComponent(getHeader(h["x-media-name"],500)).trim().slice(0,180)}catch{name=""}
 const kind=getHeader(h["x-media-kind"],30)||"other";
 const teamId=getHeader(h["x-media-team"],36)||null;
 let tagValue="";try{tagValue=decodeURIComponent(getHeader(h["x-media-tags"],1000))}catch{}
 const tags=tagValue.split(",").map(x=>x.trim()).filter(Boolean);
 return {name,kind,teamId,tags};
}
async function publicReference(id:string){
 const url="/api/v1/media/files/"+id;
 const [series,episodes,banners]=await Promise.all([
 list("SELECT 1 FROM series WHERE visibility='public' AND (poster=? OR banner=?) LIMIT 1",[url,url]),
 list("SELECT 1 FROM episodes e JOIN seasons se ON se.id=e.season_id JOIN series s ON s.id=se.series_id WHERE s.visibility='public' AND e.thumbnail=? AND e.status IN ('published','scheduled') LIMIT 1",[url]),
 list("SELECT 1 FROM banners WHERE active=1 AND (image=? OR mobile_image=?) AND (start_at IS NULL OR start_at<=UTC_TIMESTAMP(3)) AND (end_at IS NULL OR end_at>UTC_TIMESTAMP(3)) LIMIT 1",[url,url])
 ]);return !!(series.length||episodes.length||banners.length);
}
async function inUse(id:string):Promise<boolean>{
 const url="/api/v1/media/files/"+id;
 const [series,episodes,banners]=await Promise.all([
 list("SELECT 1 FROM series WHERE poster=? OR banner=? LIMIT 1",[url,url]),
 list("SELECT 1 FROM episodes WHERE thumbnail=? LIMIT 1",[url]),
 list("SELECT 1 FROM banners WHERE image=? OR mobile_image=? LIMIT 1",[url,url])
 ]);return !!(series.length||episodes.length||banners.length);
}
export function registerMedia(app:FastifyInstance){
 app.addContentTypeParser("application/octet-stream",{parseAs:"buffer",bodyLimit:MAX_BYTES},
 (_request,body,done)=>done(null,body));
 app.get("/api/v1/studio/media",async(req,reply)=>{
  const user=await requireActor(req,reply);if(!user)return;
  reply.header("Cache-Control","no-store");
  const [assets,policy]=await Promise.all([
   list(user.isAdmin?"SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 2000":
     "SELECT a.* FROM media_assets a JOIN team_members m ON m.team_id=a.team_id WHERE m.user_id=? ORDER BY a.created_at DESC LIMIT 2000",
     user.isAdmin?[]:[user.id]),uploadOptions()]);
  return {assets:assets.map(mediaRow),settings:policy};
 });
 app.get("/api/v1/studio/media/settings",async(req,reply)=>{
  const user=await requireActor(req,reply);if(!user)return;
  reply.header("Cache-Control","no-store");return uploadOptions();
 });
 app.put<{Body:{maxFileMb?:unknown,maxFiles?:unknown,allowedTypes?:unknown}}>("/api/v1/studio/media/settings",async(req,reply)=>{
  const user=await requireActor(req,reply,true);if(!user)return;
  if(!user.isAdmin)return error(reply,403,"forbidden");
  const maxMb=Number(req.body?.maxFileMb),maxFiles=Number(req.body?.maxFiles),types=req.body?.allowedTypes;
  if(!Number.isInteger(maxMb)||maxMb<1||maxMb>20||!Number.isInteger(maxFiles)||maxFiles<1||maxFiles>2000||
     !Array.isArray(types)||types.length<1||types.length>4||types.some(t=>!formats.includes(String(t))))
    return error(reply,400,"invalid_upload_settings");
  await pool.execute("UPDATE media_upload_settings SET max_file_mb=?,max_files=?,allowed_types=? WHERE id=1",
   [maxMb,maxFiles,[...new Set(types)].join(",")]);
  await audit(user.id,"media.settings.updated","00000000-0000-0000-0000-000000000001");
  return {ok:true};
 });
 app.post<{Body:Buffer}>("/api/v1/studio/media/upload",{bodyLimit:MAX_BYTES},async(req,reply)=>{
  const user=await requireActor(req,reply,true);if(!user)return;
  const meta=parseMeta(req),data=req.body;
  if(!meta.name||!kinds.includes(meta.kind)||!Buffer.isBuffer(data)||!data.length)
    return error(reply,400,"invalid_media");
  const tags=normalizeTags(meta.tags);if(!tags)return error(reply,400,"invalid_tags");
  if(meta.teamId&&!safeId(meta.teamId))return error(reply,400,"invalid_team");
  if(!await access(user,meta.teamId,true))return error(reply,403,"forbidden");
  const policy=await uploadOptions(),format=signature(data);
  if(!format||!policy.allowedTypes.includes(format.type))return error(reply,415,"unsupported_file_format");
  if(data.length>policy.maxFileMb*1024*1024)return error(reply,413,"file_too_large");
  const count=await list("SELECT COUNT(*) AS count FROM media_assets");
  if(Number(count[0]?.count)>=policy.maxFiles)return error(reply,409,"media_limit_reached");
  const id=randomUUID(),fileName=id+"."+format.ext,target=path.join(storage,fileName);
  await mkdir(storage,{recursive:true});
  await writeFile(target,data,{flag:"wx",mode:0o644});
  try{
   await pool.execute("INSERT INTO media_assets(id,name,original_name,kind,tags_json,mime_type,byte_size,sha256,storage_name,team_id,creator_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    [id,meta.name,meta.name,meta.kind,JSON.stringify(tags),format.mime,data.length,
    createHash("sha256").update(data).digest("hex"),fileName,meta.teamId,user.id]);
  }catch(e){await unlink(target).catch(()=>{});throw e;}
  await audit(user.id,"media.uploaded",id);
  return reply.code(201).send({id,url:"/api/v1/media/files/"+id});
 });
 app.patch<{Params:{id:string};Body:{name?:unknown,kind?:unknown,tags?:unknown}}>("/api/v1/studio/media/:id",async(req,reply)=>{
  const user=await requireActor(req,reply,true);if(!user)return;
  if(!safeId(req.params.id))return error(reply,400,"invalid_id");
  const assets=await list("SELECT * FROM media_assets WHERE id=?",[req.params.id]);
  if(!assets.length)return error(reply,404,"not_found");
  if(!await access(user,assets[0].team_id,true))return error(reply,403,"forbidden");
  const name=words(req.body?.name,180),kind=req.body?.kind,tags=normalizeTags(req.body?.tags);
  if(!name||!kinds.includes(String(kind))||!tags)return error(reply,400,"invalid_media");
  await pool.execute("UPDATE media_assets SET name=?,kind=?,tags_json=? WHERE id=?",
   [name,kind,JSON.stringify(tags),req.params.id]);
  await audit(user.id,"media.updated",req.params.id);return {ok:true};
 });
 app.delete<{Params:{id:string}}>("/api/v1/studio/media/:id",async(req,reply)=>{
  const user=await requireActor(req,reply,true);if(!user)return;
  if(!safeId(req.params.id))return error(reply,400,"invalid_id");
  const assets=await list("SELECT * FROM media_assets WHERE id=?",[req.params.id]);
  if(!assets.length)return error(reply,404,"not_found");
  if(!await access(user,assets[0].team_id,true))return error(reply,403,"forbidden");
  if(await inUse(req.params.id))return error(reply,409,"media_in_use");
  await pool.execute("DELETE FROM media_assets WHERE id=?",[req.params.id]);
  await unlink(path.join(storage,String(assets[0].storage_name))).catch(()=>{});
  await audit(user.id,"media.deleted",req.params.id);return {ok:true};
 });
 app.get<{Params:{id:string};Querystring:{download?:string}}>("/api/v1/media/files/:id",async(req,reply)=>{
  if(!safeId(req.params.id))return error(reply,404,"not_found");
  const assets=await list("SELECT * FROM media_assets WHERE id=?",[req.params.id]);
  if(!assets.length)return error(reply,404,"not_found");
  const asset=assets[0],user=await actor(req);
  if(!await publicReference(req.params.id)&&!(user&&await access(user,asset.team_id,false)))
    return error(reply,404,"not_found");
  let buffer:Buffer;
  try{buffer=await readFile(path.join(storage,String(asset.storage_name)));}
  catch{return error(reply,404,"file_missing");}
  reply.header("Content-Type",String(asset.mime_type));
  reply.header("X-Content-Type-Options","nosniff");
  reply.header("Content-Security-Policy","default-src 'none'; sandbox");
  reply.header("Cache-Control","private, max-age=60");
  const safeName=String(asset.name).replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,100)||"imagem";
  const ext=String(asset.storage_name).split(".").pop();
  reply.header("Content-Disposition",req.query?.download==="1"?
   'attachment; filename="'+safeName+'.'+ext+'"':'inline');
  return reply.send(buffer);
 });
}
