# My English Journey — integration & release gates

## Coastal arcade student release — 14 November 2026

**Live deployment:** main `index.html` restored from the pre-maintenance learner shell (original blob `5403a68...`) and now loads `coastal-arcade/app-bridge.js`; `sw.js` restored to offline-first learner service worker and caches `coastal-arcade/index.html` plus all ten original badge images at 580×580 in `coastal-arcade/badges/`. `reviews/admin-preview.html` uses the ten-game coastal arcade and original artwork.

The archive's 30 age-band game slots are present in `coastal-arcade/index.html` with 30 graded destination learning cards. Original WebP badges were uploaded from the user's v11.2 source, not replaced with emoji thumbnails.

**Student score integration:** Supabase Edge Function `mej-arcade-rewards` verifies the active opaque student access token via `mej_short_student_links`, active license, the synced `mej_student_progress.level_stats` per stage, and the grade-band game mapping. Atomic RPC `mej_arcade_action` uses `mej_arcade_scores` and `mej_arcade_runs` for at most two scored attempts/game, best-improvement awards, idempotent run IDs, and total bonus stars kept **separate** from academic/mastery stars and class ranking. Anonymous public endpoints do not grant table privileges; RLS is on. Client-reported gameplay scores are *unverified* as answers are not yet validated server-side.

**Field-test release, not QA certification:** real-student login→play→finish→reconnect flow, Android/iPhone/iPad touch/sound/performance, approved picture-bank coverage, upper-level listening quality, and Falling Words survival mechanics still require checks or improvements. Hidden Objects is deliberately practice-only until hotspots/scene alignment is approved; existing legacy hidden-badge history is not silently rewritten. No boat-steering, gem collecting, or cash payouts.

**Recovery:** branch `backup/mej-maintenance-before-coastal-20261114` preserves the previous maintenance state. Main rollback must preserve student data and any later progress; never wipe browser storage or cloud tables.



## Historical pre-release snapshot (superseded by above live integration)
- The student root `index.html` and `sw.js` still show maintenance; student access is paused.
- `games/release.js` remains `window.MEJArcadeRelease = false`.
- Existing arcade has **four working-category implementations** as interim review content, not the ten games per age band accepted in the newer badge conversation.
- `games/coastal-badges.js` now defines the ten locations in the original uploaded-image order (خصب → صحار → ميناء صحار → مسقط → ميناء مطرح → صور → الدقم → جزيرة مصيرة → جزر الديمانيات → صلالة), 20-star mastery milestones and exact game inventories for all three age bands. **It is not yet used to award or unlock anything.**
- Omani Sailor / boat steering and gem collecting remain **excluded from the approved arcade**. Their source survives only as an archive.
- The four-game arcade checks parent-frame messages and makes Hidden Objects practice available at 20 phase mastery stars; practice play does not award mastery stars.

## Mandatory before reopening
1. **Reconciled:** the owner's uploaded v11.1 FIXED archive supplied all 30 game assignments, now recorded in `games/coastal-badges.js`; the original artwork and executable code still need importing to GitHub before live integration.
2. Import the functioning v11.1 review game sources; upgrade Falling Words from choice bubbles to the agreed survival box (10 sentences, overflow fails), and enforce bank-approved images for Moving Pictures and Flip Cards.
3. Replace placeholder/taster bank with textbook-aligned content; use student-level/mastered evidence and approved images; match listening answers to recordings and raise difficulty appropriately.
4. Import all **original 580×580 WebP badges** and **30 bilingual graded destination cards** from the user's v11.1 FIXED archive, replacing owner-preview emoji placeholders. 20 verified mastery stars unlock a badge; bonus stars do not.
5. Add authenticated/idempotent game bonus ledger: ten tasks/game, maximum ten bonus stars, at most two scoring attempts, credit only improvement; do not count bonus stars as unlock stars.
6. Complete automated browser regression and manual Android, iPhone/iPad, offline, touch and sound checks.
7. Ensure no boat/gem game link or cash-money interface appears anywhere in the restored **main** student navigation.
8. Only after acceptance, separately restore original main entrypoint/service worker and release flag; do not lose student data.

## Available checks
`games/qa/browser.mjs` exercises the *current four-game subset*. It is not certification of the final ten-game system.
`games/qa/coastal-badges.mjs` validates the 10 reference badges, thresholds, grade-band and no-money/no-boat policies without requiring Playwright.

## Reconciliation checkpoint — 2026-11-14

The master source is the user's **MEJ_Coastal_Badges_Arcade_v11_1_FIXED.zip**, not the older deployed four-game page. The package has ten original badge pictures and a live independent arcade preview. The current main GitHub tree has been aligned at the **reference-data level only**; this is neither an uploaded production game bundle nor a completed authenticated reward implementation. Maintenance must remain active.
