import { createPublicKey, verify as verifySignature } from 'node:crypto';

/**
 * Public Vercel Function for verified-owner identity, not a CRUD admin API.
 * Google ID token must be cryptographically verified on EVERY request.
 * Owner access grants content_review only until privileged endpoints exist.
 */
const CLIENT_ID = '825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const ORIGIN = 'https://rouhous.github.io';
const OWNER_EMAIL = 'rouhous@gmail.com';
const ISSUERS = new Set(['accounts.google.com','https://accounts.google.com']);
let cachedKeys;
let keyExpiry = 0;
const json = (status, data, origin) => new Response(JSON.stringify(data), {
 status, headers: {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  ...(origin===ORIGIN?{'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin'}:{})
 }
});
function decodeJSON(b64) {
 return JSON.parse(Buffer.from(b64,'base64url').toString('utf8'));
}
async function getKeys() {
 if(cachedKeys && Date.now()<keyExpiry)return cachedKeys;
 const response=await fetch('https://www.googleapis.com/oauth2/v3/certs',
  {signal:AbortSignal.timeout(6000)});
 if(!response.ok)throw Error('CERTS_UNAVAILABLE');
 const body=await response.json();
 if(!Array.isArray(body.keys))throw Error('CERTS_INVALID');
 const cacheHeader=response.headers.get('cache-control')||'';
 const maxAge=Number(/max-age=(\d+)/i.exec(cacheHeader)?.[1]||300);
 cachedKeys=body.keys;
 keyExpiry=Date.now()+Math.max(30,Math.min(maxAge,3600))*1000;
 return cachedKeys;
}
export async function validateGoogleOwner(token) {
 if(typeof token!=='string'||token.length>8192||
    !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(token))
  throw Error('MALFORMED');
 const [h,p,s]=token.split('.');
 const header=decodeJSON(h),payload=decodeJSON(p);
 if(header.alg!=='RS256'||typeof header.kid!=='string')throw Error('ALGORITHM');
 const key=(await getKeys()).find(k=>k.kid===header.kid&&k.kty==='RSA'&&k.use==='sig');
 if(!key)throw Error('UNKNOWN_KEY');
 if(!verifySignature('RSA-SHA256',Buffer.from(h+'.'+p),
    createPublicKey({key,format:'jwk'}),Buffer.from(s,'base64url')))
  throw Error('SIGNATURE');
 const now=Math.floor(Date.now()/1000);
 if(!ISSUERS.has(payload.iss)||payload.aud!==CLIENT_ID||
    !Number.isInteger(payload.exp)||payload.exp<=now||
    !Number.isInteger(payload.iat)||payload.iat>now+60||
    payload.email_verified!==true||
    payload.email!==OWNER_EMAIL ||
    typeof payload.sub!=='string'||!/^\d{10,30}$/.test(payload.sub))
  throw Error('IDENTITY');
 // The account is a Google-managed @gmail.com address; a signed and verified
 // email is authoritative. An optional configured sub pins its stable identity.
 const pinnedSub=process.env.MEJ_OWNER_GOOGLE_SUB?.trim();
 if(pinnedSub && payload.sub!==pinnedSub)throw Error('SUB_MISMATCH');
 return {email:payload.email};
}
export async function GET(request) {
 const origin=request.headers.get('origin');
 if(origin&&origin!==ORIGIN)return json(403,{ok:false,error:'FORBIDDEN'},origin);
 try{
  const authorization=request.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))throw Error('MISSING_TOKEN');
  const owner=await validateGoogleOwner(authorization.slice(7));
  return json(200,{
   ok:true,role:'owner',email:owner.email,
   capabilities:['content_review']
  },origin);
 }catch(_){
  return json(403,{ok:false,error:'OWNER_AUTH_REQUIRED'},origin);
 }
}
export function OPTIONS(request){
 const origin=request.headers.get('origin');
 if(origin!==ORIGIN)return json(403,{ok:false,error:'FORBIDDEN'},origin);
 return new Response(null,{status:204,headers:{
  'Access-Control-Allow-Origin':ORIGIN,
  'Access-Control-Allow-Methods':'GET, OPTIONS',
  'Access-Control-Allow-Headers':'Authorization',
  'Access-Control-Max-Age':'600',
  'Vary':'Origin'
 }});
}
