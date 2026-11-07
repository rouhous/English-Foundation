'use strict';
const fs=require('fs'),vm=require('vm');
const installed=JSON.parse(fs.readFileSync('reviews/quality-audit/master-restoration-120.json','utf8'));
const names=[...new Set(installed.assignments.map(x=>x.word.toLowerCase()))];
const context={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};
vm.createContext(context);
for(let i=1;i<=12;i++){
 const filename='assets/approved-images-'+String(i).padStart(2,'0')+'.js';
 vm.runInContext(fs.readFileSync(filename,'utf8'),context,{filename,timeout:30000});
}
const bank=context.window.MEJ_APPROVED_IMAGES;
const rows=names.map(word=>{
 const entry=bank[word]||bank[word.replace(/-/g,' ')]||bank[word.replace(/ /g,'-')];
 const list=(Array.isArray(entry)?entry:[entry]).filter(x=>x&&typeof x.src==='string'&&x.rejected!==true&&x.status!=='rejected');
 const valid=list.filter(image=>{
  const url=image.src;
  if(url.startsWith('data:image/'))return true;
  if(url.startsWith('/English-Foundation/')){const file=url.slice('/English-Foundation/'.length).split('?')[0];return fs.existsSync(file)&&fs.statSync(file).size>0;}
  return false;
 });
 return {word,imagesInBank:list.length,validLocalImages:valid.length,status:valid.length?'image_found':'requires_image_review'};
});
const needingReview=rows.filter(x=>x.validLocalImages===0);
const result={uniqueWords:120,stagePlacements:installed.assignments.length,imagesAvailable:120-needingReview.length,imagesNotVerified:needingReview.length,requiresReview:needingReview.map(x=>x.word)};
fs.writeFileSync('reviews/quality-audit/master-ready-120-image-check.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));

// Trigger first post-restoration image coverage report.
