# Supabase Edge Function — verified owner login

**Deployment:** Live in the dedicated `My-English-Journey` project (`xboracsbzikojobumcke`), separate from `School-Teacher-Notebook`.

Function: `mej-owner-verify`. Request: `GET` with `Authorization: Bearer GOOGLE_ID_TOKEN`.

- `verify_jwt: false` is necessary because the bearer token is **Google-issued**,
  not Supabase-issued. This function verifies the Google signature, issuer,
  audience and expiration itself and rejects unverified callers.
- The current owner allowlist uses the signed, verified Google Gmail identity `rouhous@gmail.com`. An optional server-only `MEJ_OWNER_GOOGLE_SUB` can pin the stable Google subject as defense-in-depth. Never accept an unverified client-supplied subject.
- The API **only** validates the owner, reporting `content_review` capability.
  It does not grant student-record edits or use a service-role key.
- The public login page is connected to `https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-owner-verify`.
- The live smoke test passed for no-token, forged-token, wrong-origin and allowed CORS preflight; see `diagnostics/owner-verification-live.md`. A successful Google owner sign-in has not yet been tested.
- Keep all privileged student/teacher operations behind independent verified
  authorization. HTML hiding is not private-content access control.

Source based on Supabase Edge Function external-provider authentication guidance.
