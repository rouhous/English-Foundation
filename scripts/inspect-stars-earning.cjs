'use strict';
const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const q=['p.stars++','p.stars+=','p.stars =','p.stars=','profile.stars++','profile.stars+=','starsAward','earnedStar','p.activity.push'];
const out={};for(const needle of q){let p=0,a=[];while((p=s.indexOf(needle,p))!==-1&&a.length<35){a.push({at:p,context:s.slice(Math.max(0,p-300),p+330)});p+=needle.length}out[needle]=a}
fs.writeFileSync('diagnostics/stars-earning-hooks-20261120.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length]))));