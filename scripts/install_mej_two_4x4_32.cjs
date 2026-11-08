'use strict';
const fs=require('fs'),child=require('child_process'),path=require('path');
const arch='assets/import/MEJ_32_Cropped_4x4_Batches_2026-11-08.zip';
const manifest=JSON.parse(fs.readFileSync('reviews/image-audit/master-994-next-32-install-manifest.json','utf8'));
if(!fs.existsSync(arch))throw Error('Upload prepared zip to '+arch+' first');
if(manifest.entries.length!==32)throw Error('Expected exactly 32 words');
const tmp=fs.mkdtempSync('/tmp/mej-32-');
child.execFileSync('unzip',['-q',arch,'-d',tmp]);
const outDir='assets/mej-batches-19-20';
fs.mkdirSync(outDir,{recursive:true});
for(const item of manifest.entries){
 const source=path.join(tmp,item.filename);
 if(!fs.existsSync(source))throw Error('Missing expected image '+item.filename);
 const bytes=fs.readFileSync(source);
 if(bytes.length<1000||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Not WebP: '+item.filename);
 fs.writeFileSync(path.join(outDir,item.filename),bytes);
}
const bankPath='assets/approved-images-13.js';
if(!fs.existsSync(bankPath)){
 const parts=manifest.entries.map((item,i)=>{
  const entry={id:100130+i,src:'/English-Foundation/'+outDir+'/'+item.filename,w:384,h:384,status:'approved',preferred:true,origin:'MEJ 2026-11-08 two 4x4 batches'};
  return [item.word.trim().toLowerCase(),entry];
 });
 const js='(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(parts)+';for(const [key,image] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const a=Array.isArray(old)?old:[old];if(a.some(x=>x&&x.src===image.src))continue;window.MEJ_APPROVED_IMAGES[key]=[image,...a.filter(Boolean)];}})();\n';
 fs.writeFileSync(bankPath,js);
}
const routes=manifest.entries.flatMap(item=>String(item.stages).split(',').map(stage=>{
 stage=stage.trim();
 if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);
 return {word:item.word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage};
}));
let app=fs.readFileSync('index.html','utf8');
const js='<script src="assets/approved-images-13.js?v=20261108-32" defer></script>';
if(!app.includes('assets/approved-images-13.js')){
 if(!app.includes('</head>'))throw Error('Missing head closing');
 app=app.replace('</head>',js+'</head>');
}
const marker='/* MEJ_IMAGES_32_20261108 */';
if(!app.includes(marker)){
 const fn='function learnLevel(g,part=null){';
 if(!app.includes(fn)||!app.includes('items.push(...legacyWords);'))throw Error('Learning route not compatible');
 app=app.replace(fn,marker+'\nconst MEJ_NEW_32_IMAGES='+JSON.stringify(routes)+';\n'+fn);
 app=app.replace('items.push(...legacyWords);',"items.push(...legacyWords);const image32Words=MEJ_NEW_32_IMAGES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Master vocabulary • '+x.stage}));items.push(...image32Words);");
}
fs.writeFileSync('index.html',app);
let review=fs.readFileSync('reviews/learning.html','utf8');
review=review.replace('for(let i=1;i<=12;i++)','for(let i=1;i<=13;i++)');
fs.writeFileSync('reviews/learning.html',review);
let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/const CACHE='[^']+'/,"const CACHE='mej-public-20261108-32-images'");
sw=sw.replace('length:12','length:13').replace('imageShardsTotal:12','imageShardsTotal:13');
fs.writeFileSync('sw.js',sw);
const report={status:'installed',images:manifest.entries.length,placements:routes.length,paths:manifest.entries.map(x=>outDir+'/'+x.filename)};
fs.mkdirSync('reviews/image-audit',{recursive:true});
fs.writeFileSync('reviews/image-audit/master-32-install-result.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
