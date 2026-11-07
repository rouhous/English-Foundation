'use strict';
const fs=require('fs');
const file='index.html';let src=fs.readFileSync(file,'utf8');
const signature="function learnLevel(g,part=null){";
if(!src.includes(signature))throw Error('Learning function missing');
const helper=`// Preview words must also be extracted from older Grade 1-5 questions with empty word fields.
function mejLearningPreviewWord(q){
 const valid=v=>{const s=String(v||'').trim();return /^[A-Za-z][A-Za-z'’ -]{0,54}$/.test(s)?s:''};
 const direct=valid(q.word)||valid(q.pictureWord);
 if(direct)return direct;
 const prompt=String(q.prompt||'');
 if(q.type==='Vocabulary'){
  const match=prompt.match(/What does\\s+['“‘]([^'”’]+)['”’]\\s+mean\\?/i);
  if(match)return valid(match[1]);
  const named=prompt.match(/اختر معنى الكلمة الإنجليزية:\\s*([A-Za-z][A-Za-z'’ -]{0,54})/);
  if(named)return valid(named[1]);
  return valid(q.answer);
 }
 if(['Spelling','Listening','Match','Blend'].includes(q.type))return valid(q.answer);
 if(q.type==='Phonics'){
  const highlighted=prompt.match(/highlighted part of\\s+['“‘]([^'”’]+)['”’]/i);
  if(highlighted)return valid(highlighted[1]);
  if(/Which word contains the sound|يظهر في أي كلمة/.test(prompt))return valid(q.answer);
 }
 return '';
}
`;
const old="let items=(part?mejStageQuestions(g,part):(mejPartUnlocked(g,2)?byGrade[g]:mejStageQuestions(g,1))).filter(q=>q.word&&q.type==='Vocabulary');let seen=new Set;items=items.filter(q=>{if(seen.has(q.word))return false;seen.add(q.word);return true}).slice(0,40);";
const next="let items=(part?mejStageQuestions(g,part):(mejPartUnlocked(g,2)?byGrade[g]:mejStageQuestions(g,1))).filter(q=>['Vocabulary','Spelling','Listening','Match','Blend','Phonics'].includes(q.type)).map(q=>({...q,word:mejLearningPreviewWord(q)})).filter(q=>q.word);let seen=new Set;items=items.filter(q=>{const key=q.word.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,40);";
if(src.includes('function mejLearningPreviewWord('))throw Error('Already installed');
if(src.split(old).length!==2)throw Error('Expected exact source fragment once');
src=src.replace(signature,helper+signature).replace(old,next);
fs.writeFileSync(file,src);
if(!src.includes('mejLearningPreviewWord(q)'))throw Error('Patch did not apply');
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/early-learning-fix.json',JSON.stringify({status:'patched',scope:'Grades 1-5 and any level with missing word fields',fix:'Derive learning preview vocabulary from existing official question data',studentScoresUnchanged:true},null,2));
console.log('Patched lesson preview word extraction in index.html');

// Execute learning card fix on current published branch.
