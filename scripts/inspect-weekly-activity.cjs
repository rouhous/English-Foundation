'use strict';
const fs=require('node:fs');
const x=fs.readFileSync('index.html','utf8');
const pats=['activity.push(','.activity.push(','day:new Date','new Date().toISOString().slice(0,10)','weekStart.setDate','currentWeek.setDate','weeklyAttempts:','function reports()','function payload('];
const out={bytes:x.length,snippets:{}};
for(const pat of pats){
 const list=[];let i=0,p;
 while((p=x.indexOf(pat,i))>=0&&list.length<12){list.push({offset:p,context:x.slice(Math.max(0,p-390),p+590)});i=p+pat.length;}
 out.snippets[pat]=list;
}
fs.mkdirSync('diagnostics',{recursive:true});
fs.writeFileSync('diagnostics/mej-week-activity-inspection.json',JSON.stringify(out,null,2));
console.log(Object.fromEntries(Object.entries(out.snippets).map(([k,v])=>[k,v.length])));
