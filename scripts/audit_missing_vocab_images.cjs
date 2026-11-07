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


const path=require('node:path');
const reportDir='reviews/image-audit';
fs.mkdirSync(reportDir,{recursive:true});
const csvCell=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
const lookup=word=>{
 const key=norm(word);
 const value=bank[key]||bank[key.replace(/-/g,' ')]||bank[key.replace(/ /g,'-')]||[];
 return (Array.isArray(value)?value:[value]).filter(x=>x&&typeof x.src==='string'&&x.rejected!==true&&x.status!=='rejected');
};
const examine=src=>{
 if(src.startsWith('data:'))return {ok:true,type:'embedded',path:''};
 if(/^https?:\/\//i.test(src))return {ok:null,type:'external-unverified',path:src};
 let local=src.split('?')[0].split('#')[0];
 try{local=decodeURIComponent(local)}catch(_){}
 local=local.replace(/^\/+/, '').replace(/^English-Foundation\//,'');
 if(local.includes('..'))return {ok:false,type:'unsafe-path',path:local};
 const present=fs.existsSync(local)&&fs.statSync(local).isFile()&&fs.statSync(local).size>0;
 return {ok:present,type:present?'local-present':'local-missing',path:local};
};
const report=[];
for(const e of all.values()){
 const pictures=lookup(e.word);
 const statuses=pictures.map(p=>({src:p.src,...examine(p.src)}));
 const valid=statuses.filter(s=>s.ok===true);
 const unverified=statuses.filter(s=>s.ok===null);
 const status=valid.length?'linked_local_or_embedded':unverified.length?'external_unverified':pictures.length?'broken_image_path':'no_approved_image';
 report.push({word:e.word,levels:e.levels.join('; '),status,imageCount:pictures.length,workingCount:valid.length,unverifiedCount:unverified.length,imageSources:statuses.map(s=>s.src).join(' | ')});
}
report.sort((a,b)=>a.word.localeCompare(b.word,'en'));
const missingReport=report.filter(r=>r.status!=='linked_local_or_embedded');
const reportCSV=rows=>['word,levels,status,image_count,verified_count,unverified_count,image_sources',...rows.map(r=>[r.word,r.levels,r.status,r.imageCount,r.workingCount,r.unverifiedCount,r.imageSources].map(csvCell).join(','))].join('\n')+'\n';
fs.writeFileSync(path.join(reportDir,'all-vocabulary-image-status.csv'),reportCSV(report));
fs.writeFileSync(path.join(reportDir,'missing-or-unverified-images.csv'),reportCSV(missingReport));
const byStatus={};for(const r of report)byStatus[r.status]=(byStatus[r.status]||0)+1;
const summary={generatedAt:new Date().toISOString(),scope:'All learning vocabulary across all catalog levels',uniqueWords:report.length,byStatus,notVerifiedCount:missingReport.length,verifiedImageCount:report.length-missingReport.length};
fs.writeFileSync(path.join(reportDir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(reportDir,'README.md'),
 '# Vocabulary image audit\n\nThis checks **each learning-page vocabulary word** against all 12 approved image banks and whether a local picture exists in the repository. External URLs are not independently verified. A local file check does **not** guarantee the picture is visually correct or that a browser loaded it.\n\n'+
 Object.entries(summary).map(([k,v])=>'- **'+k+'**: '+(typeof v==='object'?JSON.stringify(v):v)).join('\n')+
 '\n\n[Missing or unverified words](missing-or-unverified-images.csv) · [All words](all-vocabulary-image-status.csv)\n');
console.log('FULL_IMAGE_AUDIT_REPORT '+JSON.stringify(summary));

// Refresh full audit after image-bank imports on 2026-11-07.
