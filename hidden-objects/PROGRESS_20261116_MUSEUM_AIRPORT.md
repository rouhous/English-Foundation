# Hidden Objects — 16 November 2026 implementation progress

Repository: `rouhous/English-Foundation`, main.

## What changed
- Generated two original 1600×900 WebP game scenes in a consistent 3D cartoon Omani setting:
  - `assets/stage04-badge03_museum.webp` — heritage museum, 220,784 bytes; Git blob SHA `266b96d258c98fe4d772e2e2a92570a7c8f5e9e6`.
  - `assets/stage08-badge05_airport.webp` — modern Omani airport terminal, 189,106 bytes; Git blob SHA `45b99784cfd82d19a31c031cf2ec44a00784363f`.
- `museum-scene-practice-20261116.js`: ten physically visible objects mapped for stages 4/badge 3, 5/badge 6 and 8/badge 3; visual QA tightened door and map hitboxes.
- `airport-scene-practice-20261116.js`: ten identifiable airport objects mapped for stages 8/badge 5 and 9/badge 7; visual QA tightened airplane and backpack hitboxes.
- `index.html`: includes both scripts before the existing candidate coverage loader.
- `sw.js`: both files and their images are in the new PWA core cache; network-refresh rules include the new scripts, maintaining offline fallback.
- `scripts/qa-hidden-precision.mjs`: updated old expectations of a blank preview for already-mapped scenes; now includes both new photo scenarios, unchanged blocked status for genuinely missing stage 12/badge 10.
- `SCENE_PRACTICE_COVERAGE_20261116_V2.json` records all 130 slots; `MISSING_13_SCENE_ART_BRIEFS_20261116.json` specifies the remaining 13.
- Original 47 WebP sources and 250 level contexts are preserved.

## Measured coverage
| Metric | Value |
|---|---:|
| Original planned badge/level scenes | 130 |
| Interactive image-based *practice* scenes mapped | **117** |
| Remaining scenes without a suitable image | **13** |
| Original source photo assets | 47 |
| Newly uploaded photo assets | 2 |
| New scene slots made playable in practice | 5 |
| Live learner bonus-score approvals granted | **0** |

All ten objects in a new scene are visible in that scene's original picture, with provisional clickable rectangles. Both visual overlays were inspected manually and two areas were corrected in each.

## QA
15/15 structural checks passed on the latest repository source: 130 original slots, 117 mapped, 13 unfilled; two new source binary blob SHAs; ten region targets per mapped slot; percent-bounded finite polygons; loader ordering; service worker contents; source JS compilation; absence of scoring approvals; updated reference data. **Actual headless CI results and device tap/offline outcomes are not yet confirmed**.

## Important educational limitations
These are *practice only* until each stage's ten words correspond to its actual curriculum and the learner-specific nine-mastered-one-challenge selection is validated. `stage-word-index-20261113.json` found only 30 exact words overlapping the 1,170 scene-slot object entries, so the source-image topic design alone does not justify score writes. Classroom, level and mastery databases must not be altered as part of rendering images. Neither the 20-star unlock threshold nor rank/reward ledger has changed.

## Generation blocker
The connected fal.ai image-generation account reports exhausted credits (403) for additional scenes. Do not assert the remaining 13 are generated or silently substitute mismatched imagery. A separate image-generation route may be used when images are actually produced and verified, but the 13 slots remain unavailable until then.
