const fs=require('fs'),vm=require('vm');
const b={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};vm.createContext(b);
for(let i=1;i<=12;i++){const f='assets/approved-images-'+String(i).padStart(2,'0')+'.js';vm.runInContext(fs.readFileSync(f,'utf8'),b,{filename:f,timeout:20000})}
const words=['family','mother','father','friend','lip','hip','pen','career','chapter','novel'];
const data=words.map(word=>{const value=b.window.MEJ_APPROVED_IMAGES[word]||[];const arr=Array.isArray(value)?value:[value];return {word,entries:arr.map(x=>({src:x.src,preferred:x.preferred,status:x.status,exists:(()=>{if(!x.src||/^https?:|^data:/i.test(x.src))return 'remote';const p=x.src.replace(/^\/English-Foundation\//,'');try{return fs.statSync(p).size}catch(e){return 'MISSING'}})()}))}});
fs.mkdirSync('reviews/image-audit',{recursive:true});fs.writeFileSync('reviews/image-audit/review-page-spot-check.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data))
// Recheck the learning-page pictured words in deployed assets.
