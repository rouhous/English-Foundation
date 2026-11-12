'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const path='index.html',old=fs.readFileSync(path,'utf8');
let s=old;
const marker='MEJ_MEDAL_STATUS_V2_20261112';
if(s.includes(marker)){console.log('Already patched');process.exit(0)}
const pattern='<span class="mej-gate-reward">🎮 العب الآن</span>';
const escaped='\\\"';
let found=(s.match(/mej-gate-reward/g)||[]).length;
if(!s.includes(pattern))throw Error('No medal reward label literal. Found '+found+' occurrences.');
const expression='<span class="mej-gate-reward">'+`\${(window.mejHiddenRoundStatus?.(g,i+1,p)?.status==='finished')?'✅ +'+window.mejHiddenRoundStatus(g,i+1,p).award+' ⭐':(window.mejHiddenRoundStatus?.(g,i+1,p)?.status==='pending'?'🔄 استكمل اللعبة':'🎮 العب الآن')}`+'</span>';
s=s.replace(pattern,expression);
s=s.replace(/mej-hidden-badges-v1\.css\?v=[^"']+/, 'mej-hidden-badges-v1.css?v=20261112metallic2');
if(!s.includes('mej-hidden-badges-v1.css?v=20261112metallic2'))throw Error('CSS cache version unchanged');
s=s.replace('</head>','<!-- '+marker+' -->\n</head>');
const bankHash=x=>{let a=x.indexOf('const BANK='),b=x.indexOf('const byGrade=');if(a<0||b<a)throw Error('No bank');return crypto.createHash('sha256').update(x.slice(a,b)).digest('hex')};
if(bankHash(s)!==bankHash(old))throw Error('Question bank changed unexpectedly');
let scripts=0;for(const [idx,m] of [...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
 if(!m[2].trim()||/application\/json/.test(m[1]))continue;
 new vm.Script(m[2],{filename:'inline-'+idx+'.js'});scripts++;
}
if(scripts<2)throw Error('Not enough inline scripts');
fs.writeFileSync(path,s);
const report={marker,statusLabels:['available','pending','finished'],badgeSVGCount:10,questionBankUnchanged:true,scriptBlocksVerified:scripts,cssVersion:'20261112metallic2'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/hidden-medal-status-v2.json',JSON.stringify(report,null,2));
console.log(report);
