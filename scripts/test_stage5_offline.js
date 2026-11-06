#!/usr/bin/env node
"use strict";
/** Offline-first PWA invariants; no live server or student data. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const js=fs.readFileSync("sw.js","utf8");
const css=fs.readFileSync("assets/stage5-responsive.css","utf8");
const html=fs.readFileSync("index.html","utf8");
assert(html.includes("MEJ_STAGE5_RESPONSIVE_V1"),"Stage 5 stylesheet must be linked");
assert(html.includes("./assets/stage5-responsive.css?v=20261105-stage5"));
assert(css.includes("safe-area-inset-bottom"),"Respect iPhone bottom safe area");
assert(css.includes("max-width:390px"),"Handle narrow phones");
assert(css.includes("orientation:landscape"),"Handle landscape");
assert(css.includes("min-height:44px"),"Touch targets");
assert(css.includes("prefers-reduced-motion"),"Reduced motion");
assert(!css.includes("display:none"),"Do not hide important controls");
assert(js.includes("IMAGE_SHARDS")&&js.includes("imageShardsCached"));
assert(js.includes("url.origin!==self.location.origin"),"Remote sync must bypass cache");
assert(js.includes("if(request.method!=='GET')return"),"Never cache score submission");
const registrations={};
const cacheDB=new Map();
function normalized(u){
 const value=typeof u==="string"?u:u.url;
 if(value.startsWith("https://school.example/"))return "./"+value.slice("https://school.example/".length);
 return value;
}
function getCache(name){
 if(!cacheDB.has(name)){
  const records=new Map();
  cacheDB.set(name,{
   async addAll(paths){for(const path of paths)records.set(path,{ok:true,url:path,body:"cached"})},
   async add(path){records.set(path,{ok:true,url:path,body:"cached"})},
   async match(path){return records.get(normalized(path))||null},
   async put(path,value){records.set(normalized(path),value)}
  });
 }
 return cacheDB.get(name);
}
const listeners={};
const self={
 location:{origin:"https://school.example"},
 addEventListener:(name,handler)=>{listeners[name]=handler},
 skipWaiting:async()=>{},
 clients:{claim:async()=>{}}
};
const caches={
 open:getCache,
 keys:async()=>Array.from(cacheDB.keys()),
 delete:async key=>cacheDB.delete(key),
 async match(path,opts){
  for(const cache of cacheDB.values()){
   const target=normalized(path);
   const value=await cache.match(opts?.ignoreSearch?target.split("?")[0]:target);
   if(value)return value;
  }
  return null;
 }
};
const context={self,caches,URL,Promise,Array,String,Boolean,console,Response:{
 error:()=>({ok:false})
 },fetch:async()=>{throw Error("offline")}};
vm.runInNewContext(js,context,{timeout:2000});
assert.equal(typeof listeners.install,"function");
assert.equal(typeof listeners.activate,"function");
assert.equal(typeof listeners.fetch,"function");
function dispatch(type,evt){listeners[type](evt);return evt.promise}
(async()=>{
 await dispatch("install",{waitUntil(p){this.promise=p}});
 await dispatch("activate",{waitUntil(p){this.promise=p}});
 // Image bundles warm without delaying install or activation.
 for(let i=0;i<80;i++){await new Promise(resolve=>setImmediate(resolve));}
 const keys=await caches.keys();assert.equal(keys.length,1);
 const core=await caches.match("./index.html");assert(core,"Main HTML not cached");
 const shardVersion=js.match(/\\.js\\?v=([^']+)/)?.[1];
 assert(shardVersion,"Service worker image bundle version missing");
 const shardPromises=Array.from({length:12},(_,i)=>"./assets/approved-images-"+String(i+1).padStart(2,"0")+".js?v="+shardVersion);
 for(const shard of shardPromises){assert(await caches.match(shard),"Missing image shard "+shard)}
 let posted=null;
 await dispatch("message",{data:{type:"MEJ_OFFLINE_STATUS"},source:{postMessage(x){posted=x}},waitUntil(p){this.promise=p}});
 assert.equal(posted.imageShardsCached,12);
 assert.equal(posted.coreCached,true);
 let handled=false;
 listeners.fetch({request:{method:"POST",url:"https://school.example/progress",mode:"cors"},respondWith(){handled=true}});
 assert.equal(handled,false,"Student score POST intercepted");
 listeners.fetch({request:{method:"GET",url:"https://script.google.com/macros/s/test/exec",mode:"cors"},respondWith(){handled=true}});
 assert.equal(handled,false,"Cloud receiver request intercepted");
 const local={method:"GET",url:"https://school.example/index.html",mode:"cors"};
 let reply;
 listeners.fetch({request:local,respondWith(p){reply=p}});
 assert(reply,"Offline local file not intercepted");
 const found=await reply;
 assert(found,"Offline page not served");
 console.log("PWA_FAST_LAUNCH_OFFLINE_TEST_PASSED: nonblocking activation, 12 cached image banks, offline shell, cloud bypass");
})().catch(e=>{console.error(e);process.exitCode=1});
