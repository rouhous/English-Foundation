'use strict';
/* Only the 15 owner-approved crop files; preserves all previous student progress. */
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const zipName='MEJ_5_Groups_80_Cropped_15_For_Review_2026-11-09.zip';
const archive=['assets/'+zipName,'assets/import/'+zipName].find(fs.existsSync);
if(!archive)throw Error('Uploaded owner-approved ZIP not found');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mej-15-'));
try{
 cp.execFileSync('unzip',['-q',archive,'-d',tmp]);
 const root=path.join(tmp,'MEJ_5_Groups_80_Cropped_Review_2026-11-09');
 function parseCSV(source){
   const lines=source.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/);
   function cells(line){const a=[];let v='',quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quote&&line[i+1]==='"'){v+='"';i++;}else quote=!quote;}else if(c===','&&!quote){a.push(v);v='';}else v+=c;}a.push(v);return a;}
   const cols=cells(lines.shift());return lines.map(l=>Object.fromEntries(cells(l).map((v,i)=>[cols[i],v])));
 }
 const records=parseCSV(fs.readFileSync(path.join(root,'SHORTLIST_15_FOR_APPROVAL.csv'),'utf8'));
 const expected=['skip','throw a ball','scooter','playing basketball','go fishing','play chess','sew','make a pizza','bake a cake','take a selfie','pencil sharpener','make the bed','tie a shoelace','play board games','do the washing up'];
 if(records.length!==15||records.some((r,i)=>r.Word.toLowerCase()!==expected[i]))throw Error('Unexpected shortlist contents');
 const shard='assets/approved-images-21.js',dest='assets/mej-approved-15-20261109';
 if(fs.existsSync(shard))throw Error('Shard 21 already exists: abort rather than overwrite');
 const existing=[];
 for(let i=14;i<=20;i++){
  const p='assets/approved-images-'+String(i).padStart(2,'0')+'.js';
  if(!fs.existsSync(p))throw Error('Missing installed image bank '+p);
  existing.push(fs.readFileSync(p,'utf8'));
 }
 // Do not silently replace approved entries. Existing old keys were cross-checked in the GitHub inventory.
 for(const r of records){if(existing.some(s=>s.includes('["'+r.Word.toLowerCase()+'",{"src"')))throw Error('Duplicate already-installed image '+r.Word);}
 let html=fs.readFileSync('index.html','utf8');
 const anchor='function learnLevel(g,part=null){',hook='items.push(...mejFourItems);';
 if(!html.includes(anchor)||!html.includes(hook)||!html.includes('</head>'))throw Error('Learning template hook not found');
 if(html.includes('MEJ_OWNER_FIFTEEN_ROUTES_20261109'))throw Error('Already installed');
 let review=fs.readFileSync('reviews/learning.html','utf8');
 if(!review.includes('for(let i=1;i<=20;i++'))throw Error('Review loader must be on shard 20');
 let sw=fs.readFileSync('sw.js','utf8');
 if(!sw.includes('length:20'))throw Error('Service worker must be on shard 20');
 const pairs=[],routes=[],files=[];
 for(const r of records){
  const name=r.ShortlistFile;
  if(path.basename(name)!==name||!/^G\d{2}_\d{2}_[a-z_]+\.webp$/.test(name))throw Error('Invalid WebP name '+name);
  const data=fs.readFileSync(path.join(root,'shortlist',name));
  if(data.length<1000||data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+name);
  const stageParts=r.Stages.split(',').map(s=>s.trim());
  for(const stage of stageParts){
   if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);
   routes.push({word:r.Word.toLowerCase(),grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});
  }
  pairs.push([r.Word.toLowerCase(),{src:'/English-Foundation/'+dest+'/'+name,status:'approved',preferred:true,origin:'owner-approved-2026-11-09-15',w:384,h:384}]);
  files.push({name,data});
 }
 if(routes.length!==16)throw Error('Expected 16 stage placements, got '+routes.length);
 html=html.replace('</head>','<script src="assets/approved-images-21.js?v=20261109-fifteen" defer></script>\n</head>');
 html=html.replace(anchor,'/* MEJ_OWNER_FIFTEEN_ROUTES_20261109 */\nconst MEJ_OWNER_FIFTEEN_ROUTES_20261109='+JSON.stringify(routes)+';\n'+anchor);
 html=html.replace(hook,hook+"const mejFifteenWords=MEJ_OWNER_FIFTEEN_ROUTES_20261109.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...mejFifteenWords);");
 review=review.replace('for(let i=1;i<=20;i++','for(let i=1;i<=21;i++');
 sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261109-owner-fifteen-v1'").replace('length:20','length:21').replace(/imageShardsTotal:20/g,'imageShardsTotal:21');
 fs.mkdirSync(dest,{recursive:true});
 for(const f of files)fs.writeFileSync(path.join(dest,f.name),f.data);
 fs.writeFileSync(shard,'(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(pairs)+';for(const [key,pic] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const previous=Array.isArray(old)?old:[old];if(!previous.some(x=>x&&x.src===pic.src))window.MEJ_APPROVED_IMAGES[key]=[pic,...previous.filter(Boolean)];}})();\n');
 fs.writeFileSync('index.html',html);fs.writeFileSync('reviews/learning.html',review);fs.writeFileSync('sw.js',sw);
 const report={status:'installed',ownerApproved:15,newImages:15,learningPlacements:16,words:expected,stages:routes.map(x=>({word:x.word,stage:x.stage})),zipPath:archive,finalImageResolution:'384x384',sourceResolution:'313-314 pixels per cell, upscaled',studentDataChanged:false};
 fs.mkdirSync('reviews/image-audit',{recursive:true});
 fs.writeFileSync('reviews/image-audit/MEJ_FIFTEEN_APPROVED_20261109_INSTALL_RESULT.json',JSON.stringify(report,null,2)+'\n');
 console.log('MEJ_FIFTEEN_INSTALL '+JSON.stringify(report));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
