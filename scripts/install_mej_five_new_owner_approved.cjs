'use strict';
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const archive='assets/MEJ_5_NEW_OWNER_APPROVED_READY_FOR_GITHUB_2026-11-08.zip';
if(!fs.existsSync(archive))throw Error('Archive missing at '+archive);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mej-5-'));
cp.execFileSync('unzip',['-q',archive,'-d',tmp]);
const folder=path.join(tmp,'MEJ_5_NEW_OWNER_APPROVED_READY_FOR_GITHUB_2026-11-08');
const csv=fs.readFileSync(path.join(folder,'manifest.csv'),'utf8');
function csvParse(src){
 const lines=src.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/);
 const part=x=>{let out=[],b='',q=false;for(let i=0;i<x.length;i++){const c=x[i];if(c==='"'){if(q&&x[i+1]==='"'){b+='"';i++}else q=!q;}else if(c===','&&!q){out.push(b);b='';}else b+=c;}out.push(b);return out;};
 const cols=part(lines.shift());
 return lines.map(l=>Object.fromEntries(part(l).map((v,i)=>[cols[i],v])));
}
const rows=csvParse(csv);
const expected=['go hiking','go camping','go sailing','go snorkelling','photography'];
if(rows.length!==5||rows.some((r,i)=>r.Word.toLowerCase()!==expected[i]||r.OwnerDecision!=='approved'))throw Error('Invalid user-approved manifest');
const dest='assets/mej-owner-approved-5new-20261108';
fs.mkdirSync(dest,{recursive:true});
const entries=[],routes=[];
for(const r of rows){
 const file=path.basename(r.ImageFile);
 if(file!==r.ImageFile||!file.endsWith('.webp'))throw Error('Invalid filename '+r.ImageFile);
 const bytes=fs.readFileSync(path.join(folder,'images',file));
 if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+file);
 fs.writeFileSync(path.join(dest,file),bytes);
 entries.push([r.Word.toLowerCase(),{src:'/English-Foundation/'+dest+'/'+file,status:'approved',preferred:true,origin:'Owner-approved 2026-11-08 5 images',w:384,h:384,nativeWidth:Number(r.NativePx),nativeHeight:Number(r.NativePx)}]);
 for(const item of r.Stages.split(',')){
  const stage=item.trim();
  if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid learning stage '+stage);
  routes.push({word:r.Word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});
 }
}
if(routes.length!==5)throw Error('Expected 5 learning stage placements');
const bank='assets/approved-images-18.js';
if(fs.existsSync(bank))throw Error('Shard 18 already exists; not overwriting');
fs.writeFileSync(bank,'(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(entries)+';for(const [key,item] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const a=Array.isArray(old)?old:[old];if(a.some(x=>x&&x.src===item.src))continue;window.MEJ_APPROVED_IMAGES[key]=[item,...a.filter(Boolean)];}})();\n');
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('assets/approved-images-18.js'))html=html.replace('</head>','<script src="assets/approved-images-18.js?v=20261108-5-owner" defer></script>\n</head>');
const marker='/* MEJ_APPROVED_FIVE_NEW_20261108 */';
if(!html.includes(marker)){
 const fn='function learnLevel(g,part=null){';
 if(!html.includes(fn))throw Error('Missing learnLevel()');
 html=html.replace(fn,marker+'\nconst MEJ_FIVE_NEW_ROUTES='+JSON.stringify(routes)+';\n'+fn);
 const hook='items.push(...last3Words);';
 if(!html.includes(hook))throw Error('Expected owner-approved previous learning hook missing; refuse silent failure');
 html=html.replace(hook,hook+"const fiveNewWords=MEJ_FIVE_NEW_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...fiveNewWords);");
}
fs.writeFileSync('index.html',html);
let learning=fs.readFileSync('reviews/learning.html','utf8');
learning=learning.replace('for(let i=1;i<=17;i++)','for(let i=1;i<=18;i++)');
fs.writeFileSync('reviews/learning.html',learning);
let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-owner-five-new'");
sw=sw.replace(/Array\.from\(\{length:17\}/,'Array.from({length:18}');
sw=sw.replace(/imageShardsTotal:17/g,'imageShardsTotal:18');
fs.writeFileSync('sw.js',sw);
const report={status:'installed',ownerApproved:5,images:5,learningPlacements:routes.length,words:expected,archive,sourceResolution:'301x301 upscaled 384x384',studentDataChanged:false};
fs.mkdirSync('reviews/image-audit',{recursive:true});
fs.writeFileSync('reviews/image-audit/MEJ_FIVE_NEW_OWNER_APPROVED_INSTALL_RESULT.json',JSON.stringify(report,null,2)+'\n');
console.log('MEJ_FIVE_NEW_INSTALL '+JSON.stringify(report));

// Trigger installation after archive was uploaded to assets/.
