'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const catalog=JSON.parse(fs.readFileSync('assets/diagnostic-question-catalog.json','utf8'));
 assert.equal(Object.keys(catalog).length,2600,'Should cover 13 stages × 200 questions');
 for(const id of ['L0-002','L6-194','L11-120'])assert.ok(catalog[id]?.type, 'Missing ID '+id);
 const html=fs.readFileSync('reviews/teacher-reports.html','utf8');
 const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(js,'Report script missing');new Function(js);
 // Regression for the null "mastered" crash: a class-level report may have
 // many students but only ONE respondent to a given question.
 const statusSource=js.slice(js.indexOf('function statusFor(row){'),js.indexOf('function gather(reports){'));
 assert.ok(statusSource.includes('function statusFor'), 'Missing diagnostic status renderer');
 const statusFor=new Function(statusSource+';return statusFor')();
 assert.equal(statusFor({students:1,unresolvedStudents:1,_single:null}),'يحتاج إلى تدريب');
 assert.equal(statusFor({students:1,unresolvedStudents:0,_single:null}),'تم إتقان السؤال لاحقاً');
 assert.equal(statusFor({students:4,unresolvedStudents:2,_single:null}),'يحتاج 2 طالب إلى تدريب');
 assert.equal(statusFor({students:4,unresolvedStudents:0}),'تم إتقان السؤال بعد الأخطاء');
 assert.equal(statusFor(null),'بيانات غير متاحة');
 for(const id of ['classFilter','studentFilter','skillFilter','stats','questionRows','studentRows'])assert.ok(html.includes('id="'+id+'"'));
 const dashboard=fs.readFileSync('reviews/teacher-dashboard.html','utf8');
 assert.ok(dashboard.includes('href="./teacher-reports.html"'));
 const url='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-learning-reports';
 const request=async(headers,method='POST')=>{
  const response=await fetch(url,{method,headers,body:method==='POST'?JSON.stringify({action:'teacher_diagnostics',scope:'teacher'}):undefined,signal:AbortSignal.timeout(18000)});
  return {status:response.status,body:await response.text()}
 };
 const absent=await request({'origin':'https://rouhous.github.io','content-type':'application/json'});
 assert.equal(absent.status,403,'Unauthenticated teacher request must be forbidden: '+absent.body);
 assert.ok(absent.body.includes('GOOGLE_LOGIN_REQUIRED'));
 const wrongOrigin=await request({'origin':'https://attacker.invalid','content-type':'application/json'});
 assert.equal(wrongOrigin.status,403,'Invalid origin must be rejected');
 const wrongMethod=await request({'origin':'https://rouhous.github.io'},'GET');
 assert.equal(wrongMethod.status,405,'GET must be rejected');
 console.log('PASS: 2600 classified questions, report UI, valid JS and privileged endpoint denies unauthenticated/foreign-origin requests');
})().catch(e=>{console.error(e);process.exit(1)});
