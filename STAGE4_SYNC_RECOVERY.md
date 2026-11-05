# My English Journey — Stage 4: offline synchronization and account recovery

**Development status:** Server code, disconnected offline queue, and synthetic tests completed. **Not live:** The current school Google Apps Script deployment and the legacy student browser client are not connected to this new pilot.

## What was added (without changing current learner accounts)

1. **Student-specific recovery codes:** `Code.gs` generates a separate 64-character recovery secret at verified-pilot enrollment. The server stores only its SHA-256 hash in the separate `MEJ_V2_Recovery` tab. No school classmate can recover another student's account without the secret.
2. **New-device transfer:** The pilot's `recover` action requires the student ID and one-time recovery code. It rotates both the student device credential and recovery secret, revoking the prior device token. The verified star total remains stored on the server.
3. **Recovery-code rotation:** An authenticated student's `rotateRecovery` action invalidates the previous recovery secret without logging them out. A teacher/admin reset for a student who loses both secrets is still **not implemented**; this requires authenticated school staff and an auditable recovery process.
4. **Detailed progress snapshot:** An authenticated `progress` action returns only that student's per-question mastery counts and verified stars, without exposing answer keys or classmates. No local client-reported score is taken as authoritative.
5. **Offline outbox library:** `assets/verified-offline-outbox-v1.js` stores bounded unsent answer events in the learner's own browser. Duplicate event IDs are idempotent. Upon reconnection, it replays them sequentially and removes each only after receiving `{ok:true,scoreVerification:'SERVER_CHECKED_PILOT'}` through an authenticated future transport. This module has **not been wired into the public app**.
6. **Synthetic preview:** `reviews/stage4-sync-recovery-preview.html` visually simulates offline learning, resynchronization, and transferring to a new phone. It does not connect to any student record or production service.

## Offline and multi-device rules

- Only answers that the server has acknowledged are guaranteed to survive the loss of a device. **Unsent offline answers cannot be recovered from a lost or deleted device.**
- Returning a device's old credential after recovery must always fail. Restoring an old recovery file or replaying an old code must fail.
- A recovered student sees their verified per-question mastery snapshot; local unverified achievements, unfinished diagnostic placement, writing drafts, preferences, and other offline content are **not covered by the v2 server snapshot yet**.
- Using the same student account concurrently on multiple devices requires an explicit device policy; the current secure transfer model is **one active device at a time**.
- A student should store the recovery secret privately and must never send it, their device token, or their teacher code to public GitHub, screenshots, classroom leaderboards, or other students.

## Tested in GitHub Actions

The `verify-student-pilot.yml` workflow tests `scripts/test_verified_pilot.js` using fake spreadsheets and student profiles. It verifies enrollment, unique credentials, token rotation, used-code rejection, revoking the old device, restoring previously mastered question IDs, replay protection and cross-student isolation.

The `scripts/test_stage4_offline_outbox.js` test simulates an offline failure, retries when online, refuses unverified acknowledgements and checks separate outboxes per student.

## Still required before students use this

- **Google Apps Script deployment** into a separately configured, school-owned staging project and approval of the data-handling policy. GitHub's `Code.gs` changes are not automatically applied to an active Apps Script /exec deployment.
- A secure two-way browser↔server transport, tested under the target Android and iOS browsers; legacy `fetch` in `no-cors` mode cannot read the new credential and confirmation responses.
- New verified-student enrollment and recover screens and integration of the authenticated `progress` snapshot into the existing locally cached teaching progress.
- Server-side storage for diagnostic placement and writing activity if the school requires those to transfer as well.
- Integration tests of lost code, wrong code, device changes, interrupted sync, duplicate requests, switching students on the same phone, and multiple devices.
- A school-approved account-recovery fallback with access controls and audit log for cases where a child loses both the device and their one-time recovery code.

**Release gate:** `MEJ_V2_ENABLED` remains off in production; do not claim new student account synchronization or ranking is active until staging, security review and end-to-end acceptance pass.
