import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';

const CLIENT_ID = '825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const OWNER_EMAIL = 'rouhous@gmail.com';
const ORIGIN = 'https://rouhous.github.io';
const API = Deno.env.get('SUPABASE_URL') || '';
const SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
  JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || '';
const KEYS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const enc = new TextEncoder();
const hex = (bytes: Uint8Array) => [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
const random = (n: number) => hex(crypto.getRandomValues(new Uint8Array(n)));
const digest = async (text: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text))));
const equals = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
async function hashPin(pin: string, saltHex: string) {
  const salt = new Uint8Array((saltHex.match(/.{2}/g) || []).map(x => parseInt(x, 16)));
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bytes = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 180000 }, key, 256);
  return hex(new Uint8Array(bytes));
}
function response(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), { status, headers: {
    'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, max-age=0',
    'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer',
    ...(origin === ORIGIN ? { 'access-control-allow-origin': ORIGIN, 'vary': 'Origin' } : {}),
  }});
}
async function database(table: string, method: string, query: string, body?: unknown) {
  if (!API || !SECRET) throw new Error('SERVER_NOT_CONFIGURED');
  const r = await fetch(API + '/rest/v1/' + table + (query ? '?' + query : ''), {
    method, headers: { 'apikey': SECRET, 'authorization': 'Bearer ' + SECRET,
      'content-type': 'application/json', 'prefer': 'return=representation' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!r.ok) throw new Error('DATABASE_REQUEST_FAILED_' + r.status);
  const data = await r.text();
  return data ? JSON.parse(data) : [];
}
async function verifiedOwner(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('GOOGLE_AUTH_REQUIRED');
  const token = auth.slice(7);
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) || token.length > 8192) throw new Error('INVALID_TOKEN');
  const verified = await jwtVerify(token, KEYS, {
    audience: CLIENT_ID, issuer: ['accounts.google.com', 'https://accounts.google.com'],
    algorithms: ['RS256'], clockTolerance: '30 seconds',
  });
  const p = verified.payload;
  const pinned = Deno.env.get('MEJ_OWNER_GOOGLE_SUB')?.trim();
  if (!/^\d{10,30}$/.test(String(p.sub || '')) || (pinned && pinned !== p.sub) ||
      p.email_verified !== true || p.email !== OWNER_EMAIL) throw new Error('NOT_OWNER');
  return String(p.sub);
}
async function issueSession(sub: string) {
  const token = random(32);
  const hash = await digest(token);
  const until = new Date(Date.now() + 45 * 60000);
  await database('mej_owner_preview_sessions', 'POST', '', { token_hash: hash, owner_sub: sub, expires_at: until.toISOString() });
  return { reviewSession: token, expiresAt: until.toISOString(), role: 'owner', readOnly: true };
}
Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin !== ORIGIN) return response(403, { ok: false, error: 'ORIGIN_NOT_ALLOWED' }, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'access-control-allow-origin': ORIGIN, 'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '600', 'vary': 'Origin',
  }});
  if (request.method !== 'POST') return response(405, { ok: false, error: 'METHOD_NOT_ALLOWED' }, origin);
  try {
    const sub = await verifiedOwner(request);
    const payload = await request.json();
    if (!payload || typeof payload !== 'object') return response(400, { ok: false }, origin);
    const action = payload.action;
    if (action === 'check' || action === 'logout') {
      const session = payload.reviewSession;
      if (typeof session !== 'string' || !/^[0-9a-f]{64}$/.test(session)) return response(403, { ok: false }, origin);
      const hash = await digest(session);
      const rows = await database('mej_owner_preview_sessions', 'GET', 'select=owner_sub,expires_at&token_hash=eq.' + hash + '&limit=1');
      if (!rows.length || rows[0].owner_sub !== sub || Date.parse(rows[0].expires_at) <= Date.now()) return response(403, { ok: false }, origin);
      if (action === 'logout') {
        await database('mej_owner_preview_sessions', 'DELETE', 'token_hash=eq.' + hash);
        return response(200, { ok: true, signedOut: true }, origin);
      }
      return response(200, { ok: true, role: 'owner', readOnly: true, expiresAt: rows[0].expires_at }, origin);
    }
    if (action !== 'setup' && action !== 'unlock') return response(400, { ok: false, error: 'ACTION_INVALID' }, origin);
    const pin = payload.code;
    if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) return response(400, { ok: false, error: 'SIX_DIGIT_CODE_REQUIRED' }, origin);
    const current = await database('mej_owner_preview_pin', 'GET', 'select=owner_sub,salt,digest,failed_attempts,locked_until&id=eq.1&limit=1');
    if (!current.length) {
      if (action !== 'setup') return response(409, { ok: false, error: 'SETUP_REQUIRED' }, origin);
      const salt = random(16);
      const value = await hashPin(pin, salt);
      await database('mej_owner_preview_pin', 'POST', '', { id: 1, owner_sub: sub, salt, digest: value, failed_attempts: 0 });
      return response(200, { ok: true, configuredNow: true, ...(await issueSession(sub)) }, origin);
    }
    if (current[0].owner_sub !== sub) return response(403, { ok: false, error: 'OWNER_NOT_AUTHORIZED' }, origin);
    if (action !== 'unlock') return response(409, { ok: false, error: 'ALREADY_CONFIGURED' }, origin);
    if (current[0].locked_until && Date.parse(current[0].locked_until) > Date.now()) {
      return response(429, { ok: false, error: 'TEMPORARILY_LOCKED' }, origin);
    }
    const value = await hashPin(pin, current[0].salt);
    if (!equals(value, current[0].digest)) {
      const failures = Math.max(0, Number(current[0].failed_attempts) || 0) + 1;
      await database('mej_owner_preview_pin', 'PATCH', 'id=eq.1', {
        failed_attempts: failures >= 5 ? 0 : failures,
        locked_until: failures >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null,
        updated_at: new Date().toISOString(),
      });
      return response(failures >= 5 ? 429 : 403, { ok: false, error: failures >= 5 ? 'TEMPORARILY_LOCKED' : 'INVALID_ADMIN_CODE' }, origin);
    }
    await database('mej_owner_preview_pin', 'PATCH', 'id=eq.1', {
      failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString(),
    });
    return response(200, { ok: true, ...(await issueSession(sub)) }, origin);
  } catch (e) {
    const message = String(e instanceof Error ? e.message : e);
    if (message.startsWith('DATABASE_') || message === 'SERVER_NOT_CONFIGURED')
      return response(503, { ok: false, error: 'PREVIEW_SERVICE_UNAVAILABLE' }, origin);
    return response(403, { ok: false, error: 'OWNER_AUTH_REQUIRED' }, origin);
  }
});
