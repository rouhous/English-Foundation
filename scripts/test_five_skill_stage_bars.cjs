#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const marker='const BANK=';
const start=html.indexOf(marker);
assert.notEqual(start,-1,'BANK must exist in index.html');
const end=html.indexOf('];',start)+1;
assert.ok(end>start,'BANK JSON terminator must exist');
const bank=JSON.parse(html.slice(start+marker.length,end));
const byGrade={};
for(let g=0;g<=12;g++)byGrade[g]=bank.filter(q=>q.g===g);
const logicStart=html.indexOf('const MEJ_STAGE_TARGET=50');
const logicEnd=html.indexOf('function fmt(n)',logicStart);
assert.ok(logicStart>=0&&logicEnd>logicStart,'five-skill progress logic must be present');
const context={byGrade,active:()=>null,window:{},JOURNEY_BADGES:Array.from({length:10},(_,i)=>['⭐','Badge '+(i+1)])};
vm.runInNewContext(html.slice(logicStart,logicEnd)+
 '\nglobalThis.__api={MEJ_SKILL_ORDER,MEJ_TYPE_SKILL,mejSkillForQuestion,mejSkillProgress,mejSkillBarsSum,mejEnsureSkillLegacyFloor,mejStageStarTarget,stageStars,stageEffectiveStars,achieved,maxAllowed};',context);
const api=context.__api;
for(const q of bank)assert.ok(api.mejSkillForQuestion(q),`unmapped BANK type: ${q.type} (${q.id})`);
for(let g=1;g<=12;g++){
 const items=byGrade[g];
 const p={correct:Object.fromEntries(items.map(q=>[q.id,2])),completed:{},stageSkillLegacyFloorV1:{},stageSkillLegacyBaselineV1:{}};
 const progress=api.mejSkillProgress(g,p);
 let targetSum=0;
 for(const skill of api.MEJ_SKILL_ORDER){
  const expected=Math.min(10,2*items.filter(q=>api.mejSkillForQuestion(q)===skill).length);
  assert.equal(progress[skill].target,expected,`island ${g} ${skill} target`);
  assert.equal(progress[skill].stars,expected,`island ${g} ${skill} full mastery`);
  targetSum+=expected;
 }
 assert.ok(targetSum<=50,`island ${g} target total must not exceed 50`);
 assert.equal(api.mejStageStarTarget(g,p),targetSum,`island ${g} displayed and reported target`);
 if(g>=1&&g<=5)assert.equal(targetSum,48,`island ${g} temporary target must be 48`);
 assert.ok(api.stageStars(g,p)<=50,`island ${g} stars must not exceed 50`);
 assert.equal(api.achieved(g,p),true,`full mastery must complete island ${g}`);
}
const legacyCorrect={},desired={listening:10,reading:8,writing:10,vocabulary:10,grammar:2};
for(const [skill,stars] of Object.entries(desired)){
 const needed=stars/2;
 const candidates=byGrade[1].filter(q=>api.mejSkillForQuestion(q)===skill).slice(0,needed);
 assert.equal(candidates.length,needed,`fixture capacity for ${skill}`);
 for(const q of candidates)legacyCorrect[q.id]=2;
}
const legacy={correct:legacyCorrect,completed:{},stageSkillLegacyFloorV1:{1:40}};
const before=api.stageStars(1,legacy);
assert.equal(before,40,'legacy learner must immediately see the preserved 40-star floor');
const nextGrammar=byGrade[1].filter(q=>api.mejSkillForQuestion(q)==='grammar').find(q=>!legacy.correct[q.id]);
legacy.correct[nextGrammar.id]=2;
const after=api.stageStars(1,legacy);
assert.equal(after,42,'new mastery above a 40-star baseline must add only the newly earned two stars');
assert.ok(legacy.stageSkillLegacyBaselineV1&&Number.isInteger(legacy.stageSkillLegacyBaselineV1[1]),'baseline snapshot must be created');
console.log(JSON.stringify({status:'PASS',bankItems:bank.length,bankTypes:[...new Set(bank.map(q=>q.type))],islands:12,legacyBefore:before,legacyAfter:after},null,2));

const badgeStart=html.indexOf('function islandBadges('),badgeEnd=html.indexOf('function voyageArt()',badgeStart);
assert.ok(badgeStart>=0&&badgeEnd>badgeStart,'island badge logic must exist');
vm.runInNewContext(html.slice(badgeStart,badgeEnd)+';globalThis.__islandBadges=islandBadges;',context);
const badge44={correct:{},completed:{},stageSkillLegacyFloorV1:{1:44},stageSkillLegacyBaselineV1:{1:0}};
assert.equal(context.__islandBadges(1,badge44).filter(b=>b.earned).length,9,'badge 9 must unlock at 44/48');
assert.equal(context.__islandBadges(1,badge44)[9].earned,false,'badge 10 waits for 48/48');
const badge48={correct:{},completed:{},stageSkillLegacyFloorV1:{1:48},stageSkillLegacyBaselineV1:{1:0}};
assert.equal(context.__islandBadges(1,badge48).filter(b=>b.earned).length,10,'badge 10 unlocks at 48/48');

const oldStudent={assigned:1,correct:{},completed:{1:true,2:true,3:true}};
assert.equal(api.maxAllowed(oldStudent),4,'legacy islands preserve cap before answers');
for(let g=1;g<=3;g++){
 const q=byGrade[g].find(item=>api.mejSkillForQuestion(item));assert.ok(q);
 oldStudent.correct[q.id]=1;
 oldStudent.completed[g]=oldStudent.completed[g]===true||api.achieved(g,oldStudent);
 assert.equal(oldStudent.completed[g],true,'legacy completion '+g+' stays true');
 assert.equal(api.achieved(g,oldStudent),true,'legacy island '+g+' stays achieved');
}
assert.equal(api.maxAllowed(oldStudent),4,'legacy islands preserve cap after answers');
assert.equal(oldStudent.stageSkillLegacyFloorV1[1],50,'ensure stores 50-star legacy floor');

const backupStart=html.indexOf('function normalizeBackupProfile(id,raw)'),backupEnd=html.indexOf('function importProgress()',backupStart);
assert.ok(backupStart>=0&&backupEnd>backupStart,'backup normalizer must exist');
const backupContext={newProfile:()=>({}),questionById:Object.fromEntries(bank.map(q=>[q.id,q])),Date,Number,Math,Object};
vm.runInNewContext(html.slice(backupStart,backupEnd)+';globalThis.__normalize=normalizeBackupProfile;',backupContext);
assert.ok(html.includes("profiles:Object.fromEntries(Object.entries(db.profiles).map(([id,profile])=>[id,{...profile,teacherCode:''}]))"),'backup export spreads profile fields');
const bp={id:'synthetic-roundtrip',name:'Synthetic learner',grade:'1',correct:{},wrong:{},completed:{1:true},stars:50,attempts:2,right:2,createdAt:Date.now(),lastActivity:Date.now(),stageSkillLegacyFloorV1:{1:50,2:38},stageSkillLegacyBaselineV1:{1:24,2:18}};
const backup=JSON.parse(JSON.stringify({app:'wadi-english-explorer',version:1,profiles:{[bp.id]:bp},active:bp.id}));
const restored=backupContext.__normalize(bp.id,backup.profiles[bp.id]);
assert.deepEqual(JSON.parse(JSON.stringify(restored.stageSkillLegacyFloorV1)),{1:50,2:38},'backup round-trip floor');
assert.deepEqual(JSON.parse(JSON.stringify(restored.stageSkillLegacyBaselineV1)),{1:24,2:18},'backup round-trip baseline');

const cloudSource=fs.readFileSync('assets/student-cloud-progress-v1.js','utf8');
const cloudStart=cloudSource.indexOf('function safePayload(value)'),cloudEnd=cloudSource.indexOf('async function post(',cloudStart);
assert.ok(cloudStart>=0&&cloudEnd>cloudStart,'cloud sanitizer must exist');
const cloudContext={Number,Math,Object,JSON};
vm.runInNewContext(cloudSource.slice(cloudStart,cloudEnd)+';globalThis.__safePayload=safePayload;',cloudContext);
const cloud=cloudContext.__safePayload({grade:1,studentName:'Synthetic learner',className:'1/1',attempts:2,correctAnswers:2,levelStats:[{level:1,mastered:0,stars:48,starTarget:48,total:200,masteryPercent:100}],privateState:{stageSkillLegacyFloorV1:{1:50,2:38},stageSkillLegacyBaselineV1:{1:24,2:18}}});
assert.equal(cloud.levelStats[0].starTarget,48,'cloud target round-trip');
const olderCloud=cloudContext.__safePayload({grade:1,studentName:'Legacy synthetic',className:'1/1',attempts:0,correctAnswers:0,levelStats:[{level:1,mastered:0,stars:0,total:200,masteryPercent:0}]});
assert.equal(olderCloud.levelStats[0].starTarget,50,'older cloud clients without starTarget retain the legacy default');
assert.deepEqual(JSON.parse(JSON.stringify(cloud.privateState.stageSkillLegacyFloorV1)),{1:50,2:38},'cloud floor round-trip');
assert.deepEqual(JSON.parse(JSON.stringify(cloud.privateState.stageSkillLegacyBaselineV1)),{1:24,2:18},'cloud baseline round-trip');
const edge=fs.readFileSync('admin-backend/supabase/functions/mej-progress/index.ts','utf8');
assert.match(edge,/stageSkillLegacyFloorV1/,'edge validator floor');
assert.match(edge,/stageSkillLegacyBaselineV1/,'edge validator baseline');
console.log('Grandfather completion, 48-star targets, badge 9/10, backup and cloud round-trip OK.');
