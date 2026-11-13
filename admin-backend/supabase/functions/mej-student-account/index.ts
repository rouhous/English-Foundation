/* MEJ Student Identity V1 — unique student identity, auto-issued recovery code.
 * This is a custom-token endpoint: verify_jwt=false; all privileges remain server-side.
 * A recovered device replaces the previous device session; stars/progress stay on the same student_ref.
 */
const ORIGIN='https://rouhous.github.io';
const BASE=Deno.env.get('SUPABASE_URL')||'';
const SECRET=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const H={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,content-type','Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
const hex=/^[a-f0-9]{64}$/;
const digits=s=>String(s||'').trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
const full=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
const grade=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=12?Number(n):null;
function response(code,data){return new Response(JSON.stringify(data),{status:code,headers:H})}
async function sha(s){const b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function code20(){const ab='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',a=crypto.getRandomValues(new Uint8Array(20));return Array.from(a,x=>ab[x%ab.length]).join('')}
function formatCode(s){return s.match(/.{1,5}/g).join('-')}
function cleanCode(s){return String(s||'').toUpperCase().replace(/[\s-]/g,'')}
async function api(path,method='GET',value){
 if(!BASE||!SECRET)throw Error('SERVER_UNAVAILABLE');
 const res=await fetch(BASE+'/rest/v1/'+path,{method,headers:{apikey:SECRET,authorization:'Bearer '+SECRET,'Content-Type':'application/json','Prefer':'return=representation'},...(value===undefined?{}:{body:JSON.stringify(value)}),signal:AbortSignal.timeout(9000)});
 const raw=await res.text();let data;try{data=JSON.parse(raw)}catch(_){data=[]}
 if(!res.ok){let e=new Error(res.status===409?'ALREADY_REGISTERED':'SERVER_UNAVAILABLE');e.status=res.status;throw e}
 return data;
}
function scope(x){return String(x.license_id)+'|'+(x.teacher_id||'owner')+'|'+full(x.school_name||'')}
async function invitation(teacherCode){
 const code=digits(teacherCode);
 if(!/^[0-9]{6}$/.test(code))throw Error('INVALID_TEACHER_CODE');
 const inv=await api('mej_short_invites?code_hash=eq.'+await sha(code)+'&active=eq.true&select=invite_type,license_id,teacher_id,school_label');
 const v=inv[0];
 if(inv.length!==1||!['teacher_student','owner_student','owner_student_secondary'].includes(v.invite_type))throw Error('INVALID_TEACHER_CODE');
 const licenses=await api('mej_licenses?id=eq.'+encodeURIComponent(v.license_id)+'&active=eq.true&select=id,school_name');
 if(licenses.length!==1)throw Error('INVALID_TEACHER_CODE');
 return {license_id:v.license_id,teacher_id:v.teacher_id,school_name:v.invite_type==='teacher_student'?licenses[0].school_name:v.school_label};
}
async function student(request){
 const header=request.headers.get('authorization')||'';
 const token=header.startsWith('Bearer ')?header.slice(7):'';
 if(!hex.test(token))throw Error('STUDENT_LOGIN_REQUIRED');
 const rows=await api('mej_short_student_links?access_hash=eq.'+await sha(token)+'&select=student_ref,license_id,teacher_id,school_name,profile_ref');
 if(rows.length!==1)throw Error('STUDENT_LOGIN_REQUIRED');
 const l=await api('mej_licenses?id=eq.'+rows[0].license_id+'&active=eq.true&select=id');
 if(l.length!==1)throw Error('STUDENT_LOGIN_REQUIRED');
 return rows[0];
}
async function attempt(req,tag,ok){
 const ip=String(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'').split(',')[0].slice(0,70);
 const key=await sha('account:v1:'+tag+':'+ip);
 const v=await api('rpc/mej_short_attempt','POST',{p_actor:key,p_action:'student_join',p_ok:ok,p_limit:8});
 if(v!==true)throw Error('TOO_MANY_ATTEMPTS');
}
async function getIdentity(studentRef){
 const found=await api('mej_student_identities?student_ref=eq.'+studentRef+'&select=student_ref,scope_key,name_key,grade,recovery_hash');
 return found[0]||null;
}
async function setCode(studentRef,extra={}){
 const raw=code20();
 const hash=await sha('MEJ-STUDENT-CODE-V1:'+raw);
 const updates=await api('mej_student_identities?student_ref=eq.'+studentRef,'PATCH',{...extra,recovery_hash:hash,updated_at:new Date().toISOString()});
 if(updates.length!==1)throw Error('ACCOUNT_NOT_FOUND');
 return formatCode(raw);
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin!==ORIGIN)return response(403,{ok:false,error:'INVALID_ORIGIN'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:H});
 if(req.method!=='POST')return response(405,{ok:false,error:'POST_ONLY'});
 try{
  const text=await req.text();if(text.length>600000)return response(413,{ok:false,error:'TOO_LARGE'});
  const input=JSON.parse(text);if(!input||typeof input.action!=='string')throw Error('INVALID_ACTION');
  if(input.action.startsWith('free_')){
   const action=input.action,n=full(input.name),g=String(input.grade),ref=String(input.profileRef||'');
   if(!n||n.length>160||(!grade(g)&&g!=='other')||!hex.test(ref))throw Error('INVALID_PROFILE');
   const where='name_key=eq.'+encodeURIComponent(n)+'&grade=eq.'+g;
   if(action==='free_register'){
    const raw=code20(),snapshot=input.snapshot||{};
    await attempt(req,'free-register',false);
    await api('mej_free_profiles','POST',{name_key:n,grade:g,profile_ref:ref,recovery_hash:await sha(raw),snapshot});
    return response(200,{ok:true,recoveryCode:formatCode(raw),revision:0});
   }
   const code=cleanCode(input.recoveryCode);
   if(!/^[A-HJ-NP-Z2-9]{20}$/.test(code))throw Error('INVALID_RECOVERY_DETAILS');
   const auth='recovery_hash=eq.'+await sha(code);
   if(action==='free_recover'){
    await attempt(req,'free-recover:'+n,false);
    const rows=await api('mej_free_profiles?'+where+'&'+auth,'PATCH',{profile_ref:ref});
    if(rows.length!==1)throw Error('RECOVERY_CODE_NOT_VALID');
    return response(200,{ok:true,snapshot:rows[0].snapshot,revision:rows[0].revision});
   }
   if(action==='free_save'){
    const rev=input.revision;
    if(!Number.isSafeInteger(rev)||rev<0||!input.snapshot)throw Error('INVALID_PROFILE');
    const rows=await api('mej_free_profiles?profile_ref=eq.'+ref+'&'+auth+'&revision=eq.'+rev,'PATCH',{name_key:n,grade:g,snapshot:input.snapshot,revision:rev+1});
    if(rows.length!==1)return response(409,{ok:false,error:'REVISION_CONFLICT'});
    return response(200,{ok:true,revision:rev+1});
   }
   throw Error('INVALID_ACTION');
  }
  if(input.action==='register'){
   const parts=input.parts,g=grade(input.grade),ref=String(input.profileRef||'');
   if(!Array.isArray(parts)||parts.length!==4||parts.some(x=>typeof x!=='string'||!x.trim()||x.length>30)||!g||!hex.test(ref))throw Error('INVALID_PROFILE');
   const n=full(parts.join(' ')),inv=await invitation(input.teacherCode);
   await attempt(req,'register:'+n,false);
   const known=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(n)+'&grade=eq.'+g+'&select=grade');
   if(known.length)throw Error('ALREADY_REGISTERED');
   // Guard older three-part names without requiring legacy students to edit them.
   const firstThree=parts.slice(0,3).map(full).join(' ');
   if(firstThree!==n){
    const legacy=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(firstThree)+'&grade=eq.'+g+'&select=student_ref');
    if(legacy.length)throw Error('ALREADY_REGISTERED');
   }
   const rand=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
   const st=rand(),access=rand(),raw=code20();
   const result=await api('rpc/mej_register_named_student','POST',{p_code_hash:await sha(digits(input.teacherCode)),p_student_ref:st,p_profile_ref:ref,p_access_hash:await sha(access),p_name:n,p_grade:g,p_recovery_hash:await sha('MEJ-STUDENT-CODE-V1:'+raw)});
   if(result!=='activated')throw Error(result==='full'?'LICENSE_CAPACITY_REACHED':'INVALID_TEACHER_CODE');
   return response(200,{ok:true,accessToken:access,studentRef:st,recoveryCode:formatCode(raw),schoolName:inv.school_name,teacherLinked:!!inv.teacher_id});
  }
  if(input.action==='check'){
   const n=full(input.name),g=grade(input.grade);
   if(!g||n.length<3||n.length>120)throw Error('INVALID_NAME_GRADE');
   const inv=await invitation(input.teacherCode);
   await attempt(req,'check:'+n+':'+String(inv.license_id),false);
   const found=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(n)+'&grade=eq.'+g+'&select=student_ref');
   let registered=found.length>0;
   const pieces=n.split(' ').filter(Boolean);
   if(!registered&&pieces.length===4){
    const legacy=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(pieces.slice(0,3).join(' '))+'&grade=eq.'+g+'&select=student_ref');
    registered=legacy.length>0;
   }
   return response(200,{ok:true,alreadyRegistered:registered});
  }
  if(input.action==='recover'){
   const n=full(input.name),g=grade(input.grade),code=cleanCode(input.recoveryCode);
   const newProfileRef=String(input.newProfileRef||'');
   if(!g||n.length<3||!hex.test(newProfileRef)||!/^([A-HJ-NP-Z2-9]{20})$/.test(code))throw Error('INVALID_RECOVERY_DETAILS');
   const inv=await invitation(input.teacherCode);
   await attempt(req,'recover:'+n+':'+String(inv.license_id),true);
   const hash=await sha('MEJ-STUDENT-CODE-V1:'+code);
   let rows=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(n)+'&grade=eq.'+g+'&recovery_hash=eq.'+hash+'&select=student_ref');
   const pieces=n.split(' ').filter(Boolean);
   if(rows.length===0&&pieces.length===4){
    rows=await api('mej_student_identities?scope_key=eq.'+encodeURIComponent(scope(inv))+'&name_key=eq.'+encodeURIComponent(pieces.slice(0,3).join(' '))+'&grade=eq.'+g+'&recovery_hash=eq.'+hash+'&select=student_ref');
   }
   if(rows.length!==1){await attempt(req,'recover:'+n+':'+String(inv.license_id),false);return response(403,{ok:false,error:'RECOVERY_CODE_NOT_VALID'});}
   const st=rows[0].student_ref;
   const access=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
   const links=await api('mej_short_student_links?student_ref=eq.'+st,'PATCH',{access_hash:await sha(access),profile_ref:newProfileRef});
   if(links.length!==1)throw Error('RESTORE_FAILED');
   const progress=await api('mej_student_progress?student_ref=eq.'+st+'&select=student_name,class_name,grade,stars,attempts,correct_answers,diagnostic_done,diagnostic_level,highest_level,private_state,revision,updated_at');
   return response(200,{ok:true,accessToken:access,studentRef:st,profileRef:newProfileRef,schoolName:links[0].school_name||'',teacherLinked:!!links[0].teacher_id,progress:progress[0]||null});
  }
  if(['claim','rotate','status'].includes(input.action)){
   const l=await student(req),identity=await getIdentity(l.student_ref);
   if(input.action==='status')return response(200,{ok:true,hasCode:!!identity?.recovery_hash,registered:!!identity});
   if(input.action==='rotate'){
    if(!identity)throw Error('REGISTER_FIRST');
    const recoveryCode=await setCode(l.student_ref);
    return response(200,{ok:true,recoveryCode});
   }
   const n=full(input.name),g=grade(input.grade),profileRef=String(input.profileRef||'');
   if(!hex.test(profileRef)||l.profile_ref!==profileRef||!g||n.length<3||n.length>120)throw Error('INVALID_PROFILE');
   const key=scope(l),time=new Date().toISOString();
   if(identity){
    const changed=identity.name_key!==n||identity.grade!==g||identity.scope_key!==key;
    if(changed)await api('mej_student_identities?student_ref=eq.'+l.student_ref,'PATCH',{name_key:n,grade:g,scope_key:key,updated_at:time});
    if(!identity.recovery_hash){const recoveryCode=await setCode(l.student_ref);return response(200,{ok:true,registered:true,recoveryCode,existing:true})}
    return response(200,{ok:true,registered:true,existing:true,hasCode:true});
   }
   const raw=code20(),hash=await sha('MEJ-STUDENT-CODE-V1:'+raw);
   await api('mej_student_identities','POST',{student_ref:l.student_ref,scope_key:key,name_key:n,grade:g,recovery_hash:hash,created_at:time,updated_at:time});
   return response(200,{ok:true,registered:true,existing:false,recoveryCode:formatCode(raw)});
  }
  throw Error('INVALID_ACTION');
 }catch(e){
  const err=String(e?.message||'SERVICE_UNAVAILABLE');
  const status=['ALREADY_REGISTERED','LICENSE_CAPACITY_REACHED'].includes(err)?409:err==='TOO_MANY_ATTEMPTS'?429:/INVALID_/.test(err)?400:/LOGIN_REQUIRED|NOT_VALID|REGISTER_FIRST/.test(err)?403:503;
  return response(status,{ok:false,error:status===503?'SERVICE_UNAVAILABLE':err});
 }
});
