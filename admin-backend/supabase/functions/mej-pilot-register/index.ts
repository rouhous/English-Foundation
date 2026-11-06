// Limited self-enrolment for the public My English Journey pilot.
// Seat counts are allocated atomically in private PostgreSQL via an internal RPC.
// This endpoint accepts opaque account fingerprints, never names or contact data.
const SITE='https://rouhous.github.io';
function response(status:number, body:Record<string,unknown>, origin:string|null){
 return new Response(JSON.stringify(body),{status,headers:{
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  'x-content-type-options':'nosniff',
  ...(origin===SITE?{'access-control-allow-origin':SITE,'vary':'Origin'}:{})
 }});
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin!==SITE)return response(403,{ok:false,error:'INVALID_ORIGIN'},origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{
  'access-control-allow-origin':SITE,
  'access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'content-type',
  'access-control-max-age':'600',
  'vary':'Origin'
 }});
 if(req.method!=='POST')return response(405,{ok:false,error:'METHOD'},origin);
 try{
  const raw=await req.text();
  if(raw.length>700)throw Error('OVERSIZE');
  const body=JSON.parse(raw);
  // Teacher accounts are not self-enrolled: these require a separately
  // authenticated teacher-registration service to protect reserved seats.
  if(body.role!=='student')return response(403,{ok:false,error:'ROLE_NOT_ENABLED'},origin);
  const accountRef=String(body.accountRef||'');
  const invite=String(body.teacherInvite||'').trim().toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(accountRef))
   return response(400,{ok:false,error:'INVALID_ACCOUNT'},origin);
  if(!/^[a-f0-9]{48}$/.test(invite))
   return response(400,{ok:false,error:'INVALID_TEACHER_INVITE'},origin);
  const bytes=new TextEncoder().encode(invite);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const inviteHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const base=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)throw Error('SERVER_CONFIG');
  const result=await fetch(base+'/rest/v1/rpc/mej_student_enroll_for_teacher',{
   method:'POST',
   headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({p_account_ref:accountRef,p_invite_hash:inviteHash}),
   signal:AbortSignal.timeout(5500)
  });
  if(!result.ok){if(result.status===400)return response(403,{ok:false,error:'INVITE_NOT_APPROVED'},origin);throw Error('CAPACITY_DB');}
  const rows=await result.json();
  const status=rows?.[0]?.result;
  if(status==='full')return response(409,{ok:false,error:'PILOT_FULL',contact:'https://wa.me/96898262956'},origin);
  if(status==='reserved'||status==='existing')return response(200,{ok:true,enrolled:true,existing:status==='existing'},origin);
  throw Error('INVALID_RESULT');
 }catch(_){return response(503,{ok:false,error:'ENROLMENT_UNAVAILABLE'},origin)}
});
