'use strict';const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');const terms=['function countMaster','function active(','p.correct[','p.correct||','correct[q.id]','correct[item.id]','profile.correct','correctAnswers','function persist(','function gradeItems','function currentIsland(','function displayQuestion(){'];
const snippets={};
for(const term of terms){let start=0,at=[];while((start=s.indexOf(term,start))>=0&&at.length<7){at.push(s.slice(Math.max(0,start-550),Math.min(s.length,start+1400)));start+=term.length}snippets[term]=at}
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/student-mastered-vocabulary-hooks-20261112.json',JSON.stringify({terms:snippets},null,2));console.log(Object.fromEntries(Object.entries(snippets).map(([k,v])=>[k,v.length])));
