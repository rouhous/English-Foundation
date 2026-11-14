# Admin-only preview during maintenance

The public `index.html` and `sw.js` stay in maintenance mode. The existing gear inside the maintenance art navigates to `reviews/admin-preview.html` and requires:
1. Verified owner Google ID token through `mej-owner-verify` (only the configured owner account).
2. The owner's **existing six-digit Admin code** validated by the live `mej-owner-preview-gate`. The first owner-verified visit enrolls the same code as a salted PBKDF2 verifier when the gate database contains no enrollment, without issuing a different code.
3. A short-lived (45-minute) owner-bound session, recorded server side. `mej-owner-preview-content` independently verifies both the Google token and active session before returning the last pre-maintenance app HTML.

The client loads that HTML into a temporary same-origin Blob iframe, **not as a public HTML page at a stable GH Pages route**. The games review tab shows the current interim educational arcade for inspection while `games/release.js` remains false for general users.

## Important limits
- The GitHub repository and its previous commits remain public; this is an **owner-authenticated preview UI**, not a DRM system for previously published source code. Never assume secret source code is protected by GitHub Pages.
- The pinned source is the original pre-maintenance `index.html` from commit `9049142891a22445522f4c5e8cb089d43adf10f7`, not a claim that the planned ten games are already finished.
- The owner's browser may retain real student records. The original app was not audited to be fully read-only; do not perform write actions against real students during review. Backend cloud operations require their own authorization.
- A failed/expired Google token, wrong Admin code, expired preview session, unavailable backend or unavailable pinned source fails closed.
- `mej-owner-preview-gate` and `mej-owner-preview-content` are deployed in the `My-English-Journey` Supabase project with `verify_jwt=false` because they **independently verify the Google ID token signature**.
- Never place Admin PIN, its hash, Google token, service-role/secret keys or owner session token in this repo.
- The legacy game of boat steering and jewel collecting is out of scope. No cash payments are enabled.

## First-use check
A PIN enrollment has not been made on the server as of this development snapshot. The first successful Google owner login prompts for the **existing** PIN and registers only a salted verifier. This cannot independently prove that a previously offline/local-only PIN matches that code; the server-bound Google owner check is the bootstrap authority. The reviewer does **not** receive a new PIN.

## Testing
`node scripts/qa-admin-preview.mjs` performs static checks. Device-side Google sign-in, PIN acceptance, app iframe rendering and re-lock after logout must still be manually tested by the owner. A static test is not a successful full sign-in.
