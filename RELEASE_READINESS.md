# My English Journey — Pre-release readiness (2026-11-04)

## Implemented and checked in repository
- Existing app preserved at `index.html`; two learning sublevels remain in place.
- Imported exactly **1,136 user-approved images** in 12 `assets/approved-images-XX.js` bundles.
- **497 user-rejected images are excluded from imported bundles.**
- Images are indexed by vocabulary label; user-selected preferred images take priority, otherwise larger approved images.
- 971 distinct approved labels; 36 explicitly preferred images.
- Source dimensions: 428 × 384×384; 708 × 316×316. Temporary lower limit: 316×316.
- Existing `imageHtml` uses the approved-only image bank; no fallback to unreviewed legacy pictures.
- Homepage stylesheet is linked directly in the app; offline service worker cache key refreshed.
- Static asset validation output: `diagnostics/prelaunch-asset-validation.json` (**STATIC_ASSET_CHECKS_PASSED**).

## Release blockers — do not publish for real student registrations yet
- **Account and progress security:** current browser `localStorage` profiles and client-supplied star totals are not trusted identities or server-verified results. Teacher registration code is not student authentication.
- **Cloud persistence:** deployment in `Code.gs` and live Google Sheets synchronization must be tested with an approved school-controlled student-data policy, including recovery and failure scenarios.
- **Class leaderboard:** safe same-grade/class retrieval and tamper-resistant star scoring are not yet implemented; do not expose names/class membership using a public endpoint.
- **Test data:** synthetic Google Sheets records and trial profiles need verified, authorized removal before rollout. Removing GitHub diagnostic files does not clear cloud records.
- **Vocabulary coverage:** approved labels do not cover the full 1,741-word master; 344 image labels require semantic matching and some lessons will display text without an approved image.
- **Legacy 512×512 images:** historical archive records exist, but older final approvals and source files have not all been reconciled. Do not override approved images without visual verification.
- **Device QA:** actual Android Firefox/Chrome and iPhone Safari screen tests, refresh/offline, logo/boat placement and tappable navigation are not yet signed off.

## Recommended acceptance tests
1. Register a TEST learner on two devices and confirm name/class/grade permissions; verify repeat sign-in and recovery.
2. Test correct and incorrect exercises, stars, no duplicated rewards, level 1/2 progress, diagnostic boundaries.
3. Disable connectivity, complete a lesson, reconnect, and verify conflict-safe cloud synchronization.
4. As a learner, verify other classes' private records cannot be read, edited or enumerated.
5. Confirm the same-class leaderboard is based on server-verified stars only and shows no levels.
6. Compare phone landscape/portrait, Firefox and Chrome; inspect actual boat/island and navigation.
7. Reset ONLY confirmed test records after a backup and authorized approval.
8. Re-run static asset validation; verify all 12 image shards load on published GitHub Pages.

Current conclusion: **reviewed images integrated; app not yet certified for public student launch**.
