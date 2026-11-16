# Hidden Objects — final grade hints and precision-tap patch
Date: 16 November 2026 • My English Journey

## Grade-specific instruction (now part of game itself)

| Grade | Hint shown in 10-object search |
|---|---|
| 1–4 | A **different reference picture** from the approved vocabulary image bank when available, otherwise an independent pictogram (never a cropped scene photo) |
| 5–9 | The **silhouette** of the independent reference illustration, alongside the English target word. No crop from the scene. |
| 10–12 | **English word only**, no image or silhouette. |

Runtime uses the explicit learner grade from the host when available, otherwise the game's stage (0 treated as foundation/Grade 1). All 10 stage-9 badge slots in `precision-v3-client.js` now explicitly request silhouette mode.

## Fixes

1. Removed the complete background-position cropping function that extracted a region from the scene to show as its own hint.
2. For all photo-based activities, hints use the independent vocabulary source already in My English Journey: `MEJ_APPROVED_IMAGES` from the same-origin parent app, with individual picture-like icons as a fallback. The 151 distinct lower-stage vocabulary words in the 130-scene inventory have independent fallback pictograms, including plurals.
3. Reduced touch tolerance to **five CSS pixels, capped at twelve source-image pixels**; valid hits wholly inside a polygon take priority over nearby matches, and found objects cannot be counted again. Click positions are mapped from the displayed photo-board rectangle to its exact 1599×900 coordinate system.
4. All 130 planned photo-backed scene positions, 62 original/added WebP scene files, and ten draft object areas per scene remain linked without changing badge unlocks, learner stars or ranking.
5. PWA service-worker cache bumped to `mej-hidden-final-hints-touch-20261116-v3`; offline fallback preserved. No user storage cleared.
6. Chromium test covers all 130 scenes and explicitly checks Grades 4, 5, 9 and 10 hint modes, no cropped hint elements, and the presence of ten words per photo.

## Important QA boundary

Structural/browser checks do **not** establish that every one of the original 1,300 estimated hotspots perfectly follows the pixels of its object. Their original labels and regions remain educational-review candidates, not curriculum-certified masks. Device-level taps on Android/iPad/iPhone and the learner-specific vocabulary gate are still not signed off. The 130 scenes remain **practice only and never award bonus stars** until reviewed. Do not label the patch as certified scoring release.

Test status artifact: `BROWSER_QA_ALL130_20261116.json` (latest pass may lag the most recent commit by a GitHub Actions cycle).
