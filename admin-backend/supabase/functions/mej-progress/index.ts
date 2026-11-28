import {createRemoteJWKSet,jwtVerify} from 'npm:jose@6.1.0';
const ORIGIN='https://rouhous.github.io';
const AUD='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const JWKS=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const BASE=Deno.env.get('SUPABASE_URL')||'';
const SECRET=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const CORS={'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'authorization,content-type','vary':'Origin'};
function response(status:number,body:unknown){return new Response(JSON.stringify(body),{status,headers:{...CORS,'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
const isId=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
async function sha(value:string){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
async function db(path:string,body?:unknown){
 if(!BASE||!SECRET)throw Error('SERVER_UNAVAILABLE');
 const res=await fetch(BASE+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',
  headers:{apikey:SECRET,authorization:'Bearer '+SECRET,'content-type':'application/json','accept':'application/json'},
  ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(8500)});
 if(!res.ok)throw Error('DATA_UNAVAILABLE');
 return await res.json();
}
async function google(req:Request){
 const h=req.headers.get('authorization')||'';
 if(!/^Bearer [^ ]+$/.test(h)||h.length>8200)throw Error('GOOGLE_LOGIN_REQUIRED');
 const {payload}=await jwtVerify(h.slice(7),JWKS,{audience:AUD,issuer:['accounts.google.com','https://accounts.google.com'],algorithms:['RS256'],clockTolerance:'30 seconds'});
 if(payload.email_verified!==true||typeof payload.sub!=='string'||typeof payload.email!=='string')throw Error('GOOGLE_LOGIN_REQUIRED');
 return {email:payload.email.toLowerCase(),sub:payload.sub};
}
async function student(req:Request){
 const h=req.headers.get('authorization')||'';
 const token=h.startsWith('Bearer ')?h.slice(7):'';
 if(!isId(token))throw Error('STUDENT_LOGIN_REQUIRED');
 const accessHash=await sha(token);
 const links=await db('mej_short_student_links?access_hash=eq.'+accessHash+'&select=student_ref,license_id,teacher_id,profile_ref');
 if(!Array.isArray(links)||links.length!==1)throw Error('STUDENT_LOGIN_REQUIRED');
 const active=await db('mej_licenses?id=eq.'+links[0].license_id+'&active=eq.true&select=id');
 if(!Array.isArray(active)||active.length!==1)throw Error('LICENSE_INACTIVE');
 return {link:links[0],accessHash};
}
function validHiddenLedger(raw:unknown,levelStats:unknown):Record<string,unknown>{
 if(raw==null)return {};
 if(typeof raw!=='object'||Array.isArray(raw))throw Error('INVALID_HIDDEN_LEDGER');
 const entries=Object.entries(raw as Record<string,unknown>);
 if(entries.length>130)throw Error('INVALID_HIDDEN_LEDGER');
 const byLevel=new Map<number,number>();
 if(Array.isArray(levelStats))for(const row of levelStats){const x=row as Record<string,unknown>;if(!Number.isInteger(x?.level))continue;const stars=Number.isInteger(x?.stars)?Number(x.stars):(Number.isInteger(x?.mastered)?Number(x.mastered)*2:null);if(stars!==null)byLevel.set(Number(x.level),Math.min(50,Math.max(0,stars)))}
 const output:Record<string,unknown>={};
 for(const [key,value] of entries){
  if(!/^(?:[0-9]|1[0-2])-(?:[1-9]|10)$/.test(key)||!value||typeof value!=='object'||Array.isArray(value))throw Error('INVALID_HIDDEN_LEDGER');
  const [stage,badge]=key.split('-').map(Number),v=value as Record<string,unknown>;
  if((byLevel.get(stage)||0)<badge*5)throw Error('INVALID_HIDDEN_UNLOCK');
  if(!Array.isArray(v.found)||v.found.length>10||!Number.isInteger(v.misses)||Number(v.misses)<0||Number(v.misses)>3)throw Error('INVALID_HIDDEN_LEDGER');
  const all=Array.from({length:16},(_,i)=>i).filter(i=>i!==6);
  let t=(stage*7919+badge*1013)>>>0;
  for(let i=all.length-1;i>0;i--){t=(Math.imul(t,1664525)+1013904223)>>>0;const j=Math.floor(t/4294967296*(i+1));[all[i],all[j]]=[all[j],all[i]]}
  const wanted=new Set(all.slice(0,10));
  const found=v.found as unknown[];
  if(new Set(found).size!==found.length||found.some(i=>!Number.isInteger(i)||!wanted.has(Number(i))))throw Error('INVALID_HIDDEN_ITEMS');
  const remaining=v.remaining==null?null:Number(v.remaining);
  if(remaining!==null&&(!Number.isInteger(remaining)||remaining<0||remaining>600))throw Error('INVALID_HIDDEN_TIMER');
  if(v.status!=='pending'&&v.status!=='finished')throw Error('INVALID_HIDDEN_LEDGER');
  if(v.status==='finished'&&found.length!==10&&Number(v.misses)!==3&&remaining!==0)throw Error('INVALID_HIDDEN_RESULT');
  output[key]={status:v.status,found,misses:v.misses,remaining,award:v.status==='finished'?Math.floor(found.length/2):0};
 }
 return output;
}
function normalized(data:Record<string,unknown>){
 const ints=['stars','attempts','correctAnswers','masteredItems','weeklyAttempts'];
 const bounds=[3250,10000000,10000000,2600,1000000];
 for(let i=0;i<ints.length;i++){const n=data[ints[i]];if(!Number.isInteger(n)||Number(n)<0||Number(n)>bounds[i])throw Error('INVALID_PROGRESS')}
 if(Number(data.correctAnswers)>Number(data.attempts))throw Error('INVALID_PROGRESS');
 if(!Number.isInteger(data.grade)||Number(data.grade)<1||Number(data.grade)>12)throw Error('INVALID_GRADE');
 for(const x of ['diagnosticLevel','highestLevel']){
  if(data[x]!==undefined&&data[x]!==null&&(!Number.isInteger(data[x])||Number(data[x])<0||Number(data[x])>12))throw Error('INVALID_LEVEL');
 }
 if(data.diagnosticDone!==undefined&&typeof data.diagnosticDone!=='boolean')throw Error('INVALID_DIAGNOSTIC');
 if(typeof data.studentName!=='string'||data.studentName.length>120||typeof data.className!=='string'||data.className.length>35)throw Error('INVALID_NAME');
 if(!Array.isArray(data.levelStats)||data.levelStats.length>13||JSON.stringify(data.levelStats).length>6500)throw Error('INVALID_LEVEL_STATS');
 return {studentName:data.studentName.trim(),className:data.className.trim(),grade:data.grade,
  stars:data.stars,attempts:data.attempts,correctAnswers:data.correctAnswers,masteredItems:data.masteredItems,
  weeklyAttempts:data.weeklyAttempts,diagnosticDone:data.diagnosticDone===true,
  diagnosticLevel:data.diagnosticLevel??null,highestLevel:data.highestLevel??null,
  levelStats:data.levelStats,privateState:(()=>{
   const state=data.privateState??{};
   if(!state||typeof state!=='object'||Array.isArray(state)||JSON.stringify(state).length>155000)throw Error('INVALID_PRIVATE_STATE');
   for(const key of ['correct','wrong','writing'])if(state[key]!==undefined&&(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key])))throw Error('INVALID_PRIVATE_STATE');
   if(state.activity!==undefined&&(!Array.isArray(state.activity)||state.activity.length>1500))throw Error('INVALID_PRIVATE_STATE');
   return {correct:state.correct||{},wrong:state.wrong||{},writing:state.writing||{},
    activity:state.activity||[],diagnosticScore:state.diagnosticScore??null,
    diagnosticDate:String(state.diagnosticDate||'').slice(0,40),
    journeyIsland:state.journeyIsland??null,
    hiddenObjectsLedger:validHiddenLedger(state.hiddenObjectsLedger??{},data.levelStats)};
  })()};
}

// Oman school week: Sunday 00:01 inclusive through Saturday 23:59:59.999.
// The source of truth is each recorded attempt, not the saved weekly_attempts
// field, which otherwise remains stale across weekly boundaries.
function omanCurrentWeek(now=Date.now()){
 const offset=4*60*60*1000,local=new Date(now+offset);
 const start=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-local.getUTCDay(),0,1)-offset;
 const end=start+7*86400000-60000;
 return {start,end,first:new Date(start+offset).toISOString().slice(0,10),
  last:new Date(start+offset+6*86400000).toISOString().slice(0,10)};
}

function omanPreviousWeek(window:{start:number,end:number,first:string,last:string}){
 const start=window.start-7*86400000;
 return {start,end:window.start-60000,first:new Date(start+4*60*60*1000).toISOString().slice(0,10),
  last:new Date(start+4*60*60*1000+6*86400000).toISOString().slice(0,10)};
}
function countedThisWeek(item:unknown,window:ReturnType<typeof omanCurrentWeek>){
 if(!item||typeof item!=='object'||Array.isArray(item))return false;
 const x=item as Record<string,unknown>;
 if(typeof x.at==='string'){
  const ms=Date.parse(x.at);
  return Number.isFinite(ms)&&ms>=window.start&&ms<window.end;
 }
 // Older app builds kept only a UTC calendar day. This remains a best-effort
 // daily approximation (not proof of the exact minute around Sunday midnight).
 return typeof x.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.day)
  &&x.day>=window.first&&x.day<=window.last;
}

/* WEEKLY_STARS_V1:
 * Count genuine new stars only when the second correct attempt masters a
 * question, NOT for every correct answer. Full history allows lossless
 * reconstruction of existing students' stars; truncated history counts
 * explicitly recorded awards only and is marked partial.
 */
function countWeeklyMasteryStars(events:unknown[], attempts:unknown,
 week:{start:number,end:number,first:string,last:string},
 isInWeek:(event:unknown,window:{start:number,end:number,first:string,last:string})=>boolean){
 const complete=Number.isSafeInteger(Number(attempts))&&Number(attempts)===events.length;
 const seen=new Map<string,number>();
 const levels=Array(13).fill(0);
 let count=0;
 for(const event of events){
  if(!event||typeof event!=='object'||Array.isArray(event))continue;
  const data=event as Record<string,unknown>;
  if(data.ok!==true)continue;
  const id=typeof data.id==='string'?data.id:'';
  const match=/^L(1[0-2]|[0-9])-\d{1,4}$/.exec(id);
  if(!match)continue;
  let earned=0;
  if(complete){
   const previouslyCorrect=seen.get(id)||0;
   if(previouslyCorrect<2){
    seen.set(id,previouslyCorrect+1);
    if(previouslyCorrect===1)earned=1;
   }
  }else if(data.earnedStars===1)earned=1;
  if(earned&&isInWeek(event,week)){count++;levels[Number(match[1])]++}
 }
 return {count,levels,complete,source:complete?'full_attempt_history':'explicit_new_awards'};
}

function computedWeekly(rows:Record<string,unknown>[]):Record<string,unknown>[]{
 const window=omanCurrentWeek();
 return rows.map(row=>{
  const {activity,...publicRow}=row;
  const events=Array.isArray(activity)?activity:[];
  const hits=events.filter(item=>countedThisWeek(item,window));
  const previousWindow=omanPreviousWeek(window);
  const previousHits=events.filter(item=>countedThisWeek(item,previousWindow));
  const earning=countWeeklyMasteryStars(events,row.attempts,window,countedThisWeek);
  const previousEarning=countWeeklyMasteryStars(events,row.attempts,previousWindow,countedThisWeek);
  return {...publicRow,weekly_stars:earning.count,weekly_star_levels:earning.levels,
   weekly_stars_complete:earning.complete,weekly_stars_source:earning.source,
   previous_week_stars:previousEarning.count,previous_week_star_levels:previousEarning.levels,
   previous_week_stars_complete:previousEarning.complete,
   previous_week_attempts:previousHits.length,
   previous_week_correct:previousHits.filter(x=>(x as Record<string,unknown>)?.ok===true).length,
   previous_week_wrong:previousHits.filter(x=>(x as Record<string,unknown>)?.ok===false).length,
   previous_week_start:previousWindow.first,previous_week_end:previousWindow.last,
   weekly_attempts:hits.length,
   weekly_correct:hits.filter(x=>(x as Record<string,unknown>)?.ok===true).length,
   weekly_window_start:window.first,weekly_window_end:window.last,
   weekly_from_activity:true,
   weekly_legacy_dates_approximate:hits.some(x=>!(x as Record<string,unknown>)?.at)};
 });
}

Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin!==ORIGIN)return response(403,{ok:false,error:'INVALID_ORIGIN'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 if(req.method!=='POST')return response(405,{ok:false,error:'METHOD'});
 try{
  const raw=await req.text();
  if(raw.length>180000)return response(413,{ok:false,error:'TOO_LARGE'});
  const body=JSON.parse(raw);
  if(!body||typeof body.action!=='string')return response(400,{ok:false,error:'INVALID_ACTION'});
  if(body.action==='student_save'||body.action==='student_get'){
   const {link,accessHash}=await student(req);
   if(body.action==='student_get'){
    const rows=await db('mej_student_progress?student_ref=eq.'+encodeURIComponent(link.student_ref)+'&select=student_name,class_name,grade,stars,attempts,correct_answers,mastered_items,weekly_attempts,diagnostic_done,diagnostic_level,highest_level,level_stats,revision,updated_at,score_source,private_state');
    return response(200,{ok:true,hasSnapshot:rows.length===1,progress:rows[0]||null,studentRef:link.student_ref});
   }
   if(!isId(body.profileRef)||link.profile_ref!==body.profileRef)return response(403,{ok:false,error:'PROFILE_NOT_ENROLLED'});
   const expected=body.expectedRevision;
   if(!Number.isSafeInteger(expected)||expected<0)return response(400,{ok:false,error:'INVALID_REVISION'});
   const payload=normalized(body.progress||{});
   const saved=await db('rpc/mej_progress_submit',{p_access_hash:accessHash,p_expected_revision:expected,p_payload:payload});
   const result=Array.isArray(saved)?saved[0]:null;
   if(result?.result==='REVISION_CONFLICT')return response(409,{ok:false,error:'REVISION_CONFLICT',serverRevision:result.new_revision});
   if(result?.result!=='SAVED')return response(403,{ok:false,error:'SAVE_REJECTED'});
   return response(200,{ok:true,revision:result.new_revision,updatedAt:result.saved_at,scoreVerification:'CLIENT_REPORTED_UNVERIFIED'});
  }
  if(body.action==='owner_rosters'){
   const id=await google(req);
   // A signed Google ID token is required. Never broaden this privilege to
   // app administrators, school managers or accounts simply holding a code.
   if(id.email!=='rouhous@gmail.com')return response(403,{ok:false,error:'OWNER_REQUIRED'});
   const ownerSub=Deno.env.get('MEJ_OWNER_GOOGLE_SUB');
   if(ownerSub&&ownerSub!==id.sub)return response(403,{ok:false,error:'OWNER_REQUIRED'});
   const licenses=await db('mej_licenses?license_type=in.(owner_unlimited,wadi_2429)&active=eq.true&select=id,license_type,school_name');
   if(!Array.isArray(licenses)||licenses.length!==2)return response(403,{ok:false,error:'LICENSE_INACTIVE'});
   // One owner license issues BOTH private and school codes. Do not use license
   // type alone to classify the owner's pupils: preserve registration scope.
   const scopes=[
     {key:'private',label:'خاص',schoolName:'خارج المدرسة',linkedCount:0,students:[] as unknown[]},
     {key:'school',label:'مدرسة وادي الحواسنة',schoolName:'مدرسة وادي الحواسنة',linkedCount:0,students:[] as unknown[]}
   ];
   for(const licenseType of ['owner_unlimited','wadi_2429']){
    const lic=licenses.find((x:{license_type:string})=>x.license_type===licenseType);
    if(!lic)return response(403,{ok:false,error:'LICENSE_INACTIVE'});
    const links=await db('mej_short_student_links?license_id=eq.'+lic.id+'&select=student_ref,school_name&limit=1000');
    const progress=computedWeekly(await db('mej_student_progress?license_id=eq.'+lic.id+'&select=student_ref,student_name,class_name,grade,stars,attempts,correct_answers,mastered_items,weekly_attempts,activity:private_state->activity,diagnostic_done,diagnostic_level,highest_level,level_stats,updated_at,score_source&limit=1000'));
    const progressByRef=new Map(progress.map((p:{student_ref:string})=>[p.student_ref,p]));
    for(const link of links){
      // The teacher's special private code explicitly sets "خارج المدرسة".
      // All school-code enrollments stay under School regardless of license type.
      const privateLink=licenseType==='owner_unlimited'&&String(link.school_name||'').trim()==='خارج المدرسة';
      const group=privateLink?scopes[0]:scopes[1];
      group.linkedCount++;
      const student=progressByRef.get(link.student_ref);
      if(student)group.students.push(student);
    }
   }
   return response(200,{ok:true,role:'owner_teacher',teacherName:'المالك',scopes,
      verification:'CLIENT_REPORTED_UNVERIFIED'});
  }
  if(body.action==='teacher_roster'||body.action==='school_summary'){
   const id=await google(req);
   if(body.action==='teacher_roster'){
    const teachers=await db('mej_verified_teachers?google_email=eq.'+encodeURIComponent(id.email)+'&verification_state=eq.verified&select=id,teacher_name,classes,license_id');
    if(teachers.length!==1){
      // The verified app owner may also use the teacher dashboard. Do not
      // impersonate another teacher or expose their records. If not yet linked
      // to a teacher profile, return an accurate empty private roster.
      if(id.email==='rouhous@gmail.com' && teachers.length===0){
        const owned=await db('mej_licenses?license_type=eq.wadi_2429&active=eq.true&select=id,school_name');
        if(owned.length!==1)return response(403,{ok:false,error:'LICENSE_INACTIVE'});
        return response(200,{ok:true,role:'owner_teacher',teacherName:'حساب المالك',schoolName:owned[0].school_name,
          classes:'',students:[],importedTrialStudents:[],verification:'CLIENT_REPORTED_UNVERIFIED',
          profileNotice:'OWNER_TEACHER_PROFILE_NOT_LINKED'});
      }
      return response(403,{ok:false,error:'NOT_VERIFIED_TEACHER'});
    }
    const license=await db('mej_licenses?id=eq.'+teachers[0].license_id+'&active=eq.true&select=id,school_name');
    if(license.length!==1)return response(403,{ok:false,error:'LICENSE_INACTIVE'});
    const rows=computedWeekly(await db('mej_student_progress?teacher_id=eq.'+teachers[0].id+'&license_id=eq.'+teachers[0].license_id+'&select=student_ref,student_name,class_name,grade,stars,attempts,correct_answers,mastered_items,weekly_attempts,activity:private_state->activity,diagnostic_done,diagnostic_level,highest_level,level_stats,updated_at,score_source&order=class_name.asc,student_name.asc&limit=1000'));
    const imported=await db('mej_imported_trial_students?teacher_id=eq.'+teachers[0].id+'&license_id=eq.'+teachers[0].license_id+'&select=id,source_key,source_tab,student_name,class_name,grade,highest_level,mastery_percent,stars,weekly_attempts,source_kind&order=class_name.asc,student_name.asc&limit=1000');
    return response(200,{ok:true,role:'teacher',teacherName:teachers[0].teacher_name,schoolName:license[0].school_name,classes:teachers[0].classes,students:rows,importedTrialStudents:imported,verification:'CLIENT_REPORTED_UNVERIFIED'});
   }
   const managers=await db('mej_school_accounts?google_sub=eq.'+encodeURIComponent(id.sub)+'&google_email=eq.'+encodeURIComponent(id.email)+'&active=eq.true&select=license_id,school_name');
   if(managers.length!==1)return response(403,{ok:false,error:'NOT_SCHOOL_MANAGER'});
   const schoolLicense=await db('mej_licenses?id=eq.'+managers[0].license_id+'&active=eq.true&select=id,school_name');
   if(schoolLicense.length!==1)return response(403,{ok:false,error:'LICENSE_INACTIVE'});
   const teachers=await db('mej_verified_teachers?license_id=eq.'+managers[0].license_id+'&verification_state=eq.verified&select=id,teacher_name,classes&order=teacher_name.asc&limit=500');
   const live=computedWeekly(await db('mej_student_progress?license_id=eq.'+managers[0].license_id+'&select=student_ref,teacher_id,student_name,class_name,grade,stars,attempts,correct_answers,mastered_items,weekly_attempts,activity:private_state->activity,diagnostic_done,diagnostic_level,highest_level,level_stats,updated_at,score_source&order=class_name.asc,student_name.asc&limit=1000'));
   const imported=await db('mej_imported_trial_students?license_id=eq.'+managers[0].license_id+'&select=id,teacher_id,source_tab,student_name,class_name,grade,highest_level,mastery_percent,stars,weekly_attempts,source_kind&order=class_name.asc,student_name.asc&limit=1000');
   const allowedIds=new Set(teachers.map((t:{id:string})=>t.id));
   const students=live.filter((x:{teacher_id:string})=>allowedIds.has(x.teacher_id));
   const importedTrialStudents=imported.filter((x:{teacher_id:string})=>allowedIds.has(x.teacher_id));
   return response(200,{ok:true,role:'school_manager',schoolName:schoolLicense[0].school_name,
    teachers:teachers.map((t:{id:string,teacher_name:string,classes:string})=>({id:t.id,name:t.teacher_name,classes:t.classes,
     studentCount:students.filter((x:{teacher_id:string})=>x.teacher_id===t.id).length,
     trialCount:importedTrialStudents.filter((x:{teacher_id:string})=>x.teacher_id===t.id).length})),
    students,importedTrialStudents,verification:'CLIENT_REPORTED_UNVERIFIED'});
  }
  return response(400,{ok:false,error:'INVALID_ACTION'});
 }catch(err){
  const message=String(err instanceof Error?err.message:err);
  const status=/LOGIN_REQUIRED|NOT_VERIFIED|NOT_SCHOOL_MANAGER|LICENSE_INACTIVE/.test(message)?403:/INVALID_/.test(message)?400:503;
  return response(status,{ok:false,error:status===503?'SERVICE_UNAVAILABLE':message.slice(0,70)});
 }
});