// Validate imported Hidden Objects Precision Hotspots v3 assets, preview geometry, and stage-specific hints.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';

const root=process.cwd(), host='http://127.0.0.1:8765';
const manifest=JSON.parse(fs.readFileSync(root+'/hidden-objects/precision-v3-manifest.json','utf8'));
const draft=JSON.parse(fs.readFileSync(root+'/hidden-objects/precision-v3-hotspots-draft.json','utf8'));
assert.equal(manifest.targetSlots,130,'130 candidate badge slots');
assert.equal(manifest.contextCount,250,'stage-level contexts');
assert.equal(manifest.sceneSlots.length,130,'130 scene slot records');
assert.equal(manifest.libraryAssets.length,47,'47 preserved scene images');
assert.equal(manifest.certification.imageVerified,false,'candidate images are NOT certified');
assert.equal(manifest.certification.hotspotsVerified,false,'draft hotspots are NOT reward eligible');
const digests=[];
for(const a of manifest.libraryAssets){
 const p=root+'/hidden-objects/'+a.file;
 assert.ok(fs.existsSync(p),'Scene image missing: '+a.file);
 const bytes=fs.readFileSync(p);
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Not a WebP RIFF: '+a.file);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Not a WebP: '+a.file);
 const actual=crypto.createHash('sha256').update(bytes).digest('hex');
 digests.push(a.file+' '+actual);
}
// Source manifest SHA fields are stale for every file; fingerprint below was
// recomputed from the 47 EMBEDDED original images in the user's offline v3 HTML.
// It verifies byte-for-byte preservation without silently changing that source.
assert.equal(crypto.createHash('sha256').update(digests.sort().join('\n')).digest('hex'),
 'a811708b14327ef22d4860da255cc09d524c399b856fae931f05e0f50d9c5e7a',
 'Imported image contents differ from original offline v3 images');
const mapped=Object.values(draft.hotspots).reduce((n,words)=>n+Object.keys(words).length,0);
assert.equal(mapped,30,'Preserve 30 original estimated polygons');
assert.ok(Object.values(draft.hotspots).every(o=>Object.values(o).every(x=>x.status==='unverified-estimate')),'Estimated maps may not be approved without review');
const exec=fs.readFileSync(root+'/hidden-objects/precision-v3-client.js','utf8');
assert.ok(exec.includes('approvedForScoring'), 'Review-only imported library');
const source=fs.readFileSync(root+'/hidden-objects/index.html','utf8');
assert.ok(source.includes("guideMode=phase<=4?'picture':phase<=8?'silhouette':'word'"),'Stage-dependent picture / silhouette / word modes');
const arcade=fs.readFileSync(root+'/coastal-arcade/index.html','utf8');
assert.ok(arcade.includes("lower:[['hidden'"),'Hidden Objects first for lower stages');
assert.ok(arcade.includes("middle:[['hidden'"),'Hidden Objects first for middle stages');
assert.ok(arcade.includes("upper:[['hidden'"),'Hidden Objects first for upper stages');
assert.ok(arcade.includes("preview:!LIVE"),'Drafts playable only in unscored review');

const bin=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(bin?{executablePath:bin}:{})});
const failures=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto(host+'/reviews/hidden-objects-archive.html',{waitUntil:'domcontentloaded'});
 async function launch(stage,badge,preview){
  await page.evaluate(({stage,badge,preview})=>{
   document.body.replaceChildren();
   window.__hEvents=[];
   window.__mejTarget={stage,badge,preview};
   if(!window.__hListener){
    window.__hListener=e=>{
      if(e.origin!==location.origin||e.source!==document.querySelector('#h')?.contentWindow)return;
      const v=e.data;
      if(v?.type==='mej:hidden-ready')e.source.postMessage({type:'mej:hidden-init',
        stage:window.__mejTarget.stage,badge:window.__mejTarget.badge,practice:true,
        preview:window.__mejTarget.preview,masteredWords:[],levelWords:[]},location.origin);
      else if(v?.type==='mej:hidden-progress')window.__hEvents.push(v);
     };
     window.addEventListener('message',window.__hListener);
   }
   const f=document.createElement('iframe');f.id='h';f.title='Hidden Objects review';f.style.cssText='width:100%;height:760px;border:0';f.src='/hidden-objects/index.html';document.body.append(f);
  },{stage,badge,preview});
  const frame=page.frameLocator('#h');
  await frame.locator('.photo-board').waitFor({timeout:20000});
  return frame;
 }
 // The reference draft contains exactly 10 preliminary polygons for the bedroom scene.
 {
  const frame=await launch(1,2,true);
  await frame.locator('#words li').first().waitFor({timeout:8000});
  assert.equal(await frame.locator('#words li').count(),10,'review mode should enable all ten draft polygons');
  assert.equal(await frame.locator('#words li.guide-picture').count(),10,'stage 1 photo guide');
  assert.equal(await frame.locator('.photo-board').evaluate(el=>getComputedStyle(el).backgroundImage.includes('base_s1_02.webp')),true,'correct draft scene image');
  assert.equal(await frame.locator('#bonus').innerText().then(x=>x.includes('تدريب')),true,'review stars must be training only');
  const bounds=await frame.locator('.photo-board').boundingBox();
  await frame.locator('.photo-board').click({position:{x:bounds.width*.135,y:bounds.height*.66}});
  assert.ok((await frame.locator('#found').innerText()).startsWith('1 / 10'),'click inside backpack polygon should register');
  await page.screenshot({path:'hidden-precision-review-picture.png',fullPage:true});
 }
 // Draft scene does not award or expose provisional hit polygons to real students.
 {
  const frame=await launch(1,2,false);
  await frame.locator('.photo-board').waitFor();
  assert.equal(await frame.locator('#words li').count(),0,'unapproved student word list must remain hidden');
  assert.equal(await frame.locator('#scene .precision-pending').count(),1,'student sees review notice rather than fake questions');
  await page.screenshot({path:'hidden-precision-student-pending.png',fullPage:true});
 }
 for(const [stage,kind] of [[3,'picture'],[5,'silhouette'],[8,'silhouette'],[9,'word'],[12,'word']]){
  const frame=await launch(stage,1,true);
  const mode=await frame.locator('#scene').getAttribute('class');
  assert.ok(mode.includes('mode-'+kind),'stage '+stage+' must use '+kind+' clues');
  assert.equal(await frame.locator('#bonus').innerText().then(s=>s.includes('تدريب')),true,'no live star writes');
 }
 assert.deepEqual(failures,[],'No uncaught browser errors');
 console.log('MEJ_HIDDEN_PRECISION_QA_PASS 47 images SHA-256 verified; 130 stages; 30 draft polygons; 10-target review; 3 level-sensitive hint modes; no draft rewards');
 await page.close();
}finally{await browser.close();}  for(const [stage,kind] of [[3,'picture'],[5,'silhouette'],[9,'word'],[12,'word']]){
   const frame=await launch(stage,1,true);
   const mode=await frame.locator('#scene').getAttribute('class');
   assert.ok(mode.includes('mode-'+kind),'stage '+stage+' must use '+kind+' clues');
   assert.equal(await frame.locator('#bonus').innerText().then(s=>s.includes('تدريب')),true,'no live star writes');
  }
  // The source deliberately leaves stage 8 badge 1 without an image. Never invent a substitute.
  {
   const frame=await launch(8,1,true);
   await frame.locator('.precision-unavailable').waitFor();
   const mode=await frame.locator('#scene').getAttribute('class');
   assert.ok(mode.includes('mode-silhouette'),'stage 8 keeps the appropriate hint mode');
   assert.equal(await frame.locator('#words li').count(),0,'unmapped scene must not offer fake targets');
  }

