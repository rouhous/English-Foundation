'use strict';
const fs=require('fs');const paths=['index.html','reviews/admin-levels-catalog.json'];
for(const path of paths){
 let src=fs.readFileSync(path,'utf8');
 let count=0;
 for(let grade=6;grade<=12;grade++)for(let n=196;n<=199;n++){
  const id='L'+grade+'-'+n;
  const matches=[...src.matchAll(/\{[^{}]*"id":"L\d+-\d+"[^{}]*\}/g)].filter(m=>m[0].includes('"id":"'+id+'"'));
  if(matches.length!==1)throw Error(path+' '+id+' found '+matches.length);
  const original=JSON.parse(matches[0][0]);
  if(grade===6&&n===196)original.options=['Dear Class 6B,','Dear School Principal,','Dear Student Council,'];
  if(grade===10&&n===196)original.options=['Dear Research Team,','Dear Headteacher,','Dear Event Organiser,'];
  const unique=[...new Set(original.options)];
  if(unique.length!==3||!unique.includes(original.answer))throw Error('bad choices '+id);
  // Distribute answer positions evenly, without changing the answer.
  const pos=(grade+n)%3;
  const distractors=unique.filter(a=>a!==original.answer);
  const options=[...distractors];options.splice(pos,0,original.answer);
  const next={...original,options};
  src=src.slice(0,matches[0].index)+JSON.stringify(next)+src.slice(matches[0].index+matches[0][0].length);
  count++;
 }
 fs.writeFileSync(path,src);
 console.log(path,'updated',count,'answers with balanced positions');
}

// Run approved question balance revision.
