const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('reviews/learning.html','utf8');
const a=html.indexOf('function englishLabel('),b=html.indexOf('function draw(){',a);
assert(a>0&&b>a);
const source=html.slice(a,b);
const ctx={};vm.createContext(ctx);vm.runInContext(source+'\nthis.getReviewWord=reviewWord;',ctx);
const c=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const results=[];
for(const level of c.levels){
 for(const part of level.parts){
  const words=[...new Set(part.questions.filter(q=>['Vocabulary','Phonics','Blend','Listening','Spelling','Match'].includes(q.type)).map(q=>ctx.getReviewWord(q)).filter(Boolean))];
  results.push({grade:level.grade,part:part.part,words:words.length,sample:words.slice(0,5)});
  assert(words.length>0,'No vocabulary at '+level.grade+':'+part.part);
 }
}
assert(results.find(x=>x.grade===0&&x.part===2).words>=10,'Foundation part 2 must not be empty');
assert(results.find(x=>x.grade===1&&x.part===1).sample.includes('family'),'First grade family vocabulary restored');
assert(results.find(x=>x.grade===2&&x.part===1).sample.includes('house'),'Second grade house restored');
console.log('VOCABULARY_REVIEW_ALL_26_LEVELS_PASS');
console.log(JSON.stringify(results));
