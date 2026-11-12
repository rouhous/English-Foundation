'use strict';
const fs=require('fs');
const updates={
'L8-197':{
prompt:'Arrange the events to make a logical paragraph about an adventure trip.\nA. Finally, the group returned to school and shared their photos.\nB. First, the students met their guide and checked their equipment.\nC. Next, they explored the mountain path with their teacher.',
answer:'B → C → A',
options:['B → C → A','C → B → A','B → A → C'],
tip:'تبدأ الفقرة بالاستعداد (First)، ثم تنفيذ الرحلة (Next)، وتنتهي بالعودة ومشاركة الصور (Finally).'},
'L8-198':{
prompt:'Our class wanted to reduce plastic waste on the school trip, ___ we decided to bring reusable water bottles.',
answer:'so',
options:['although','so','unless'],
tip:'so تربط السبب بالنتيجة: أردنا تقليل النفايات، لذلك قررنا استخدام زجاجات قابلة لإعادة الاستخدام.'}
};
const ids=Object.keys(updates);
for(const path of ['index.html','reviews/admin-levels-catalog.json']){
 const before=fs.readFileSync(path,'utf8');
 let found=0;
 const after=before.replace(/\{[^{}]*"id":"L\d+-\d+"[^{}]*\}/g,raw=>{
  const m=raw.match(/"id":"(L\d+-\d+)"/);
  if(!m||!updates[m[1]])return raw;
  found++;
  const original=JSON.parse(raw);
  if(original.type!=='Writing'||original.mode!=='mcq')throw Error('Unexpected question type for '+m[1]);
  return JSON.stringify({...original,...updates[m[1]]});
 });
 if(found!==2)throw Error('Expected two replacements in '+path+', got '+found);
 fs.writeFileSync(path,after,'utf8');
}
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const qs=catalog.levels.flatMap(l=>l.parts.flatMap(p=>p.questions));
for(const id of ids){
 const q=qs.find(x=>x.id===id);
 if(!q||q.answer!==updates[id].answer||q.options.filter(x=>x===q.answer).length!==1||new Set(q.options).size!==3)throw Error('Invalid '+id);
}
const report={date:'2026-11-12',reviewRound:4,approvedUnchanged:59,pendingTeacherApproval:ids,changes:ids.map(id=>({id,...updates[id]})),note:'Only two rejected questions replaced; all other 59 questions preserved.'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/writing-final-candidates-20261112.json',JSON.stringify(report,null,2));
console.log('Applied 2 grade-8 Writing replacements in both question bank and review catalog.');
