const ORIGIN='https://rouhous.github.io';
const BASE=Deno.env.get('SUPABASE_URL')||'';
const SECRET=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const cors={'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'authorization,content-type','vary':'Origin'};
const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:{...cors,'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const hex=(v:string)=>/^[a-f0-9]{64}$/.test(v);
async function digest(s:string){const x=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(x),b=>b.toString(16).padStart(2,'0')).join('')}
async function get(path:string){if(!BASE||!SECRET)throw Error('CONFIG');const r=await fetch(BASE+'/rest/v1/'+path,{headers:{apikey:SECRET,authorization:'Bearer '+SECRET,accept:'application/json'},signal:AbortSignal.timeout(8500)});if(!r.ok)throw Error('DATABASE');return r.json()}
Deno.serve(async(req:Request)=>{
 if(req.headers.get('origin')!==ORIGIN)return reply(403,{ok:false,error:'ORIGIN'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply(405,{ok:false,error:'METHOD'});
 try{
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  if(!hex(token))return reply(403,{ok:false,error:'STUDENT_LOGIN_REQUIRED'});
  const body=await req.json().catch(()=>null);
  if(body?.action!=='my_class')return reply(400,{ok:false,error:'ACTION'});
  const links=await get('mej_short_student_links?access_hash=eq.'+await digest(token)+'&select=student_ref,license_id,teacher_id,profile_ref,school_name');
  if(links.length!==1||!hex(links[0].profile_ref||''))return reply(403,{ok:false,error:'PROFILE_NOT_LINKED'});
  const self=links[0];
  if(typeof self.school_name!=='string'||!self.school_name.trim())return reply(403,{ok:false,error:'SCHOOL_NOT_LINKED'});
  const licenses=await get('mej_licenses?id=eq.'+self.license_id+'&active=eq.true&select=id');
  if(licenses.length!==1)return reply(403,{ok:false,error:'LICENSE_INACTIVE'});
  const own=await get('mej_student_progress?student_ref=eq.'+encodeURIComponent(self.student_ref)+'&select=student_ref,student_name,class_name,grade,stars,score_source,teacher_id,license_id');
  if(own.length!==1)return reply(200,{ok:false,error:'NO_SAVED_PROGRESS'});
  const me=own[0];
  if(!me.class_name||!me.grade||me.license_id!==self.license_id||me.teacher_id!==self.teacher_id)return reply(403,{ok:false,error:'CLASS_NOT_LINKED'});
  const rows=await get('mej_student_progress?license_id=eq.'+self.license_id+'&grade=eq.'+me.grade+'&select=student_ref,student_name,class_name,teacher_id,stars,score_source&limit=1000');
  const schoolLinks=await get('mej_short_student_links?license_id=eq.'+
    encodeURIComponent(self.license_id)+'&school_name=eq.'+
    encodeURIComponent(self.school_name)+'&select=student_ref,teacher_id&limit=1500');
  const permitted=new Set(schoolLinks.filter((l:any)=>l.teacher_id===self.teacher_id).map((l:any)=>l.student_ref));
  if(!permitted.has(self.student_ref))return reply(403,{ok:false,error:'SCHOOL_SCOPE_MISMATCH'});
  // Competition ranking is fail-closed: browser-submitted snapshots remain visible
  // in teacher reports, but never enter a public/class leaderboard as certified scores.
  const eligible=rows.filter((s:any)=>permitted.has(s.student_ref)&&
    s.class_name===me.class_name&&s.teacher_id===self.teacher_id&&
    s.score_source==='SERVER_VERIFIED');
  eligible.sort((a:any,b:any)=>b.stars-a.stars||String(a.student_name).localeCompare(String(b.student_name),'ar'));
  let rank=0,prev:number|null=null;
  const entries=eligible.map((s:any,i:number)=>{if(s.stars!==prev)rank=i+1;prev=s.stars;return {name:String(s.student_name||'طالب').slice(0,80),stars:s.stars,rank,isMe:s.student_ref===self.student_ref}});
  if(!entries.some((e:any)=>e.isMe))return reply(200,{ok:true,verified:false,error:'NO_SERVER_VERIFIED_RESULTS',scoreVerification:'SERVER_VERIFIED_ONLY',className:me.class_name,entries:[],eligibleCount:0});
  return reply(200,{ok:true,verified:true,scope:'OWN_VERIFIED_CLASS',scoreVerification:'SERVER_VERIFIED',className:me.class_name,entries,eligibleCount:entries.length});
 }catch(_){return reply(503,{ok:false,error:'SERVICE_UNAVAILABLE'})}
});