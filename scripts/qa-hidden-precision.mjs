import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const base='http://127.0.0.1:8765';
const chrome=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(chrome?{executablePath:chrome}:{})});
const errors=[],page=await browser.newPage({viewport:{width:390,height:844}});
page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(base+'/hidden-objects/precision-v3-studio.html',{waitUntil:'domcontentloaded'});
 assert.deepEqual(await page.evaluate(()=>[window.MEJ_MANIFEST.libraryAssets.length,window.MEJ_MANIFEST.sceneSlots.length,window.MEJ_MANIFEST.levelContexts.length,Object.keys(window.MEJ_DRAFT.hotspots).length]),[47,130,250,3]);
 const unavailable=await page.evaluate(async()=> (await Promise.all(window.MEJ_MANIFEST.libraryAssets.map(async a=>({file:a.file,status:(await fetch(a.file,{method:'HEAD'})).status})))).filter(a=>a.status!==200));
 assert.deepEqual(unavailable,[],'all 47 uploaded source images');
 await page.waitForFunction(()=>document.querySelector('#area img')?.naturalWidth>0);
 await page.screenshot({path:'hidden-qa-precision-editor.png',fullPage:true});
 async function load(stage,badge){
   await page.evaluate(({stage,badge})=>{
    document.querySelector('#qa-frame')?.remove();
    const f=document.createElement('iframe');f.id='qa-frame';f.style.cssText='width:100%;height:740px;border:0';
    function onReady(ev){if(ev.source!==f.contentWindow||ev.data?.type!=='mej:hidden-ready')return;
      window.removeEventListener('message',onReady);
      f.contentWindow.postMessage({type:'mej:hidden-init',stage,badge,preview:true,practice:true,masteredWords:[],levelWords:[]},location.origin);
    }
    window.addEventListener('message',onReady);document.body.append(f);f.src='/hidden-objects/index.html';
   },{stage,badge});
   const f=page.frameLocator('#qa-frame');await f.locator('.photo-board, .precision-unavailable').first().waitFor({timeout:14000});return f;
 }
 {
  const f=await load(1,2);
  await f.locator('#words li').first().waitFor({timeout:14000});
  assert.equal(await f.locator('#words li').count(),10,'mapped words');
  assert.equal(await f.locator('.independent-guide').count(),10,'ten independent pictures, never scene crops');
  assert.equal(await f.locator('.draft-guide-image').count(),0,'no fragments copied from the original scene');
  const box=await f.locator('.photo-board').boundingBox();
  await f.locator('.photo-board').click({position:{x:box.width*.135,y:box.height*.66}});
  await page.waitForTimeout(260);
  assert.match(await f.locator('#found').innerText(),/1 \/ 10/,'backpack polygon');
  await page.screenshot({path:'hidden-qa-stage1-precision.png',fullPage:true});
 }
 {
  const f=await load(3,1);
  assert.equal(await f.locator('#words li').count(),10,'stage 3 source photo has ten practice objects');
  assert.equal(await f.locator('.precision-pending').count(),0,'stage 3 no longer pending');
  await page.screenshot({path:'hidden-qa-stage3-practice.png',fullPage:true});
 }
 {
  const f=await load(4,3);
  assert.equal(await f.locator('#words li').count(),10,'new museum photo provides ten objects');
  assert.equal(await f.locator('.precision-pending').count(),0,'new museum photo playable');
  assert.match(await f.locator('#bonus').innerText(),/تدريب/,'museum is practice-only');
  await page.screenshot({path:'hidden-qa-museum-new.png',fullPage:true});
 }
 {
  const f=await load(8,5);
  assert.equal(await f.locator('#words li').count(),10,'new airport picture has ten practice targets');
  assert.equal(await f.locator('.precision-pending').count(),0,'airport scene is not pending');
  assert.match(await f.locator('#bonus').innerText(),/تدريب/,'airport awards blocked');
  await page.screenshot({path:'hidden-qa-airport-new.png',fullPage:true});
 }
 {
  const f=await load(9,1);
  assert.equal(await f.locator('#words li').count(),10,'upper-stage practice objects mapped');
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-silhouette/,'grade 9 uses silhouettes');
  assert.equal(await f.locator('.independent-guide').count(),10,'all grade 9 hints are independent silhouettes');
 }
 {
  const f=await load(4,1);
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-picture/,'grade 4 uses separate picture hints');
  assert.equal(await f.locator('.independent-guide').count(),10,'grade 4 uses alternative cues');
  assert.equal(await f.locator('.draft-guide-image').count(),0,'never crop the scene');
 }
 {
  const f=await load(5,1);
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-silhouette/,'grade 5 uses silhouettes');
  assert.equal(await f.locator('.independent-guide').count(),10,'grade 5 silhouette hints present');
 }
 {
  const f=await load(10,1);
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-word/,'grade 10 uses word hints only');
  assert.equal(await f.locator('.guide-art').count(),0,'grade 10 has no picture or silhouette');
 }
 {
  // Exhaustive visible-game coverage: all 13 stages × 10 badges, not just selected samples.
  let checked=0;
  for(let stage=0;stage<=12;stage++){
   for(let badge=1;badge<=10;badge++){
    const f=await load(stage,badge);
    assert.equal(await f.locator('#words li').count(),10,'stage '+stage+' badge '+badge+' has ten clickable words');
    assert.equal(await f.locator('.precision-pending').count(),0,'stage '+stage+' badge '+badge+' is not pending');
    assert.equal(await f.locator('.precision-unavailable').count(),0,'stage '+stage+' badge '+badge+' has a valid photo');
    assert.match(await f.locator('#bonus').innerText(),/تدريب/,'unapproved stage '+stage+' badge '+badge+' must not award stars');
    checked++;
   }
  }
  assert.equal(checked,130,'all 130 planned badge scenes tested');
  const f=page.frameLocator('#qa-frame');
  const pos=await f.locator('.photo-board').evaluate(()=>{
   const slot=window.MEJPrecisionLibrary.sceneSlots.find(x=>x.stage===12&&x.badge===10);
   const first=Object.values(window.MEJPrecisionLibrary.hotspots[slot.assetId])[0].points;
   return first.reduce((a,p)=>({x:a.x+p[0]/first.length,y:a.y+p[1]/first.length}),{x:0,y:0});
  });
  const box=await f.locator('.photo-board').boundingBox();
  await f.locator('.photo-board').click({position:{x:box.width*pos.x/100,y:box.height*pos.y/100}});
  assert.equal((await f.locator('#found').innerText()).trim(),'1 / 10','space observation object click');
  await page.screenshot({path:'hidden-qa-space-station.png',fullPage:true});
 }
 assert.deepEqual(errors,[],'no browser JS exceptions');
 console.log('HIDDEN_PRECISION_QA_PASS: all 130 scenes; grades 1-4 alternate imagery, 5-9 silhouettes, 10-12 words; no photo-crop hints or rewards');
}finally{await browser.close()}
