# Admin-only preview during maintenance

The public `index.html` and `sw.js` stay in maintenance mode. The existing maintenance anchor (⚓) opens `reviews/owner-login.html`; after the existing Google owner check, its existing review link opens `reviews/admin-preview.html` and requires:
1. Verified owner Google ID token through `mej-owner-verify` (only the configured owner account).
2. The owner's **existing six-digit Admin code** validated by the live `mej-owner-preview-gate`. The first owner-verified visit enrolls the same code as a salted PBKDF2 verifier when the gate database contains no enrollment, without issuing a different code.
3. A short-lived (45-minute) owner-bound session, recorded server side. `mej-owner-preview-content` independently verifies both the Google token and active session before returning the current owner-preview branch HTML.

The client loads that HTML into a temporary same-origin Blob iframe, **not as a public HTML page at a stable GH Pages route**. The preview page resolves the changed Host, Grammar, spaced-review and arcade scripts from the integration branch while keeping the app document on the normal GitHub Pages origin. The games review tab shows the current interim educational arcade for inspection while `games/release.js` remains false for general users.

## Important limits
- The GitHub repository and its previous commits remain public; this is an **owner-authenticated preview UI**, not a DRM system for previously published source code. Never assume secret source code is protected by GitHub Pages.
- The protected preview content endpoint is prepared to read `index.html` from the `preview/owner-review-updates` branch. This branch combines the phase-two snapshot with the current Hidden Objects, Grammar and spaced-review changes. It is not active until the owner explicitly approves the hosting step.
- The owner's browser may retain real student records. The original app was not audited to be fully read-only; do not perform write actions against real students during review. Backend cloud operations require their own authorization.
- A failed/expired Google token, wrong Admin code, expired preview session, unavailable backend or unavailable preview-branch source fails closed.
- `mej-owner-preview-gate` and `mej-owner-preview-content` are deployed in the `My-English-Journey` Supabase project with `verify_jwt=false` because they **independently verify the Google ID token signature**.
- Never place Admin PIN, its hash, Google token, service-role/secret keys or owner session token in this repo.
- The legacy game of boat steering and jewel collecting is out of scope. No cash payments are enabled.

## First-use check
A PIN enrollment has not been made on the server as of this development snapshot. The first successful Google owner login prompts for the **existing** PIN and registers only a salted verifier. This cannot independently prove that a previously offline/local-only PIN matches that code; the server-bound Google owner check is the bootstrap authority. The reviewer does **not** receive a new PIN.

## Testing
`node scripts/qa-admin-preview.mjs` performs static checks. Device-side Google sign-in, PIN acceptance, app iframe rendering and re-lock after logout must still be manually tested by the owner. A static test is not a successful full sign-in.

### Owner-only visual access to all levels
The authenticated, temporary Blob preview patches the four level/skill access helpers **only in memory** after server-verified Google + PIN login. This lets the owner review all 13 stage indexes (0–12), L1/L2 and skill categories regardless of a learner's diagnosed progress. It does not alter normal student unlocking rules, actual mastery records, accounts or teacher data. Do not use live student records for test answers.
