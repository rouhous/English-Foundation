# My English Journey — arcade integration readiness (2026-11-14)

## Confirmed in source
- Root `index.html` and `sw.js` are still maintenance screens: learner access stays paused.
- `games/release.js` remains `window.MEJArcadeRelease = false`; direct game links are locked.
- Arcade only runs within a same-origin parent frame after a valid `mej:arcade-init` handshake.
- Host-provided **current stage** is used for Hidden Objects rather than treating selected grade as stage.
- Hidden Objects unlocks at 20 verified basic stars; Omani Sailor unlocks at **40** (second badge). Practice scores are **not** deposited as student stars or money.
- Regression suite `games/qa/browser.mjs` checks the maintenance gate, standalone access rejection, hostile self-message, 20/40 unlocking, grade-aware exercises, practice hunt, return navigation and mobile layout. Its workflow is `.github/workflows/mej-games-qa.yml`.

## Remaining release blockers
1. Review every question for exact Oman Ministry textbook alignment; the current 12-grade mini-bank is thematic supplemental practice, not a certified textbook mapping.
2. Visually inspect 3D game on Android and iOS; test swipe/touch, sound and offline load.
3. Connect *authenticated server-side* rewards and teacher settlements before activating real baisa amounts. Current 3D treasure is demo-only and not verified payout.
4. Confirm browser CI green and manual PWA testing; desktop and mobile screenshots alone do not certify device-specific behavior.
5. Keep root maintenance files and `games/release.js` locked until approval. Never infer payout or entitlement from child iframe postMessage or localStorage.

## Reopening
Restore original entrypoint and service worker carefully, merge intervening feature changes, pass QA, then change release flag only as part of an approved production release. No user data was cleared by these source edits.
