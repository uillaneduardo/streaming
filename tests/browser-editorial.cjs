#!/usr/bin/env node
// Real browser: category quick-create/settings and revision approval on live Studio.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.CENALIVRE_TEST_BASE_URL||'http://127.0.0.1:8088';
const {CI_LOGIN_EMAIL,CI_LOGIN_PASSWORD}=process.env;
if(!CI_LOGIN_EMAIL||!CI_LOGIN_PASSWORD)throw Error('CI owner credentials required');
const out=path.join(__dirname,'..','test-results','browser');
fs.mkdirSync(out,{recursive:true});
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/#/studio/series');
  await page.locator('#studio-login').waitFor({timeout:15000});
  await page.locator('#studio-login [name="email"]').fill(CI_LOGIN_EMAIL);
  await page.locator('#studio-login [name="password"]').fill(CI_LOGIN_PASSWORD);
  await page.locator('#studio-login [type="submit"]').click();
  await page.locator('.admin-main').waitFor({timeout:15000});
  await page.goto(base+'/#/studio/series');
  await page.locator('[data-action="edit-series"][data-id="s1"]').waitFor({timeout:15000});
  await page.locator('[data-action="edit-series"][data-id="s1"]').click();
  await page.locator('[data-action="category-quick"]').waitFor();
  await page.locator('[data-action="category-quick"]').click();
  await page.locator('#category-quick-name').fill('Categoria Navegador CI');
  await page.locator('[data-action="category-quick-save"]').click();
  await page.locator('select[name="category"] option:checked').getByText('Categoria Navegador CI').waitFor();
  await page.screenshot({path:path.join(out,'m2-category-quick-create.png'),fullPage:true});
  await page.locator('#modal-root [data-action="close-modal"]').last().click();

  await page.goto(base+'/#/studio/settings');
  await page.locator('#settings-categorias').waitFor();
  await page.getByText('Categoria Navegador CI').first().waitFor();
  const row=page.locator('.category-settings-item').filter({hasText:'Categoria Navegador CI'});
  await row.locator('[data-action="category-edit"]').click();
  await page.locator('#category-form [name="name"]').fill('Categoria Navegador CI Editada');
  await page.locator('#category-form [type="submit"]').click();
  await page.locator('.category-settings-item').filter({hasText:'Categoria Navegador CI Editada'}).waitFor();
  page.once('dialog',d=>d.accept());
  await page.locator('.category-settings-item').filter({hasText:'Categoria Navegador CI Editada'})
    .locator('[data-action="category-delete"]').click();
  await page.getByText('Categoria excluída.',{exact:false}).first().waitFor();
  await page.screenshot({path:path.join(out,'m2-category-settings.png'),fullPage:true});

  await page.goto(base+'/#/studio/series');
  await page.locator('[data-action="review-open"][data-id="s1"]').waitFor({timeout:15000});
  await page.locator('[data-action="review-open"][data-id="s1"]').click();
  await page.locator('#review-submit-form').waitFor();
  assert((await page.locator('.review-version').count())>0,'Revision history visible');
  await page.locator('#review-submit-form [name="message"]').fill('Revisão de conteúdo via navegador');
  await page.locator('#review-submit-form [type="submit"]').click();
  await page.locator('.review-card [data-action="review-decide"]').first().waitFor({timeout:15000});
  await page.screenshot({path:path.join(out,'m2-editorial-pending-review.png'),fullPage:true});
  await page.locator('.review-card [data-decision="approve"]').first().click();
  await page.getByText('Aprovado',{exact:true}).first().waitFor({timeout:15000});
  await page.screenshot({path:path.join(out,'m2-editorial-approved-review.png'),fullPage:true});
  assert.deepEqual(errors,[],'No client-side errors during editorial workflows');
  console.log('M2 editorial browser flow passed: category create/update/delete, history, submit and approve');
 }catch(error){
  await page.screenshot({path:path.join(out,'FAILED-m2-editorial.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{await context.close();await browser.close();}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
