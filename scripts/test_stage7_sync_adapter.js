#!/usr/bin/env node
"use strict";
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const storage=new Map(),events={};
const makeStorage={getItem:k=>storage.has(k)?storage.get(k):null,
 setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const student='mejv2-'+'a'.repeat(32),other='mejv2-'+'b'.repeat(32),token='f'.repeat(64);
let online=false,fail=false,requestCount=0,ackStars=0;
const browser={localStorage:makeStorage,navigator:{get onLine(){return online}},
 crypto:{getRandomValues:a=>crypto.webcrypto.getRandomValues(a)},
 addEventListener:(name,handler)=>{events[name]=handler},
 removeEventListener:(name,handler)=>{if(events[name]===handler)delete events[name]}};
const context={window:browser,Set,Promise,Uint8Array,AbortController,Error,JSON,Object,Array,Number,String,URL};
vm.createContext(context);
for(const file of ['assets/verified-offline-outbox-v1.js','assets/verified-sync-bridge-v1.js']){
 vm.runInContext(fs.readFileSync(file,'utf8'),context,{timeout:1000});
}
const fetchImpl=async(endpoint,options)=>{
 requestCount++;
 assert.equal(endpoint,'https://example.test/verified');
 assert.equal(options.method,'POST');
 assert.equal(options.mode,'cors');
 assert.equal(options.credentials,'omit');
 assert.equal(options.cache,'no-store');
 assert.equal(options.headers['Content-Type'],'text/plain;charset=utf-8');
 const data=JSON.parse(options.body);
 assert.equal(data.studentId,student);
 assert.equal(data.deviceToken,token);
 if(fail)throw Error('CONNECTION_RESET');
 if(data.action==='answer'){
  ackStars++;
  return {ok:true,json:async()=>({ok:true,correct:true,stars:ackStars,scoreVerification:'SERVER_CHECKED_PILOT'})};
 }
 if(data.action==='progress'){
  return {ok:true,json:async()=>({ok:true,scope:'OWN_STUDENT_PROGRESS',studentId:student,
   stars:2,mastered:[{questionId:'L1-001',correctCount:2},{questionId:'L1-002',correctCount:2}],
   scoreVerification:'SERVER_CHECKED_PILOT'})};
 }
 throw Error('UNEXPECTED_ACTION');
};
assert.throws(()=>browser.MEJVerifiedSync.create({endpoint:'http://example.test',studentId:student,deviceToken:token}),/HTTPS_ENDPOINT_REQUIRED/);
const sync=browser.MEJVerifiedSync.create({endpoint:'https://example.test/verified',studentId:student,
 deviceToken:token,fetchImpl,outbox:browser.MEJVerifiedOutbox,isOnline:()=>online});
(async()=>{
 sync.queueAnswer('L1-001','apple');
 sync.queueAnswer('L1-002','banana');
 assert.equal(sync.getStatus().pending,2);
 assert.equal(requestCount,0,'Offline learner actions must not contact backend');
 let state=await sync.sync();assert.equal(state.state,'offline');assert.equal(state.pending,2);
 online=true;fail=true;
 state=await sync.sync();assert.equal(state.pending,2,'Network failure must not lose answers');
 fail=false;
 state=await sync.sync();assert.equal(state.state,'synced');
 assert.equal(state.pending,0);assert.equal(state.verifiedStars,2);
 const restored=await sync.restore();
 assert.equal(restored.stars,2);
 assert.equal(restored.correct['L1-001'],2);
 assert.equal(restored.correct['L1-002'],2);
 assert.equal(restored.pending,0);
 assert.equal(browser.MEJVerifiedOutbox.count(other),0);
 sync.startAutoSync();
 assert.equal(typeof events.online,'function');
 sync.queueAnswer('L1-003','book');
 ackStars=2;
 await events.online(); // browser event handler need not be awaited; use explicit sync for a deterministic check
 state=await sync.sync();assert.equal(state.pending,0);
 sync.dispose();
 assert.equal(events.online,undefined);
 assert.throws(()=>sync.queueAnswer('L1-004','tree'),/SESSION_DISPOSED/);
 // A mismatched or unverified response must leave the event queued.
 const malicious=browser.MEJVerifiedSync.create({endpoint:'https://example.test/verified',
  studentId:student,deviceToken:token,outbox:browser.MEJVerifiedOutbox,
  isOnline:()=>true,fetchImpl:async()=>({ok:true,json:async()=>({
   ok:true,stars:2600,correct:true,scoreVerification:'CLIENT_REPORTED_UNVERIFIED'})})});
 malicious.queueAnswer('L1-005','red');
 const blocked=await malicious.sync();
 assert.equal(blocked.pending,1,'Unverified ACK must not erase queued answer');
 await assert.rejects(malicious.restore(),/UNVERIFIED_SERVER_RESPONSE/);
 malicious.dispose();
 console.log('STAGE7_SYNC_ADAPTER_TESTS_PASSED: offline queue, verified ACK, reconnect, recovery, per-student isolation, server trust');
})().catch(e=>{console.error(e);process.exitCode=1});
