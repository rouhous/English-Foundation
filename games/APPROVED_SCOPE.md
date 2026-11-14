# My English Journey — authoritative interactive games scope

Updated 2026-11-14 from the newer badge-games conversation, ahead of the older four-game arcade preview.

## Final intended structure
- Ten **distinct educational interactive games per grade band**: grades **1–4**, **5–9** and **10–12**. Games unlock **cumulatively**, one new game at successive badges; already-opened ones remain usable.
- Ten coastal-Oman badge names in order: **خصب، صحار، ميناء صحار، مسقط، ميناء مطرح، صور، جزر الديمانيات، جزيرة مصيرة، الدقم، صلالة**. Each is labeled in Arabic and English, with information difficulty adapted to age/grade.
- A new badge is unlocked every **20 verified mastery stars** (20–200 per phase). Bonus game stars **never** count toward badge unlocking.
- Each game aims for **10 tasks** and up to **10 bonus stars**. Only the best improvement across the **two scoring attempts** is credited; later replay is practice-only. Duplicate awards for the same student/stage/badge/game must be prevented by an authenticated ledger before production.
- No cash payouts, wallets, vouchers or monetary rewards of any kind.

## Educational games and uniqueness rules
The most recent recovered discussions explicitly include:
- **Moving Pictures** for grades 1–4, **Flip Cards** for grades 5–12 (using the existing approved GitHub vocabulary-image bank, not newly invented images).
- **Falling Words Survival**: larger accumulating bubbles; form **10 sentences** to win; fail if the box fills. It is not a duplicate of Sentence Builder.
- A single **Word Builder** and a single **Sentence Builder**, without duplicate spelling/sentence variants under different titles.
- Interactive **Picture Match**, **Hidden Objects**, **Grammar Challenge**, **Vocabulary Quiz**, plus more age-appropriate listening/reading/critical-thinking missions in the advanced grade bands.
- Listening answer options must relate to **the same recording/sentence**; upper grades need longer, more demanding passages.

**Important:** the full, exact v11.1 list assigning all ten game titles to each individual grade band is not available in the current checked-in GitHub files. Do **not** invent or assert a completed band-by-band inventory. Reconcile with the original v11.1 prototype/source before treating the arcade as finished.

## Explicit exclusion
The Omani Sailor boat-steering **and gem/jewel-collection game are excluded** from the student app. Preserve old files under `boat-game/` and `omani-sailor/` as archival source only; do not link, embed, restore or award points from them unless the user later explicitly changes this decision. No sailing-game feature is a prerequisite for badge unlocks.

## Existing deployed code is only an interim subset
The code in `games/index.html`, `games/arcade.js` and `games/bank.js` currently implements **only four** exercise choices (Word Explorer, Sentence Builder, Grammar Gate, Hidden Objects). They are **not** the complete approved ten-game design.

`games/coastal-badges.js` captures the ten agreed badge places, milestones, grade-band metadata and non-cash scoring constraints **as reference data only**; it is not wired into student progression.

Keep the root maintenance page active and `games/release.js` equal to `false` until the actual ten-game design, student progression, asset matching, rewards ledger and device QA have passed.
