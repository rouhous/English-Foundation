# Hidden Objects — first coastal badge integration audit (15 November 2026)

## Source and repository comparison
Input: `MEJ_Hidden_Objects_Precision_Hotspots_Offline_FIXED_v3.html` (single-file offline review studio; not itself a certified student game).
Repo: `rouhous/English-Foundation`, branch `main`.

- All **47** embedded WebP scene assets match `hidden-objects/assets/` by complete Git blob SHA and filename (combined inventory checksum FNV32 `c90e6e8f`).
- Exact manifest data are already tracked: **130 scene slots**, **250 level contexts**.
- The scene status inventory remains **42 visual candidates**, **70 reuse candidates**, and **18 scenes needing new artwork**.
- The attached initial draft includes 30 unverified regions in 3 scenes; these are review estimates, not approved game content.
- **Important metadata debt:** the SHA-256 digests declared in `precision-v3-manifest.json` and in the source's manifest do not match the current 47 WebP bytes (the WebP bytes themselves do match GitHub). Do not use these old digests as an asset-integrity gate until reconciled.

## Existing integration retained
- `coastal-arcade/index.html` already maps **Hidden Objects as game #1** for the junior, middle, and upper grade bands.
- The first coastal badge opens at **20 verified mastery stars**, within the existing 20-star/10-badge system.
- The main learner app routes badges through `coastal-arcade/app-bridge.js`; its current student arcade opens `hidden-objects/index.html` for the hidden-object game.
- Historical boat/gem games are not restored; the academic star counter and student rankings are not changed.

## 15 November change: safe playable picture pilots
New `hidden-objects/first-badge-practice.js` defines 10 targeted, image-relative polygon regions each for:
- **Stage 0 / badge 01**: `assets/base_classroom.webp` — clock, globe, map, book, backpack, bottle, pen, ruler, scissors, ball.
- **Stage 1 / badge 01**: `assets/variant_classroom.webp` — clock, globe, map, teddy bear, cup, laptop, apple, ruler, backpack, ball.

`hidden-objects/index.html` loads the new script after the archived precision-v3 candidate library and enables these two scenes in **practice-only** mode when accessed from the verified badge launcher. If new teacher-approved mappings exist in future, the draft maps will not overwrite them.

`sw.js` precaches the two first-badge photos and the precision candidate and practice scripts, bumping the PWA cache name to refresh installed clients. No user storage or cloud data is cleared.

## Release boundary
This change does **not** certify the other stages or award game bonus stars. The manifest still declares `imageVerified=false`, `hotspotsVerified=false`, `curriculumWordsVerified=false`, `masteryVerified=false`, and `contentApproved=false`. Student-scoring mode stays disabled for Hidden Objects.

Before turning on scoring for a particular stage/level, verify all 10 scene objects against that specific curriculum and actual learner mastery (**9 mastered + 1 new challenge**), visually approve the full polygons on the exact image, validate taps on phones and tablets, and use the authoritative server reward ledger with idempotent attempts. Never treat the owner's standalone precision editor or a visually reviewed map as student approval.

## Verification
- 12/12 source and data structural checks passed on GitHub after the changes: 2 pilot scenes, 10 targets per pilot, bounded coordinates, never approved for rewards, correct page script order, badge gate, offline precache, 47/130 manifest counts, unaltered certification flags, first-game order for all three bands.
- 47/47 source image Git object SHAs match the deployed repository inventory.
- **Not verified:** real Android/iPhone/iPad playback, actual student login/state, cloud synchronization, GitHub Pages cache propagation, or production learner reward settlement. No field-test or comprehensive release claim is made.
