'use strict';
const fs=require('fs'),vm=require('vm');
const sw=fs.readFileSync('sw.js','utf8');
new vm.Script(sw,{filename:'sw.js'});
const html=fs.readFileSync('reviews/learning.html','utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i],{filename:'reviews/learning.html:inline-'+i});
if(!sw.includes("isApprovedImageBank")||!sw.includes("reviews/learning.html")||!sw.includes("cache:'no-store'"))throw Error('Missing SW update');
if(!html.includes("review-refresh-")||!html.includes("attempt<photos.length"))throw Error('Missing review fallback');
const bank={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};vm.createContext(bank);
for(let n=1;n<=12;n++){const path='assets/approved-images-'+String(n).padStart(2,'0')+'.js';vm.runInContext(fs.readFileSync(path,'utf8'),bank,{filename:path,timeout:20000});}
const words=['mother','father','friend','lip','hip','career','chapter','novel'];
for(const word of words){
 const entry=bank.window.MEJ_APPROVED_IMAGES[word];
 if(!entry)throw Error('Missing bank entry '+word);
 const items=Array.isArray(entry)?entry:[entry];
 const approved=items.filter(x=>x&&x.src&&x.rejected!==true&&x.status!=='rejected');
 if(!approved.length)throw Error('No approved entries '+word);
 const available=approved.filter(x=>x.src.startsWith('/English-Foundation/')&&fs.existsSync(x.src.slice('/English-Foundation/'.length))||x.src.startsWith('data:image/'));
 if(!available.length)throw Error('Image file absent '+word);
}
console.log('PASS: review page JS, SW syntax and eight representative image links');
// Verify currently deployed review image bank refresh.

// QA run: updated service-worker image cache handling.
