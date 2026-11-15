# Hidden Objects — remaining scene preparation and QA

Date: 15 November 2026
Repository: `rouhous/English-Foundation`, main branch.
Source: `MEJ_Hidden_Objects_Precision_Hotspots_Offline_FIXED_v3.html`, with its 47 original scene WebP assets, 130 scene slots and 250 level contexts.

## Delivered

- Existing original artwork retained, not replaced or duplicated.
- `practice-region-library-a.js`, `-b.js`, and `-c.js`: 46 additional image-specific lists, each containing 10 visually located English words and rectangular candidate click areas (460 object targets). The earlier `base_classroom` map supplies the 47th image. The three retained first-badge pilots are not overwritten.
- `practice-region-loader.js`: normalizes rectangles into the game's precise polygon format, preserves teacher-approved regions if present, records coverage, and never enables scoring.
- `index.html`: uses approved-looking photographs only as **practice candidates** across all already-unlocked badge/grade stages when 10 targets exist. All stages retain their original scene-image assignments; 18 null slots remain blocked with a clear missing-image notice.
- Touch accuracy: when approximate object areas overlap, the closest target centre resolves the click; a repeated tap on an already-found target does not reveal an adjacent word. Successful finds show a small green check by the object edge only after finding it.
- `sw.js`: PWA precaches the new script modules, refreshes them on network use, and warms the original 47 photo assets for later offline availability without blocking the page launch. No data reset.

## Scene inventory

| Measure | Count |
|---|---:|
| Existing source pictures | 47 |
| Original stage / badge slots | 130 |
| Photo-backed slots with 10 interactive targets for **practice** | **112** |
| Slots still requiring genuinely topic-matched artwork | **18** |
| Student scoring-eligible slots created by this work | **0** |

The 18 missing slots are listed individually in `SCENE_PRACTICE_COVERAGE_20261115.json`. They include museum, airport, medical, transport, heritage/archive, smart city, sustainability and space themes for advanced stages. Do not fill them with unrelated images.

## Automated checks

**19 of 19 source-level checks passed:** 47 WebPs exist in GitHub, every referenced image path resolves in the repository, 130 scene slots remain, 112 mapped scenes have precisely 10 distinct targets, 18 missing slots remain unavailable, all polygon coordinates are bounded, later approved edits are preserved, practice does not grant rewards, the iframe message and first-game badge access remain unchanged, script loading and compilation pass, online refresh and offline image prewarming are present.

The 112 candidate scenes were mapped by visually inspecting scene thumbnails and manually choosing approximate locations. **These are draft rectangles, not pixel-exact object masks.** Some adjacent shapes overlap; the centre-nearest tie-breaker is a usability safeguard, not teacher certification. Native Android/iOS/tablet gameplay and offline field testing have not been independently completed.

## Curriculum and reward gate — still closed

The separate `stage-word-index-20261113.json` yields only **30 exact word matches out of 1,120 proposed scene-slot targets** (some images are reused at multiple stages). Most draft scene labels have not yet been verified against the stage-specific question bank, nor against each learner's mastered words. This is a **strict blocker to bonus-star scoring**; all 112 illustrated slots are **practice-only**. The 9 mastered + 1 new challenge-word rule, content/curriculum certification, touch geometry review, and authoritative server validation must be completed before any scores are eligible for reward.

Original scoring/grade-star totals, the existing first-badge unlock threshold (20 verified academic stars), the reward ledger and the rule excluding boat/gems/cash remain unchanged.

## Quick code pointers

- `precision-v3-manifest.json`: canonical planned scenes and 250 contexts, still unapproved.
- `precision-v3-client.js`: browser-side candidate image map.
- `first-badge-practice.js`: the original first three playable pilot image mappings (stages 0, 1, 5).
- `practice-region-library-{a,b,c}.js`: the additional 46 photo-specific candidate maps.
- `practice-region-loader.js`: safe candidate registration and counts.
- `SCENE_PRACTICE_COVERAGE_20261115.json`: 130-scene audit with per-scene status and tentative word matches.
