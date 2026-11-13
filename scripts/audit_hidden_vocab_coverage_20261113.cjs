'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const normalize=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const english=s=>/^[a-z][a-z '-]{1,35}$/i.test(s);
function target(q){
 if(!['Vocabulary','Spelling','Match','Describe','Phonics','Blend'].includes(q.type))return '';
 let w=normalize(q.word||q.targetWord||'');
 if(!english(w)&&['Vocabulary','Spelling'].includes(q.type)&&english(normalize(q.answer)))w=normalize(q.answer);
 if(!english(w)){const m=String(q.prompt||'').match(/[“'«"]([A-Za-z][A-Za-z '-]{1,35})[”'»"]/);if(m)w=normalize(m[1]);}
 return english(w)?w:'';
}
const nonPhysical=new Set(['always','never','sometimes','often','usually','because','before','after','between','however','although','would','should','could','will','must','can','like','good','bad','happy','sad','big','small','red','blue','green','yellow','beautiful','interesting','quickly','carefully','honest','reliable','ambitious','confident','creative','digital','virtual','independent','technology','information','identity','personality','communication','conversation','language','meaning','understand','privacy','innovation','future','opinion','suggestion','frequency','connection']);
const stages=catalog.levels.map(level=>{
 const words=new Map();let scanned=0;
 for(const part of level.parts)for(const q of part.questions){const w=target(q);if(!w)continue;scanned++;if(!words.has(w))words.set(w,[]);words.get(w).push(q.id)}
 const all=[...words].map(([word,ids])=>({word,questionIds:ids,physicalCandidate:!nonPhysical.has(word)}));
 return {stage:level.grade,questionsWithTarget:scanned,uniqueWordCount:all.length,physicalCandidates:all.filter(x=>x.physicalCandidate).length,words:all};
});
const photoSource=fs.readFileSync('hidden-objects/photo-scenes.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(photoSource,ctx);
const scene=ctx.window.MEJRealPhotoScenes.scenes;
const review=scene.map(s=>{const stage=stages.find(x=>x.stage===s.stage);
return {id:s.id,name:s.name,stage:s.stage,badge:s.badge,approved:s.approved,targets:s.targets.map(t=>({word:t.word,inCurriculum:stage?stage.words.some(x=>x.word===normalize(t.word)):null,regionCount:t.regions?.length||0}))};
});
assert.equal(stages.length,13);assert(scene.every(x=>x.approved===false));
const report={marker:'MEJ_HIDDEN_VOCAB_COVERAGE_20261113',stages:stages.map(({stage,questionsWithTarget,uniqueWordCount,physicalCandidates})=>({stage,questionsWithTarget,uniqueWordCount,physicalCandidates})),sceneCandidates:scene.length,approvedForStudentBonus:scene.filter(s=>s.approved===true).length,candidateChecks:review,notes:'physicalCandidates are heuristic only: every target must be vetted for imageability, curriculum mastery, and photo placement.'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/hidden-vocab-coverage-20261113.json',JSON.stringify(report,null,2));
fs.writeFileSync('hidden-objects/stage-word-index-20261113.json',JSON.stringify({schema:'mej-stage-target-words-v1',source:'reviews/admin-levels-catalog.json',stages},null,2));
console.log('AUDIT PASS',report.stages,report.sceneCandidates);
