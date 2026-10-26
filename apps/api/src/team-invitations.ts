import {randomBytes,randomUUID} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import type {RowDataPacket} from "mysql2";
import {pool} from "./db.js";
import {actor as currentActor,requireActor} from "./auth.js";
import {teamManager} from "./studio.js";
import {csrfForToken,hashPassword,hashToken,normalizeEmail,tokenMatch} from "./security.js";

type Row=RowDataPacket&Record<string,any>;
const roles=["manager","editor","publisher","viewer"];
const validId=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-z_-]{1,36}$/i.test(v);
const validToken=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const fail=(reply:FastifyReply,status:number,message:string)=>reply.code(status).send({error:message});
const noCache=(reply:FastifyReply)=>reply.header("Cache-Control","no-store");
const lookups=new Map<string,{attempts:number;until:number}>();
function allowLookup(ip:string){
 const now=Date.now(),old=lookups.get(ip);
 if(lookups.size>10000)lookups.clear();
 if(!old||old.until<now){lookups.set(ip,{attempts:1,until:now+300_000});return true;}
 if(old.attempts>=50)return false;
 old.attempts++;return true;
}
function status(r:Row){
 if(r.accepted_at)return "accepted";
 if(r.revoked_at)return "revoked";
 if(new Date(r.expires_at).getTime()<=Date.now())return "expired";
 return "pending";
}
function present(r:Row){
 return {id:r.id,teamId:r.team_id,teamName:r.team_name,email:r.email,
  role:r.role,status:status(r),expiresAt:new Date(r.expires_at).toISOString()};
}
const audit=async(conn:any,actorId:string,action:string,id:string)=>
 conn.execute("INSERT INTO audit_log(id,actor_id,action,target_type,target_id) VALUES(?,?,?,?,?)",
  [randomUUID(),actorId,action,"team_invitation",id]);

export function registerTeamInvitations(app:FastifyInstance){
 app.get("/api/v1/studio/invitations",async(req,reply)=>{
  noCache(reply);
  const user=await requireActor(req,reply);if(!user)return;
  const sql="SELECT i.id,i.team_id,t.name AS team_name,i.email,i.role,i.expires_at,"+
   "i.accepted_at,i.revoked_at FROM team_invitations i JOIN teams t ON t.id=i.team_id";
  const where=user.isAdmin?"":" JOIN team_members m ON m.team_id=i.team_id"+
    " AND m.user_id=? AND m.role='manager'";
  const [rows]=await pool.execute<RowDataPacket[]>(sql+where+" ORDER BY i.created_at DESC LIMIT 300",
    user.isAdmin?[]:[user.id]);
  return {invitations:(rows as Row[]).map(present)};
 });

 app.post<{Body:{teamId?:unknown;email?:unknown;role?:unknown}}>(
  "/api/v1/studio/invitations",async(req,reply)=>{
   noCache(reply);
   const user=await requireActor(req,reply,true);if(!user)return;
   const {teamId,role}=req.body||{},email=normalizeEmail(req.body?.email);
   if(!validId(teamId)||!email||!roles.includes(String(role)))return fail(reply,400,"invalid_invitation");
   if(!await teamManager(user,teamId))return fail(reply,403,"forbidden");
   if(role==="manager"&&!user.isAdmin)return fail(reply,403,"manager_invites_require_admin");
   const conn=await pool.getConnection();
   try{
    await conn.beginTransaction();
    const [team]=await conn.execute<RowDataPacket[]>("SELECT id FROM teams WHERE id=?",[teamId]);
    if(!team.length){await conn.rollback();return fail(reply,404,"team_not_found");}
    const [member]=await conn.execute<RowDataPacket[]>(
     "SELECT 1 FROM team_members m JOIN users u ON u.id=m.user_id"+
      " WHERE m.team_id=? AND u.email=? LIMIT 1",[teamId,email]);
    if(member.length){await conn.rollback();return fail(reply,409,"already_member");}
    const [pending]=await conn.execute<RowDataPacket[]>(
     "SELECT id FROM team_invitations WHERE team_id=? AND email=?"+
      " AND accepted_at IS NULL AND revoked_at IS NULL"+
      " AND expires_at>UTC_TIMESTAMP(3) LIMIT 1",[teamId,email]);
    if(pending.length){await conn.rollback();return fail(reply,409,"pending_invitation_exists");}
    const [volume]=await conn.execute<RowDataPacket[]>(
     "SELECT COUNT(*) AS count FROM team_invitations WHERE team_id=?"+
      " AND accepted_at IS NULL AND revoked_at IS NULL"+
      " AND expires_at>UTC_TIMESTAMP(3)",[teamId]);
    if(Number((volume[0] as Row).count)>=100){await conn.rollback();return fail(reply,429,"too_many_team_invites");}
    const id=randomUUID(),token=randomBytes(32).toString("hex");
    await conn.execute("INSERT INTO team_invitations"+
     " (id,team_id,email,role,token_hash,created_by,expires_at)"+
     " VALUES (?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 72 HOUR))",
     [id,teamId,email,role,hashToken(token),user.id]);
    await audit(conn,user.id,"invitation.created",id);
    await conn.commit();
    return reply.code(201).send({id,token,email,role,expiresInHours:72});
   }catch(error){await conn.rollback();throw error;}
   finally{conn.release();}
  });

 app.delete<{Params:{id:string}}>("/api/v1/studio/invitations/:id",async(req,reply)=>{
  noCache(reply);
  const user=await requireActor(req,reply,true);if(!user)return;
  if(!validId(req.params.id))return fail(reply,400,"invalid_id");
  const conn=await pool.getConnection();
  try{
   await conn.beginTransaction();
   const [rows]=await conn.execute<RowDataPacket[]>(
    "SELECT id,team_id,accepted_at,revoked_at FROM team_invitations WHERE id=? FOR UPDATE",
    [req.params.id]);
   if(!rows.length){await conn.rollback();return fail(reply,404,"invitation_not_found");}
   const invite=rows[0] as Row;
   if(!await teamManager(user,String(invite.team_id))){
    await conn.rollback();return fail(reply,403,"forbidden");
   }
   if(invite.accepted_at||invite.revoked_at){
    await conn.rollback();return fail(reply,409,"invitation_not_pending");
   }
   await conn.execute("UPDATE team_invitations SET revoked_at=UTC_TIMESTAMP(3) WHERE id=?",[invite.id]);
   await audit(conn,user.id,"invitation.revoked",String(invite.id));
   await conn.commit();
   return {ok:true};
  }catch(error){await conn.rollback();throw error;}
  finally{conn.release();}
 });

 app.post<{Body:{token?:unknown}}>("/api/v1/invitations/lookup",async(req,reply)=>{
  noCache(reply);
  if(!allowLookup(req.ip))return fail(reply,429,"too_many_attempts");
  if(!validToken(req.body?.token))return fail(reply,404,"invitation_not_found");
  const [rows]=await pool.execute<RowDataPacket[]>(
   "SELECT i.id,i.team_id,t.name AS team_name,i.email,i.role,"+
    "i.expires_at,i.revoked_at,i.accepted_at FROM team_invitations i"+
    " JOIN teams t ON t.id=i.team_id WHERE i.token_hash=? LIMIT 1",[hashToken(req.body.token)]);
  if(!rows.length)return fail(reply,404,"invitation_not_found");
  const invite=rows[0] as Row;
  if(status(invite)!=="pending")return fail(reply,410,"invitation_"+status(invite));
  return {invitation:present(invite)};
 });

 app.post<{Body:{token?:unknown;name?:unknown;password?:unknown}}>(
  "/api/v1/invitations/accept",async(req,reply)=>{
   noCache(reply);
   if(!allowLookup(req.ip))return fail(reply,429,"too_many_attempts");
   if(!validToken(req.body?.token))return fail(reply,404,"invitation_not_found");
   const session=await currentActor(req);
   if(session&&!tokenMatch(req.headers["x-csrf-token"],csrfForToken(session.token)))
    return fail(reply,403,"csrf_required");
   const conn=await pool.getConnection();
   try{
    await conn.beginTransaction();
    const [invitations]=await conn.execute<RowDataPacket[]>(
     "SELECT id,team_id,email,role,expires_at,revoked_at,accepted_at"+
      " FROM team_invitations WHERE token_hash=? FOR UPDATE",[hashToken(req.body.token)]);
    if(!invitations.length){await conn.rollback();return fail(reply,404,"invitation_not_found");}
    const invitation=invitations[0] as Row;
    if(invitation.revoked_at||invitation.accepted_at||
       new Date(invitation.expires_at).getTime()<=Date.now()){
     await conn.rollback();return fail(reply,410,"invitation_unavailable");
    }
    const [users]=await conn.execute<RowDataPacket[]>(
     "SELECT id,email FROM users WHERE email=? FOR UPDATE",[invitation.email]);
    const existing=(users[0]||null) as Row|null;
    let userId:string;
    if(existing){
     if(!session){await conn.rollback();return fail(reply,401,"existing_account_login_required");}
     if(session.id!==existing.id){
      await conn.rollback();return fail(reply,403,"invitation_email_mismatch");
     }
     userId=String(existing.id);
    }else{
     const name=typeof req.body.name==="string"?req.body.name.trim():"";
     const password=req.body.password;
     if(!name||name.length>160||typeof password!=="string"||password.length<12||password.length>128){
      await conn.rollback();return fail(reply,400,"invalid_new_user");
     }
     const hash=await hashPassword(password);
     userId=randomUUID();
     await conn.execute("INSERT INTO users(id,email,name,password_hash) VALUES(?,?,?,?)",
      [userId,invitation.email,name,hash]);
    }
    await conn.execute("INSERT INTO team_members(team_id,user_id,role) VALUES (?,?,?)"+
       " ON DUPLICATE KEY UPDATE role=VALUES(role)",
     [invitation.team_id,userId,invitation.role]);
    await conn.execute("UPDATE team_invitations SET accepted_at=UTC_TIMESTAMP(3),accepted_by=? WHERE id=?",
     [userId,invitation.id]);
    await audit(conn,userId,"invitation.accepted",String(invitation.id));
    await conn.commit();
    return {ok:true,accountCreated:!existing,teamId:invitation.team_id};
   }catch(error){
    await conn.rollback();
    if((error as {code?:string}).code==="ER_DUP_ENTRY")return fail(reply,409,"email_exists_retry_login");
    throw error;
   }finally{conn.release();}
  });
}
