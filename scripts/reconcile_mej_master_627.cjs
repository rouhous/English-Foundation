'use strict';
/* Reconcile the 627 master words with legacy approved images against the active app.
   Only insert image-backed words into their source-book A/B stages, and do not touch assessments. */
const fs=require('fs'),vm=require('vm'),zlib=require('zlib');
const rows=JSON.parse(zlib.inflateSync(Buffer.from(fs.readFileSync('scripts/master-627-stage-manifest.b64','utf8').trim(),'base64')).toString('utf8'));
if(rows.length!==627||new Set(rows.map(x=>x[0].toLowerCase())).size!==627)throw Error('627-word source inventory validation failed');
const context={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};
vm.createContext(context);
for(let i=1;i<=12;i++){
 const f='assets/approved-images-'+String(i).padStart(2,'0')+'.js';
 vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f,timeout:30000});
}
const bank=context.window.MEJ_APPROVED_IMAGES;
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
function imagesFor(word){
 const key=normalize(word),value=bank[key]||bank[key.replace(/-/g,' ')]||bank[key.replace(/ /g,'-')]||[];
 return (Array.isArray(value)?value:[value]).filter(x=>x&&typeof x.src==='string'&&x.rejected!==true&&x.status!=='rejected').filter(x=>{
  if(x.src.startsWith('data:image/'))return true;
  if(!x.src.startsWith('/English-Foundation/'))return false;
  const file=x.src.slice('/English-Foundation/'.length).split('?')[0].split('#')[0];
  return !file.includes('..')&&fs.existsSync(file)&&fs.statSync(file).size>0;
 });
}
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const original=new Map();
function questionWord(q){
 const valid=x=>{const s=String(x||'').trim();return /^[A-Za-z][A-Za-z'’ -]{0,70}$/.test(s)?s:'';};
 if(valid(q.word))return valid(q.word);
 if(valid(q.pictureWord))return valid(q.pictureWord);
 const prompt=String(q.prompt||'');
 if(q.type==='Vocabulary'){
  const match=prompt.match(/What does\s+['“‘]([^'”’]+)['”’]\s+mean\?/i);
  if(match)return valid(match[1]);
  return valid(q.answer);
 }
 if(['Spelling','Listening','Match','Blend'].includes(q.type))return valid(q.answer);
 if(q.type==='Phonics'){
  const found=prompt.match(/highlighted part of\s+['“‘]([^'”’]+)['”’]/i);
  if(found)return valid(found[1]);
  if(/Which word contains the sound/.test(prompt))return valid(q.answer);
 }
 return '';
}
for(const g of catalog.levels)for(const p of g.parts){
 const key=g.grade+'-'+p.part;
 original.set(key,new Set(p.questions.map(questionWord).filter(Boolean).map(normalize)));
}
const checkStages=stages=>stages.split(/\s*,\s*/).map(stage=>{
 if(!/^(?:[1-9]|1[0-2])[AB]$/.test(stage))throw Error('Invalid stage '+stage);
 return {grade:Number(stage.slice(0,-1)),part:stage.endsWith('A')?1:2,stage};
});
const info=[],insert=[],seenInsert=new Set();
for(const [word,stages] of rows){
 const imgs=imagesFor(word);
 const places=checkStages(stages);
 const missing=places.filter(loc=>!original.get(loc.grade+'-'+loc.part)?.has(normalize(word)));
 const existing=places.filter(loc=>original.get(loc.grade+'-'+loc.part)?.has(normalize(word)));
 const status=imgs.length===0?'missing_verified_image':missing.length===0?'already_in_all_stages':'image_ready_for_missing_stages';
 info.push({word,stages,approvedImagesAvailable:imgs.length,alreadyIn:existing.map(x=>x.stage),missingFrom:missing.map(x=>x.stage),status});
 if(imgs.length>0)for(const loc of missing){
   const key=normalize(word)+'|'+loc.stage;
   if(!seenInsert.has(key)){insert.push({word,grade:loc.grade,part:loc.part,stage:loc.stage});seenInsert.add(key);}
 }
}
const statusCounts={};for(const row of info)statusCounts[row.status]=(statusCounts[row.status]||0)+1;
const imagesPresent=info.filter(x=>x.approvedImagesAvailable>0).length;
const imageMissing=info.filter(x=>x.approvedImagesAvailable===0).length;
const alreadyAll=info.filter(x=>x.approvedImagesAvailable>0&&x.missingFrom.length===0).length;
const newUnique=new Set(insert.map(x=>normalize(x.word))).size;
const report={sourceWords:627,availableInCurrentImageBank:imagesPresent,missingImagesFromCurrentBank:imageMissing,alreadyPresentInSourceStages:alreadyAll,insertedUniqueWords:newUnique,insertedStagePlacements:insert.length,counts:statusCounts,words:info,insertions:insert,scope:'learning pages only; no student progress or question IDs altered'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/master-627-reconciliation.json',JSON.stringify(report,null,2));
const csvCell=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
fs.writeFileSync('reviews/quality-audit/master-627-reconciliation.csv',[
 'word,original_stages,image_count,already_in_stages,missing_from_stages,status',
 ...info.map(x=>[x.word,x.stages,x.approvedImagesAvailable,x.alreadyIn.join('; '),x.missingFrom.join('; '),x.status].map(csvCell).join(','))
].join('\n')+'\n');
let html=fs.readFileSync('index.html','utf8');
const mark='/* MEJ_RECONCILED_LEGACY_627_20261107 */';
if(!html.includes(mark)){
 const hook='items.push(...restoredWords);';
 if(!html.includes(hook))throw Error('Missing master 120 restoration hook, refuse to alter live app');
 html=html.replace('function learnLevel(g,part=null){',mark+'\nconst MEJ_RESTORED_LEGACY_627='+JSON.stringify(insert)+';\nfunction learnLevel(g,part=null){');
 html=html.replace(hook,hook+"const legacyWords=MEJ_RESTORED_LEGACY_627.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'📖 Master vocabulary • '+x.stage}));items.push(...legacyWords);");
 const before='.slice(0,120);';
 if(!html.includes(before))throw Error('Learning preview word limit changed; manual review needed');
 html=html.replace(before,'.slice(0,300);');
 fs.writeFileSync('index.html',html);
}
console.log('LEGACY_RECONCILE '+JSON.stringify({sourceWords:627,availableInCurrentImageBank:imagesPresent,missingImagesFromCurrentBank:imageMissing,alreadyPresentInSourceStages:alreadyAll,insertedUniqueWords:newUnique,insertedStagePlacements:insert.length}));

// Execute legacy-vocabulary reconciliation and safe learning preview import.
