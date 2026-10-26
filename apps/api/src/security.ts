import {createHash,randomBytes,scrypt as scryptCb,timingSafeEqual} from "node:crypto";
const OPTIONS={N:16384,r:8,p:1,maxmem:64*1024*1024};
const scrypt=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>{
  scryptCb(password,salt,64,OPTIONS,(error,key)=>error?reject(error):resolve(key));
});
export async function hashPassword(password:string) {
  if(typeof password!=="string"||password.length<12||password.length>128) throw new Error("password_length");
  const salt=randomBytes(16).toString("hex");
  const derived=await scrypt(password,salt);
  return "scrypt$"+salt+"$"+derived.toString("hex");
}
export async function verifyPassword(password:unknown,record:string) {
  if(typeof password!=="string"||password.length>128||!record.startsWith("scrypt$")) return false;
  const [,salt,hash]=record.split("$");
  if(!/^[a-f0-9]{32}$/.test(salt||"")||!/^[a-f0-9]{128}$/.test(hash||""))return false;
  const known=Buffer.from(hash,"hex"),calculated=await scrypt(password,salt);
  return timingSafeEqual(known,calculated);
}
export const normalizeEmail=(value:unknown):string|null=>{
  if(typeof value!=="string")return null;
  const v=value.trim().toLowerCase();
  return v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?v:null;
};
export const hashToken=(token:string)=>createHash("sha256").update(token).digest("hex");
export const csrfForToken=(token:string)=>hashToken("cenalivre:csrf:"+token);
export const tokenMatch=(received:unknown,expected:string)=>{
  if(typeof received!=="string"||!/^[0-9a-f]{64}$/.test(received))return false;
  return timingSafeEqual(Buffer.from(received,"hex"),Buffer.from(expected,"hex"));
};
export function validateArtwork(value:unknown):string|null {
  if(value===null||value===undefined||value==="")return null;
  if(typeof value!=="string"||value.length>512)return null;
  if(/^assets\/[a-zA-Z0-9_.-]+\.(svg|png|jpg|jpeg|webp)$/.test(value))return value;
  if(/^\/api\/v1\/media\/files\/[0-9a-f-]{36}$/i.test(value))return value;
  try {const u=new URL(value);return u.protocol==="https:"&&u.username===""&&u.password===""?value:null;}
  catch{return null;}
}
