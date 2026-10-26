const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const base='http://localhost:8088';
let cookie='',csrf='';
async function call(path,method='GET',body){
  const headers={'Accept':'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(cookie)headers['Cookie']=cookie;
  if(method!=='GET'&&csrf)headers['x-csrf-token']=csrf;
  const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.json()}catch{data={}};
  return {code:response.status,data,setCookie:response.headers.get('set-cookie')};
}
(async()=>{
  assert.equal((await call('/api/v1/studio/bootstrap')).code,401);
  const login=await call('/api/v1/auth/login','POST',{email:process.env.CI_LOGIN_EMAIL,password:process.env.CI_LOGIN_PASSWORD});
  assert.equal(login.code,200);
  cookie=login.setCookie.split(';')[0];csrf=login.data.csrfToken;
  const administrator=await call('/api/v1/studio/bootstrap');
  assert.equal(administrator.code,200);assert.equal(administrator.data.series.length,5);
  const editorPassword=randomBytes(24).toString('hex');
  const user=await call('/api/v1/studio/users','POST',{email:'integration-editor@example.test',name:'Integration Editor',password:editorPassword});
  assert.equal(user.code,201);
  assert.equal((await call('/api/v1/studio/teams/t1/members','PUT',{email:'integration-editor@example.test',role:'editor'})).code,200);
  assert.equal((await call('/api/v1/studio/series/s1/grants','PUT',{teamId:'t1',userId:user.data.id,permission:'edit'})).code,200);
  const editorLogin=await call('/api/v1/auth/login','POST',{email:'integration-editor@example.test',password:editorPassword});
  assert.equal(editorLogin.code,200);
  cookie=editorLogin.setCookie.split(';')[0];csrf=editorLogin.data.csrfToken;
  const scoped=await call('/api/v1/studio/bootstrap');
  assert.equal(scoped.code,200);assert.deepEqual(scoped.data.series.map(s=>s.id),['s1']);
  const form={title:'Além da Órbita',category:'Ficção científica',summary:'Texto atualizado na integração',poster:'assets/orbital-poster.svg',banner:'assets/orbital-banner.svg'};
  assert.equal((await call('/api/v1/studio/series/s1','PUT',form)).code,200);
  assert.equal((await call('/api/v1/studio/series/s3','PUT',form)).code,403);
  assert.equal((await call('/api/v1/studio/series/s1','PUT',{...form,featured:true})).code,403);
  assert.equal((await call('/api/v1/auth/logout','POST')).code,200);
  assert.equal((await call('/api/v1/studio/bootstrap')).code,401);
  console.log('Authentication, role isolation, grants and revocation: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
