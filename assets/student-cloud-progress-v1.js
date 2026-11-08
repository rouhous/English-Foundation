/* MEJ internal student progress transport: local-first, authenticated, no Google Sheets.
   This stores a bounded latest snapshot and retries only after server acknowledgment.
   Cloud figures are CLIENT_REPORTED_UNVERIFIED pending server-side answer verification. */
(function(root){
'use strict';
const ENDPOINT='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-progress';
const ENROLL_ENDPOINT='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license';
const QUEUE='MEJ_PROGRESS_PENDING_SUPABASE_V1';
const REVISIONS='MEJ_PROGRESS_SERVER_REVISIONS_V1';
const TOKEN='MEJ_STUDENT_ACCESS_V1';
let pendingPromise=null,listenerInstalled=false;
const hex=/^[a-f0-9]{64}$/;
function get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function set(k,v){localStorage.setItem(k,JSON.stringify(v))}
function revisions(){return get(REVISIONS)||{}}
function current(){return get(QUEUE)}
function secret(){const t=localStorage.getItem(TOKEN)||'';return hex.test(t)?t:null}
function online(){return navigator.onLine!==false}
function safePayload(value){
 if(!value||typeof value!=='object'||!Number.isInteger(value.grade)||value.grade<1||value.grade>12)return null;
 if(typeof value.studentName!=='string'||!value.studentName.trim())return null;
 if(typeof value.className!=='string'||!Array.isArray(value.levelStats))return null;
 const asInt=(v,max)=>Number.isSafeInteger(Number(v))?Math.max(0,Math.min(max,Number(v))):0;
 const attempts=asInt(value.attempts,10000000);
 return {studentName:value.studentName.slice(0,120),className:value.className.slice(0,35),grade:value.grade,
  stars:asInt(value.stars,2600),attempts,correctAnswers:Math.min(attempts,asInt(value.correctAnswers,10000000)),
  masteredItems:asInt(value.masteredItems,2600),weeklyAttempts:asInt(value.weeklyAttempts,1000000),
  diagnosticDone:value.diagnosticDone===true,diagnosticLevel:Number.isInteger(value.diagnosticLevel)?value.diagnosticLevel:null,
  highestLevel:Number.isInteger(value.highestLevel)?value.highestLevel:null,
  levelStats:value.levelStats.slice(0,13).map(v=>({level:asInt(v.level,12),mastered:asInt(v.mastered,200),total:200,
    masteryPercent:asInt(v.masteryPercent,100)})),
  privateState:(()=>{
   const p=value.privateState||{},out={};
   if(!p||typeof p!=='object'||Array.isArray(p))return {};
   for(const key of ['correct','wrong','writing'])if(p[key]&&typeof p[key]==='object'&&!Array.isArray(p[key]))out[key]=p[key];
   if(Array.isArray(p.activity))out.activity=p.activity.slice(-1500);
   out.diagnosticScore=p.diagnosticScore??null;
   out.diagnosticDate=String(p.diagnosticDate||'').slice(0,40);
   out.journeyIsland=Number.isInteger(Number(p.journeyIsland))?Number(p.journeyIsland):null;
   if(JSON.stringify(out).length>150000)return {};
   return out;
  })()};
}
async function post(action,token,data){
 const r=await fetch(ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
  body:JSON.stringify({action,...data}),signal:AbortSignal.timeout(16000)});
 const result=await r.json();
 if(!r.ok||result.ok!==true){const e=new Error(result.error||'CLOUD_UNAVAILABLE');e.status=r.status;throw e}
 return result;
}
async function ensureEnrollment(profileRef,token){
 const r=await fetch(ENROLL_ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({action:'enroll_profile',profileRef,accessToken:token}),signal:AbortSignal.timeout(16000)});
 const data=await r.json();
 if(!r.ok||data.ok!==true||data.enrolled!==true)throw Error(data.error||'STUDENT_ENROLLMENT_PENDING');
 return true;
}
async function flush(){
 if(pendingPromise)return pendingPromise;
 pendingPromise=(async()=>{
  const item=current(),token=secret();
  if(!item)return {state:'idle'};
  if(!token||!online())return {state:'pending'};
  if(!hex.test(item.profileRef)||typeof item.key!=='string')return {state:'invalid'};
  const revisionMap=revisions();
  let rev=revisionMap[item.profileRef];
  try{
   if(!Number.isSafeInteger(rev)){
    // Recover a valid six-digit-code login that has not yet attached its local
    // learner profile. Enrollment is checked server-side against its own token.
    await ensureEnrollment(item.profileRef,token);
    const cloud=await post('student_get',token);
    if(cloud.hasSnapshot){
     return {state:'needs_review',error:'CLOUD_PROGRESS_EXISTS_NO_LOCAL_REVISION'};
    }
    rev=0;
   }
   const result=await post('student_save',token,{profileRef:item.profileRef,expectedRevision:rev,progress:item.progress});
   const latest=revisions();latest[item.profileRef]=result.revision;set(REVISIONS,latest);
   if(current()?.key===item.key)localStorage.removeItem(QUEUE);
   if(current()&&online())Promise.resolve().then(()=>flush()).catch(()=>{});
   return {state:'synced',revision:result.revision};
  }catch(error){
    return {state:error.message==='REVISION_CONFLICT'?'needs_review':'pending',error:String(error.message||error).slice(0,95)};
  }
 })();
 try{return await pendingPromise}finally{pendingPromise=null}
}
function queue(profileRef,raw){
 if(!hex.test(profileRef)||!secret())return {state:'not_linked'};
 const progress=safePayload(raw);
 if(!progress)return {state:'incomplete'};
 const random=crypto.getRandomValues(new Uint8Array(12));
 const key=Array.from(random,n=>n.toString(16).padStart(2,'0')).join('');
 try{set(QUEUE,{key,profileRef,progress,queuedAt:Date.now()})}
 catch(_){return {state:'storage_full'}}
 if(!online())return {state:'offline_pending'};
 return flush();
}
function start(){
 if(listenerInstalled)return;listenerInstalled=true;
 root.addEventListener('online',()=>flush().catch(()=>{}));
 root.addEventListener('pageshow',()=>{if(online())flush().catch(()=>{})});
 if(online())flush().catch(()=>{});
}
root.MEJStudentCloudProgress={queue,flush,start,status(){return {online:online(),pending:!!current(),tokenPresent:!!secret()}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);