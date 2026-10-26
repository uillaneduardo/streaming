#!/usr/bin/env node
/* Browser acceptance: M0 portal, Studio, artwork and release windows.
 * Runs in real Chromium (desktop + mobile), over file:// and Nginx/HTTP.
 * Screenshots are uploaded as CI artifacts for manual review.
 */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const repo=path.resolve(__dirname,'..');
const offline=pathToFileURL(path.join(repo,'apps/web/index.html')).href;
const origin=process.env.CENALIVRE_TEST_BASE_URL||'http://127.0.0.1:8088';
const captures=path.join(repo,'test-results/browser');
fs.mkdirSync(captures,{recursive:true});
const devices=[
 {name:'desktop',viewport:{width:1440,height:900},isMobile:false,deviceScaleFactor:1},
 {name:'mobile',viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,hasTouch:true}
];
let checks=0;
function verify(ok,message){assert.ok(ok,message);checks++;}

async function waitFor(page,selector){
 await page.locator(selector).first().waitFor({state:'visible',timeout:15000});
}
async function screenshot(page,name){
 await page.screenshot({path:path.join(captures,name+'.png'),fullPage:true,animations:'disabled'});
}
async function noViewportOverflow(page,label){
 const metrics=await page.evaluate(()=>({
  page:document.documentElement.scrollWidth,
  viewport:document.documentElement.clientWidth,
  body:document.body.scrollWidth
 }));
 verify(metrics.page<=metrics.viewport+3&&metrics.body<=metrics.viewport+3,
  label+': horizontal overflow '+JSON.stringify(metrics));
}
async function assertArtworkLoads(page,label){
 const images=page.locator('img[data-artwork-kind]');
 const count=await images.count();
 verify(count>0,label+': no editorial artwork');
 for(let i=0;i<Math.min(count,14);i++){
  const img=images.nth(i);
  await img.scrollIntoViewIfNeeded();
  const result=await img.evaluate(async image=>{
   try{await image.decode()}catch{}
   return {url:image.getAttribute('src'),width:image.naturalWidth,complete:image.complete};
  });
  verify(result.width>0,label+': broken image '+JSON.stringify(result));
 }
}
async function homeFlow(page,label){
 await waitFor(page,'.hero h1');
 await waitFor(page,'.grid-cards .poster-card');
 verify((await page.locator('.view-option[data-action="home-view"][data-view="grid"]').getAttribute('aria-pressed'))==='true',
  label+': home must default to grid');
 verify(await page.locator('.home-episodes:not(.home-episodes-list)').count()>0,
  label+': episode rows must also default to grid');
 await assertArtworkLoads(page,label+' home');
 await page.locator('[data-action="home-view"][data-view="list"]').click();
 verify(await page.locator('.grid-cards.list-cards').count()>0,label+': list toggle did not update production sections');
 verify(await page.locator('.home-episodes.home-episodes-list').count()>0,
  label+': list toggle did not update episode sections');
 await page.locator('[data-action="home-view"][data-view="grid"]').click();
 verify((await page.locator('[data-action="home-view"][data-view="grid"]').getAttribute('aria-pressed'))==='true',
  label+': switching back to grid failed');
 verify(await page.locator('.grid-cards.list-cards').count()===0,label+': list persisted after changing to grid');
 await noViewportOverflow(page,label+' home');
 await screenshot(page,label+'-home');
}
async function publicFlow(page,label){
 await page.locator('a[href="#/explorar"]').first().click();
 await waitFor(page,'#public-search');
 verify((await page.locator('.poster-card').count())>=3,label+': expected multiple catalog productions');
 await page.locator('#public-search').fill('Código Aberto');
 verify((await page.locator('#explore-results .poster-card').count())===1,
  label+': catalog search should narrow results');
 await page.locator('#public-search').fill('');
 await page.locator('[data-action="catalog-view"][data-view="list"]').click();
 verify(await page.locator('#explore-results .grid-cards.list-cards').count()===1,
  label+': catalog list button failed');
 await page.locator('[data-action="catalog-view"][data-view="grid"]').click();
 await page.locator('a[href="#/serie/s1"]').first().click();
 await waitFor(page,'.series-hero h1');
 verify((await page.locator('.episode-row').count())===4,label+': first season should show four episodes');
 verify(await page.locator('.episode-row').filter({hasText:'Em breve'}).count()>=1,
  label+': scheduled episodes must be labeled unavailable');
 await assertArtworkLoads(page,label+' series');
 await noViewportOverflow(page,label+' series');
 await screenshot(page,label+'-series');

 // The upcoming episode is not playable, even via a direct deep link.
 await page.goto((label.startsWith('offline')?offline:origin+'/')+'#/assistir/e3');
 await waitFor(page,'.watch-layout h2');
 verify(await page.locator('#cenalivre-youtube').count()===0,
  label+': unpublished episode must not mount a YouTube player');
 verify(await page.locator('[data-action="play-video"][disabled]').count()===1,
  label+': premiere window must disable playback');

 await page.goto((label.startsWith('offline')?offline:origin+'/')+'#/assistir/e1');
 await waitFor(page,'.watch-layout h2');
 verify(await page.locator('[data-action="watch"]').count()>=2,
  label+': previous/next navigation is missing');
 await page.locator('.controls [data-action="watch"]').last().click();
 verify(page.url().endsWith('#/assistir/e2'),label+': next episode navigation failed');
 await noViewportOverflow(page,label+' watch');
 await screenshot(page,label+'-player');
}
async function studioOffline(page,label){
 const sections=['dashboard','series','seasons','episodes','media','schedule','homepage','teams','settings'];
 for(const section of sections){
  await page.goto(offline+'#/studio/'+section);
  await waitFor(page,'.admin-main');
  verify(await page.locator('.admin-content').count()===1,
    label+': Studio page '+section+' not rendered');
  const nav=page.locator('[data-action="route"][data-path="/studio/'+section+'"]');
  verify(await nav.count()===1,label+': Studio navigation missing '+section);
  if(section==='dashboard'||section==='series'||section==='settings')
   await screenshot(page,label+'-studio-'+section);
  if(section==='series'){
   await page.locator('[data-action="create-series"]').first().click();
   await waitFor(page,'[role="dialog"]');
   verify(await page.locator('[role="dialog"] .media-inline-thumb').count()>=2,
    label+': series media inputs missing');
   await page.locator('[role="dialog"] [name="title"]').fill('Validação visual');
   verify(await page.locator('[role="dialog"]').count()===1,
    label+': a click inside the modal closed it');
   await page.locator('.modal-backdrop').click({position:{x:6,y:6}});
   verify(await page.locator('[role="dialog"]').count()===0,
    label+': backdrop did not close modal');
  }
  if(section==='homepage'){
   verify(await page.locator('[data-editorial-panel="banners"]').count()===1,
    label+': banners panel missing');
   verify(await page.locator('[data-editorial-panel="sections"]').count()===1,
    label+': CMS sections panel missing');
  }
 }
 if(label.endsWith('mobile')){
  await page.goto(offline+'#/studio/dashboard');
  await waitFor(page,'.admin-top');
  await page.locator('.mobile-menu').click();
  verify(await page.locator('#sidebar.open').count()===1,label+': mobile Studio drawer failed');
  await screenshot(page,label+'-studio-menu');
 }
 await noViewportOverflow(page,label+' Studio');
}
async function serverFlow(page,label){
 await page.goto(origin+'/#/');
 await homeFlow(page,label);
 await publicFlow(page,label);
 // An anonymous visitor must not see administrative data.
 await page.goto(origin+'/#/studio/dashboard');
 await waitFor(page,'#studio-login');
 verify(await page.locator('.admin-main').count()===0,label+': unauthenticated Studio should be blocked');
 await screenshot(page,label+'-studio-login');
}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const dev of devices){
   const ctx=await browser.newContext({viewport:dev.viewport,isMobile:dev.isMobile,
    hasTouch:!!dev.hasTouch,deviceScaleFactor:dev.deviceScaleFactor});
   const page=await ctx.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(offline);
    await homeFlow(page,'offline-'+dev.name);
    await publicFlow(page,'offline-'+dev.name);
    await studioOffline(page,'offline-'+dev.name);
    verify(errors.length===0,'offline '+dev.name+' JavaScript failures: '+errors.join(' | '));
    console.log('PASS offline '+dev.name);
   }catch(error){
    await screenshot(page,'FAILED-offline-'+dev.name).catch(()=>{});
    throw error;
   }finally{await ctx.close()}
  }
  // Fixture is loaded explicitly by CI; production databases are never seeded.
  const healthy=await fetch(origin+'/api/v1/public/bootstrap');
  assert.equal(healthy.status,200,'Nginx/API bootstrap must respond');
  const data=await healthy.json();
  assert.equal(data.series.length,5,'The HTTP browser test requires the CI-only fixture');
  for(const dev of devices){
   const ctx=await browser.newContext({viewport:dev.viewport,isMobile:dev.isMobile,
    hasTouch:!!dev.hasTouch,deviceScaleFactor:dev.deviceScaleFactor});
   const page=await ctx.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await serverFlow(page,'nginx-'+dev.name);
    verify(errors.length===0,'HTTP '+dev.name+' JavaScript failures: '+errors.join(' | '));
    console.log('PASS nginx '+dev.name);
   }catch(error){
    await screenshot(page,'FAILED-nginx-'+dev.name).catch(()=>{});
    throw error;
   }finally{await ctx.close()}
  }
  console.log('M0 real-browser acceptance complete ('+checks+' assertions; file:// and Nginx, desktop + mobile)');
 }finally{await browser.close()}
}
run().catch(error=>{console.error(error.stack||error);process.exitCode=1});
