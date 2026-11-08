'use strict';
/* Owner approved all 32 pictures. Only install newly missing master images.
   Keep existing primary images, store two out-of-master approved pictures separately. */
const fs=require('fs'),cp=require('child_process'),path=require('path'),os=require('os'),vm=require('vm');
const doc=JSON.parse(fs.readFileSync('reviews/image-audit/MEJ_32_OWNER_APPROVAL_2026-11-08.json','utf8'));
if(doc.items.length!==32||doc.items.some(x=>x.ownerDecision!=='approved'))throw Error('Incorrect owner-approved 32-item manifest');
const archive=doc.archiveExpected;
if(!fs.existsSync(archive))throw Error('ZIP not uploaded: '+archive);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mej-32-approved-'));
cp.execFileSync('unzip',['-q',archive,'-d',tmp]);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(d,f.name)):[path.join(d,f.name)]);
const files=walk(tmp);
const targetDir='assets/mej-owner-approved-32-20261108';
fs.mkdirSync(targetDir,{recursive:true});
const arr=[],master=[],extras=[],existing=[];
for(const row of doc.items){
 const found=files.filter(f=>path.basename(f)===row.imageFile);
 if(found.length!==1)throw Error('Expected one file for '+row.word+' '+row.imageFile+' got '+found.length);
 const src=found[0],buff=fs.readFileSync(src);
 if(buff.length<1000||buff.toString('ascii',0,4)!=='RIFF'||buff.toString('ascii',8,12)!=='WEBP')throw Error('Not WEBP '+row.imageFile);
 if(row.masterStatus==='already_has_approved_image'){existing.push(row.word);continue;}
 const rel=targetDir+'/'+row.imageFile;fs.writeFileSync(rel,buff);
 const data={src:'/English-Foundation/'+rel,status:'approved',preferred:true,origin:'Owner-approved 2026-11-08 32 picture cutouts',sourceWidth:313,sourceHeight:313};
 arr.push([row.word.trim().toLowerCase(),data]);
 if(row.masterStatus==='master_missing_image')for(const st of row.stages.split(/\s*,\s*/)){
  if(!/^(?:[1-9]|1[0-2])[AB]$/.test(st))throw Error('Bad stage '+st);
  master.push({word:row.word,grade:Number(st.slice(0,-1)),part:st.endsWith('A')?1:2,stage:st});
 }else extras.push(row.word);
}
if(arr.length!==28||master.length!==27||existing.length!==4||extras.length!==2)throw Error('Unexpected install count');
const bank='assets/approved-images-15.js';
if(fs.existsSync(bank))throw Error('Never overwrite an existing 15th image bank');
fs.writeFileSync(bank,'(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(arr)+';for(const [k,p] of entries){const old=window.MEJ_APPROVED_IMAGES[k]||[];const a=Array.isArray(old)?old:[old];if(a.some(x=>x&&x.src===p.src))continue;window.MEJ_APPROVED_IMAGES[k]=[p,...a.filter(Boolean)];}})();\n');
let html=fs.readFileSync('index.html','utf8');
const ref='<script src="assets/approved-images-15.js?v=20261108-32-owner" defer></script>';
if(!html.includes('assets/approved-images-15.js'))html=html.replace('</head>',ref+'\n</head>');
if(!html.includes('/* MEJ_OWNER_APPROVED_CROPPED_32_20261108 */')){
 const tag='function learnLevel(g,part=null){';
 if(!html.includes(tag))throw Error('Cannot find learnLevel, no partial app edits');
 html=html.replace(tag,'/* MEJ_OWNER_APPROVED_CROPPED_32_20261108 */\nconst MEJ_OWNER_32_ROUTES='+JSON.stringify(master)+';\n'+tag);
 const existingRoute='items.push(...reuse28Words);';
 if(!html.includes(existingRoute))throw Error('Reuse image insert point missing');
 html=html.replace(existingRoute,existingRoute+"const owner32Words=MEJ_OWNER_32_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...owner32Words);");
}
fs.writeFileSync('index.html',html);
const learnPath='reviews/learning.html';
if(fs.existsSync(learnPath)){let learn=fs.readFileSync(learnPath,'utf8');learn=learn.replace('for(let i=1;i<=14;i++)','for(let i=1;i<=15;i++)');fs.writeFileSync(learnPath,learn);}
let sw=fs.readFileSync('sw.js','utf8');sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-owner-32-crops'").replace(/Array\.from\(\{length:14\}/,'Array.from({length:15}').replace(/imageShardsTotal:14/g,'imageShardsTotal:15');fs.writeFileSync('sw.js',sw);
const result={status:'installed',ownerApproved:32,newImageFiles:28,alreadyExistingNoDuplicates:existing.length,masterWordsLinked:26,learningPlacements:master.length,outsideMasterStored:extras,sourceSize:'313x313',review:'All 32 user-approved; no additional review requested',scope:'Learning only; do not alter quiz results or user data'};
fs.writeFileSync('reviews/image-audit/MEJ_32_OWNER_APPROVED_INSTALL_RESULT.json',JSON.stringify(result,null,2)+'\n');
console.log('OWNER32 '+JSON.stringify(result));
