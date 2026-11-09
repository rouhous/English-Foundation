'use strict';
/** Install only four 2026-11-09 owner-approved MEJ vocabulary images. */
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const name='MEJ_4_Approved_Ready_For_GitHub_2026-11-09.zip';
const archive=['assets/'+name,'assets/import/'+name].find(p=>fs.existsSync(p));
if(!archive)throw Error('Approved image ZIP not uploaded; place '+name+' in assets/ or assets/import/');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mej-four-'));
try{
 cp.execFileSync('unzip',['-q',archive,'-d',tmp]);
 const root=path.join(tmp,'MEJ_4_Approved_Ready_For_GitHub_2026-11-09');
 function parse(s){
  const lines=s.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
  function cells(line){const a=[];let v='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){v+='"';i++;}else q=!q;}else if(c===','&&!q){a.push(v);v='';}else v+=c;}a.push(v);return a;}
  const headers=cells(lines.shift());
  return lines.map(l=>Object.fromEntries(cells(l).map((v,i)=>[headers[i],v])));
 }
 const entries=parse(fs.readFileSync(path.join(root,'manifest.csv'),'utf8'));
 const expected=['scientist','spacesuit','watch','junk food'];
 if(entries.length!==expected.length||entries.some((r,i)=>r.Word.toLowerCase()!==expected[i]||r.OwnerDecision!=='approved'))throw Error('Owner approval manifest mismatch');
 const paths=[],routes=[];
 for(const e of entries){
  if(path.basename(e.ImageFile)!==e.ImageFile||!/^G\d{2}_\d{2}_[a-z_]+\.webp$/.test(e.ImageFile))throw Error('Invalid image filename');
  const bytes=fs.readFileSync(path.join(root,'images',e.ImageFile));
  if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+e.ImageFile);
  for(const part of e.Stages.split(',')){
   const stage=part.trim();
   if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);
   routes.push({word:e.Word.toLowerCase(),stage,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2});
  }
  paths.push({word:e.Word.toLowerCase(),file:e.ImageFile,bytes});
 }
 if(routes.length!==5)throw Error('Expected five learning placements');
 const shard='assets/approved-images-20.js';
 if(fs.existsSync(shard))throw Error('Shard 20 already exists. Refusing to overwrite.');
 // Fail closed if these pictures are already in the current bank (shards 14-19).
 for(let i=14;i<=19;i++){
   const s=fs.readFileSync('assets/approved-images-'+i+'.js','utf8');
   for(const p of paths)if(s.includes('["'+p.word+'",{"src"'))throw Error('Already approved in shard '+i+': '+p.word);
 }
 let html=fs.readFileSync('index.html','utf8');
 const anchor='function learnLevel(g,part=null){';
 const hook='items.push(...lastTwoWords);';
 if(!html.includes(anchor)||!html.includes(hook)||!html.includes('</head>'))throw Error('Current learning template mismatch; no files changed');
 if(html.includes('MEJ_OWNER_FOUR_ROUTES_20261109'))throw Error('Already installed');
 const reviewPath='reviews/learning.html';
 let review=fs.readFileSync(reviewPath,'utf8');
 if(!review.includes('for(let i=1;i<=19;i++'))throw Error('Current review loader mismatch; no files changed');
 let sw=fs.readFileSync('sw.js','utf8');
 if(!sw.includes('length:19'))throw Error('Current offline cache loader mismatch; no files changed');
 const base='assets/mej-approved-four-20261109';
 const images=paths.map(p=>[p.word,{src:'/English-Foundation/'+base+'/'+p.file,status:'approved',preferred:true,origin:'owner-approved-2026-11-09',w:384,h:384}]);
 const bank='(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const items='+JSON.stringify(images)+';for(const [key,picture] of items){const current=window.MEJ_APPROVED_IMAGES[key]||[];const previous=Array.isArray(current)?current:[current];if(!previous.some(x=>x&&x.src===picture.src))window.MEJ_APPROVED_IMAGES[key]=[picture,...previous.filter(Boolean)];}})();\n';
 html=html.replace('</head>','<script src="assets/approved-images-20.js?v=20261109-four" defer></script>\n</head>');
 html=html.replace(anchor,'/* MEJ_OWNER_FOUR_ROUTES_20261109 */\nconst MEJ_OWNER_FOUR_ROUTES_20261109='+JSON.stringify(routes)+';\n'+anchor);
 html=html.replace(hook,hook+"const mejFourItems=MEJ_OWNER_FOUR_ROUTES_20261109.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...mejFourItems);");
 review=review.replace('for(let i=1;i<=19;i++','for(let i=1;i<=20;i++');
 sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261109-owner-four-v1'").replace('length:19','length:20').replace(/imageShardsTotal:19/g,'imageShardsTotal:20');
 fs.mkdirSync(base,{recursive:true});
 for(const p of paths)fs.writeFileSync(path.join(base,p.file),p.bytes);
 fs.writeFileSync(shard,bank);
 fs.writeFileSync('index.html',html);
 fs.writeFileSync(reviewPath,review);
 fs.writeFileSync('sw.js',sw);
 fs.mkdirSync('reviews/image-audit',{recursive:true});
 const report={status:'installed',ownerApproved:4,newImages:4,learningPlacements:5,words:expected,stages:routes.map(({word,stage})=>({word,stage})),zipPath:archive,studentDataChanged:false};
 fs.writeFileSync('reviews/image-audit/MEJ_FOUR_APPROVED_20261109_INSTALL_RESULT.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
