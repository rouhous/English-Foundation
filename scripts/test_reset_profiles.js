#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
const match=html.match(/const DBKEY='WADI_ENGLISH_EXPLORER_PROFILES_V1';[\s\S]*?(?=let db=\{profiles:)/);
assert(match,"Reset must precede database loading");
assert(match[0].includes("MEJ_TEST_ACCOUNT_RESET_20261105_V1"),"Reset marker missing");
const data=new Map([
 ["WADI_ENGLISH_EXPLORER_PROFILES_V1","OLD_TEST_PROFILE"],
 ["EBO_OMAN_V4","OLD_MIGRATABLE_PROFILE"],
 ["EE_V38_RECOVERY_SESSIONS","OLD_TEST_TOKEN"],
 ["SCHOOL_TEACHER_NOTEBOOK_DATA","KEEP_FOREVER"],
 ["UNRELATED_APP_DATA","KEEP_FOREVER"]
]);
const storage={
 getItem:k=>data.has(k)?data.get(k):null,
 setItem:(k,v)=>data.set(k,String(v)),
 removeItem:k=>data.delete(k)
};
const context={localStorage:storage,console};vm.createContext(context);
vm.runInContext(match[0],context,{timeout:1500});
for(const k of ["WADI_ENGLISH_EXPLORER_PROFILES_V1","EBO_OMAN_V4","EE_V38_RECOVERY_SESSIONS"])assert(!data.has(k),"Old trial account remained: "+k);
assert.equal(data.get("SCHOOL_TEACHER_NOTEBOOK_DATA"),"KEEP_FOREVER");
assert.equal(data.get("UNRELATED_APP_DATA"),"KEEP_FOREVER");
assert.equal(data.get("MEJ_TEST_ACCOUNT_RESET_20261105_V1_DONE"),"1");
data.set("WADI_ENGLISH_EXPLORER_PROFILES_V1","NEW_ENROLLMENT");
vm.runInNewContext(match[0],{localStorage:storage,console},{timeout:1500});
assert.equal(data.get("WADI_ENGLISH_EXPLORER_PROFILES_V1"),"NEW_ENROLLMENT","Reset repeated and destroyed new registration");
console.log("TEST_ACCOUNT_RESET_PASSED: old test profiles retired once; new registration and unrelated apps preserved");
