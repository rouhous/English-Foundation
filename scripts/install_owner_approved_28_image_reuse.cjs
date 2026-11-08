'use strict';
/* Install only human-approved reuse decisions; rejected stay unlinked. */
const fs=require('fs'),vm=require('vm');
function csv(text){const lines=text.replace(/^\uFEFF/,'').trimEnd().split(/\r?\n/);function parse(line){let out=[],buf='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){buf+='"';i++}else quoted=!quoted;}else if(c===','&&!quoted){out.push(buf);buf='';}else buf+=c;}out.push(buf);return out;}const fields=parse(lines.shift());return lines.map(l=>Object.fromEntries(parse(l).map((v,i)=>[fields[i],v])));}
const decisions=csv(fs.readFileSync('reviews/image-audit/MEJ_33_reuse_review_decisions_APPROVED_2026-11-08.csv','utf8'));
const acceptable=new Set(['accepted','rejected']);
if(decisions.length!==33||new Set(decisions.map(x=>x.Word.toLowerCase())).size!==33||decisions.some(x=>!acceptable.has(x.Decision)))throw Error('Owner decisions require exactly 33 unique valid entries');
const ctx={window:{MEJ_APPROVED_IMAGES:{}},console:{log(){},warn(){}}};vm.createContext(ctx);
for(let i=1;i<=13;i++){const f='assets/approved-images-'+String(i).padStart(2,'0')+'.js';if(!fs.existsSync(f))throw Error('Missing image shard '+f);vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f,timeout:30000});}
const bank=ctx.window.MEJ_APPROVED_IMAGES;
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
const selected=[],missing=[],rejected=[],insert=[];
for(const row of decisions){
 const key=norm(row.Word),source=norm(row.Candidate.split('|')[0]);
 if(row.Decision==='rejected'){rejected.push({word:row.Word,candidate:source,reason:'rejected by user'});continue;}
 const possible=bank[source];
 const images=(Array.isArray(possible)?possible:[possible]).filter(x=>x&&typeof x.src==='string'&&x.rejected!==true&&x.status!=='rejected').filter(x=>{
  const src=x.src.split('?')[0];if(src.startsWith('data:image/'))return true;
  if(!src.startsWith('/English-Foundation/'))return false;
  const file=src.slice('/English-Foundation/'.length);return !file.includes('..')&&fs.existsSync(file)&&fs.statSync(file).size>500;
 });
 if(!images.length){missing.push({word:row.Word,source});continue;}
 const chosen=images.find(x=>x.preferred===true)||images[0];
 selected.push({word:row.Word,source,src:chosen.src});
 for(const st of row.Stages.split(/\s*,\s*/)){
  if(!/^(?:[1-9]|1[0-2])[AB]$/.test(st))throw Error('Invalid stage '+st);
  insert.push({word:row.Word,grade:Number(st.slice(0,-1)),part:st.endsWith('A')?1:2,stage:st});
 }
}
if(missing.length)throw Error('Refuse partial approval: existing source images missing '+JSON.stringify(missing));
if(selected.length!==28||rejected.length!==5)throw Error('Unexpected 28 approved / 5 rejected integrity error');
const shardPath='assets/approved-images-14.js';
const entries=selected.map(({word,source,src})=>[norm(word),{src,sourceKey:source,status:'approved',preferred:true,origin:'Owner-reviewed reuse 2026-11-08',w:384,h:384}]);
const js='(function(){window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};const entries='+JSON.stringify(entries)+';for(const [key,item] of entries){const old=window.MEJ_APPROVED_IMAGES[key]||[];const vals=Array.isArray(old)?old:[old];if(vals.some(x=>x&&x.src===item.src))continue;window.MEJ_APPROVED_IMAGES[key]=[item,...vals.filter(Boolean)];}})();\n';
fs.writeFileSync(shardPath,js);
let app=fs.readFileSync('index.html','utf8');
const snippet='<script src="assets/approved-images-14.js?v=20261108-owner-28" defer></script>';
if(!app.includes('assets/approved-images-14.js')){
 if(!app.includes('</head>'))throw Error('Missing </head> in app');
 app=app.replace('</head>',snippet+'\n</head>');
}
const marker='/* MEJ_OWNER_APPROVED_REUSE_28_20261108 */';
if(!app.includes(marker)){
 const target='function learnLevel(g,part=null){';
 if(!app.includes(target))throw Error('Learning level route not found');
 app=app.replace(target,marker+'\nconst MEJ_REUSE_28_ROUTES='+JSON.stringify(insert)+';\n'+target);
 const place='items.push(...image32Words);';
 if(!app.includes(place))throw Error('Expected original 32-picture learning insertion hook not found');
 app=app.replace(place,place+"const reuse28Words=MEJ_REUSE_28_ROUTES.filter(x=>x.grade===Number(g)&&(!part?(mejPartUnlocked(g,2)||x.part===1):x.part===Number(part))).map(x=>({word:x.word,type:'Vocabulary',prompt:'Owner-approved picture • '+x.stage}));items.push(...reuse28Words);");
}
fs.writeFileSync('index.html',app);
const learnPath='reviews/learning.html';
if(fs.existsSync(learnPath)){let learn=fs.readFileSync(learnPath,'utf8');learn=learn.replace('for(let i=1;i<=13;i++)','for(let i=1;i<=14;i++)');fs.writeFileSync(learnPath,learn);}
const swPath='sw.js';let sw=fs.readFileSync(swPath,'utf8');
sw=sw.replace(/const CACHE='[^']+'/, "const CACHE='mej-public-20261108-owner-reuse-28'");
sw=sw.replace(/Array\.from\(\{length:13\}/,'Array.from({length:14}').replace(/imageShardsTotal:13/g,'imageShardsTotal:14');
fs.writeFileSync(swPath,sw);
const report={state:'owner_approved_reuse_installed',approved:selected.length,rejected:rejected.length,newImageFiles:0,newImageAliases:selected.length,learningPlacements:insert.length,sourceImages:selected,rejectedWords:rejected,scope:'Vocabulary learning only; no quiz grades, student progress, or user accounts modified'};
fs.writeFileSync('reviews/image-audit/MEJ_33_reuse_install_result.json',JSON.stringify(report,null,2)+'\n');
console.log('REUSE_INSTALL '+JSON.stringify({approved:selected.length,rejected:rejected.length,placements:insert.length}));
