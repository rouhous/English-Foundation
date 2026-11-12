'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const file='index.html';let source=fs.readFileSync(file,'utf8');
const marker='MEJ_SPELLING_PROMPT_FIX_V3';
if(source.includes(marker)){console.log('Already applied');process.exit(0)}
const before=source;
const find="builder?'Listen carefully, then build the word with the mixed-up letters.':";
const replacement="builder?(q.type==='Spelling' && q.g>0?q.prompt:'Listen carefully, then build the word with the mixed-up letters.'):";
if(source.split(find).length!==2)throw Error('Expected one word builder question prompt override');
source=source.replace(find,replacement);
const originalPrompt="let presentation=mejQuestionPresentation(q,promptRaw);";
if(source.split(originalPrompt).length!==2)throw Error('Shared presentation hook not present');
const enhancedPrompt="let presentation=mejQuestionPresentation(q,(q.type==='Spelling'&&q.g>0)?q.prompt:promptRaw);";
source=source.replace(originalPrompt,enhancedPrompt);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function bankHash(s){const a=s.indexOf('const BANK='),b=s.indexOf('const byGrade=');if(a<0||b<a)throw Error('Cannot find bank boundaries');return hash(s.slice(a,b))}
if(bankHash(before)!==bankHash(source))throw Error('Question content changed unexpectedly');
const a=source.indexOf('// MEJ_QUESTION_FORMAT_20261112_V1'),b=source.indexOf('function displayQuestion(){',a);
if(a<0||b<a)throw Error('Question presentation helper missing');
const helper=source.slice(a,b);
const ctx={esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};vm.createContext(ctx);vm.runInContext(helper,ctx);
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
let checked=0,visible=0,phonics=0,problems=[];
for(const level of catalog.levels)for(const part of level.parts)for(const q of part.questions){
 if(q.type!=='Spelling')continue;
 const isPhonics=/^Build the word from these sounds/i.test(q.prompt);
 const requested=(q.type==='Spelling'&&level.grade>0)?q.prompt:(isPhonics?'Listen carefully, then build the word with the mixed-up letters.':q.prompt);
 const output=ctx.mejQuestionPresentation(q,requested);
 checked++;
 if(isPhonics){phonics++;continue}
 if(!output.questionHtml.includes('mej-focus-word'))problems.push({id:q.id,prompt:q.prompt});
 else visible++;
}
if(problems.length)throw Error('Spelling word not highlighted: '+JSON.stringify(problems.slice(0,12)));
if(checked!==632||visible!==572||phonics!==60)throw Error('Unexpected coverage '+JSON.stringify({checked,visible,phonics}));
let jsBlocks=0;for(const [i,m] of [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
 if(!m[2].trim()||/application\/json/.test(m[1]))continue;
 new vm.Script(m[2],{filename:'inline-'+i+'.js'});jsBlocks++;
}
if(jsBlocks<1)throw Error('No script blocks checked');
source=source.replace('</head>','<!-- '+marker+' -->\n</head>');
fs.writeFileSync(file,source,'utf8');
const report={marker,spellingQuestionsChecked:checked,highlighted:visible,phonicsExcluded:phonics,unmatched:problems.length,scriptBlocksChecked:jsBlocks,questionBankUnchanged:true,rootCause:'Word-builder quiz replaced the original Spelling prompt before invoking the vocabulary-style display helper'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/spelling-word-display-v3.json',JSON.stringify(report,null,2));console.log(report);
