// Secure owner identity gate for a future My English Journey admin backend.
// Node 20+, no dependencies. Deploy behind HTTPS; NEVER publish env secrets.
import http from 'node:http';
import { createPublicKey, verify as verifySignature } from 'node:crypto';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const ownerSub = process.env.MEJ_OWNER_GOOGLE_SUB || '';
const allowedOrigin = process.env.MEJ_ALLOWED_ORIGIN || 'https://rouhous.github.io';
const port = Number(process.env.PORT || 8080);
const issuer = new Set(['accounts.google.com', 'https://accounts.google.com']);
let cachedKeys = null;
let fetchedAt = 0;
const MAX_TOKEN_LENGTH = 8192;

function json(res, status, data, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };
  if (origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Vary'] = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}
function parsePart(s) {
  return JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
}
async function keys() {
  if (cachedKeys && Date.now() - fetchedAt < 5 * 60_000) return cachedKeys;
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error('KEYS_UNAVAILABLE');
  const value = await response.json();
  if (!Array.isArray(value.keys)) throw new Error('KEYS_INVALID');
  cachedKeys = value.keys;
  fetchedAt = Date.now();
  return cachedKeys;
}
async function ownerFromToken(token) {
  if (!clientId || !ownerSub) throw new Error('ADMIN_NOT_CONFIGURED');
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('INVALID_TOKEN');
  }
  const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
  const header = parsePart(headerEncoded);
  const body = parsePart(payloadEncoded);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('BAD_ALGORITHM');
  const jwk = (await keys()).find(x => x.kid === header.kid && x.kty === 'RSA' && x.use === 'sig');
  if (!jwk) throw new Error('UNKNOWN_SIGNING_KEY');
  const signed = Buffer.from(headerEncoded + '.' + payloadEncoded);
  const valid = verifySignature('RSA-SHA256', signed,
    createPublicKey({ key: jwk, format: 'jwk' }),
    Buffer.from(signatureEncoded, 'base64url'));
  if (!valid) throw new Error('BAD_SIGNATURE');
  const now = Math.floor(Date.now() / 1000);
  if (!issuer.has(body.iss) || body.aud !== clientId ||
      typeof body.exp !== 'number' || body.exp <= now ||
      typeof body.iat !== 'number' || body.iat > now + 60 ||
      body.sub !== ownerSub || body.email_verified !== true ||
      body.email?.toLowerCase() !== 'rouhous@gmail.com') {
    throw new Error('OWNER_NOT_AUTHORIZED');
  }
  return { subject: body.sub, email: body.email };
}
http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    if (origin !== allowedOrigin) return json(res, 403, { ok: false }, origin);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Max-Age': '600',
      'Vary': 'Origin'
    });
    return res.end();
  }
  if (req.url === '/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, configured: Boolean(clientId && ownerSub) }, origin);
  }
  if (req.url !== '/api/admin/me' || req.method !== 'GET') {
    return json(res, 404, { ok: false, error: 'NOT_FOUND' }, origin);
  }
  if (origin && origin !== allowedOrigin) {
    return json(res, 403, { ok: false, error: 'ORIGIN_NOT_ALLOWED' }, origin);
  }
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const owner = await ownerFromToken(token);
    return json(res, 200, {
      ok: true,
      role: 'owner',
      email: owner.email,
      capabilities: ['content_review'],
      note: 'Only identity verification is enabled; student administration is not yet connected.'
    }, origin);
  } catch (_) {
    return json(res, 403, { ok: false, error: 'OWNER_AUTH_REQUIRED' }, origin);
  }
}).listen(port, '0.0.0.0', () => console.log('MEJ owner identity service listening on port', port));
