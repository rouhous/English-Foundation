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
const logicEnd=html.indexOf('// MEJ_STAGE1_LEVEL_UNLOCK_V2',logicStart);
assert.ok(logicStart>=0&&logicEnd>logicStart,'five-skill progress logic must be present');
const context={byGrade,active:()=>null};
vm.runInNewContext(html.slice(logicStart,logicEnd)+
 '\nglobalThis.__api={MEJ_SKILL_ORDER,MEJ_TYPE_SKILL,mejSkillForQuestion,mejSkillProgress,mejSkillBarsSum,mejEnsureSkillLegacyFloor,stageStars,stageEffectiveStars,achieved};',context);
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
 assert.ok(api.stageStars(g,p)<=50,`island ${g} stars must not exceed 50`);
 assert.equal(api.achieved(g,p),true,`full mastery must complete island ${g}`);
}
const reading=byGrade[1].find(q=>api.mejSkillForQuestion(q)==='reading');
const legacy={correct:{[reading.id]:1},completed:{},stageSkillLegacyFloorV1:{1:40}};
const before=api.stageStars(1,legacy);
assert.equal(before,40,'legacy learner must immediately see the preserved 40-star floor');
legacy.correct[reading.id]=2;
const after=api.stageStars(1,legacy);
assert.equal(after,41,'new mastery beyond the saved baseline must visibly increase progress');
assert.ok(legacy.stageSkillLegacyBaselineV1&&Number.isInteger(legacy.stageSkillLegacyBaselineV1[1]),'baseline snapshot must be created');
console.log(JSON.stringify({status:'PASS',bankItems:bank.length,bankTypes:[...new Set(bank.map(q=>q.type))],islands:12,legacyBefore:before,legacyAfter:after},null,2));
