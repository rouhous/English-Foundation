# Supabase Edge Function — verified owner login

Deploy **only to a dedicated My English Journey Supabase project**, not the
School-Teacher-Notebook project.

Function: `mej-owner-verify`. Request: `GET` with `Authorization: Bearer GOOGLE_ID_TOKEN`.

- `verify_jwt: false` is necessary because the bearer token is **Google-issued**,
  not Supabase-issued. This function verifies the Google signature, issuer,
  audience and expiration itself and rejects unverified callers.
- Configure the server-only Supabase secret `MEJ_OWNER_GOOGLE_SUB` with the
  verified stable Google subject for `rouhous@gmail.com`. Never put the
  subject in browser code. Until it is configured, the endpoint returns HTTP 503.
- The API **only** validates the owner, reporting `content_review` capability.
  It does not grant student-record edits or use a service-role key.
- On successful deployment, update `reviews/owner-login.html` to point to
  `https://<project-ref>.supabase.co/functions/v1/mej-owner-verify` and make
  the frontend fetch that exact URL rather than the Vercel-style
  `/api/admin/me` path.
- Keep all privileged student/teacher operations behind independent verified
  authorization. HTML hiding is not private-content access control.

Source based on Supabase Edge Function external-provider authentication guidance.
