import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';

const CLIENT_ID = '825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const OWNER_EMAIL = 'rouhous@gmail.com';
const ORIGIN = 'https://rouhous.github.io';
const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function response(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...(origin === ORIGIN ? {
        'access-control-allow-origin': ORIGIN,
        'vary': 'Origin',
      } : {}),
    },
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin && origin !== ORIGIN) {
    return response(403, { ok: false, error: 'FORBIDDEN' }, origin);
  }
  if (request.method === 'OPTIONS') {
    if (origin !== ORIGIN) return response(403, { ok: false }, origin);
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': ORIGIN,
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'authorization, content-type',
        'access-control-max-age': '600',
        'vary': 'Origin',
      },
    });
  }
  if (request.method !== 'GET') {
    return response(405, { ok: false, error: 'METHOD_NOT_ALLOWED' }, origin);
  }
  // The Google-signed verified gmail address is the initial allowlist.
  // An optional owner-sub setting adds identity pinning if configured later.
  const expectedSub = Deno.env.get('MEJ_OWNER_GOOGLE_SUB')?.trim();
  if (expectedSub && !/^\d{10,30}$/.test(expectedSub)) {
    return response(503, { ok: false, error: 'OWNER_CONFIG_INVALID' }, origin);
  }
  try {
    const authorization = request.headers.get('authorization') || '';
    if (!authorization.startsWith('Bearer ')) throw Error('NO_TOKEN');
    const token = authorization.slice(7);
    if (token.length > 8192) throw Error('TOKEN_TOO_LARGE');
    const verified = await jwtVerify(token, jwks, {
      audience: CLIENT_ID,
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      algorithms: ['RS256'],
      clockTolerance: '30 seconds',
    });
    const identity = verified.payload;
    if ((expectedSub && identity.sub !== expectedSub) ||
        !/^\d{10,30}$/.test(String(identity.sub || '')) ||
        identity.email !== OWNER_EMAIL ||
        identity.email_verified !== true) {
      throw Error('NOT_OWNER');
    }
    return response(200, {
      ok: true, role: 'owner',
      email: OWNER_EMAIL,
      capabilities: ['content_review'],
    }, origin);
  } catch {
    return response(403, { ok: false, error: 'OWNER_AUTH_REQUIRED' }, origin);
  }
});
