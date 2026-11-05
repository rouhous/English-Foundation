#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const code=fs.readFileSync("assets/verified-offline-outbox-v1.js","utf8");
const data=new Map(),storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
const root={localStorage:storage,crypto:{getRandomValues:arr=>crypto.webcrypto.getRandomValues(arr)}};
vm.runInNewContext(code,{window:root,crypto:root.crypto,Uint8Array,Set,Error,JSON,Array,Promise},{timeout:1000});
const q=root.MEJVerifiedOutbox;
const a="mejv2-"+"a".repeat(32),b="mejv2-"+"b".repeat(32);
const eventId=q.makeEventId();
assert.match(eventId,/^[a-zA-Z0-9_-]{16,96}$/);
q.enqueue(a,{eventId,questionId:"L1-001",answer:"apple"});
assert.equal(q.count(a),1);
assert.equal(q.count(b),0);
q.enqueue(a,{eventId,questionId:"L1-001",answer:"apple"});
assert.equal(q.count(a),1,"Identical replay not duplicated");
assert.throws(()=>q.enqueue(a,{eventId,questionId:"L1-001",answer:"banana"}),/EVENT_ID_CONFLICT/);
q.enqueue(a,{eventId:q.makeEventId(),questionId:"L1-002",answer:"banana"});
let calls=0;
(async()=>{
 let attempt=await q.flush(a,async x=>{
  calls++;
  if(calls>1)throw Error("OFFLINE");
  return {ok:true,scoreVerification:"SERVER_CHECKED_PILOT"};
 });
 assert.equal(attempt.sent,1);assert.equal(attempt.remaining,1);
 let rejected=await q.flush(a,async()=>({ok:true,scoreVerification:"CLIENT_REPORTED_UNVERIFIED"}));
 assert.equal(rejected.sent,0);assert.equal(q.count(a),1,"Untrusted ack must not remove an answer");
 let done=await q.flush(a,async()=>({ok:true,scoreVerification:"SERVER_CHECKED_PILOT"}));
 assert.equal(done.sent,1);assert.equal(done.remaining,0);
 assert.equal(q.count(b),0);
 assert.throws(()=>q.count("visitor"),/INVALID_STUDENT/);
 console.log("STAGE4_OFFLINE_OUTBOX_TESTS_PASSED: offline retries, verified acknowledgements, idempotency, per-student isolation");
})().catch(err=>{console.error(err);process.exitCode=1});
