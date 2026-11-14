import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';

const CLIENT_ID='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const OWNER_EMAIL='rouhous@gmail.com';
const ORIGIN='https://rouhous.github.io';
const SOURCE='https://raw.githubusercontent.com/rouhous/English-Foundation/9049142891a22445522f4c5e8cb089d43adf10f7/index.html';
const JWKS=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const encoder=new TextEncoder();
const API=Deno.env.get('SUPABASE_URL')||'';
const SECRETS=(()=>{try{return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}')}catch{return {}}})();
const SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||SECRETS.default||'';
function reply(status,obj,origin){
 return new Response(JSON.stringify(obj),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0',
 'x-content-type-options':'nosniff','referrer-policy':'no-referrer',
 ...(origin===ORIGIN?{'access-control-allow-origin':ORIGIN,'vary':'Origin'}:{})
 }});
}
function cors(origin){return new Response(null,{status:204,headers:{
 'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS',
 'access-control-allow-headers':'authorization,content-type','access-control-max-age':'600','vary':'Origin'
}})}
async function owner(req){
 const raw=req.headers.get('authorization')||'';
 if(!raw.startsWith('Bearer '))throw Error('MISSING_GOOGLE_TOKEN');
 const token=raw.slice(7);
 if(token.length>8192||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw Error('INVALID_GOOGLE_TOKEN');
 const {payload}=await jwtVerify(token,JWKS,{audience:CLIENT_ID,issuer:['accounts.google.com','https://accounts.google.com'],algorithms:['RS256'],clockTolerance:'30 seconds'});
 const pinned=Deno.env.get('MEJ_OWNER_GOOGLE_SUB')?.trim();
 if(!/^\d{10,30}$/.test(String(payload.sub||'')) || (pinned&&pinned!==payload.sub) ||payload.email_verified!==true||payload.email!==OWNER_EMAIL)throw Error('OWNER_NOT_ALLOWED');
 return String(payload.sub);
}
async function sessionAccepted(session,subject){
 if(!API||!SERVICE_KEY)throw Error('SERVICE_NOT_CONFIGURED');
 if(typeof session!=='string'||!/^[0-9a-f]{64}$/.test(session))return false;
 const digest=await crypto.subtle.digest('SHA-256',encoder.encode(session));
 const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
 const url=API+'/rest/v1/mej_owner_preview_sessions?select=owner_sub,expires_at&token_hash=eq.'+hash+'&limit=1';
 const res=await fetch(url,{headers:{apikey:SERVICE_KEY,authorization:'Bearer '+SERVICE_KEY,accept:'application/json'},signal:AbortSignal.timeout(9000)});
 if(!res.ok)throw Error('SESSION_DATABASE_DOWN');
 const rows=await res.json();
 return rows.length===1&&rows[0].owner_sub===subject&&Date.parse(rows[0].expires_at)>Date.now();
}
Deno.serve(async(req)=>{
 const origin=req.headers.get('origin');
 if(origin!==ORIGIN)return reply(403,{ok:false,error:'ORIGIN_NOT_ALLOWED'},origin);
 if(req.method==='OPTIONS')return cors(origin);
 if(req.method!=='POST')return reply(405,{ok:false,error:'METHOD_NOT_ALLOWED'},origin);
 try{
  const subject=await owner(req);
  const body=await req.json();
  if(body?.action!=='preview-content'||!await sessionAccepted(body?.reviewSession,subject))return reply(403,{ok:false,error:'ADMIN_PREVIEW_SESSION_REQUIRED'},origin);
  const upstream=await fetch(SOURCE,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!upstream.ok)return reply(503,{ok:false,error:'PREVIEW_SOURCE_UNAVAILABLE'},origin);
  const length=Number(upstream.headers.get('content-length')||0);
  if(length>4500000)return reply(503,{ok:false,error:'PREVIEW_SOURCE_TOO_LARGE'},origin);
  let html=await upstream.text();
  if(html.length>4500000||!html.includes('id="mej-owner-only-gate"'))return reply(503,{ok:false,error:'PREVIEW_SOURCE_INVALID'},origin);
  html=html.replace(/<head>/i,'<head><base href="https://rouhous.github.io/English-Foundation/">');
  return new Response(html,{status:200,headers:{
   'content-type':'text/html; charset=utf-8','cache-control':'private, no-store, max-age=0',
   'content-security-policy':"frame-ancestors https://rouhous.github.io",
   'x-content-type-options':'nosniff','referrer-policy':'no-referrer',
   'access-control-allow-origin':ORIGIN,'vary':'Origin'
  }});
 }catch(e){
  const msg=String(e instanceof Error?e.message:e);
  if(msg==='SESSION_DATABASE_DOWN'||msg==='SERVICE_NOT_CONFIGURED')return reply(503,{ok:false,error:'PREVIEW_SERVICE_UNAVAILABLE'},origin);
  return reply(403,{ok:false,error:'OWNER_AUTH_REQUIRED'},origin);
 }
});
