import {randomBytes} from "node:crypto";
import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {hashToken,csrfForToken,normalizeEmail,tokenMatch,verifyPassword} from "./security.js";
type Row=RowDataPacket & {id:string;email:string;name:string;active:number;is_admin:number;password_hash?:string};
export type Actor={id:string;email:string;name:string;isAdmin:boolean;token:string};
const cookieName="cl_session";
const sessionLength=7*86400;
const failLimit=new Map<string,{count:number;reset:number}>();
const dummy="scrypt$0123456789abcdef0123456789abcdef$"+"0".repeat(128);
const noCache=(reply:FastifyReply)=>reply.header("Cache-Control","no-store");
function getCookie(req:FastifyRequest) {
  const parts=(req.headers.cookie||"").split(";");
  for(const part of parts){
    const [key,value]=part.trim().split("=");
    if(key===cookieName&&value&&/^[0-9a-f]{64}$/.test(value))return value;
  }
  return null;
}
const cookie=(token:string,maxAge:number)=>{
  const secure=process.env.COOKIE_SECURE==="true" ? "; Secure" : "";
  return cookieName+"="+token+"; HttpOnly; Path=/api/v1; SameSite=Strict; Max-Age="+maxAge+secure;
};
function throttle(req:FastifyRequest):boolean {
  const key=req.ip,now=Date.now();
  if(failLimit.size>10000)failLimit.clear();
  const prev=failLimit.get(key);
  if(!prev||prev.reset<now){failLimit.set(key,{count:1,reset:now+15*60_000});return true;}
  if(prev.count>=12)return false;
  prev.count++;return true;
}
export async function actor(req:FastifyRequest):Promise<Actor|null>{
  const token=getCookie(req);
  if(!token)return null;
  const [rows]=await pool.execute<RowDataPacket[]>(
    `SELECT u.id,u.email,u.name,u.active,u.is_admin
     FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3)
       AND s.revoked_at IS NULL AND u.active=1 LIMIT 1`,[hashToken(token)]);
  if(!rows.length)return null;
  const u=rows[0] as Row;
  return {id:u.id,email:u.email,name:u.name,isAdmin:!!u.is_admin,token};
}
export async function requireActor(req:FastifyRequest,reply:FastifyReply,write=false):Promise<Actor|null>{
  const u=await actor(req);
  if(!u){noCache(reply);reply.code(401).send({error:"unauthorized"});return null;}
  if(write&&!tokenMatch(req.headers["x-csrf-token"],csrfForToken(u.token))){
    noCache(reply);reply.code(403).send({error:"csrf_required"});return null;
  }
  return u;
}
export function registerAuth(app:FastifyInstance){
  app.post<{Body:{email?:unknown;password?:unknown}}>("/api/v1/auth/login",async(req,reply)=>{
    noCache(reply);
    if(!throttle(req))return reply.code(429).send({error:"too_many_attempts"});
    const email=normalizeEmail(req.body?.email);
    const password=req.body?.password;
    if(typeof password!=="string"||password.length>128||!email)return reply.code(401).send({error:"invalid_credentials"});
    const [rows]=await pool.execute<RowDataPacket[]>(
      "SELECT id,email,name,password_hash,is_admin,active FROM users WHERE email=? LIMIT 1",[email]);
    const u=(rows[0]??null) as Row|null;
    const valid=await verifyPassword(password,u?.password_hash||dummy);
    if(!valid||!u||!u.active)return reply.code(401).send({error:"invalid_credentials"});
    const token=randomBytes(32).toString("hex");
    await pool.execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?, ?,DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 7 DAY))",
      [hashToken(token),u.id]);
    reply.header("Set-Cookie",cookie(token,sessionLength));
    return {user:{id:u.id,email:u.email,name:u.name,isAdmin:!!u.is_admin},csrfToken:csrfForToken(token)};
  });
  app.get("/api/v1/auth/session",async(req,reply)=>{
    noCache(reply);
    const user=await requireActor(req,reply);
    if(!user)return;
    return {user:{id:user.id,email:user.email,name:user.name,isAdmin:user.isAdmin},csrfToken:csrfForToken(user.token)};
  });
  app.post("/api/v1/auth/logout",async(req,reply)=>{
    noCache(reply);
    const user=await requireActor(req,reply,true);
    if(!user)return;
    await pool.execute("UPDATE sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE token_hash=?",[hashToken(user.token)]);
    reply.header("Set-Cookie",cookie("",0));
    return {ok:true};
  });
  app.post("/api/v1/auth/logout-all",async(req,reply)=>{
    noCache(reply);
    const user=await requireActor(req,reply,true);
    if(!user)return;
    await pool.execute("UPDATE sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE user_id=? AND revoked_at IS NULL",[user.id]);
    reply.header("Set-Cookie",cookie("",0));
    return {ok:true};
  });
}
