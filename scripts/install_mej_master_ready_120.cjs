'use strict';
/* Restore 120 master vocabulary words to the original student learning preview.
 * Stage source: MEJ_Complete_Image_Vocabulary_Inventory.xlsx / Vocabulary,
 * matched to the 120 newly generated, exact-name words.
 * Student test IDs, scores, and progress remain unchanged. */
const fs=require('node:fs');
const path='index.html';
const entries=[["January","3A,3B,7A"],["accommodation","12A"],["adolescence","11A"],["advertisement","12A"],["advice","10B,11A,11B"],["always","4A"],["ambitious","10B"],["application","10B,11B,12A"],["arrival","12A"],["athlete","11B"],["attraction","12A"],["audience","11B"],["beautiful","10A,4B"],["between","3B"],["blog","10A,11A"],["body language","11A"],["brand","12A"],["broadcast","12B"],["career","11A,12A,12B"],["carefully","4B"],["carrot","2B"],["castle","6A"],["celebration","11B"],["champion","11B"],["cheap","4B"],["citizen","12B"],["citizenship","12B"],["coast","5B"],["community","11B,12B"],["competition","11B"],["concert","11B"],["connection","11B"],["consumer","10B,12A"],["customer service","12A"],["dangerous","10A,10B"],["deadline","12A"],["departure","12A"],["desk","1A,2A"],["destination","10B,12A"],["digital","10A"],["discount","12A"],["discovery","11A"],["earthquake","12B"],["efficient","10B"],["emergency","11A,12B"],["energy","10A"],["entertainment","9A"],["entrepreneur","10B"],["entrepreneurship","10B"],["exchange","12A,8A"],["exciting","11B"],["exercise","10B"],["expensive","10B,4B"],["experience","11B"],["explain","9A"],["feathers","2B"],["festival","11B"],["friend","1A"],["go to school","3A"],["guidebook","7A"],["habit","10B"],["hand","2A"],["head","1B,2A"],["home","10B"],["hospitality","12A"],["identity","10B"],["information","11A"],["inspiration","11B"],["interesting","2A,4B"],["interests","10B"],["inventor","11A"],["itinerary","12A"],["journalist","12B"],["journey","12A"],["kitchen","2B"],["kite","2A"],["magazine","10A"],["money","10B,11A"],["monkey","1B"],["musician","11B"],["never","4A"],["nose","2A"],["often","4A"],["opinion","11A,11B,12B"],["peer","11A"],["performance","11B"],["planet","5A"],["play","3A"],["plot","10B"],["privacy","11A"],["project","10B"],["pronounce","9A"],["purchase","12A"],["qualification","12A,12B"],["quickly","10B,4B"],["reception","12A"],["record","11B"],["reduce","10B"],["renewable","10A"],["reporter","12B"],["reservation","12A"],["responsibility","12B"],["retail","12A"],["safety","12B"],["scholarship","12A"],["screen","6A"],["sometimes","4A"],["sustainable","10A"],["teamwork","12B"],["technology","10B,11A"],["teenager","10A,11A"],["tiger","1B"],["tourism","12A"],["tourist","12A"],["transport","12A"],["understand","9A"],["university","12A"],["vehicle","10B,12A"],["volunteer","11B,12B"],["zebra","1B"]];
if(entries.length!==120||new Set(entries.map(x=>x[0].toLowerCase())).size!==120)throw Error('Expected 120 unique master words');
const stageRegex=/^(?:[1-9]|1[0-2])[AB]$/;
const assigned=[];
for(const [word,stages] of entries)for(const stage of stages.split(',')){
 if(!stageRegex.test(stage))throw Error('Invalid stage '+stage);
 assigned.push({word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});
}
if(assigned.length!==149)throw Error('Expected 149 stage assignments, got '+assigned.length);
let s=fs.readFileSync(path,'utf8');
const marker='/* MEJ_120_MASTER_RESTORATION_20261107 */';
if(s.includes(marker)){console.log('120-word restoration already installed');process.exit(0)}
const old="let seen=new Set;items=items.filter(q=>{const key=q.word.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,40);";
if(s.split(old).length!==2)throw Error('Original learning-preview deduplication hook missing or duplicated');
const source=marker+'\nconst MEJ_RESTORED_MASTER_120='+JSON.stringify(assigned)+';\n';
const target="const restoredWords=MEJ_RESTORED_MASTER_120.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'📖 Master vocabulary • '+x.stage}));items.push(...restoredWords);let seen=new Set;items=items.filter(q=>{const key=q.word.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,120);";
s=s.replace('function learnLevel(g,part=null){',source+'function learnLevel(g,part=null){').replace(old,target);
if(!s.includes(marker)||!s.includes('items.push(...restoredWords)'))throw Error('Patch verification failed');
fs.writeFileSync(path,s);
const counts=Object.fromEntries(Array.from({length:12},(_,i)=>[i+1,[0,0]]));
for(const {grade,part} of assigned)counts[grade][part-1]++;
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/master-restoration-120.json',JSON.stringify({source:'MEJ master inventory / 120 image-prepared exact text matches',uniqueWords:120,stagePlacements:assigned.length,assignments:assigned,countsByGradeAndPart:counts,scope:'Learning preview only; no test/question/progress changes',status:'installed'},null,2));
console.log('RESTORED_MASTER_120 '+JSON.stringify({uniqueWords:120,stagePlacements:assigned.length,counts}));
