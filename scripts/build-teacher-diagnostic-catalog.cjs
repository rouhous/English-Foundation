'use strict';
// Derives a read-only public diagnostic lookup from the question bank already
// embedded in index.html. The lookup contains no answer key or student data.
const fs=require('node:fs');
const source=fs.readFileSync('index.html','utf8');
const result={};
const rx=/\{"g":(?:[0-9]|1[0-2]),"type":"[^"]+"[^{}]{0,8000}?"id":"L(?:[0-9]|1[0-2])-[0-9]+"\}/g;
for(const match of source.matchAll(rx)){
 let q;try{q=JSON.parse(match[0])}catch(_){continue}
 if(!/^L(?:[0-9]|1[0-2])-\d+$/.test(String(q.id))||typeof q.type!=='string')continue;
 const type=q.type.slice(0,60);
 const prompt=String(q.prompt||'').slice(0,400);
 const label=String(q.word||'').slice(0,90);
 result[q.id]={type,prompt,word:label};
}
const count=Object.keys(result).length;
if(count<500)throw Error('Too few question IDs matched ('+count+'). Refusing to publish incomplete catalog.');
fs.mkdirSync('assets',{recursive:true});
fs.writeFileSync('assets/diagnostic-question-catalog.json',JSON.stringify(result));
console.log('Question metadata index: '+count+' IDs, '+fs.statSync('assets/diagnostic-question-catalog.json').size+' bytes.');
