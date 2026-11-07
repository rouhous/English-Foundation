const fs=require('node:fs'),vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('reviews/learning.html','utf8');
const a=html.indexOf('function englishLabel('),b=html.indexOf('function draw(){',a);
assert(a>=0&&b>a,'learning extractor unavailable');
const ctxt={};vm.createContext(ctxt);vm.runInContext(html.slice(a,b)+'\nthis.extract=reviewWord;',ctxt);
const bankContext={window:{MEJ_APPROVED_IMAGES:{}},console:{warn:()=>{},log:()=>{}}};
vm.createContext(bankContext);
for(let i=1;i<=12;i++){
 const file='assets/approved-images-'+String(i).padStart(2,'0')+'.js';
 const source=fs.readFileSync(file,'utf8');
 vm.runInContext(source,bankContext,{filename:file,timeout:15000});
}
const bank=bankContext.window.MEJ_APPROVED_IMAGES;
const norm=v=>String(v||'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
function hasApproved(word){
 const key=norm(word);
 const a=bank[key]||bank[key.replace(/-/g,' ')]||bank[key.replace(/ /g,'-')]||[];
 const list=(Array.isArray(a)?a:[a]);
 return list.some(x=>x&&x.src&&x.rejected!==true&&x.status!=='rejected');
}
const c=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const all=new Map(),groups=[],allowed=new Set(['Vocabulary','Phonics','Blend','Listening','Spelling','Match']);
for(const l of c.levels)for(const p of l.parts){
 const words=[...new Set(p.questions.filter(q=>allowed.has(q.type)).map(q=>ctxt.extract(q)).filter(Boolean))];
 const missing=words.filter(w=>!hasApproved(w));
 groups.push({grade:l.grade,part:p.part,words:words.length,missing:missing.length,items:missing});
 for(const word of words){const key=norm(word);if(!all.has(key))all.set(key,{word,levels:[],hasImage:hasApproved(word)});all.get(key).levels.push(l.grade+':'+p.part)}
}
const noImage=[...all.values()].filter(x=>!x.hasImage).sort((a,b)=>a.word.localeCompare(b.word,'en'));
console.log('MISSING_IMAGES_AUDIT_SUMMARY '+JSON.stringify({totalUnique:all.size,missingUnique:noImage.length,shards:12,imageKeys:Object.keys(bank).length,groups:groups.map(({grade,part,words,missing})=>({grade,part,words,missing}))}));
console.log('MISSING_IMAGES_LIST_BEGIN');
for(const e of noImage)console.log(e.word+' | '+e.levels.join(','));
console.log('MISSING_IMAGES_LIST_END');

// Run complete image coverage audit.
