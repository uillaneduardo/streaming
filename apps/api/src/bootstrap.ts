import {randomUUID} from "node:crypto";
import {pool} from "./db.js";
import {hashPassword,normalizeEmail} from "./security.js";
async function run(){
  const email=normalizeEmail(process.env.BOOTSTRAP_EMAIL);
  const password=process.env.BOOTSTRAP_PASSWORD||"";
  const name=process.env.BOOTSTRAP_NAME?.trim()||"";
  if(!email||!name||name.length>160||password.length<12||password.length>128){
    throw new Error("BOOTSTRAP_EMAIL, BOOTSTRAP_NAME, BOOTSTRAP_PASSWORD (12-128 chars) são obrigatórios.");
  }
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [rows]=await conn.query<any[]>("SELECT id FROM users WHERE is_admin=1 LIMIT 1 FOR UPDATE");
    if(rows.length)throw new Error("Administrador global já existe; bootstrap bloqueado.");
    const hash=await hashPassword(password);
    await conn.execute("INSERT INTO users(id,email,name,password_hash,is_admin,active) VALUES (?,?,?,?,1,1)",
      [randomUUID(),email,name,hash]);
    await conn.commit();
    process.stdout.write("Administrador inicial criado.\n");
  }catch(e){await conn.rollback();throw e;}
  finally{conn.release();}
}
run().catch(e=>{process.stderr.write((e instanceof Error?e.message:"Bootstrap falhou")+"\n");process.exitCode=1;}).finally(()=>pool.end());
