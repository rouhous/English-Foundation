#!/usr/bin/env node
"use strict";
/* Synthetic-data-only tests of the disabled Apps Script verification pilot. */
const fs=require("fs"),vm=require("vm"),crypto=require("crypto"),assert=require("assert");
const code=fs.readFileSync("Code.gs","utf8");
const publicHtml=fs.readFileSync("index.html","utf8");
const extracted=publicHtml.match(/const BANK=(\[.*?\]);\s*const PHOTO=/s);
assert(extracted,"Server key-import parser must match current published bank");
const publicBank=JSON.parse(extracted[1]);
assert.equal(publicBank.length,2600,"Server key-import expects exactly 2600 questions");
assert.equal(new Set(publicBank.map(q=>q.id)).size,2600,"Every question needs a unique key");
for(const q of publicBank){
 assert(/^L(?:[0-9]|1[0-2])-[0-9]{3}$/.test(q.id),"Invalid question key "+q.id);
 assert(String(q.answer??"").trim().length>0&&String(q.answer).trim().length<=300,
   "Question has no server-comparable answer: "+q.id);
}

const db=new Map();
let uidCounter=0,activeLocks=0;
const props={MEJ_V2_ENABLED:"true",TEACHER_REGISTRATION_CODE:"TEST-TEACHER-CODE"};
class Sheet{
 constructor(name){this.name=name;this.rows=[]}
 getLastRow(){return this.rows.length}
 getLastColumn(){return this.rows[0]?.length||0}
 appendRow(values){this.rows.push([...values]);return this}
 setFrozenRows(){}
 getRange(row,col,nr=1,nc=1){
  const sheet=this;
  return {
   getValues(){return Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>sheet.rows[row-1+i]?.[col-1+j]??""))},
   setValues(values){for(let i=0;i<values.length;i++){while(sheet.rows.length<row+i)sheet.rows.push([]);for(let j=0;j<values[i].length;j++)sheet.rows[row+i-1][col+j-1]=values[i][j]}return this},
   setValue(value){this.setValues([[value]]);return this},
   getValue(){return this.getValues()[0][0]},
   getDisplayValue(){return String(this.getValue())}
  }
 }
}
const ss={getSheetByName(name){return db.get(name)||null},insertSheet(name){const sh=new Sheet(name);db.set(name,sh);return sh}};
const context={
 console,Date,JSON,Object,Array,String,Number,Boolean,Math,RegExp,Error,Map,Set,
 PropertiesService:{getScriptProperties(){return {getProperty(key){return props[key]||""}}}},
 LockService:{getScriptLock(){return {waitLock(){activeLocks++},releaseLock(){activeLocks--}}}},
 SpreadsheetApp:{getActiveSpreadsheet(){return ss}},
 Utilities:{
  DigestAlgorithm:{SHA_256:"SHA_256"},Charset:{UTF_8:"UTF_8"},
  computeDigest(kind,value){return [...crypto.createHash("sha256").update(value,"utf8").digest()].map(x=>x>127?x-256:x)},
  getUuid(){return (++uidCounter).toString(16).padStart(32,"0").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/,"$1-$2-$3-$4-$5")}
 },
 ContentService:{
  MimeType:{JSON:"json",JAVASCRIPT:"javascript"},
  createTextOutput(data){return {data,setMimeType(){return this},getContent(){return data}}}
 }
};
vm.createContext(context);vm.runInContext(code,context,{timeout:1500});
function bad(fn,errorCode){assert.throws(fn,e=>String(e.message).includes(errorCode),"Expected error: "+errorCode)}
function post(d){return JSON.parse(context.doPost({postData:{contents:JSON.stringify(d)}}).getContent())}
const p=(action,fields={})=>({schema:"mej-verified-v2",action,...fields});
const key=context.mejV2Table_("MEJ_V2_QuestionKeys",["Question ID","Stage","Correct Answer"]);
key.appendRow(["L1-001",1,"apple"]);key.appendRow(["L1-002",1,"banana"]);key.appendRow(["L1-101",1,"window"]);key.appendRow(["L2-001",2,"tree"]);
const invite=context.mejV2IssueInvite_(1,"1A","TEST_SCHOOL_A_1A");assert.equal(invite.length,64);
bad(()=>context.mejV2Handle_(p("enroll",{teacherCode:"bad",studentName:"TEST A",grade:1,className:"1A",inviteCode:invite})),"INVALID_TEACHER_CODE");
const enrol=context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"TEST A",grade:1,className:"1A",inviteCode:invite,stars:2600}));
assert.equal(enrol.ok,true);assert.equal(enrol.stars,0);assert.equal(enrol.studentId.startsWith("mejv2-"),true);assert.equal(enrol.deviceToken.length,64);
assert.equal(enrol.recoveryCode.length,64);assert.equal(enrol.revision,1);
bad(()=>context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"TEST A",grade:1,className:"1A",inviteCode:invite})),"INVALID_OR_USED_INVITE");
const auth={studentId:enrol.studentId,deviceToken:enrol.deviceToken};
const attempt=(eventId,questionId,answer,extra={})=>p("answer",{...auth,eventId,questionId,answer,...extra});
const E=n=>"STAGING_EVENT_"+String(n).padStart(4,"0");
assert.equal(context.mejV2Handle_(attempt(E(1),"L1-001","pear")).correct,false);
assert.equal(context.mejV2Handle_(attempt(E(2),"L1-001","apple")).stars,0);
assert.equal(context.mejV2Handle_(attempt(E(2),"L1-001","apple")).duplicate,true);
bad(()=>context.mejV2Handle_(attempt(E(2),"L1-001","pear")),"EVENT_ID_CONFLICT");
assert.equal(context.mejV2Handle_(attempt(E(3),"L1-001","apple",{stars:2600})).stars,1,"Server ignores forged client stars");
assert.equal(context.mejV2Handle_(attempt(E(4),"L1-001","apple")).stars,1,"One star per mastered question");
bad(()=>context.mejV2Handle_(p("summary",{...auth,deviceToken:"0".repeat(64)})),"INVALID_STUDENT_CREDENTIALS");
bad(()=>context.mejV2Handle_(attempt(E(5),"L2-001","tree")),"QUESTION_ABOVE_SCHOOL_GRADE");
bad(()=>context.mejV2Handle_(attempt(E(6),"L1-101","window")),"SUBLEVEL_LOCKED");
assert.equal(context.mejV2Handle_(p("summary",auth)).stars,1);
const invite2=context.mejV2IssueInvite_(2,"2B","TEST_SCHOOL_A_2B");
const other=context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"TEST B",grade:2,className:"2B",inviteCode:invite2}));
assert.equal(context.mejV2Handle_(p("summary",{studentId:other.studentId,deviceToken:other.deviceToken})).stars,0);
assert.equal(context.mejV2Handle_(p("summary",auth)).stars,1);
const response=post(p("summary",auth));assert.equal(response.ok,true);assert.equal(response.stars,1);
// Stage 3: leaderboard is OFF by default even while verified pilot is enabled.
bad(()=>context.mejV2Handle_(p("leaderboard",auth)),"CLASS_RANKING_DISABLED");
// Two different schools may both have a class named 1A.
const inviteA2=context.mejV2IssueInvite_(1,"1A","TEST_SCHOOL_A_1A");
const peer=context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"TEST PEER",grade:1,className:"1A",inviteCode:inviteA2}));
const inviteA3=context.mejV2IssueInvite_(1,"1A","TEST_SCHOOL_A_1A");
const peer2=context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"TEST NO STARS",grade:1,className:"1A",inviteCode:inviteA3}));
const inviteB=context.mejV2IssueInvite_(1,"1A","TEST_SCHOOL_B_1A");
const foreign=context.mejV2Handle_(p("enroll",{teacherCode:"TEST-TEACHER-CODE",studentName:"OTHER SCHOOL",grade:1,className:"1A",inviteCode:inviteB}));
props.MEJ_V2_RANKING_ENABLED="true";
const ranked=context.mejV2Handle_(p("leaderboard",auth));
assert.equal(ranked.ok,true);assert.equal(ranked.count,3);
assert.equal(ranked.scope,"OWN_VERIFIED_CLASS");
assert.deepEqual(Array.from(ranked.entries,r=>r.stars),[1,0,0]);
assert.deepEqual(Array.from(ranked.entries,r=>r.rank),[1,2,2]);
assert.equal(ranked.entries.filter(r=>r.isMe).length,1);
assert(!ranked.entries.some(r=>r.name==="OTHER SCHOOL"||r.name==="TEST B"));
assert(!JSON.stringify(ranked).includes(foreign.studentId));
for(const row of ranked.entries){
 assert.deepEqual(Object.keys(row).sort(),["isMe","name","rank","stars"]);
}
const peerRank=context.mejV2Handle_(p("leaderboard",{studentId:peer.studentId,deviceToken:peer.deviceToken}));
assert.equal(peerRank.count,3);
const otherSchoolRank=context.mejV2Handle_(p("leaderboard",{studentId:foreign.studentId,deviceToken:foreign.deviceToken}));
assert.equal(otherSchoolRank.count,1);
assert.equal(otherSchoolRank.entries[0].name,"OTHER SCHOOL");
bad(()=>context.mejV2Handle_(p("leaderboard",{...auth,deviceToken:"0".repeat(64)})),"INVALID_STUDENT_CREDENTIALS");
props.MEJ_V2_RANKING_ENABLED="false";
bad(()=>context.mejV2Handle_(p("leaderboard",auth)),"CLASS_RANKING_DISABLED");
assert.equal(response.scoreVerification,"SERVER_CHECKED_PILOT");
// Restore detailed mastery counts from the authenticated server, not just stars.
const snapshot=context.mejV2Handle_(p("progress",auth));
assert.equal(snapshot.scope,"OWN_STUDENT_PROGRESS");
assert.equal(snapshot.stars,1);
assert(!JSON.stringify(snapshot).includes("answer"));
assert(snapshot.mastered.some(x=>x.questionId==="L1-001"&&x.correctCount===2));
bad(()=>context.mejV2Handle_(p("progress",{studentId:enrol.studentId,deviceToken:"0".repeat(64)})),"INVALID_STUDENT_CREDENTIALS");
const otherSnapshot=context.mejV2Handle_(p("progress",{studentId:other.studentId,deviceToken:other.deviceToken}));
assert.equal(otherSnapshot.stars,0);
assert.equal(otherSnapshot.mastered.length,0);
// Stage 4 — secure transfer: old device credential revoked after recovery.
const originalToken=enrol.deviceToken;
const previousRecovery=enrol.recoveryCode;
const recovery=context.mejV2Handle_(p("recover",{studentId:enrol.studentId,recoveryCode:previousRecovery}));
assert.equal(recovery.ok,true);assert.equal(recovery.stars,1);
assert.equal(recovery.revision,2);assert.notEqual(recovery.deviceToken,originalToken);
assert.notEqual(recovery.recoveryCode,previousRecovery);
bad(()=>context.mejV2Handle_(p("summary",{studentId:enrol.studentId,deviceToken:originalToken})),"INVALID_STUDENT_CREDENTIALS");
bad(()=>context.mejV2Handle_(p("recover",{studentId:enrol.studentId,recoveryCode:previousRecovery})),"INVALID_RECOVERY_CREDENTIALS");
assert.equal(context.mejV2Handle_(p("summary",{studentId:enrol.studentId,deviceToken:recovery.deviceToken})).stars,1);
const rotated=context.mejV2Handle_(p("rotateRecovery",{studentId:enrol.studentId,deviceToken:recovery.deviceToken}));
assert.equal(rotated.revision,3);
bad(()=>context.mejV2Handle_(p("recover",{studentId:enrol.studentId,recoveryCode:recovery.recoveryCode})),"INVALID_RECOVERY_CREDENTIALS");
const device2=context.mejV2Handle_(p("recover",{studentId:enrol.studentId,recoveryCode:rotated.recoveryCode}));
assert.equal(device2.stars,1);assert.equal(device2.revision,4);
bad(()=>context.mejV2Handle_(p("summary",{studentId:enrol.studentId,deviceToken:recovery.deviceToken})),"INVALID_STUDENT_CREDENTIALS");
assert.equal(context.mejV2Handle_(p("summary",{studentId:enrol.studentId,deviceToken:device2.deviceToken})).stars,1);
const recoveredSnapshot=context.mejV2Handle_(p("progress",{studentId:enrol.studentId,deviceToken:device2.deviceToken}));
assert.equal(recoveredSnapshot.stars,1);
assert(recoveredSnapshot.mastered.some(x=>x.questionId==="L1-001"&&x.correctCount===2));
assert.equal(db.get("MEJ_V2_Recovery").getLastRow(),6);
props.MEJ_V2_ENABLED="false";
bad(()=>context.mejV2Handle_(p("summary",auth)),"VERIFIED_PILOT_DISABLED");
assert.equal(activeLocks,0,"Locks released");
assert.equal(db.get("MEJ_V2_Students").getLastRow(),6);
assert.equal(db.get("MEJ_V2_Attempts").getLastRow(),5);
assert.equal(db.get("MEJ_V2_Mastery").getLastRow(),2);
console.log("VERIFIED_PILOT_SYNTHETIC_TESTS_PASSED: verified stars, isolated ranking, secure device recovery, token rotation, old device revocation");
