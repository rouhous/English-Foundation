'use strict';
const fs=require('fs');
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const issues=[];let total=0;const gradeSummary={};
for(const level of catalog.levels){
 const gs=gradeSummary[level.grade]={count:0,issues:0,exactRepeats:0};
 for(const part of level.parts){
  const seen=new Map();
  for(const q of part.questions){
    total++;gs.count++;
    if(q.mode==='mcq'){
      const options=q.options||[];
      if(!options.includes(q.answer))issues.push({grade:level.grade,part:part.part,id:q.id,severity:'critical',type:'missing_correct_answer',prompt:q.prompt});
      if(new Set(options).size!==options.length)issues.push({grade:level.grade,part:part.part,id:q.id,severity:'critical',type:'duplicate_options',prompt:q.prompt});
      if(options.some(x=>!String(x).trim()))issues.push({grade:level.grade,part:part.part,id:q.id,severity:'critical',type:'blank_option',prompt:q.prompt});
      if(options.some(x=>/^(The when where\.|Because and the\.|However but because\.|And also therefore but\.|No there it will\.|Or because the things\.|This makes because\.)$/i.test(String(x).trim())))
        issues.push({grade:level.grade,part:part.part,id:q.id,severity:'high',type:'obvious_nonsense_distractor',prompt:q.prompt});
    }
    const key=JSON.stringify([q.type,q.prompt,q.answer]);
    if(seen.has(key)){gs.exactRepeats++;issues.push({grade:level.grade,part:part.part,id:q.id,severity:'medium',type:'exact_repeated_question',duplicateOf:seen.get(key),prompt:q.prompt});}
    else seen.set(key,q.id);
  }
 }
}
for(const issue of issues)gradeSummary[issue.grade].issues++;
const summary={totalQuestions:total,grades:Object.keys(gradeSummary).length,issues:issues.length,byType:{},byGrade:gradeSummary};
for(const i of issues)summary.byType[i.type]=(summary.byType[i.type]||0)+1;
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/question-quality-report.json',JSON.stringify({summary,issues},null,2));
const rows=[['grade','part','question_id','severity','issue','duplicate_of','prompt'],...issues.map(i=>[i.grade,i.part,i.id,i.severity,i.type,i.duplicateOf||'',i.prompt||''])];
const esc=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
fs.writeFileSync('reviews/quality-audit/question-quality-issues.csv',rows.map(row=>row.map(esc).join(',')).join('\n')+'\n');
console.log('QUESTION_QUALITY_AUDIT '+JSON.stringify(summary));

// Run full question QA on current main branch.
