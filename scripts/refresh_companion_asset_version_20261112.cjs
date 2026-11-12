'use strict';
const fs=require('fs'),crypto=require('crypto');
const filename='index.html';let s=fs.readFileSync(filename,'utf8');
const marker='MEJ_COMPANION_ROAM_ASSET_V2';
if(s.includes(marker)){console.log('Already updated');process.exit(0)}
const before=s;
const pattern=/(<script\b[^>]*src=["'][^"']*mej-companion-live-v1\.js)(\?[^"']*)?(["'][^>]*><\/script>)/gi;
let count=0;
s=s.replace(pattern,(_,prefix,query,suffix)=>{count++;return prefix+'?v=20261112roam2'+suffix});
if(count!==1)throw Error('Expected one companion script link; got '+count);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const bank=x=>{let a=x.indexOf('const BANK='),b=x.indexOf('const byGrade=');if(a<0||b<a)throw Error('No bank markers');return hash(x.slice(a,b));};
if(bank(before)!==bank(s))throw Error('Question bank unexpectedly changed');
s=s.replace('</head>','<!-- '+marker+' -->\n</head>');
fs.writeFileSync(filename,s,'utf8');
const report={marker,scriptLinksUpdated:count,appQuestionBankUnchanged:true,cacheBusted:'?v=20261112roam2'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/companion-asset-version-20261112.json',JSON.stringify(report,null,2));
console.log(report);
