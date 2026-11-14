// My English Journey — coastal arcade bonus gateway (2026-11-14).
// Student's opaque access token is verified against the SAME linked identity as mej-progress.
// Quiz scores are client-reported and are never counted as certified academic mastery.
const ORIGIN='https://rouhous.github.io';
const BASE=Deno.env.get('SUPABASE_URL')||'',SECRET=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const H={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS',
 'Access-Control-Allow-Headers':'authorization,content-type','Vary':'Origin','Cache-Control':'no-store',
 'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff'};
const goodRef=(s:unknown)=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const bad=(s:number,error:string)=>new Response(JSON.stringify({ok:false,error}),{status:s,headers:H});
const ok=(value:unknown)=>new Response(JSON.stringify(value),{status:200,headers:H});
async function sha(s:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
async function db(path:string,body?:unknown){
 if(!BASE||!SECRET)throw Error('SERVER_UNAVAILABLE');
 const r=await fetch(BASE+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',
  headers:{apikey:SECRET,authorization:'Bearer '+SECRET,'Content-Type':'application/json','Accept':'application/json'},
  ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('DB_'+r.status);
 return await r.json();
}
Deno.serve(async req=>{
 if(req.headers.get('origin')!==ORIGIN)return bad(403,'INVALID_ORIGIN');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:H});
 if(req.method!=='POST')return bad(405,'POST_ONLY');
 try{
  const raw=await req.text();
  if(raw.length>6000)return bad(413,'TOO_LARGE');
  const d=JSON.parse(raw);
  if(!d||!['status','start','finish'].includes(d.action))return bad(400,'INVALID_ACTION');
  const header=req.headers.get('authorization')||'';
  const token=header.startsWith('Bearer ')?header.slice(7):'';
  if(!goodRef(token))return bad(403,'STUDENT_LOGIN_REQUIRED');
  const hash=await sha(token);
  const links=await db('mej_short_student_links?access_hash=eq.'+hash+'&select=student_ref,license_id,profile_ref');
  if(!Array.isArray(links)||links.length!==1)return bad(403,'STUDENT_LOGIN_REQUIRED');
  const license=await db('mej_licenses?id=eq.'+links[0].license_id+'&active=eq.true&select=id');
  if(!Array.isArray(license)||license.length!==1)return bad(403,'LICENSE_INACTIVE');
  const ref=String(links[0].student_ref||'');
  if(!/^[a-f0-9]{64}$/.test(ref))return bad(403,'INVALID_STUDENT_IDENTITY');
  if(d.action==='status'){
   const rows=await db('mej_arcade_scores?student_ref=eq.'+ref+'&select=stage,badge,game_code,best,attempts&order=stage.asc,badge.asc&limit=130');
   return ok({ok:true,records:rows||[],total:(rows||[]).reduce((n:{},r:{best:number})=>Number(n)+Math.max(0,Math.min(10,Number(r.best)||0)),0),verification:'CLIENT_REPORTED_UNVERIFIED'});
  }
  const stage=Number(d.stage),badge=Number(d.badge);
  const game=String(d.game||'').slice(0,30);
  if(!Number.isInteger(stage)||stage<0||stage>12||!Number.isInteger(badge)||badge<1||badge>10||!/^[a-z]{3,15}$/.test(game))
   return bad(400,'INVALID_GAME_REQUEST');
  const run=d.action==='finish'&&typeof d.runId==='string'&&/^[a-f0-9-]{36}$/i.test(d.runId)?d.runId:null;
  const score=d.action==='finish'&&Number.isInteger(d.score)&&d.score>=0&&d.score<=10?d.score:null;
  if(d.action==='finish'&&(!run||score===null))return bad(400,'INVALID_SCORE');
  const result=await db('rpc/mej_arcade_action',{p_student_ref:ref,p_action:d.action,p_stage:stage,p_badge:badge,p_game:game,p_run_id:run,p_score:score});
  if(!result||result.ok!==true)return bad(result?.error==='PROGRESS_NOT_SYNCED'?409:403,result?.error||'REJECTED');
  return ok({...result,verification:'CLIENT_REPORTED_UNVERIFIED'});
 }catch(_){return bad(503,'SERVICE_UNAVAILABLE')}
});