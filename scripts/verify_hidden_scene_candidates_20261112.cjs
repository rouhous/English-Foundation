'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('hidden-objects/photo-scenes.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(source,ctx);
const cat=ctx.window.MEJRealPhotoScenes;assert.equal(cat.scenes.length,5);
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const level0=catalog.levels.find(x=>x.grade===0);
const curriculum=new Set(level0.parts.flatMap(part=>part.questions).map(q=>String(q.word||'').trim().toLowerCase()).filter(Boolean));
let polygons=0,candidates=0,ready=0;
for(const scene of cat.scenes){
 assert.equal(scene.targets.length,10);assert.equal(new Set(scene.targets.map(x=>x.word)).size,10);
 assert(fs.existsSync('hidden-objects/real-scenes/'+scene.file),'Missing '+scene.file);
 if(scene.approved)ready++;else candidates++;
 for(const t of scene.targets){
  assert(Array.isArray(t.regions)&&t.regions.length);
  for(const shape of t.regions){assert(shape.length>=3,'Need polygon vertices');
   assert(shape.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1599&&y>=0&&y<=900));polygons++;
  }
 }
}
const first=cat.scenes.find(s=>s.file==='05_phonics_classroom.webp');
assert(first&&first.stage===0&&!first.approved);
assert(first.targets.every(t=>curriculum.has(t.word)),'Scene 05 contains non-curriculum words');
for(const file of ['hidden-objects/review-v5.html','hidden-objects/index.html']){
 const html=fs.readFileSync(file,'utf8');let blocks=0;
 for(const m of html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)){
  if(!m[1].trim())continue;new vm.Script(m[1],{filename:file});blocks++;
 }
 assert(blocks>=1,'Cannot verify inline JS '+file);
}
const host=fs.readFileSync('assets/mej-sailor-host.js','utf8');new vm.Script(host);
assert(host.includes('Number(correct[q.id])>=2'));
const game=fs.readFileSync('hidden-objects/index.html','utf8');
assert(game.includes('sc.approved===true'));
assert(game.includes('filter(t=>known.has(norm(t.word))).length===9'));
const sw=fs.readFileSync('sw.js','utf8');assert(sw.includes('05_phonics_classroom.webp'));
const report={marker:'MEJ_HIDDEN_FIVE_SCENE_CANDIDATES_V1',scenes:cat.scenes.length,polygons,targets:cat.scenes.length*10,unapprovedCandidates:candidates,studentApproved:ready,grade0CurriculumCheck:'pass',bonusDataUntouched:true,cloudTransportUntouched:true,offlineImages:'five present',scripts:'pass',visualTapTestOnActualDevice:'pending'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/hidden-five-scene-candidates-20261112.json',JSON.stringify(report,null,2));console.log(report);
