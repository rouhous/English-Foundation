# My English Journey — Verified Progress Pilot (Stage 2)

**Status: CODE IMPLEMENTED, SYNTHETIC TESTS PASSED, NOT DEPLOYED TO LIVE APPS SCRIPT.**

This is an **opt-in, default-disabled pilot** added to the repository's `Code.gs`. It is deliberately separate from `english-foundation-oman-progress-v1`; it does not read, delete, migrate or overwrite that legacy data. Do not enable it on the school's production spreadsheet yet.

## What has been implemented

- Student-specific opaque ID and 64-character device credential. The sheet stores only a SHA-256 hash of each credential.
- School-admin-issued, **single-use invite codes**, bound to the intended grade and class. Enrollment requires both the invite and the teacher registration code; the teacher code alone cannot enroll a student.
- A server-maintained attempt ledger keyed by unique event ID. Replaying an identical submission returns a duplicate acknowledgement without increasing the score. Reusing the event ID with changed contents is rejected.
- Separate mastery records with a cap of two correct submissions per question, and **server-derived** star totals (one star per question mastered).
- Student-scoped score lookup requiring the student's own credential; no public class roster, cross-student lookups or leaderboard endpoint.
- Rejection of questions above the registered school grade, and of questions in a stage's second 100-question half before the first 100 are mastered. Pilot limit of 600 submissions per student per UTC day.
- A private `MEJ_V2_QuestionKeys` sheet populated from the app's 2,600-question bank through a manually invoked admin setup function.
- Synthetic Node.js regression tests: `node scripts/test_verified_pilot.js`. These run without real student records or Google account credentials.

## Important limitations

**The existing GitHub Pages app is not automatically switched to this protocol.** It still uses its previous local learning and legacy report flow. The opt-in pilot is not live until the school deploys the new `Code.gs`, explicitly enables the pilot, and implements/tests an authenticated browser-to-server response channel.

The current app exposes the answers in its downloadable JavaScript. Server-side answer checking therefore protects against a simple forged star *total*, but **cannot prove genuine independent learning**. Automated answering remains possible. Do not market this as cheat-proof or use it for official grades.

The school must approve student data collection, retention and access before any real student records are created. The school should evaluate whether Google Sheets/Apps Script is suitable for the intended load, privacy and reliability; this pilot is not load-tested.

## Safe controlled deployment

1. Prepare a **separate TEST Google Spreadsheet and Apps Script project** owned by the school. Do not overwrite or redeploy the existing live /exec project as a first test.
2. Copy the repository's `Code.gs` to the test Apps Script project. In its script properties set `TEACHER_REGISTRATION_CODE` to a *test-only* secret; set `MEJ_V2_ENABLED=false` initially. Use a test-only `SPREADSHEET_ID` or attach the test Sheet.
3. From the editor, run `mejV2InstallQuestionKeys_()` once. It imports 2,600 question IDs and answers to a protected `MEJ_V2_QuestionKeys` tab using the public bank source. **Do not publish that tab.** This function refuses to overwrite already-installed keys.
4. In the *test project only*, set `MEJ_V2_ENABLED=true`. From the editor, call `mejV2IssueInvite_(1,'1A','SCHOOL_A_CLASS_1A')` to obtain a one-time synthetic invite. Never publish invite codes or tokens in GitHub or screenshots.
5. Test `mejV2Handle_({schema:'mej-verified-v2',action:'enroll',teacherCode:'<test-only-code>',studentName:'TEST STUDENT',grade:1,className:'1A',inviteCode:'<invite>'})` locally using synthetic information. Store the returned secret securely. Run `answer` twice with distinct event IDs and `summary`, then repeat an event ID; confirm the star count cannot rise on replay. Confirm an invalid token, another student's token, a locked second sublevel, and a grade-above-limit question are rejected.
6. Before any external HTTP test, separately evaluate Apps Script CORS, authenticated response transport, rate limits, deployment restrictions, answer-key management, conflict recovery, device reauthentication, and data minimization. Do not make the service public until these checks pass.

**No real learner data should be tested in the pilot without school approval.**

## Remaining requirements before classroom use

- A working credential-delivery and recovery flow integrated with the browser (currently **not** connected).
- Explicit school authorization and privacy notices, including a process to reset a lost token without impersonation.
- Server-verified diagnostic placement and secure progression, including permitted starting grade.
- Private class-membership verification, tamper-resistant activity events, and student-scoped sync conflict handling.
- End-to-end Android/iOS/offline tests and an appropriate load/reliability plan.
- A separate audit before allowing any class-level rankings, which should be based on **server-calculated** totals only.

**Release gate:** `MEJ_V2_ENABLED` must remain unset or `false` on the existing production deployment.

## Stage 3 — Class-only rankings (code implemented, inactive)

The verified pilot now offers an opt-in `leaderboard` action. Rankings count **server-verified stars** only. Students are grouped by an administrator-assigned `Cohort` identifier in addition to school grade and class; the same class name in different schools must always have distinct cohort identifiers. Issue a new single-use invitation using `mejV2IssueInvite_(grade, className, cohortId)`. Example: `mejV2IssueInvite_(9,'9A','BOYS_SCHOOL_A_G9A_EN')`.

The requester must authenticate using their own student ID and device token. There is **no public leaderboard**. Responses contain only the rank, display name, stars, and an `isMe` marker for same-cohort students — no other student's ID, school level, answered questions, login token, or learning stage. Equal stars share a rank. A class larger than 100 students is rejected for pilot review.

**Default OFF:** the `MEJ_V2_RANKING_ENABLED` script property is absent/false unless the school explicitly turns it on, and the verified-progress pilot must also be enabled. The legacy browser is not connected to this endpoint. The classroom ranking is therefore **not live or available to real learners**, even though the synthetic backend and display tests pass.

**Preview only:** `reviews/stage3-ranking-preview.html` shows fictional students and their stars. It is not connected to any student record.

Before activating either pilot flag, require school authorization for sharing students' display names within the class and confirm per-student authentication, a school-specific cohort ID, correct grade/class membership, server endpoint deployment, restricted transport, and end-to-end phone testing. Do not migrate or reuse old `Student_Progress` totals as verified ranking scores.
