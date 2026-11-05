# My English Journey — Stage 6 final acceptance report

**Date:** 5 November 2026  
**Automated acceptance:** 10 / 10 checked conditions passed  
**Production release decision:** **NO-GO FOR REAL STUDENT ACCOUNTS**  
**Non-negotiable design rule:** Local/offline-first learning; upload pending verified progress when connectivity returns.

## What was genuinely tested

- In a fresh Chromium browser using **one fictitious learner**, the app initialized an offline diagnostic containing **24 questions**.
- While the browser was fully offline, the test answered the same foundation question correctly three times in three practice attempts. No star was awarded on the first correct response; **one star** was awarded after the second; and the third answer did **not** duplicate that star.
- The second sublevel remained locked because the learner had not mastered the first 100 questions.
- Following an offline page reload, the fictitious learner, star total, number of attempts, mastery and lock status were restored unchanged from local browser storage.
- The previous Stage 5 Chromium test established that the app shell, level navigation and all 12 approved-image shards can work with the network disconnected.
- Five screen sizes passed the prior headless Chromium viewport check with no document-level horizontal overflow.
- Stage 2 security static checks and synthetic Apps Script verified-scoring, recovery, ranking and offline-outbox tests passed. These are **isolated simulations**, not proof of production cloud authorization.

See `diagnostics/stage6-learner-browser.json` and `diagnostics/stage6-release-gate.json`.

## Preserved

- Original app at `index.html` and GitHub Pages.
- Oman-themed home artwork and mobile styling.
- 24 stops (two learning sublevels per school grade).
- 1,136 user-approved vocabulary images in 12 bundles.
- Local-first progress. Network failures must **never** block lessons.
- Earlier authorized test-data reset and backups; **no new deletion in Stage 6**.

## Outstanding release blockers (do not misrepresent)

1. The opt-in verified `Code.gs` account/score service is still **not deployed and configured on the real Google Apps Script project**. GitHub code changes alone never update an existing Apps Script deployment.
2. New verified student enrollment, authenticated answer submission, recovery, progress snapshot and cloud leaderboard are **not yet wired into the public learner app**.
3. The new offline answer outbox is a tested, separate module; the app's current learning flow does not yet use it to post authenticated events. The existing legacy local-first/reporting workflow must remain distinct.
4. The safe same-class leaderboard is intentionally closed, pending approved cohort memberships and student-name visibility rules.
5. The new server snapshot does not yet cover diagnostic placement and writing drafts.
6. Real Android Chrome/Firefox and iPhone Safari physical-device tests, including offline launch after force-close and cloud reconnection, have not been completed.
7. Student data protection, admin account recovery and transport/rate limiting require school acceptance.
8. **708 approved pictures are 316×316 px**, below the preferred minimum of 384×384. Do not silently delete or replace them without review.

## Next acceptance sequence

Use **synthetic students only** and a separate school-controlled TEST Apps Script + Google Sheet. Deploy verified v2 privately, connect browser enrollment and secure API transport, then test cloud saving and recovering on two physical devices. Confirm teacher-controlled class membership, private leaderboard and automatic retries with the network disconnected/reconnected. Re-run this complete Stage 6 CI suite. Secure production launch only after those checks and student privacy review are explicitly approved.

**Current recommendation:** Continue controlled development and review; do not enable real-student registration or real-name ranking yet.
