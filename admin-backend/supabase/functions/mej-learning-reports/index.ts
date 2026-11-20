import {createRemoteJWKSet,jwtVerify} from 'npm:jose@6.1.0';
const ORIGIN='https://rouhous.github.io';
const AUD='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const JWKS=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const BASE=Deno.env.get('SUPABASE_URL')||'';
const SECRET=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const OWNER_EMAIL='rouhous@gmail.com';
const CORS={'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'authorization,content-type','vary':'Origin'};
const max=(v:unknown,m=1000000)=>Number.isFinite(Number(v))?Math.max(0,Math.min(m,Math.trunc(Number(v)))):0;
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f-]{36}$/.test(v);
const studentId=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
function reply(status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:{...CORS,'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
async function fetchDb(query:string){
 if(!BASE||!SECRET)throw Error('SERVER_UNAVAILABLE');
 const res=await fetch(BASE+'/rest/v1/'+query,{headers:{apikey:SECRET,authorization:'Bearer '+SECRET,'accept':'application/json'},signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw Error('DATABASE_UNAVAILABLE');
 return await res.json();
}
async function identity(req:Request){
 const h=req.headers.get('authorization')||'';
 if(!/^Bearer [^ ]+$/.test(h)||h.length>8200)throw Error('GOOGLE_LOGIN_REQUIRED');
 let payload;try{({payload}=await jwtVerify(h.slice(7),JWKS,{audience:AUD,issuer:['accounts.google.com','https://accounts.google.com'],algorithms:['RS256'],clockTolerance:'30 seconds'}))}catch(_){throw Error('GOOGLE_LOGIN_REQUIRED')}
 if(payload.email_verified!==true||typeof payload.sub!=='string'||typeof payload.email!=='string')throw Error('GOOGLE_LOGIN_REQUIRED');
 return {email:payload.email.toLowerCase(),sub:payload.sub};
}
function getPart(item:unknown,id:string){return item&&typeof item==='object'&&!Array.isArray(item)?(item as Record<string,unknown>)[id]:null}
// Read-only activity for the current Oman school week. Existing day-only
// records are approximate at Sunday midnight; new "at" timestamps are exact.
function omanWeek(now=Date.now()){
 const off=4*60*60*1000,d=new Date(now+off);
 const start=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-d.getUTCDay(),0,1)-off;
 return {start,end:start+7*86400000-60000,
  first:new Date(start+off).toISOString().slice(0,10),
  last:new Date(start+off+6*86400000).toISOString().slice(0,10)};
}
function withinOmanWeek(item:unknown,week:ReturnType<typeof omanWeek>){
 if(!item||typeof item!=='object'||Array.isArray(item))return false;
 const x=item as Record<string,unknown>;
 if(typeof x.at==='string'){const ms=Date.parse(x.at);return Number.isFinite(ms)&&ms>=week.start&&ms<week.end}
 return typeof x.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.day)&&x.day>=week.first&&x.day<=week.last;
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

function studentReport(row:Record<string,unknown>){
 const state=(row.private_state&&typeof row.private_state==='object'&&!Array.isArray(row.private_state)?row.private_state:{}) as Record<string,unknown>;
 const wrong=(state.wrong&&typeof state.wrong==='object'&&!Array.isArray(state.wrong)?state.wrong:{}) as Record<string,unknown>;
 const correct=(state.correct&&typeof state.correct==='object'&&!Array.isArray(state.correct)?state.correct:{}) as Record<string,unknown>;
 const log=Array.isArray(state.activity)?state.activity.slice(-1500):[];
 const window=omanWeek();
 const currentWeek=log.filter(x=>withinOmanWeek(x,window));
 const earning=countWeeklyMasteryStars(log,row.attempts,window,withinOmanWeek);
 const weeklyCorrect=currentWeek.filter(x=>(x as Record<string,unknown>)?.ok===true).length;
 const weeklyWrong=currentWeek.filter(x=>(x as Record<string,unknown>)?.ok===false).length;

 const lastMistake=new Map<string,string>();
 const days=new Map<string,{day:string,wrong:number,correct:number}>();
 let loggedWrong=0,loggedCorrect=0;
 for(const entry of log){
  const x=entry as Record<string,unknown>;
  if(!x||typeof x!=='object'||!studentIdLike(x.id))continue;
  const day=typeof x.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.day)?x.day:null;
  if(x.ok===false){loggedWrong++;if(day)lastMistake.set(String(x.id),day)}
  if(x.ok===true)loggedCorrect++;
  if(day&&(x.ok===true||x.ok===false)){
   const info=days.get(day)||{day,wrong:0,correct:0};
   if(x.ok===false)info.wrong++;else info.correct++;
   days.set(day,info)
  }
 }
 const items=[];
 let wrongAttempts=0,repeatItems=0,unresolved=0,masteredAfter=0;
 for(const [id,value] of Object.entries(wrong)){
  if(!studentIdLike(id))continue;
  const n=max(value,1000000);
  if(n<=0)continue;
  const c=max(getPart(correct,id),1000000);
  wrongAttempts+=n;
  if(n>=2)repeatItems++;
  if(c<2)unresolved++;else masteredAfter++;
  items.push({id,level:Number(/^L(\d+)-/.exec(id)?.[1]||0),wrong:n,correct:c,lastError:lastMistake.get(id)||null,mastered:c>=2});
 }
 items.sort((a,b)=>b.wrong-a.wrong||a.level-b.level||a.id.localeCompare(b.id));
 return {studentRef:row.student_ref,studentName:String(row.student_name||'طالب').slice(0,120),
  className:String(row.class_name||'').slice(0,40),grade:max(row.grade,12),
  stars:max(row.stars,3250),attempts:max(row.attempts,10000000),
  weeklyAttempts:currentWeek.length,weeklyCorrect,weeklyWrong,
  weeklyStars:earning.count,weeklyStarLevels:earning.levels,
  weeklyStarsComplete:earning.complete,weeklyStarsSource:earning.source,
  weeklyStart:window.first,weeklyEnd:window.last,
  weeklyLegacyApproximate:currentWeek.some(x=>!(x as Record<string,unknown>)?.at),
  correctAnswers:max(row.correct_answers,10000000),updatedAt:row.updated_at||null,
  wrongAttempts,repeatItems,unresolved,masteredAfter,
  loggedWrong,loggedCorrect,historyCoverage:'latest_1500_events_max',
  items:items.slice(0,1200),days:[...days.values()].sort((a,b)=>a.day.localeCompare(b.day))};
}
function studentIdLike(id:unknown){return typeof id==='string'&&/^L(?:[0-9]|1[0-2])-\d{1,4}$/.test(id)}
async function activeLicenses(){
 const list=await fetchDb('mej_licenses?license_type=in.(owner_unlimited,wadi_2429)&active=eq.true&select=id,license_type,school_name');
 return Array.isArray(list)?list:[]
}
const columns='student_ref,student_name,class_name,grade,stars,attempts,correct_answers,updated_at,private_state';
async function teacherRows(id:{email:string,sub:string},className:string|null,studentRef:string|null){
 const teachers=await fetchDb('mej_verified_teachers?google_email=eq.'+encodeURIComponent(id.email)+'&verification_state=eq.verified&select=id,license_id,google_sub');
 if(teachers.length!==1||!uuid(teachers[0].id))throw Error('NOT_VERIFIED_TEACHER');
 if(teachers[0].google_sub&&teachers[0].google_sub!==id.sub)throw Error('NOT_VERIFIED_TEACHER');
 const license=await fetchDb('mej_licenses?id=eq.'+teachers[0].license_id+'&active=eq.true&select=id');
 if(license.length!==1)throw Error('LICENSE_INACTIVE');
 let path='mej_student_progress?teacher_id=eq.'+teachers[0].id+'&license_id=eq.'+teachers[0].license_id+'&select='+columns;
 if(className)path+='&class_name=eq.'+encodeURIComponent(className);
 if(studentRef)path+='&student_ref=eq.'+studentRef;
 path+='&order=class_name.asc,student_name.asc&limit=1000';
 return await fetchDb(path)
}
async function ownerRows(id:{email:string,sub:string},scope:string,className:string|null,studentRef:string|null){
 if(id.email!==OWNER_EMAIL||!['private','school'].includes(scope))throw Error('OWNER_REQUIRED');
 const ownerSub=Deno.env.get('MEJ_OWNER_GOOGLE_SUB');
 if(ownerSub&&ownerSub!==id.sub)throw Error('OWNER_REQUIRED');
 const licenses=await activeLicenses();
 if(!licenses.some((x:{license_type:string})=>x.license_type==='owner_unlimited')||!licenses.some((x:{license_type:string})=>x.license_type==='wadi_2429'))throw Error('LICENSE_INACTIVE');
 const rows=[];
 for(const license of licenses){
  const links=await fetchDb('mej_short_student_links?license_id=eq.'+license.id+'&select=student_ref,school_name&limit=1000');
  const allowed=links.filter((link:{student_ref:string,school_name:string})=>{
   const isPrivate=license.license_type==='owner_unlimited'&&String(link.school_name||'').trim()==='خارج المدرسة';
   return (scope==='private'?isPrivate:!isPrivate)&&(!studentRef||studentRef===link.student_ref)
  }).map((link:{student_ref:string})=>link.student_ref).filter(studentId);
  for(let n=0;n<allowed.length;n+=35){
   const refs=allowed.slice(n,n+35);
   const filter='mej_student_progress?license_id=eq.'+license.id+'&student_ref=in.('+refs.join(',')+')&select='+columns+'&limit=35';
   const fetched=await fetchDb(filter);
   const secure=new Set(refs);
   for(const p of fetched){
    if(!secure.has(p.student_ref))continue;
    if(className&&p.class_name!==className)continue;
    rows.push(p)
   }
  }
 }
 return rows
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin');
 if(origin!==ORIGIN)return reply(403,{ok:false,error:'INVALID_ORIGIN'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 if(req.method!=='POST')return reply(405,{ok:false,error:'METHOD'});
 try{
  const body=await req.json();
  if(body?.action!=='teacher_diagnostics')return reply(400,{ok:false,error:'INVALID_ACTION'});
  const className=body.className==null||body.className===''?null:String(body.className);
  const studentRef=body.studentRef==null?null:String(body.studentRef);
  if((className&&(className.length>35||/[&?%]/.test(className)))||(studentRef&&!studentId(studentRef)))return reply(400,{ok:false,error:'INVALID_FILTER'});
  const id=await identity(req);
  const isOwner=id.email===OWNER_EMAIL;
  const scope=String(body.scope||'teacher');
  if(!isOwner&&scope!=='teacher')return reply(403,{ok:false,error:'INVALID_SCOPE'});
  const rows=isOwner?await ownerRows(id,scope,className,studentRef):await teacherRows(id,className,studentRef);
  const reports=rows.map(studentReport);
  return reply(200,{ok:true,scope,studentCount:reports.length,reports,source:'CLIENT_REPORTED_UNVERIFIED',historyLimit:1500});
 }catch(err){
  const message=String(err instanceof Error?err.message:err);
  const code=/GOOGLE_LOGIN_REQUIRED|NOT_VERIFIED_TEACHER|OWNER_REQUIRED|LICENSE_INACTIVE|INVALID_SCOPE/.test(message)?403:/INVALID_ACTION|INVALID_FILTER/.test(message)?400:503;
  return reply(code,{ok:false,error:code===503?'SERVICE_UNAVAILABLE':message.slice(0,70)});
 }
});