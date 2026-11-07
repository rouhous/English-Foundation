const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const store=new Map();const calls=[];
const localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
let online=false, failSave=false;
const token='a'.repeat(64),ref='b'.repeat(64);
store.set('MEJ_STUDENT_ACCESS_V1',token);
const webcrypto=require('node:crypto').webcrypto;
const document={readyState:'complete'};
const listeners={};
const window={addEventListener:(name,fn)=>{listeners[name]=fn},document};
const navigator={get onLine(){return online}};
const fetch=async(url,opts)=>{
 const data=JSON.parse(opts.body);calls.push(data.action);
 assert.equal(opts.headers.Authorization,'Bearer '+token);
 if(data.action==='student_get')return {ok:true,status:200,json:async()=>({ok:true,hasSnapshot:false})};
 if(data.action==='student_save'){
  if(failSave)return {ok:false,status:409,json:async()=>({ok:false,error:'REVISION_CONFLICT'})};
  return {ok:true,status:200,json:async()=>({ok:true,revision:1,scoreVerification:'CLIENT_REPORTED_UNVERIFIED'})};
 }
 throw Error('Unexpected action');
};
vm.runInNewContext(fs.readFileSync('assets/student-cloud-progress-v1.js','utf8'),{window,document,navigator,localStorage,crypto:webcrypto,fetch,AbortSignal,console,Promise});
const cloud=window.MEJStudentCloudProgress;
const sample={studentName:'Sample Student',className:'9_1',grade:9,stars:42,attempts:100,correctAnswers:70,masteredItems:42,weeklyAttempts:10,diagnosticDone:true,diagnosticLevel:9,highestLevel:9,levelStats:[]};
(async()=>{
 let r=await cloud.queue(ref,sample);assert.equal(r.state,'offline_pending');assert.equal(calls.length,0);assert.equal(cloud.status().pending,true);
 online=true;r=await cloud.flush();assert.equal(r.state,'synced');assert.deepEqual(calls,['student_get','student_save']);assert.equal(cloud.status().pending,false);
 failSave=true;r=await cloud.queue(ref,{...sample,stars:43});assert.equal(r.state,'needs_review');assert.equal(cloud.status().pending,true);
 r=await cloud.queue('not-a-profile',sample);assert.equal(r.state,'not_linked');
 console.log('MEJ_STUDENT_CLOUD_ADAPTER_TEST_PASSED');
})().catch(err=>{console.error(err);process.exit(1)});
