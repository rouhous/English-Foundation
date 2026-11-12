'use strict';
const fs=require('fs'),crypto=require('crypto'),vm=require('vm');
let text=fs.readFileSync('index.html','utf8');
if(text.includes('MEJ_TARGET_DISPLAY_NORMALIZATION_V2')){console.log('Already applied');process.exit(0)}
const before=text;
const newBlock=" if(t==='Vocabulary'||t==='Spelling'){\n  const qv=s.match(/^[\\s\\S]*?[“”«»\"']([^“”«»\"']+)[“”«»\"']/);\n  let target='',direction='',instruction='';\n  if(t==='Vocabulary'){\n   if(/^What does\\b/i.test(s)||/^اختر معنى الكلمة الإنجليزية\\s*[:：]/.test(s)){\n    direction='en-ar';\n    target=qv?.[1]||s.split(/[:：]/).slice(1).join(':')||q?.word||'';\n    instruction='What does this word mean in Arabic?';\n   }else if(/^(?:اختر|اكتب)\\s+الكلمة الإنجليزية/.test(s)){\n    direction='ar-en';target=qv?.[1]||s.split(/[:：]/).slice(1).join(':');\n    instruction='ما مرادف هذه الكلمة باللغة الإنجليزية؟';\n   }\n  }else if(t==='Spelling'&&!/^Build the word from these sounds/i.test(s)){\n   const isSpell=/^(?:Choose the correct spelling for|(?:اختر\\s+)?(?:ال)?إملاء\\s+صحيح\\s+لكلمة|(?:اختر\\s+)?الإملاء\\s+الصحيح\\s+لكلمة)/i.test(s);\n   const isWrite=/^(?:Write the English word for|اكتب الكلمة الإنجليزية بمعنى)/i.test(s);\n   if(isSpell||isWrite){\n    direction='spelling';target=qv?.[1]||s.split(/[:：]/).slice(1).join(':');\n    if(!target&&isSpell){const m=s.match(/(?:كلمة|for)\\s+(.+)$/i);target=m?.[1]||'';}\n    instruction=isSpell?'Choose the correct spelling of this word in English.':'Write the English word for:';\n   }\n  }\n  target=String(target||'').replace(/[\\u200b-\\u200f\\u2060\\ufeff\\ufe0e\\ufe0f]/g,'').replace(/^[\\s“”«»\"']+|[\\s“”«»\"'.,،؟]+$/g,'').trim();\n  if(direction&&target){\n   const lang=/[\\u0600-\\u06ff]/.test(target)?'ar':'en',dir=lang==='ar'?'rtl':'ltr';\n   const caption=direction==='ar-en'?'ما مرادف هذه الكلمة باللغة الإنجليزية؟':instruction;\n   questionHtml='<span class=\"mej-vocab-instruction\" dir=\"'+(/[\\u0600-\\u06ff]/.test(caption)?'rtl':'ltr')+'\">'+esc(caption)+'</span><strong class=\"mej-focus-word\" dir=\"'+dir+'\" lang=\"'+lang+'\">“'+esc(target)+'”</strong>';\n   left=false;\n  }\n }";
const helperStart=text.indexOf('// MEJ_QUESTION_FORMAT_20261112_V1');
const helperEnd=text.indexOf('function displayQuestion(){',helperStart);
if(helperStart<0||helperEnd<helperStart)throw Error('Shared question presentation not found');
let helper=text.slice(helperStart,helperEnd);
const block=/ if\(t==='Vocabulary'\)\{[\s\S]*?(?= if\(t==='Reading'\)\{)/;
if(!block.test(helper))throw Error('Expected vocabulary and spelling branches missing');
helper=helper.replace(block,newBlock+'\n');
text=text.slice(0,helperStart)+helper+text.slice(helperEnd);
const styleMark='</style></head>';
if(!text.includes(styleMark))throw Error('Expected style insertion point missing');
text=text.replace(styleMark,'.mej-vocab-instruction{display:block!important;margin:0 auto 12px!important}.mej-focus-word{display:block!important;margin:0 auto 12px!important;text-align:center!important;white-space:normal;overflow-wrap:anywhere;font-size:clamp(27px,6vw,41px)!important}\n'+styleMark);
const hash=(s)=>crypto.createHash('sha256').update(s).digest('hex');
const bankHash=(s)=>{let a=s.indexOf('const BANK='),b=s.indexOf('const byGrade=');if(a<0||b<a)throw Error('Bank not found');return hash(s.slice(a,b))};
if(bankHash(text)!==bankHash(before))throw Error('Question bank changed unexpectedly');
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ctx={esc};vm.createContext(ctx);vm.runInContext(helper,ctx);
const db=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
let inspected=0,highlighted=0,unmatched=[];
for(const level of db.levels)for(const part of level.parts)for(const q of part.questions){
 if(!['Vocabulary','Spelling'].includes(q.type))continue;
 const output=ctx.mejQuestionPresentation(q,q.prompt);inspected++;
 const expected=q.type==='Vocabulary'||(q.type==='Spelling'&&!q.prompt.startsWith('Build the word from these sounds'));
 if(expected){
  if(!output.questionHtml.includes('mej-focus-word'))unmatched.push({id:q.id,prompt:q.prompt,reason:'missing target'});else highlighted++;
  if(output.questionHtml.includes('“'+esc(q.answer)+'”')&&!q.prompt.includes(q.answer)&&!String(q.answer).match(/[\u0600-\u06ff]/))unmatched.push({id:q.id,prompt:q.prompt,reason:'potential answer leak'});
 }else if(output.questionHtml.includes('mej-focus-word'))unmatched.push({id:q.id,prompt:q.prompt,reason:'phonics answer leak'});
}
if(unmatched.length)throw Error('Unmatched target prompts: '+JSON.stringify(unmatched.slice(0,10)));
const scripts=[...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];let valid=0;
for(const [i,m] of scripts.entries()){if(!m[2].trim()||/application\/json/.test(m[1]))continue;new vm.Script(m[2],{filename:'script-'+i});valid++;}
const marker='<!-- MEJ_TARGET_DISPLAY_NORMALIZATION_V2 -->';text=text.replace('</head>',marker+'\n</head>');
fs.writeFileSync('index.html',text,'utf8');
const report={marker:'MEJ_TARGET_DISPLAY_NORMALIZATION_V2',inspected,highlighted,deliberatelyExcludedPhonics:inspected-highlighted,unmatched:unmatched.length,bankUnchanged:true,inlineScriptsChecked:valid};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/vocab-spelling-target-normalization.json',JSON.stringify(report,null,2));
console.log(report);