import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';
const CLIENT_ID='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const OWNER='rouhous@gmail.com';
const SITE='https://rouhous.github.io';
const JWKS=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
function reply(status:number,data:Record<string,unknown>,origin:string|null){
 return new Response(JSON.stringify(data),{status,headers:{
  'content-type':'application/json; charset=utf-8','cache-control':'no-store',
  'x-content-type-options':'nosniff',
  ...(origin===SITE?{'access-control-allow-origin':SITE,'vary':'Origin'}:{})
 }});
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin!==SITE)return reply(403,{ok:false,error:'INVALID_ORIGIN'},origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{
  'access-control-allow-origin':SITE,
  'access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'authorization, content-type',
  'access-control-max-age':'600','vary':'Origin'
 }});
 if(req.method!=='POST')return reply(405,{ok:false,error:'METHOD_NOT_ALLOWED'},origin);
 try{
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer ')||auth.length>8210)throw Error('INVALID_TOKEN');
  const {payload}=await jwtVerify(auth.slice(7),JWKS,{
   audience:CLIENT_ID,
   issuer:['accounts.google.com','https://accounts.google.com'],
   algorithms:['RS256'],clockTolerance:'30 seconds'
  });
  const ownerSub=Deno.env.get('MEJ_OWNER_GOOGLE_SUB')?.trim();
  if(payload.email!==OWNER||payload.email_verified!==true||
     !/^\d{10,30}$/.test(String(payload.sub||''))||
     (ownerSub&&payload.sub!==ownerSub))throw Error('NOT_OWNER');
  const text=await req.text();
  if(text.length>300)throw Error('BODY_TOO_LARGE');
  const body=JSON.parse(text);
  const teacherEmail=String(body.teacherEmail||'').trim().toLowerCase();
  if(teacherEmail.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherEmail))
   return reply(400,{ok:false,error:'INVALID_EMAIL'},origin);
  const encoded=new TextEncoder().encode(teacherEmail);
  const digest=await crypto.subtle.digest('SHA-256',encoded);
  const hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  const api=Deno.env.get('SUPABASE_URL');
  const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!api||!service)throw Error('DATABASE_CONFIG');
  const res=await fetch(api+'/rest/v1/rpc/mej_pilot_reserve_seat',{
   method:'POST',
   headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/json'},
   body:JSON.stringify({p_role:'teacher',p_account_ref:hash}),
   signal:AbortSignal.timeout(6000)
  });
  if(!res.ok)throw Error('DATABASE_UNAVAILABLE');
  const rows=await res.json();
  const state=rows?.[0]?.result;
  if(state==='full')return reply(409,{ok:false,error:'PILOT_FULL'},origin);
  if(state==='existing'||state==='reserved'){
   // Generate a fresh teacher invitation. Only the Google-verified owner
   // receives the raw code. The database stores its SHA-256 fingerprint.
   const inviteBytes=crypto.getRandomValues(new Uint8Array(24));
   const invitation=Array.from(inviteBytes,v=>v.toString(16).padStart(2,'0')).join('');
   const inviteDigest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(invitation));
   const inviteHash=Array.from(new Uint8Array(inviteDigest),v=>v.toString(16).padStart(2,'0')).join('');
   const registered=await fetch(api+'/rest/v1/rpc/mej_owner_set_teacher_invite',{
    method:'POST',
    headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/json'},
    body:JSON.stringify({p_teacher_ref:hash,p_hash:inviteHash}),
    signal:AbortSignal.timeout(6000)
   });
   if(!registered.ok)throw Error('TEACHER_INVITE_STORE_FAILED');
   return reply(200,{ok:true,approved:true,existing:state==='existing',teacherInvite:invitation},origin);
  }
  throw Error('BAD_RESPONSE');
 }catch(_){return reply(403,{ok:false,error:'OWNER_VERIFICATION_REQUIRED'},origin)}
});
