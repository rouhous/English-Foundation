'use strict';
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const candidates=['assets/import/MEJ_Last_Two_Groups_32_Cropped_8_Approved.zip','assets/MEJ_Last_Two_Groups_32_Cropped_8_Approved.zip'];
const archive=candidates.find(p=>fs.existsSync(p));
if(!archive)throw Error('Upload approved ZIP into assets/ or assets/import/ first');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mej-two-grids-'));
cp.execFileSync('unzip',['-q',archive,'-d',tmp]);
function parse(src){
const lines=src.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/);
const split=s=>{let out=[],val='',quote=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'){if(quote&&s[i+1]==='"'){val+='"';i++}else quote=!quote;}else if(c===','&&!quote){out.push(val);val='';}else val+=c;}out.push(val);return out;};
const heads=split(lines.shift());
return lines.map(line=>Object.fromEntries(split(line).map((v,i)=>[heads[i],v])));
}
const rows=parse(fs.readFileSync(path.join(tmp,'APPROVED_8_MANIFEST.csv'),'utf8'));
const expected=['fair','fingers','flat','foggy','fur','garage','hall','train station'];
if(rows.length!==8||rows.some((x,i)=>x.Word.toLowerCase()!==expected[i]||x.OwnerDecision!=='approved'))throw Error('Owner manifest mismatch; abort');
const dest='assets/mej-two-grids-eight-20261108';
fs.mkdirSync(dest,{recursive:true});
const entries=[],routes=[];
for(const r of rows){
const file=path.basename(r.ImageFile);
if(file!==r.ImageFile||!file.endsWith('.webp'))throw Error('Unsafe image filename');
const bytes=fs.readFileSync(path.join(tmp,'approved_8',file));
if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+file);
fs.writeFileSync(path.join(dest,file),bytes);
entries.push([r.Word.toLowerCase(),{src:'/English-Foundation/'+dest+'/'+file,status:'approved',preferred:true,origin:'Owner approved last two grids 2026-11-08',w:384,h:384}]);
for(const raw of r.Stages.split(',')){const stage=raw.trim();if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);routes.push({word:r.Word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});}
}
const shard='assets/approved-images-19.js';
if(fs.existsSync(shard))throw Error('Image shard 19 already exists; refuse overwrite');
fs.writeFileSync(shard,'(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(entries)+';for(const [key,item] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const a=Array.isArray(old)?old:[old];if(a.some(x=>x&&x.src===item.src))continue;window.MEJ_APPROVED_IMAGES[key]=[item,...a.filter(Boolean)];}})();\n');
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('assets/approved-images-19.js'))html=html.replace('</head>','<script src="assets/approved-images-19.js?v=20261108-2grids" defer></script>\n</head>');
const marker='/* MEJ_LAST_TWO_GRID_ROUTES_20261108 */';
if(!html.includes(marker)){
 const fn='function learnLevel(g,part=null){';
 if(!html.includes(fn))throw Error('learnLevel function missing');
 html=html.replace(fn,marker+'\nconst MEJ_LAST_TWO_ROUTES='+JSON.stringify(routes)+';\n'+fn);
 const hook='items.push(...fiveNewWords);';
 if(!html.includes(hook))throw Error('Expected five-new learning route hook missing; do not publish partial update');
 html=html.replace(hook,hook+"const lastTwoWords=MEJ_LAST_TWO_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...lastTwoWords);");
}
fs.writeFileSync('index.html',html);
const review='reviews/learning.html';let learning=fs.readFileSync(review,'utf8');
if(!learning.includes('for(let i=1;i<=18;i++)'))throw Error('Expected review shard loop 18 not found');
learning=learning.replace('for(let i=1;i<=18;i++)','for(let i=1;i<=19;i++)');
fs.writeFileSync(review,learning);
let sw=fs.readFileSync('sw.js','utf8');
if(!sw.includes('length:18'))throw Error('Expected service worker shard count 18 missing');
sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-two-grids-8'");
sw=sw.replace('length:18','length:19').replace(/imageShardsTotal:18/g,'imageShardsTotal:19');
fs.writeFileSync('sw.js',sw);
fs.mkdirSync('reviews/image-audit',{recursive:true});
const result={status:'installed',approved:8,imagesWritten:8,learningPlacements:routes.length,archive,words:expected,studentDataChanged:false};
fs.writeFileSync('reviews/image-audit/MEJ_LAST_TWO_GRIDS_8_INSTALL_RESULT.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
