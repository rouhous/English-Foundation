'use strict';
const helper="// MEJ_QUESTION_FORMAT_20261112_V1\nfunction mejQuestionPresentation(q,raw){\n const s=String(raw||'').trim(),t=String(q?.type||'');\n let questionHtml=esc(s),left=/[A-Za-z]/.test(s)&&!/[\\u0600-\\u06FF]/.test(s);\n let passageHtml=q?.passage?'<div class=\"passage mej-reading-passage\" dir=\"ltr\">'+esc(q.passage)+'</div>':'';\n if(t==='Vocabulary'){\n  const toArabic=/^What does\\b/i.test(s)||/^اختر معنى الكلمة الإنجليزية\\s*[:：]/.test(s);\n  const toEnglish=/^(اختر|اكتب)\\s+الكلمة الإنجليزية/.test(s);\n  if(toArabic||toEnglish){\n   const quoted=s.match(/[“'«\"]([^”'»\"]+)[”'»\"]/);\n   let word=quoted?.[1]||((s.includes(':')||s.includes('：'))?s.split(/[:：]/).slice(1).join(':'):(toArabic?q?.word:''));\n   word=String(word||'').replace(/^[\\s“”«»\"']+|[\\s“”«»\"'.،؟]+$/g,'').trim();\n   if(word){\n    const instruction=toArabic?'What does this word mean in Arabic?':'ما مرادف هذه الكلمة باللغة الإنجليزية؟';\n    const dir=toArabic?'ltr':'rtl';\n    questionHtml='<span class=\"mej-vocab-instruction\" dir=\"'+dir+'\">'+esc(instruction)+'</span><strong class=\"mej-focus-word\" dir=\"'+dir+'\">“'+esc(word)+'”</strong>';\n    left=false;\n   }\n  }\n }\n if(t==='Reading'){\n  if(!q?.passage){\n   const m=s.match(/^([\\s\\S]+[.!])\\s+((?:What|Where|When|Why|Who|Which|How|Is|Are|Was|Were|Do|Does|Did|Can|Could|Should|Will|Would)\\b[\\s\\S]*\\?)$/i);\n   if(m&&m[1].trim().length>=12){passageHtml='<div class=\"passage mej-reading-passage\" dir=\"ltr\">'+esc(m[1].trim())+'</div>';questionHtml=esc(m[2].trim());}\n  }\n  questionHtml='<div class=\"mej-reading-question\" dir=\"ltr\">'+questionHtml+'</div>';left=false;\n }\n return {questionHtml,passageHtml,left};\n}";
const css="/* MEJ_QUESTION_FORMAT_20261112_V1 */\n.mej-vocab-instruction{display:block;text-align:center;font-weight:800;font-size:clamp(17px,3.8vw,22px);line-height:1.6;margin:8px auto 14px}\n.mej-focus-word{display:block;text-align:center;font-weight:900;font-size:clamp(26px,6vw,39px);line-height:1.5;overflow-wrap:anywhere;background:#e6f4ff;border:2px solid #7ebedb;border-radius:13px;padding:10px 18px;margin:0 auto 10px;color:#103c62;unicode-bidi:isolate}\n.mej-reading-passage{display:block!important;text-align:left!important;direction:ltr;white-space:pre-wrap;line-height:1.9;font-size:clamp(16px,3.5vw,19px);padding:17px 18px!important;margin:14px 0 18px!important;background:#f1f8fd;border:2px solid #a9cfe7;border-radius:14px;color:#173f59}\n.mej-reading-question{display:block!important;font-size:clamp(19px,4.1vw,24px);font-weight:850;line-height:1.65;text-align:left!important;direction:ltr;color:#123d63;padding:8px 0}\n.quiz .question:has(.mej-focus-word){text-align:center!important;direction:rtl!important}\n.quiz .question:has(.mej-reading-question){direction:ltr!important;text-align:left!important}\n";
const fs=require('fs'),crypto=require('crypto'),vm=require('vm');
const path='index.html';let s=fs.readFileSync(path,'utf8');
if(s.includes('MEJ_QUESTION_FORMAT_20261112_V1')){console.log('Already installed');process.exit(0)}
const old=s,here='function displayQuestion(){';
if(s.split(here).length!==2)throw Error('displayQuestion location mismatch');
s=s.replace(here,helper+'\n'+here);
const pat=/let promptText=esc\(promptRaw\);let left=[^\n]*?\.test\(promptRaw\);/;
if(!pat.test(s))throw Error('Prompt rendering location mismatch');
s=s.replace(pat,'let presentation=mejQuestionPresentation(q,promptRaw);let promptText=presentation.questionHtml;let left=presentation.left;');
const d=String.fromCharCode(36),tick=String.fromCharCode(96);
const original=d+'{q.passage?'+tick+'<div class="passage">'+d+'{esc(q.passage)}</div>'+tick+":''}";
if(!s.includes(original))throw Error('Passage rendering location mismatch');
s=s.replace(original,d+'{presentation.passageHtml}');
if(!s.includes('</head>'))throw Error('Head missing');
s=s.replace('</head>','<style id="mej-question-presentation-style">'+css+'</style></head>');
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const bank=v=>{const i=v.indexOf('const BANK='),j=v.indexOf('const byGrade=');if(i<0||j<i)throw Error('BANK delimiters missing');return hash(v.slice(i,j));};
if(bank(old)!==bank(s))throw Error('Question bank modified unexpectedly');
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ctx={esc};vm.createContext(ctx);vm.runInContext(helper,ctx);
const cases=[[{type:'Vocabulary'},"What does 'family' mean?",'family'],[{type:'Vocabulary'},'اختر الكلمة الإنجليزية: عائلة','عائلة'],[{type:'Vocabulary',word:'hobby'},'اختر الكلمة الإنجليزية لمعنى «هواية».','هواية'],[{type:'Vocabulary'},'اختر معنى الكلمة الإنجليزية: airport','airport']];
for(const [q,input,word] of cases){const got=ctx.mejQuestionPresentation(q,input);if(!got.questionHtml.includes('mej-focus-word')||!got.questionHtml.includes(word))throw Error('Vocabulary test failed '+input)}
const reading=ctx.mejQuestionPresentation({type:'Reading'},"Ali has a blue bag. He has two books. What colour is Ali's bag?");
if(!reading.passageHtml.includes('Ali has a blue bag.')||!reading.questionHtml.includes("What colour is Ali's bag?"))throw Error('Reading test failed');
let checked=0;for(const [i,m] of [...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){if(!m[2].trim()||/type\s*=\s*["']?(?:text\/plain|application\/json)/i.test(m[1]))continue;new vm.Script(m[2],{filename:'inline-'+i});checked++;}
if(!checked)throw Error('No script checked');
fs.writeFileSync(path,s);
const report={scope:'Vocabulary and Reading presentation in levels and diagnostic',bankUnchanged:bank(old)===bank(s),syntaxBlocks:checked,translationSamples:cases.length,readingSamples:1,marker:'MEJ_QUESTION_FORMAT_20261112_V1'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/question-presentation-formatting-20261112.json',JSON.stringify(report,null,2));console.log(report);
