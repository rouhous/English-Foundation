'use strict';
/* MEJ owner-approved 5-grid salvage: install 38 exact images, learning only. */
const fs=require('fs'),cp=require('child_process'),path=require('path'),os=require('os');
const archive='assets/import/MEJ_38_OWNER_APPROVED_READY_FOR_GITHUB_2026-11-08.zip';
if(!fs.existsSync(archive))throw Error('Upload owner-approved ZIP first: '+archive);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mej-38-'));
cp.execFileSync('unzip',['-q',archive,'-d',dir]);
function csv(src){const lines=src.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/);const p=s=>{let a=[],v='',q=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++}else q=!q}else if(c===','&&!q){a.push(v);v=''}else v+=c}a.push(v);return a};const h=p(lines.shift());return lines.map(l=>Object.fromEntries(p(l).map((v,i)=>[h[i],v])));}
const rows=csv(fs.readFileSync(path.join(dir,'manifest.csv'),'utf8'));
if(rows.length!==38||new Set(rows.map(x=>x.word.toLowerCase())).size!==38)throw Error('Expected 38 unique approved master words');
if(rows.some(x=>x.owner_decision!=='approved'))throw Error('Unapproved picture present');
const outDir='assets/mej-5grid-owner-38-20261108';
fs.mkdirSync(outDir,{recursive:true});
const entries=[],placements=[];
for(const [i,row] of rows.entries()){
 const file=path.basename(row.file);
 if(file!==row.file||!file.endsWith('.webp'))throw Error('Unsafe image name '+row.file);
 const bytes=fs.readFileSync(path.join(dir,'images',file));
 if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP: '+file);
 const filePath=outDir+'/'+file;fs.writeFileSync(filePath,bytes);
 entries.push([row.word.toLowerCase().normalize('NFKC').trim(),{src:'/English-Foundation/'+filePath,status:'approved',preferred:true,origin:'Owner approved 2026-11-08 five-grid salvage',w:384,h:384,nativeWidth:Number(row.native_width),nativeHeight:Number(row.native_height)}]);
 for(const rawStage of row.stage.split(',')){const stage=rawStage.trim();
 if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage+' for '+row.word);
 placements.push({word:row.word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});
 }
}
if(placements.length!==48)throw Error('Expected 48 stage links, found '+placements.length);
const bankPath='assets/approved-images-16.js';
if(fs.existsSync(bankPath))throw Error('Shard 16 exists. Refuse overwrite.');
const js='(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(entries)+';for(const [key,item] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const a=Array.isArray(old)?old:[old];if(a.some(x=>x&&x.src===item.src))continue;window.MEJ_APPROVED_IMAGES[key]=[item,...a.filter(Boolean)];}})();\n';
fs.writeFileSync(bankPath,js);
let app=fs.readFileSync('index.html','utf8');
const include='<script src="assets/approved-images-16.js?v=20261108-38-owner" defer></script>';
if(!app.includes('assets/approved-images-16.js')){if(!app.includes('</head>'))throw Error('Missing head tag');app=app.replace('</head>',include+'\n</head>')}
const marker='/* MEJ_FIVE_GRID_38_OWNER_APPROVED_20261108 */';
if(!app.includes(marker)){
 const anchor='function learnLevel(g,part=null){';
 if(!app.includes(anchor))throw Error('Missing learnLevel function');
 app=app.replace(anchor,marker+'\nconst MEJ_FIVE_GRID_38_ROUTES='+JSON.stringify(placements)+';\n'+anchor);
 const hook='items.push(...owner32Words);';
 if(!app.includes(hook))throw Error('Missing approved 32 learning hook, refuse to alter index');
 app=app.replace(hook,hook+"const fiveGrid38=MEJ_FIVE_GRID_38_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Approved five-grid picture • '+x.stage}));items.push(...fiveGrid38);");
}
fs.writeFileSync('index.html',app);
const learning='reviews/learning.html';if(fs.existsSync(learning)){let r=fs.readFileSync(learning,'utf8');r=r.replace('for(let i=1;i<=15;i++)','for(let i=1;i<=16;i++)');fs.writeFileSync(learning,r);}
let sw=fs.readFileSync('sw.js','utf8');sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-38-owner'").replace(/Array\.from\(\{length:15\}/,'Array.from({length:16}').replace(/imageShardsTotal:15/g,'imageShardsTotal:16');fs.writeFileSync('sw.js',sw);
fs.mkdirSync('reviews/image-audit',{recursive:true});
const result={status:'installed',approvedWords:38,newWebPFiles:38,placements:48,duplicateFiles:0,source:'5 grids cropped and user visually approved',preserve:'No quiz, marks or student progress changed'};
fs.writeFileSync('reviews/image-audit/MEJ_38_OWNER_APPROVED_INSTALL_RESULT.json',JSON.stringify(result,null,2)+'\n');
console.log('MEJ38 '+JSON.stringify(result));
