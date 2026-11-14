# My English Journey — interactive games integration and readiness

## Approved scope (updated 2026-11-14)
Only **Word Explorer, Sentence Builder, Grammar Gate and Hidden Objects** belong to the approved interactive games release candidate. **Omani Sailor / boat and jewel collection are excluded**, not merely postponed for conversion to stars. Their old files are retained as archive references and must not be linked or loaded from the arcade.

## Verified in repository source
- The app's root `index.html` and `sw.js` provide the maintenance page; public learner access remains paused.
- `games/release.js` remains `window.MEJArcadeRelease = false`.
- The arcade requires an embedding parent and validates the same-origin parent before accepting an island and its learning stars.
- Hidden Objects practice opens at 20 phase learning stars and never adds practice points to student learning stars.
- The game hub contains four active game choices and no boat/jewel-collection option or runtime iframe path.
- Browser regression tests check the maintenance gate, standalone rejection, untrusted self-messages, Hidden Objects gating, boat exclusion, grade-specific vocabulary, sentence/grammar gameplay, return navigation and mobile layout.

## Outstanding release checks
1. Verify the thematic question bank against actual grades, textbook units and required question types.
2. Execute GitHub Actions browser QA and inspect failures/screenshots. Source-level syntax checks alone are not acceptance.
3. Check mobile (Android and iPhone/iPad), sound, touch controls and offline recovery.
4. Confirm that the restored **main app** navigation has no old Omani Sailor launch button or label; legacy `openMejSailor` compatibility routes to Hidden Objects but must not be visible as a boat feature.
5. Confirm account-linked stars and badges remain correct; practice scores must never be added to mastery stars.
6. Keep the whole app in maintenance and `games/release.js` false until a separately approved production release.

No cash rewards or monetary wallets are in the approved scope.
