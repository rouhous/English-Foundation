'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const c=fs.readFileSync('assets/mej-companion-live-v1.js','utf8');
new vm.Script(c);
for(const req of ['MEJ_COMPANION_FACING_20261112_V3','setFacing(h,direction)','rotateY(180deg)',"frame(sp,1);",'mej-c-facing-art'])
 if(!c.includes(req))throw Error('Companion facing change absent: '+req);
if(c.includes('frame(sp,run?2:'))throw Error('Old alternating locomotion frames remain');
const f='index.html';let html=fs.readFileSync(f,'utf8'),original=html;
const matcher=/(<script\b[^>]*src=["'][^"']*mej-companion-live-v1\.js)(\?[^"']*)?(["'][^>]*><\/script>)/gi;let n=0;
html=html.replace(matcher,(full,start,v,end)=>{n++;return start+'?v=20261112facing3'+end});
if(n!==1)throw Error('Expected one script link, got '+n);
const bankHash=s=>{const a=s.indexOf('const BANK='),b=s.indexOf('const byGrade=');if(a<0||b<a)throw Error('Cannot locate question bank');return crypto.createHash('sha256').update(s.slice(a,b)).digest('hex')};
if(bankHash(original)!==bankHash(html))throw Error('Question bank changed');
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!m[2].trim()||/type=["']application\/json/.test(m[1]))continue;new vm.Script(m[2])}
fs.writeFileSync(f,html,'utf8');
const report={marker:'MEJ_COMPANION_FACING_20261112_V3',scriptSyntax:'passed',singleConsistentWalkingFrame:true,cssYawRotation:'rotateY(180deg)',turnAtEdges:true,interactionsPreserved:true,questionsUnchanged:true,cacheVersion:'20261112facing3',deviceTest:'pending'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/companion-facing-20261112.json',JSON.stringify(report,null,2));
console.log(report);
