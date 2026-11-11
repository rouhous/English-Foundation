# Omani Sailor – original design integration preview

This archive retains the original Three.js 3D scene, images, movement and drag controls. It replaces the old 100–300 baisa + teacher password treasure logic with random 5, 10, 15 or 20 baisa prizes, capped to 50 baisa per stage. Every 20 **journey** stars yields 10 baisa. At 200 journey stars a stage yields 100 badge baisa + maximum 50 treasure baisa.

## Embedding in the app (same origin)

Open `omani-sailor/index.html` in an iframe and wait for `mej:sailor-ready`. Send:

```js
iframe.contentWindow.postMessage({
  type:'mej:sailor-link', studentId: authenticatedStudentId,
  phase: 1, stageId: verifiedStageId, stageStars: verifiedStageStars
}, location.origin);
```

The game emits `mej:sailor-progress` with `demoOnly: true`. Do NOT credit financial balances based on this event. The linked account must have >=40 verified stage stars (second badge) before opening this game. The parent app must perform this access check; this file is a preview, not a security barrier.

## Outstanding backend integration

Server must award stars-derived badges from authenticated learner progress, securely store each chest claim idempotently per student and stage, enforce the 50-baisa per-stage cap atomically, and record teacher-authorized partial/full disbursements in an immutable ledger. Settlements reduce outstanding balance but never reset treasure cap. Teacher and student wallets should query the same ledger. Avoid trusting localStorage or browser-provided amounts for real-money claims. The game keeps its own local demo record only.

## Difficulty / reward-chest v2

- Easy: 5 game points per gem; Medium: 10; Hard: 20. Existing stars add 25 game points. Game points **do not** count towards school journey badges.
- Every 100 cumulative game points in the selected difficulty opens a visual island treasure hunt, including progress across interrupted runs. An unfinished hunt is resumed.
- After opening 3 chests on Easy, Medium unlocks; after 3 chests on Medium, Hard unlocks. The school learning phase selector is independent of these difficulty levels.
- Sailing speed grows by 8% (relative to difficulty's auto-speed) per opened chest, capped at 1.8x. The speed bonus carries across difficulty switches and restarts, unlike the run score.
- Demo localStorage is not a secure payment source. Server-side treasure issuance, school access and teacher settlement still require separate authenticated integration.
