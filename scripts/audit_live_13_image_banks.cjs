'use strict';
const fs=require('fs'),vm=require('vm'),zlib=require('zlib');
const ctx={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};vm.createContext(ctx);
for(let i=1;i<=13;i++){const p='assets/approved-images-'+String(i).padStart(2,'0')+'.js';if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p,timeout:30000});}
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
const bank=ctx.window.MEJ_APPROVED_IMAGES;
const verified=new Set(),unavailable=new Set(),rejected=new Set();
for(const [word,value] of Object.entries(bank)){
 const key=normalize(word),arr=Array.isArray(value)?value:[value];
 let good=false;
 for(const x of arr){
  if(!x||typeof x.src!=='string')continue;
  if(x.rejected===true||x.status==='rejected'){rejected.add(key);continue;}
  const source=x.src.split('?')[0];
  if(source.startsWith('data:image/')){good=true;break;}
  const path=source.startsWith('/English-Foundation/')?source.slice('/English-Foundation/'.length):source.replace(/^\.\//,'');
  if(!path.includes('..')&&fs.existsSync(path)&&fs.statSync(path).size>500){good=true;break;}
 }
 (good?verified:unavailable).add(key);
}
const c=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const known=new Set();
for(const l of c.levels)for(const p of l.parts)for(const q of p.questions){
 const x=q.word||q.pictureWord||'';
 if(x)known.add(normalize(x));
 const m=String(q.prompt||'').match(/What does\s+['“‘]([^'”’]+)['”’]\s+mean\?/i);
 if(m)known.add(normalize(m[1]));
 if(q.type==='Vocabulary'&&q.answer&&/^[a-zA-Z -]+$/.test(q.answer))known.add(normalize(q.answer));
}
const code=fs.readFileSync('index.html','utf8');
const staged=new Set();
for(const arrayName of ['MEJ_RESTORED_MASTER_120','MEJ_RESTORED_LEGACY_627','MEJ_NEW_32_IMAGES']){
 const pattern=new RegExp('const '+arrayName+'=(\\[[^;]+\\]);');
 const match=code.match(pattern);
 if(match){try{JSON.parse(match[1]).forEach(x=>staged.add(normalize(x.word)))}catch(e){console.warn('stage parse failed '+arrayName)}}
}
const result={generatedAt:new Date().toISOString(),shardsLoaded:13,allBankKeys:Object.keys(bank).length,verifiedKeys:verified.size,brokenKeys:[...unavailable].filter(x=>!verified.has(x)).length,stagedKeyCount:staged.size,catalogExtractedKeyCount:known.size};
const payload={meta:result,verified:[...verified].sort(),unavailable:[...unavailable].filter(x=>!verified.has(x)).sort(),staged:[...staged].sort(),catalog:[...known].sort()};
fs.mkdirSync('reviews/image-audit',{recursive:true});
fs.writeFileSync('reviews/image-audit/live-approved-bank-index.json',JSON.stringify(payload,null,2));
const compressed=zlib.deflateSync(Buffer.from(JSON.stringify(payload))).toString('base64');
fs.writeFileSync('reviews/image-audit/live-approved-bank-index.b64',compressed+'\n');
console.log('IMAGE_AUDIT '+JSON.stringify(result));
