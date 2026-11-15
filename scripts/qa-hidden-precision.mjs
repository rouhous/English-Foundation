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
   const f=page.frameLocator('#qa-frame');await f.locator('.photo-board').waitFor({timeout:14000});return f;
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
  await f.locator('.precision-pending').waitFor();
  assert.equal(await f.locator('.spot').count(),0,'no incorrect floating art');
  assert.equal(await f.locator('#words li').count(),0,'no invented object list');
  await page.screenshot({path:'hidden-qa-stage3-pending.png',fullPage:true});
 }
 {
  const f=await load(9,1);
  await f.locator('.precision-pending').waitFor();
  assert.match(await f.locator('#scene').getAttribute('class'),/mode-word/,'upper stage text hints');
 }
 assert.deepEqual(errors,[],'no browser JS exceptions');
 console.log('HIDDEN_PRECISION_QA_PASS: 47 image assets; 130 scene slots; 3 draft mapping images; grade hints; safe unapproved scenes');
}finally{await browser.close()}
