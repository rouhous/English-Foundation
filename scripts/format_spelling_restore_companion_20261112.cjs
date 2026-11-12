'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const path='index.html';let s=fs.readFileSync(path,'utf8');const before=s;
const marker='MEJ_SPELLING_AND_LEVELS_COMPANION_20261112_V1';
if(s.includes(marker)){console.log('Already installed');process.exit(0)}
const spell=" if(t==='Spelling'){\n  let term='',instruction='';\n  const englishChoice=s.match(/^Choose the correct spelling for\\s*[:：]\\s*(.+)$/i);\n  const arabicChoice=s.match(/^إملاء صحيح لكلمة\\s+(.+)$/);\n  const arabicWrite=s.match(/^اكتب الكلمة الإنجليزية بمعنى\\s*[:：]\\s*(.+)$/);\n  const englishWrite=s.match(/^Write the English word for\\s*[«“\"'](.+?)[»”\"']\\.?$/i);\n  if(englishChoice||arabicChoice||arabicWrite||englishWrite){\n   term=String(englishChoice?.[1]||arabicChoice?.[1]||arabicWrite?.[1]||englishWrite?.[1]||'');\n   term=term.replace(/[\\u200c-\\u200f\\u2060\\ufeff]/g,'').replace(/^[\\s\\u201c\\u201d\\u00ab\\u00bb\"']+|[\\s\\u201c\\u201d\\u00ab\\u00bb\"'.،؟]+$/g,'').trim();\n   instruction=(englishChoice||arabicChoice)?(englishChoice?'Choose the correct spelling of this word in English.':'ما الإملاء الصحيح للكلمة التالية باللغة الإنجليزية؟'):(englishWrite?'Write the English word for:':'اكتب الكلمة الإنجليزية التي تعني:');\n   if(term){const dir=/[\\u0600-\\u06ff]/.test(instruction)?'rtl':'ltr';questionHtml='<span class=\"mej-vocab-instruction\" dir=\"'+dir+'\">'+esc(instruction)+'</span><strong class=\"mej-focus-word\" dir=\"rtl\" lang=\"ar\">“'+esc(term)+'”</strong>';left=false;}\n  }\n }";
const key=" if(t==='Reading'){";
if(s.split(key).length!==2)throw Error('Reading branch not uniquely located');
s=s.replace(key,spell+'\n'+key);
const routeEnd="window.scrollTo({top:0,behavior:'instant'});}";
if(s.split(routeEnd).length!==2)throw Error('Route end not unique');
const routeReplacement="window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>{try{window.MEJCompanionLive?.refresh?.()}catch(_){}});}";
s=s.replace(routeEnd,routeReplacement);
const fingerprint=t=>{const i=t.indexOf('const BANK='),j=t.indexOf('const byGrade=');if(i<0||j<i)throw Error('No question bank boundaries');return crypto.createHash('sha256').update(t.slice(i,j)).digest('hex')};
if(fingerprint(before)!==fingerprint(s))throw Error('Question bank unexpectedly changed');
const first=s.indexOf('// MEJ_QUESTION_FORMAT_20261112_V1'),last=s.indexOf('function displayQuestion(){',first);
if(first<0||last<first)throw Error('Question renderer missing');
const helper=s.slice(first,last);
const ctx={esc:v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};vm.createContext(ctx);vm.runInContext(helper,ctx);
const examples=[["Choose the correct spelling for: منزل","منزل"],["إملاء صحيح لكلمة معلم ‍","معلم"],["اكتب الكلمة الإنجليزية بمعنى: منزل","منزل"],["Write the English word for «هواية».","هواية"]];
for(const [raw,term] of examples){const o=ctx.mejQuestionPresentation({type:'Spelling'},raw);if(!o.questionHtml.includes('mej-focus-word')||!o.questionHtml.includes('“'+term+'”')||o.passageHtml)throw Error('Spelling test failed '+raw);}
let scripts=0;for(const [i,b] of [...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){if(!b[2].trim()||/type\s*=\s*["']?(?:application\/json|text\/plain)/i.test(b[1]))continue;new vm.Script(b[2],{filename:'inline'+i});scripts++;}
if(scripts<1)throw Error('No inline JS');
s=s.replace('</head>','<!-- '+marker+' -->\n</head>');
fs.writeFileSync(path,s,'utf8');
const report={marker,questionsUnchanged:true,bankSha256:fingerprint(s),spellingExamplesPassed:examples.length,inlineScriptsChecked:scripts,companionRouteRefresh:true,diagnosticCompanionPolicy:'unchanged: companion disabled during diagnostic',note:'Live companion refresh is triggered after a route render; runtime behavior on actual devices still requires testing.'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/spelling-companion-20261112.json',JSON.stringify(report,null,2));console.log(report);
