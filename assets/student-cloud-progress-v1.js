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
  stars:asInt(value.stars,3250),attempts,correctAnswers:Math.min(attempts,asInt(value.correctAnswers,10000000)),
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
   if(p.hiddenObjectsLedger&&typeof p.hiddenObjectsLedger==='object'&&!Array.isArray(p.hiddenObjectsLedger))out.hiddenObjectsLedger=p.hiddenObjectsLedger;
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
/* Profile registration and mandatory placement. */
(function(){
'use strict';
if(window.MEJStudentAccountUI)return;
window.MEJStudentAccountUI=true;
const endpoint='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-student-account';
const oldHome=home, oldRoute=route, oldProfile=openProfile, oldPersist=persist;
const labels=['الاسم الأول','اسم الأب','اسم الجد','اسم العائلة'];
const profileCode=p=>localStorage.getItem('MEJ_RECOVERY_'+p.id)||'';
const storeCode=(p,code)=>localStorage.setItem('MEJ_RECOVERY_'+p.id,code);
const ownerSession=()=>window.__MEJ_ACCESS_ROLE==='owner';
const needsGrade=()=>!ownerSession()&&!!active()?.name&&!active().diagnosed&&placementCeiling(active())===null;
const pending=()=>!ownerSession()&&!!active()?.name&&!active().diagnosed&&placementCeiling(active())!==null;
const registered=()=>!!active()?.name&&placementCeiling(active())!==null;
const linked=p=>!!(p.teacherCode||mejCreds()[p.id]?.MEJ_STUDENT_ACCESS_V1);
let saving=false;
async function account(action,data,token){
 const res=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...data}),signal:AbortSignal.timeout(20000)});
 const result=await res.json();
 if(!res.ok||!result.ok)throw Error(result.error||'UNAVAILABLE');
 return result;
}
async function ref(p){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p.id));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
function snapshot(p){const copy={...p};delete copy.freeRevision;delete copy.accountDirty;return {profile:copy,checkpoint:p.id===db.active?mejReadDiagnostic():null}}
function write(){localStorage.setItem(DBKEY,JSON.stringify(db))}
const freeJobs=new Map();
async function flushFree(p){
 if(!p.accountDirty||linked(p)||!profileCode(p)||freeJobs.has(p.id)||!navigator.onLine)return;
 freeJobs.set(p.id,true);
 try{
  while(p.accountDirty){
   const version=p.accountDirty;
   const r=await account('free_save',{name:p.name,grade:p.grade,profileRef:await ref(p),recoveryCode:profileCode(p),snapshot:snapshot(p),revision:p.freeRevision});
   p.freeRevision=r.revision;if(p.accountDirty===version)delete p.accountDirty;write();
  }
 }catch(e){p.syncStatus=e.message==='REVISION_CONFLICT'?'توقف الحفظ السحابي على هذا الجهاز. استعد الحساب برمز الطالب.':'التقدم محفوظ على الجهاز بانتظار المزامنة.'}
 finally{freeJobs.delete(p.id)}
}
persist=function(send=true){const ok=oldPersist(send),p=active();if(ok&&profileCode(p)&&!linked(p)){p.accountDirty=(p.accountDirty||0)+1;write();void flushFree(p)}return ok};
function startRequired(){
 if(ownerSession())return false;
 if(needsGrade()){
  if(!document.querySelector('#journeyModal'))queueMicrotask(()=>{if(needsGrade()&&!document.querySelector('#journeyModal'))openProfile(false)});
  return true;
 }
 if(!pending())return false;if(activeSession?.kind!=='diagnostic'||!document.querySelector('#app .quiz #feedback')){current='diagnostic';document.getElementById('journeyNav')?.classList.remove('open');startDiagnostic()}return true}
route=function(page){if(!startRequired())return oldRoute(page)};
home=function(){if(startRequired())return;oldHome();document.querySelectorAll('button[onclick="letsGo()"]').forEach(b=>{b.disabled=!registered();b.setAttribute('aria-disabled',String(!registered()));b.title=registered()?'':'سجّل الاسم والصف قبل بدء اللعبة'})};
const originalLetsGo=letsGo;
letsGo=function(){
 if(!registered()){toast('لا يمكن بدء اللعبة قبل تسجيل اسم الطالب وصفه.');openProfile(!active()?.name);return}
 if(startRequired())return;
 return originalLetsGo();
};
const originalStop=stopQuiz;
stopQuiz=function(){if(!pending()&&!needsGrade())return originalStop()};
const originalCloseProfile=closeProfile;
closeProfile=function(){if(needsGrade()){toast('أكمل بيانات الصف ثم اختبار التشخيص قبل العودة.');return}return originalCloseProfile()};
function guard(){
 const diagLock=pending()&&activeSession?.kind==='diagnostic';
 const dataLock=needsGrade();
 const skip=document.querySelector('#app .quiz #skipBtn');
 if(skip&&diagLock){skip.hidden=true;skip.disabled=true}
 for(const el of document.querySelectorAll('button,a[href],input,select,textarea,[role=button],[tabindex]')){
  const action=el.getAttribute('onclick');
  const block=dataLock?!el.closest('#journeyModal'):
   diagLock&&(!el.closest('#app .quiz')||action==='stopQuiz()'||action==='skipQuestion()');
  if(block&&!el.inert){el.inert=true;el.dataset.placementInert='1';if('disabled' in el&&!el.disabled){el.disabled=true;el.dataset.placementDisabled='1'}}
  if(!block&&el.dataset.placementInert){el.inert=false;delete el.dataset.placementInert;if(el.dataset.placementDisabled){el.disabled=false;delete el.dataset.placementDisabled}}
 }
}
const gateEvents=e=>{
 if((needsGrade()&&!e.target.closest?.('#journeyModal'))||
    (pending()&&activeSession?.kind==='diagnostic'&&(!e.target.closest?.('#app .quiz')||e.target.closest?.('[onclick="stopQuiz()"],[onclick="skipQuestion()"]')))){
   e.preventDefault();e.stopImmediatePropagation()
 }
};
document.addEventListener('click',gateEvents,true);
new MutationObserver(guard).observe(document.body,{childList:true,subtree:true});
const messages={INVALID_TEACHER_CODE:'تحقق من رمز المعلم.',LICENSE_CAPACITY_REACHED:'بلغ الترخيص الحد المسموح به من الطلاب.',RECOVERY_CODE_NOT_VALID:'رمز الطالب لا يطابق هذا الحساب.',INVALID_RECOVERY_DETAILS:'تحقق من رمز الطالب.',ALREADY_REGISTERED:'لديك حساب مفعّل سابقًا. أدخل رمز الطالب لاستعادة تقدمك.',TOO_MANY_ATTEMPTS:'تكررت المحاولات. حاول مجددًا لاحقًا.'};
const claims=new Map();
async function issue(p){
 if(profileCode(p))return profileCode(p);
 if(claims.has(p.id))return claims.get(p.id);
 const job=(async()=>{
  const profileRef=await ref(p);let result;
  if(linked(p)){
   const token=mejCreds()[p.id]?.MEJ_STUDENT_ACCESS_V1||(db.active===p.id&&localStorage.getItem('MEJ_STUDENT_ACCESS_V1'));
   if(!token)throw Error('STUDENT_LOGIN_REQUIRED');
   result=await account('claim',{profileRef,name:p.name,grade:p.grade},token);
   if(!result.recoveryCode)result=await account('rotate',{},token);
  }else{
   result=await account('free_register',{profileRef,name:p.name,grade:p.grade,snapshot:snapshot(p)});p.freeRevision=result.revision;write();
  }
  storeCode(p,result.recoveryCode);return result.recoveryCode;
 })();claims.set(p.id,job);try{return await job}finally{claims.delete(p.id)}
}
openProfile=function(isNew=false){
 if(pending()&&startRequired())return;
 oldProfile(isNew);const modal=document.querySelector('#journeyModal'),p=active(),fresh=isNew||!p.name;
 const orig=modal.querySelector('#studentName');orig.parentElement.hidden=true;orig.parentElement.style.display='none';
 const parts=fresh?[]:(p.nameParts||p.name.trim().split(/\s+/));if(parts.length>4)parts.splice(3,parts.length-3,parts.slice(3).join(' '));
 labels.forEach((label,i)=>{const field=document.createElement('label');field.className='field';field.textContent=label+(fresh?' *':i===3?' (اختياري)':'');const input=document.createElement('input');input.dataset.namePart=i;input.maxLength=30;input.required=fresh;input.value=parts[i]||'';field.append(input);orig.parentElement.before(field)});
 const entry=modal.querySelector('#ee-recovery-entry');const panel=document.createElement('div');panel.setAttribute('role','status');panel.className='notice blue';entry.replaceWith(panel);
 if(fresh){
  const recovery=document.createElement('input');recovery.id='studentRecoveryCode';recovery.placeholder='رمز الطالب';recovery.dir='ltr';recovery.hidden=true;
  const recover=document.createElement('button');recover.className='btn light';recover.textContent='لديّ حساب سابق';recover.onclick=()=>{recovery.hidden=false;panel.firstChild.textContent='أدخل الاسم المسجّل والصف ورمز المعلم ثم رمز الطالب واضغط حفظ.';recovery.focus()};
  panel.append(document.createTextNode(''),recover,recovery);
 }else{
  const refresh=()=>issue(p).then(code=>panel.textContent='رمز الطالب لاستعادة التقدم: '+code).catch(()=>panel.textContent='تعذّر جلب رمز الطالب. افتح البيانات عند الاتصال بالإنترنت.');
  refresh();
 }
 modal.querySelector('[data-name-part]').focus();
};
function attach(p,r,code){
 for(const [key,val] of Object.entries({MEJ_STUDENT_ACCESS_V1:r.accessToken,MEJ_STUDENT_DEVICE_REF_V1:r.studentRef,MEJ_VERIFIED_SCHOOL_NAME_V1:r.schoolName,MEJ_ASSIGNED_TEACHER_CODE_V1:code,MEJ_VERIFIED_TEACHER_LINKED_V1:r.teacherLinked===true?'1':'0',MEJ_ASSIGNED_TEACHER_NAME_V1:''}))localStorage.setItem(key,val||'');
 window.__MEJ_ACCESS_ROLE='student';mejCapture(p.id)
}
saveProfileModal=async function(isNew){
 if(saving)return;
 const modal=document.querySelector('#journeyModal'),inputs=[...modal.querySelectorAll('[data-name-part]')],parts=inputs.map(e=>e.value.trim()),name=parts.filter(Boolean).join(' ');
 const grade=modal.querySelector('#studentGrade').value,section=modal.querySelector('#studentSection').value.trim(),teacherCode=modal.querySelector('#teacherCode').value.trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
 const p=isNew||!active().name?newProfile():active(),fresh=!p.name,codeInput=modal.querySelector('#studentRecoveryCode'),recover=codeInput&&!codeInput.hidden;
 const msg=modal.querySelector('[role=status]');
 function error(t){if(fresh)msg.firstChild.textContent=t;else toast(t)}
 if(!name){error('أدخل اسم الطالب.');return}
 if(!grade||(teacherCode&&(!/^\d{6}$/.test(teacherCode)||grade==='other'))||(section&&!/^[1-9]\d{0,2}$/.test(section))){error('تحقق من الصف والقسم ورمز المعلم.');return}
 const data={name,grade,teacherCode},profileRef=await ref(p),original=db.active;
 if(saving)return;saving=true;modal.inert=true;
 try{
  if(fresh){
   if(!recover&&parts.some(s=>!s)){
    const found=teacherCode&&grade!=='other'&&await account('check',data);
    if(found?.alreadyRegistered)throw Error('ALREADY_REGISTERED');
    error('أكمل خانات الاسم الأربع.');return;
   }
   const id=p.id;Object.assign(p,{name,grade,teacherCode,className:grade+(section?'_'+section:''),school:modal.querySelector('#studentSchool').value.trim(),nameParts:parts});
   let r;
   if(recover){
    const recoveryCode=codeInput.value.trim();r=await account(teacherCode?'recover':'free_recover',{...data,recoveryCode,newProfileRef:profileRef,profileRef});
    if(r.snapshot?.profile)Object.assign(p,r.snapshot.profile,{id,freeRevision:r.revision});
    if(r.snapshot?.checkpoint)localStorage.setItem('MEJ_DIAGNOSTIC_CHECKPOINT_V1_'+id,JSON.stringify(r.snapshot.checkpoint));
    if(r.progress){const s=r.progress;Object.assign(p,s.private_state||{},{name:s.student_name,grade:String(s.grade),className:s.class_name,stars:s.stars,attempts:s.attempts,right:s.correct_answers,diagnosed:s.diagnostic_done,assigned:s.diagnostic_level||0});
     const key='MEJ_PROGRESS_SERVER_REVISIONS_V1',revs=JSON.parse(localStorage.getItem(key)||'{}');revs[profileRef]=s.revision;localStorage.setItem(key,JSON.stringify(revs))}
    r.recoveryCode=recoveryCode;
   }else{
    r=await account(teacherCode?'register':'free_register',{...data,parts,profileRef,snapshot:snapshot(p)});if(!teacherCode)p.freeRevision=r.revision;
   }
   mejCapture(original);
   if(recover){
    const same=Object.values(db.profiles).find(x=>x.id!==id&&profileCode(x)===r.recoveryCode&&x.name===name&&String(x.grade)===grade);
    if(same){db.active=same.id;mejSwitch(same.id);
     // A linked recovery has just rebound the remote profile reference.
     // Keep the freshly bound ID and merge the local record if it is newer.
     if(Number(same.stars)>Number(p.stars))Object.assign(p,same,{id,freeRevision:p.freeRevision});
     delete db.profiles[same.id];localStorage.removeItem('MEJ_RECOVERY_'+same.id)
    }
   }
   db.profiles[id]=p;db.active=id;mejSwitch(id);
   if(teacherCode){p.school=r.schoolName||'';attach(p,r,teacherCode)}
   storeCode(p,r.recoveryCode);activeSession=null;write();if(teacherCode)scheduleReport();
   closeProfile();if(!recover)alert('تم التسجيل. احتفظ برمز الطالب لاستعادة تقدمك على جهاز آخر:\n'+r.recoveryCode);route(p.diagnosed?'journey':'diagnostic');
  }else{
   const token=mejCreds()[p.id]?.MEJ_STUDENT_ACCESS_V1||localStorage.getItem('MEJ_STUDENT_ACCESS_V1');
   if(placementCeiling(p)!==null)await issue(p);
   if(linked(p)&&token&&(name!==p.name||grade!==String(p.grade)))await account('claim',{name,grade,profileRef},token);
   if(!linked(p)&&(name!==p.name||grade!==String(p.grade))){
    if(freeJobs.has(p.id))throw Error('BUSY');
    const snap=snapshot(p);Object.assign(snap.profile,{name,grade,nameParts:parts});
    if(profileCode(p)){
     const r=await account('free_save',{name,grade,profileRef,recoveryCode:profileCode(p),revision:p.freeRevision,snapshot:snap});p.freeRevision=r.revision
    }
   }
   modal.querySelector('#studentName').value=name;p.nameParts=parts;
   if(await saveStudent())closeProfile();
  }
 }catch(e){
  error(messages[e.message]||'تعذّر حفظ الحساب. تحقق من الاتصال ثم أعد المحاولة.');
  if(e.message==='ALREADY_REGISTERED'&&codeInput){codeInput.hidden=false;codeInput.focus()}
 }finally{modal.inert=false;saving=false}
};
const oldSwitch=switchUser;
switchUser=function(id){if(pending())return;oldSwitch(id);resume()};
const oldCheckpoint=mejSaveDiagnostic;
mejSaveDiagnostic=function(nextIndex){
 oldCheckpoint(nextIndex);
 const p=active();if(!linked(p)&&profileCode(p)){p.accountDirty=(p.accountDirty||0)+1;write();void flushFree(p)}
};
function resume(){const p=active();if(p?.name&&placementCeiling(p)!==null&&!profileCode(p)&&navigator.onLine)void issue(p).catch(()=>{});for(const item of Object.values(db.profiles))void flushFree(item)}
window.addEventListener('popstate',()=>{if(pending()||needsGrade())startRequired()});
window.addEventListener('hashchange',()=>{if(pending()||needsGrade())startRequired()});
window.addEventListener('online',resume);window.addEventListener('pageshow',resume);
if(!startRequired()&&document.querySelector('#app [onclick="letsGo()"]'))home();guard();resume();
})();
