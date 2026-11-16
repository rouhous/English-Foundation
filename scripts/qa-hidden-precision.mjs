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
  assert.equal(await f.locator('.draft-guide').count(),10,'picture hints match source');
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
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-word/,'upper stage uses text hints');
 }
 {
  const f=await load(12,10);
  await f.locator('.precision-unavailable').waitFor();
  assert.equal(await f.locator('#words li').count(),0,'genuinely missing topic image remains blocked');
 }
 assert.deepEqual(errors,[],'no browser JS exceptions');
 console.log('HIDDEN_PRECISION_QA_PASS: 47 original source assets; 130 scene slots; 117 practice slots; museum and airport included; 13 missing slots safely blocked');
}finally{await browser.close()}
