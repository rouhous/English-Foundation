# My English Journey — Owner identity service (not deployed)

This is a **secure-by-default authentication scaffold**. It **does not** grant
full admin rights until a deployment and per-operation authorization are added.

Node.js 20+, no third-party packages. Deploy with HTTPS (reverse proxy or a
managed hosting platform) and provide these **server-side** environment variables:

- `GOOGLE_OAUTH_CLIENT_ID`: the Google OAuth Web Client ID for the live Pages origin
- `MEJ_OWNER_GOOGLE_SUB`: the verified, stable Google account subject ID of the owner
- `MEJ_ALLOWED_ORIGIN`: `https://rouhous.github.io`
- `PORT`: optional port

Do not place either account subject or private credentials in browser source.
Even a correct email address is insufficient authorization by itself. Google
signature, audience, issuer, expiry, email verification and both the subject
allowlist and account email are checked.

Deploy with `node admin-backend/server.mjs`, with TLS termination handled by
your provider. The `GET /api/admin/me` request accepts a short-lived Google
ID token in `Authorization: Bearer <token>` and returns only the current
owner's role and read-only capability. Tokens are never stored in a cookie or
in localStorage by this service. The endpoint never returns student data.

**Not yet performed:** Google Cloud OAuth configuration, backend hosting,
production verification, application Google sign-in UI, student/teacher admin
operations, and confirmation that the service is deployed. Do not claim
that full admin access is enabled. The public review site is read-only.

The first full-admin action should be designed as a separate authenticated,
audited route with least-privilege access to student records; never share
the School-Teacher-Notebook database or place API secrets on GitHub Pages.

See https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
