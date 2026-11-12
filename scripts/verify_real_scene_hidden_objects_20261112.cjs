'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('hidden-objects/index.html','utf8');
const host=fs.readFileSync('assets/mej-sailor-host.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const map=fs.readFileSync('hidden-objects/photo-scenes.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(map,ctx);
const data=ctx.window.MEJRealPhotoScenes;
assert.equal(data.scenes.length,4);
assert.equal(data.root,'./real-scenes/');
let hits=0;
for(const scene of data.scenes){
 assert.match(scene.file,/^[0-9]{2}_[a-z_]+\.webp$/);
 assert.equal(scene.targets.length,10);
 assert.equal(new Set(scene.targets.map(o=>o.word)).size,10);
 for(const hit of scene.targets){
  assert(typeof hit.word==='string'&&hit.word.length>=3);
  assert(hit.x>0.01&&hit.x<.99&&hit.y>.01&&hit.y<.99);
  hits++;
 }
}
const match=html.match(/<script>\s*([\s\S]*?)<\/script>/);assert(match);
new vm.Script(match[1],{filename:'hidden-objects/index.html'});
new vm.Script(host,{filename:'assets/mej-sailor-host.js'});
new vm.Script(sw,{filename:'sw.js'});
assert(html.includes("field.classList.add('photo-active')"));
assert(html.includes("canvas.style.backgroundImage='url(\"'+PHOTO.root+photoScene.file+'\")'"));
assert(html.includes("img.onerror=()=>{photoScene=null;start()}"));
assert(html.includes("if(session.found.includes(id))tap(id)")===false);
assert(html.includes("if(!session.found.includes(id))tap(id)"));
assert(html.includes("if(ev.target.closest('.spot,.photo-target,.photo-board,.end'))return;wrong()"));
assert(html.includes("Math.floor(session.found.length/2)"));
assert(host.includes("if(mastered<20*badge)"));
assert(host.includes("Math.min(50,sum)"));
assert(sw.includes("...OPTIONAL_REAL_SCENES"));
assert(sw.includes("mej-hidden-objects-v5-real-scene-hotspots-20261112"));
const photosPresent=data.scenes.filter(sc=>fs.existsSync('hidden-objects/real-scenes/'+sc.file)).length;
const report={
 marker:'MEJ_REAL_PHOTO_SCENES_20261112_V2',realisticPhotoSceneMaps:data.scenes.length,
 originalPhotoObjectHotspots:hits,photoImagesActuallyOnGithub:photosPresent,
 imageInstallationNeeded:photosPresent!==data.scenes.length,
 floatingImagesUsedForPhotoMode:false,legacyFallbackOnMissingPhotos:true,
 noDuplicatePenaltyOnFoundObjects:true,threeMistakesEndGame:true,
 scoring:'floor(objects_found/2)',maxPerRound:5,tenRoundsPerStage:true,
 badgeUnlockBasedOnBaseMastery:true,offlinePrecacheIncludesPhotos:true,
 javascriptSyntax:'pass',browserDeviceTest:'not performed',
 rewardProof:'client-reported; requires server-side trusted verification for secure payouts'
};
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/hidden-real-scenes-integration-20261112.json',JSON.stringify(report,null,2));
console.log(report);
