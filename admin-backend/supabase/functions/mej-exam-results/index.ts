import {createRemoteJWKSet, jwtVerify} from 'npm:jose@6.1.0';

const origin = 'https://rouhous.github.io';
const audience = '825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const base = Deno.env.get('SUPABASE_URL') || '';
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const encoder = new TextEncoder();
const hex = /^[a-f0-9]{64}$/;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const cors = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8'
};
const bytesToHex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
const digest = async (value: string) => bytesToHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const sessionKey = secret ? await crypto.subtle.importKey('raw', encoder.encode('mej-exams-v1:' + secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign','verify']) : null;
type Link = {student_ref: string; license_id: string; teacher_id: string | null; access_hash: string};
type License = {id: string; license_type: string};

function reply(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {status, headers: cors});
}
async function db<T>(path: string, body?: unknown): Promise<T> {
  if (!base || !secret) throw Error('DATABASE_UNAVAILABLE');
  const response = await fetch(base + '/rest/v1/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {apikey: secret, Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json',
      ...(body === undefined ? {} : {Prefer: 'resolution=ignore-duplicates,return=minimal'})},
    ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw Error('DATABASE_UNAVAILABLE');
  const raw = await response.text();
  return (raw ? JSON.parse(raw) : undefined) as T;
}
function getLink(filter: string) {
  return db<Link[]>('mej_short_student_links?' + filter + '&select=student_ref,license_id,teacher_id,access_hash&limit=2');
}
async function license(link: Link) {
  const [value] = await db<License[]>('mej_licenses?id=eq.' + encodeURIComponent(link.license_id) + '&active=eq.true&select=id,license_type');
  return value;
}
async function studentGrade(studentRef: string) {
  const filter = 'student_ref=eq.' + encodeURIComponent(studentRef) + '&select=grade&limit=1';
  const [identity] = await db<{grade:number}[]>('mej_student_identities?' + filter);
  if (identity) return identity.grade;
  const [progress] = await db<{grade:number}[]>('mej_student_progress?' + filter);
  return progress?.grade;
}
async function sign(link: Link, expiry: number) {
  if (!sessionKey) throw Error('DATABASE_UNAVAILABLE');
  const data = link.student_ref + '.' + expiry;
  const signature = await crypto.subtle.sign('HMAC', sessionKey, encoder.encode(data + '.' + link.access_hash));
  return data + '.' + bytesToHex(signature);
}
async function verify(token: string) {
  const [ref, expires, signature, extra] = token.split('.');
  if (extra !== undefined || !hex.test(ref || '') || !/^\d{13}$/.test(expires || '') ||
      !hex.test(signature || '') || Number(expires) <= Date.now() || !sessionKey) return null;
  const [link] = await getLink('student_ref=eq.' + ref);
  if (!link) return null;
  const signatureBytes = new Uint8Array(signature.match(/../g)!.map(pair => parseInt(pair, 16)));
  const valid = await crypto.subtle.verify('HMAC', sessionKey, signatureBytes, encoder.encode(ref + '.' + expires + '.' + link.access_hash));
  return valid ? link : null;
}
async function mayRead(token: string, link: Link, active: License) {
  let payload;
  try {
    ({payload} = await jwtVerify(token, googleKeys, {audience, issuer: ['accounts.google.com','https://accounts.google.com'], algorithms: ['RS256']}));
  } catch { return false; }
  if (payload.email_verified !== true || typeof payload.email !== 'string' || typeof payload.sub !== 'string') return false;
  const email = payload.email.toLowerCase();
  const ownerSub = Deno.env.get('MEJ_OWNER_GOOGLE_SUB');
  if (email === 'rouhous@gmail.com' && (!ownerSub || ownerSub === payload.sub) &&
      ['owner_unlimited','wadi_2429'].includes(active.license_type)) return true;
  if (!link.teacher_id) return false;
  const [teacher] = await db<{google_sub:string|null}[]>('mej_verified_teachers?id=eq.' + encodeURIComponent(link.teacher_id) +
    '&license_id=eq.' + encodeURIComponent(active.id) + '&verification_state=eq.verified&google_email=eq.' + encodeURIComponent(email) + '&select=google_sub&limit=1');
  return Boolean(teacher && (!teacher.google_sub || teacher.google_sub === payload.sub));
}
function marks(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}
function validGrade(grade: number | undefined) {
  return Number.isInteger(grade) && grade! >= 5 && grade! <= 12;
}

Deno.serve(async (request: Request) => {
  if (request.headers.get('Origin') !== origin) return reply(403, {error:'ORIGIN'});
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:cors});
  if (request.method !== 'POST') return reply(405, {error:'METHOD'});
  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer [^ ]+$/.test(authorization) || authorization.length > 8200) return reply(401, {error:'LOGIN_REQUIRED'});
  const token = authorization.slice(7);
  try {
    const raw = await request.text();
    if (raw.length > 3000) return reply(413, {error:'TOO_LARGE'});
    let data;
    try { data = JSON.parse(raw); } catch { return reply(400, {error:'INVALID_BODY'}); }
    if (!data || typeof data !== 'object') return reply(400, {error:'INVALID_BODY'});
    if (data.action === 'launch') {
      if (!hex.test(token)) return reply(401, {error:'LOGIN_REQUIRED'});
      const links = await getLink('access_hash=eq.' + await digest(token));
      if (links.length !== 1) return reply(401, {error:'LOGIN_REQUIRED'});
      const link = links[0];
      const active = await license(link);
      if (!active || (!link.teacher_id && !['owner_unlimited','wadi_2429'].includes(active.license_type))) return reply(403, {error:'NO_TEACHER'});
      const grade = await studentGrade(link.student_ref);
      if (!validGrade(grade)) return reply(422, {error:'GRADE_UNAVAILABLE'});
      const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
      return reply(200, {ok:true, grade, expiresAt, token:await sign(link, expiresAt)});
    }
    if (data.action === 'submit') {
      const link = await verify(token);
      if (!link || !await license(link)) return reply(401, {error:'SESSION_EXPIRED'});
      const grade = await studentGrade(link.student_ref);
      if (!validGrade(grade) || grade !== data.grade) return reply(403, {error:'GRADE_MISMATCH'});
      if (typeof data.attemptId !== 'string' || !uuid.test(data.attemptId) ||
          !['unit','skill','comprehensive','random'].includes(data.mode) ||
          !(grade! <= 10 ? data.track === '' : ['core','elective'].includes(data.track)) ||
          typeof data.paper !== 'string' || !/^[a-z0-9_/-]{1,90}$/i.test(data.paper) ||
          typeof data.skill !== 'string' || !/^[a-z0-9_-]{0,32}$/i.test(data.skill) ||
          !marks(data.earned) || !marks(data.possible) || data.earned > data.possible ||
          typeof data.writingPending !== 'boolean' || (!data.possible && !data.writingPending)) return reply(400, {error:'INVALID_RESULT'});
      await db('mej_exam_attempts?on_conflict=student_ref,attempt_id', {
        student_ref:link.student_ref, attempt_id:data.attemptId, grade, mode:data.mode, track:data.track,
        paper:data.paper, skill:data.skill, earned:data.earned, possible:data.possible, writing_pending:data.writingPending
      });
      return reply(200, {ok:true});
    }
    if (data.action === 'teacher_results') {
      if (typeof data.studentRef !== 'string' || !hex.test(data.studentRef)) return reply(400, {error:'INVALID_STUDENT'});
      const [link] = await getLink('student_ref=eq.' + data.studentRef);
      const active = link && await license(link);
      if (!active || !await mayRead(token, link, active)) return reply(403, {error:'FORBIDDEN'});
      const results = await db('mej_exam_attempts?student_ref=eq.' + data.studentRef +
        '&select=submitted_at,grade,track,mode,paper,skill,earned,possible,writing_pending&order=submitted_at.desc&limit=100');
      return reply(200, {ok:true, results});
    }
    return reply(400, {error:'INVALID_ACTION'});
  } catch {
    return reply(503, {error:'UNAVAILABLE'});
  }
});
