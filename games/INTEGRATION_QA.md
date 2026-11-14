# My English Journey — integration & release gates

## Current confirmed repository state
- The student root `index.html` and `sw.js` still show maintenance; student access is paused.
- `games/release.js` remains `window.MEJArcadeRelease = false`.
- Existing arcade has **four working-category implementations** as interim review content, not the ten games per age band accepted in the newer badge conversation.
- `games/coastal-badges.js` defines the ten coastal-Oman locations and 20-star mastery milestones. **It is not yet used to award or unlock anything.**
- Omani Sailor / boat steering and gem collecting remain **excluded from the approved arcade**. Their source survives only as an archive.
- The four-game arcade checks parent-frame messages and makes Hidden Objects practice available at 20 phase mastery stars; practice play does not award mastery stars.

## Mandatory before reopening
1. Recover/reconcile **the complete v11.1 badge-games source** to obtain the exact ten-game lists per band. Keep games distinct; no duplicate Word Builder or Sentence Builder.
2. Implement Moving Pictures (1–4), Flip Cards using approved vocabulary pictures (5–12), Falling Words Survival with ten correctly formed sentences, plus the agreed age-specific interactive activities and listening missions.
3. Replace placeholder/taster bank with textbook-aligned content; use student-level/mastered evidence and approved images; match listening answers to recordings and raise difficulty appropriately.
4. Integrate the ten Omani places as differentiated badge designs and bilingual learning content. 20 verified mastery stars unlock a badge, bonus stars do not.
5. Add authenticated/idempotent game bonus ledger: ten tasks/game, maximum ten bonus stars, at most two scoring attempts, credit only improvement; do not count bonus stars as unlock stars.
6. Complete automated browser regression and manual Android, iPhone/iPad, offline, touch and sound checks.
7. Ensure no boat/gem game link or cash-money interface appears anywhere in the restored **main** student navigation.
8. Only after acceptance, separately restore original main entrypoint/service worker and release flag; do not lose student data.

## Available checks
`games/qa/browser.mjs` exercises the *current four-game subset*. It is not certification of the final ten-game system.
`games/qa/coastal-badges.mjs` validates the 10 reference badges, thresholds, grade-band and no-money/no-boat policies without requiring Playwright.
