# My English Journey — Stage 7: verified cloud sync integration (staging)

**Status: Verified transport adapter and offline-first tests passed. Not activated in the public learner app.**

The requested architectural principle is unchanged: **Every game and lesson must run offline after initial install. Results are saved locally immediately; cloud sync is automatic only when a working connection and a trusted server are available.** Unsent answers are never thrown away because the network failed.

## Implemented

- `assets/verified-sync-bridge-v1.js`: an opt-in, student-scoped adapter that connects the already tested offline answer outbox to a future authenticated HTTPS endpoint.
- Queues each answer with a cryptographically random event ID, separately per learner, without waiting for network access. Uses the existing `MEJVerifiedOutbox`.
- Calls the verified v2 `answer` endpoint only if online, and sends queued events sequentially. The outbox removes an event only when the response is readable and contains `ok:true`, `scoreVerification:'SERVER_CHECKED_PILOT'`, valid answer status and server-derived stars.
- An untrusted, unreadable or failed network response leaves all unconfirmed events queued. A repeated request with the same event ID is rejected or deduplicated by the server-side ledger.
- `startAutoSync()` listens for browser `online` and `pageshow` events. It does not interfere with studying when offline.
- `restore()` verifies that a signed-in learner's snapshot is scoped to `OWN_STUDENT_PROGRESS`, contains valid unique question IDs, and has a star total equal to the number of questions mastered twice. It returns the validated snapshot without overwriting local drafts or unsent events.
- `reviews/stage7-offline-cloud-preview.html`: interactive fictional-data demo showing offline answer queues and reconnection.

## Automated test evidence

`scripts/test_stage7_sync_adapter.js` exercises offline queued answers, reconnection, successful server acknowledgement, no duplicated cloud stars, unsafe acknowledgement rejection, authenticated snapshot parsing, per-student queue isolation, and automatic sync listeners. The GitHub Actions workflow `stage7-sync-acceptance.yml` has passed.

This **mock server test does not demonstrate a connection to Google's live Apps Script**. It proves the browser-side interface contract and offline data-preservation logic only.

## Why not enable this in the live app yet?

- The existing Apps Script `Code.gs` has not been redeployed into an approved school-controlled, isolated test web app. The current live receiver still accepts older unverified progress reports.
- Apps Script ContentService responses can be served through a separate Google domain/redirect and are not guaranteed to be readable by JavaScript on GitHub Pages due to cross-origin browser restrictions. A safe, permitted two-way response transport must be demonstrated on actual browsers before enabling enrollment, score submission or recovery. **Never use `mode:'no-cors'` or an opaque response as evidence of cloud persistence.**
- The public learner app does not currently collect v2 credentials, enroll students with an authorized one-time invite, or load this adapter. This is intentional: real student accounts must not be migrated to an untested protocol silently.
- A school-approved process is needed for forgotten recovery codes, permissions, grade/class enrollment, privacy notices, and real device testing.
- The current verified snapshot includes question mastery, but not diagnostic placement or writing drafts. It is unsafe to replace all local progress with that partial snapshot.

## Deployment gate

1. Create and secure a separate school-owned test Google Spreadsheet and Apps Script project. Import the `Code.gs` repository file and provision `MEJ_V2_ENABLED=true` **only for this synthetic-data pilot**. Keep class rankings disabled by default.
2. Implement an authenticated, CORS-compatible response transport with origin checks and audit logging. Demonstrate the actual `/exec` response is readable and never exposed to other classrooms.
3. Connect a private **TEST ONLY** student enrollment and credential-recovery UI, then wire the opt-in adapter to that transport. Never put device tokens, invite codes or recovery secrets in public JS or GitHub.
4. Run actual Android Chrome/Firefox and iPhone Safari offline/reconnection tests on two devices, including wrong token, duplicate answer, repeated reconnect, account loss, local-storage pressure, and partial snapshot.
5. Obtain school data-handling authorization before real student use; activate production only after independent acceptance.

**Release decision remains NO-GO for real student accounts.** The original app continues functioning locally and with its legacy reporting path; this stage introduces no new collection of real student data.
