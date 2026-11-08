'use strict';
/* Install owner-reviewed cropped images from 48-image review archive, without touching assessments. */
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const archive='assets/import/MEJ_Last_3_Grids_48_Cropped_and_25_Matched_Review.zip';
const decisionsPath='reviews/image-audit/MEJ_LAST_3_GRIDS_OWNER_DECISIONS_2026-11-08.csv';
if(!fs.existsSync(archive))throw Error('Review ZIP not found at '+archive);
if(!fs.existsSync(decisionsPath))throw Error('Owner decision CSV not found. No pictures installed.');
function parseCSV(src){const lines=src.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/),split=s=>{let a=[],v='',q=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++}else q=!q}else if(c===','&&!q){a.push(v);v=''}else v+=c;}a.push(v);return a;};const hdr=split(lines.shift());return lines.map(x=>Object.fromEntries(split(x).map((v,i)=>[hdr[i],v])));}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mej-48-'));
cp.execFileSync('unzip',['-q',archive,'-d',dir]);
const folder=path.join(dir,'MEJ_Last_3_Grids_Cut_Review_2026-11-08');
const shortlist=parseCSV(fs.readFileSync(path.join(folder,'SHORTLIST_25_For_Approval.csv'),'utf8'));
const decisions=parseCSV(fs.readFileSync(decisionsPath,'utf8'));
if(shortlist.length!==25||decisions.length!==25)throw Error('Must have exactly 25 reviewed decisions');
const lookup=new Map(decisions.map(r=>[r.Word.trim().toLowerCase(),r.Decision.trim().toLowerCase()]));
if(lookup.size!==25||shortlist.some(r=>!lookup.has(r.Word.trim().toLowerCase())))throw Error('Decision words do not match shortlist');
const allowed=new Set(['approved','rejected','pending']);
if([...lookup.values()].some(x=>!allowed.has(x)))throw Error('Invalid decision; accepted values approved, rejected, pending');
const accepted=shortlist.filter(r=>lookup.get(r.Word.trim().toLowerCase())==='approved');
const rejected=shortlist.filter(r=>lookup.get(r.Word.trim().toLowerCase())==='rejected');
const pending=shortlist.filter(r=>lookup.get(r.Word.trim().toLowerCase())==='pending');
const dstDir='assets/mej-last3-owner-reviewed-20261108',bankPath='assets/approved-images-17.js';
if(fs.existsSync(bankPath))throw Error('Image bank 17 already exists; no overwrite');
fs.mkdirSync(dstDir,{recursive:true});
const entries=[],routes=[],skipped=[];
for(const r of accepted){
 const imgName=path.basename(r.OutputImage);
 if(imgName!==r.OutputImage||!imgName.endsWith('.webp'))throw Error('Invalid basename '+r.OutputImage);
 const source=path.join(folder,'shortlisted_25',imgName);
 if(!fs.existsSync(source))throw Error('Missing image '+source);
 const bytes=fs.readFileSync(source);
 if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+imgName);
 const dst=path.join(dstDir,imgName);fs.writeFileSync(dst,bytes);
 const normalized=r.Word.normalize('NFKC').trim().toLowerCase();
 entries.push([normalized,{src:'/English-Foundation/'+dst,status:'approved',preferred:true,origin:'Owner reviewed last 3 grids 2026-11-08',w:384,h:384}]);
 for(const raw of r.Stages.split(',')){
  const stage=raw.trim();if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);
  routes.push({word:r.Word,grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage});
 }
}
const script='(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(entries)+';for(const [key,item] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const vals=Array.isArray(old)?old:[old];if(vals.some(x=>x&&x.src===item.src))continue;window.MEJ_APPROVED_IMAGES[key]=[item,...vals.filter(Boolean)];}})();\n';
fs.writeFileSync(bankPath,script);
let app=fs.readFileSync('index.html','utf8');
if(!app.includes('assets/approved-images-17.js')){
 if(!app.includes('</head>'))throw Error('No head close tag');
 app=app.replace('</head>','<script src="assets/approved-images-17.js?v=20261108-last3" defer></script>\n</head>');
}
const marker='/* MEJ_LAST_THREE_GRID_APPROVED_20261108 */';
if(!app.includes(marker)){
 const anchor='function learnLevel(g,part=null){';
 if(!app.includes(anchor))throw Error('Learning function not found');
 app=app.replace(anchor,marker+'\nconst MEJ_LAST3_APPROVED_ROUTES='+JSON.stringify(routes)+';\n'+anchor);
 const hook='items.push(...fiveGrid38);';
 if(!app.includes(hook))throw Error('Missing previous learning hook, refuse unsafe modification');
 app=app.replace(hook,hook+"const last3Words=MEJ_LAST3_APPROVED_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Reviewed picture • '+x.stage}));items.push(...last3Words);");
}
fs.writeFileSync('index.html',app);
let learning=fs.readFileSync('reviews/learning.html','utf8');
learning=learning.replace('for(let i=1;i<=16;i++)','for(let i=1;i<=17;i++)');fs.writeFileSync('reviews/learning.html',learning);
let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-last3-reviewed'").replace(/Array\.from\(\{length:16\}/,'Array.from({length:17}').replace(/imageShardsTotal:16/g,'imageShardsTotal:17');
fs.writeFileSync('sw.js',sw);
const result={status:'installed_from_owner_decisions',approved:accepted.length,rejected:rejected.length,pending:pending.length,learningPlacements:routes.length,imagesWritten:entries.length};
fs.writeFileSync('reviews/image-audit/MEJ_LAST_3_GRIDS_INSTALL_RESULT.json',JSON.stringify(result,null,2)+'\n');
console.log('MEJ_LAST3 '+JSON.stringify(result));
