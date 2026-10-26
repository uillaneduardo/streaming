#!/usr/bin/env node
// Real-browser invitation flow: Studio manager -> one-time URL -> new team member.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.CENALIVRE_TEST_BASE_URL||'http://127.0.0.1:8088';
const email=process.env.CI_LOGIN_EMAIL,password=process.env.CI_LOGIN_PASSWORD;
if(!email||!password)throw new Error('CI_LOGIN_EMAIL and CI_LOGIN_PASSWORD are required');
const dir=path.join(__dirname,'..','test-results','browser');
fs.mkdirSync(dir,{recursive:true});
async function login(page,user,pass){
 await page.goto(base+'/#/studio/teams');
 await page.locator('#studio-login').waitFor();
 await page.locator('#studio-login [name="email"]').fill(user);
 await page.locator('#studio-login [name="password"]').fill(pass);
 await page.locator('#studio-login [type="submit"]').click();
 await page.locator('.admin-main').waitFor({timeout:15000});
}
async function inviteFromStudio(page,invitedEmail){
 await page.goto(base+'/#/studio/teams');
 await page.locator('[data-action="invite-open"]').waitFor();
 await page.locator('[data-action="invite-open"]').click();
 await page.locator('#studio-invite-form').waitFor();
 await page.locator('#studio-invite-form [name="teamId"]').selectOption('t1');
 await page.locator('#studio-invite-form [name="role"]').selectOption('viewer');
 await page.locator('#studio-invite-form [name="email"]').fill(invitedEmail);
 await page.locator('#studio-invite-form [type="submit"]').click();
 await page.locator('#invite-created-link').waitFor();
 const url=await page.locator('#invite-created-link').inputValue();
 assert.match(url,/\/#\/convite\/[a-f0-9]{64}$/);
 await page.locator('[data-action="close-modal"]').last().click();
 return url;
}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const owner=await browser.newContext();
 const admin=await owner.newPage();
 const browserErrors=[];
 admin.on('pageerror',e=>browserErrors.push(e.message));
 try{
  await login(admin,email,password);
  const inviteEmail='browser-accept@example.test';
  const secretPass='browser-accept-'+Math.random().toString(36).slice(2)+'!Secure42';
  const link=await inviteFromStudio(admin,inviteEmail);

  const visitorContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const visitor=await visitorContext.newPage();
  visitor.on('pageerror',e=>browserErrors.push(e.message));
  await visitor.goto(link);
  await visitor.locator('#invite-accept-form').waitFor({timeout:15000});
  assert.match(await visitor.locator('.auth-panel').innerText(),/Coletivo Aurora/);
  await visitor.locator('#invite-accept-form [name="name"]').fill('Colaborador Mobile');
  await visitor.locator('#invite-accept-form [name="password"]').fill(secretPass);
  await visitor.locator('#invite-accept-form [type="submit"]').click();
  await visitor.getByText('Convite aceito.',{exact:false}).first().waitFor({timeout:15000});
  await visitor.screenshot({path:path.join(dir,'m1-invitation-accepted-mobile.png'),fullPage:true});
  await visitor.locator('[data-action="go-studio"]').click();
  await visitor.locator('#studio-login').waitFor();
  await visitor.locator('#studio-login [name="email"]').fill(inviteEmail);
  await visitor.locator('#studio-login [name="password"]').fill(secretPass);
  await visitor.locator('#studio-login [type="submit"]').click();
  await visitor.locator('.admin-main').waitFor({timeout:15000});
  await visitor.goto(base+'/#/studio/teams');
  await visitor.getByText('Coletivo Aurora').first().waitFor({timeout:15000});
  await visitor.screenshot({path:path.join(dir,'m1-invited-member-studio.png'),fullPage:true});
  await visitorContext.close();

  const revokeEmail='browser-revoked@example.test';
  const revokeLink=await inviteFromStudio(admin,revokeEmail);
  admin.once('dialog',dialog=>dialog.accept());
  const revokeRow=admin.locator('tr').filter({hasText:revokeEmail});
  await revokeRow.locator('[data-action="invite-revoke"]').click();
  await admin.getByText('Revogado').first().waitFor({timeout:15000});
  const token=revokeLink.split('/').pop();
  const response=await admin.request.post(base+'/api/v1/invitations/lookup',{data:{token}});
  assert.equal(response.status(),410,'Revoked invitation must not be usable');
  assert.deepEqual(browserErrors,[],'Unexpected JavaScript errors in invitation flows');
  console.log('M1 invitation browser flow passed: owner -> mobile invite -> registration -> Studio, plus revocation');
 }catch(error){
  await admin.screenshot({path:path.join(dir,'FAILED-m1-invitations.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{await owner.close();await browser.close()}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1});
