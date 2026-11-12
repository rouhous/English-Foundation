'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const path='index.html';let s=fs.readFileSync(path,'utf8'),before=s;
if(s.includes('MEJ_HIDDEN_BONUS_CLOUD_V1')){console.log('Already patched');process.exit(0)}
const snapshot='grade:Number(profile.grade),stars:Math.max(0,Math.min(2600,Number(profile.stars)||0)),';
if(s.split(snapshot).length!==2)throw Error('Cloud stars snapshot changed');
s=s.replace(snapshot,'grade:Number(profile.grade),stars:Math.max(0,Math.min(3250,Number(profile.stars)||0)),');
const archive='journeyIsland:profile.journeyIsland??null\n   }';
if(s.split(archive).length!==2)throw Error('Cloud private backup serialization changed');
s=s.replace(archive,'journeyIsland:profile.journeyIsland??null,\n    hiddenObjectsLedger:profile.hiddenObjectsLedger||{}\n   }');
const marker='<!-- MEJ_HIDDEN_BONUS_CLOUD_V1 -->';
if(!s.includes('</head>'))throw Error('Head missing');
s=s.replace('</head>',marker+'</head>');
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const bank=v=>{let a=v.indexOf('const BANK='),b=v.indexOf('const byGrade=');if(a<0||b<a)throw Error('Bank missing');return hash(v.slice(a,b));};
if(bank(before)!==bank(s))throw Error('Question bank changed');
let valid=0;for(const [i,x] of [...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){if(!x[2].trim()||/application\/json/.test(x[1]))continue;new vm.Script(x[2],{filename:'inline-'+i});valid++;}
fs.writeFileSync(path,s);
const worker='sw.js';let sw=fs.readFileSync(worker,'utf8');
const old=sw;sw=sw.replace(/const CACHE='mej-hidden-objects-v1-20261112';/,"const CACHE='mej-hidden-objects-v2-cloud-20261112';");
if(sw===old)throw Error('Expected old cache version');
new vm.Script(sw);fs.writeFileSync(worker,sw);
const report={marker:'MEJ_HIDDEN_BONUS_CLOUD_V1',bonusLedgerSent:true,starCap:3250,baseMasteryCap:2600,questionBankUnchanged:true,syntaxBlocks:valid,cache:'mej-hidden-objects-v2-cloud-20261112'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/hidden-bonus-cloud-sync.json',JSON.stringify(report,null,2));console.log(report);
