# Stage 3 — Own-class verified star ranking

**Status: Backend logic, protected route and synthetic preview implemented. Real student rankings OFF.**

## Expected learner experience

A student enters their own authenticated account and selects **🏆 ترتيب صفي** (My Class Ranking). Once the school's verified-progress service has been deployed, approved, and integrated, the page will list only classmates in the same teacher/school-specific cohort. Each row shows **rank, student display name, and total verified stars**. It does not show learning level, stage, diagnostic result, activity history, student ID, or device credentials. Equal star totals share a rank. The student's own row is highlighted.

Until secure authentication and backend transport work end-to-end, the main app displays a clear unavailability message rather than fabricated rankings or unverified client totals.

## Isolation and authorization

The independent `Code.gs` verified pilot uses `mej-verified-v2`, `action: 'leaderboard'`, **a student-specific device token**, server-stored grade and class, and an admin-defined `Cohort` ID. The cohort MUST be unique to an approved school/class/teacher grouping. A class called 9A at School A and a class called 9A at School B MUST have distinct cohorts. The server ignores any grade/class/cohort fields submitted by the requesting client and derives membership from the authenticated student record.

The ranking is disabled unless BOTH `MEJ_V2_ENABLED` and `MEJ_V2_RANKING_ENABLED` are explicitly set to `true` in the relevant TEST Apps Script project's script properties. Those properties remain disabled in the repository defaults.

The response has only `{rank,name,stars,isMe}` for each classmate, and the grouping class name; no IDs or levels for other students. At most 100 members per cohort are supported for the pilot. Backend counts mastered question IDs to compute stars; no client-submitted score is trusted. Invalid credentials, a missing cohort, or disabled feature flags cause requests to be rejected.

## Verified synthetic tests

GitHub Actions workflow `verify-student-pilot.yml` runs `scripts/test_verified_pilot.js` against a mock Apps Script spreadsheet. It tests grade/class isolation, school cohort isolation, credentials, disabled-by-default ranking, tied ranks, own-row flag, score integrity, replay resistance, and absence of levels/other student IDs.

The UI test `scripts/test_stage3_ranking_view.js` checks rendered ranking rows, tied ranks, rejection of unverified client-score payloads, and safe DOM text rendering of fake, markup-shaped names.

## Review materials

- `reviews/stage3-ranking-preview.html` — fictional class 9A with five fake students, an interactive choice of whose row is highlighted, and an unavailable-state example.
- `assets/class-ranking-v1.js` — safe DOM renderer for an authenticated verified response.
- `assets/class-ranking-route-v1.js` — app route displays unavailability until the approved authenticated transport supplies a verified ranking response.

## Deployment / release blockers

1. Set up the verified-progress protocol on a separate school-approved **test** Apps Script + Sheet; the current repository's updated `Code.gs` is not automatically deployed to any live receiver.
2. Complete secure browser account enrollment, credential recovery, trusted POST response channel and student-scoped sync. The current legacy client and `MEJ_VERIFIED_RANKING_PROVIDER` are **not** connected to the verified pilot.
3. Review student name visibility, school consent/privacy safeguards and approved cohort management. Use teacher-approved display names if school policy prefers them.
4. Validate Android/iPhone offline and multiple-device behavior, including stale submissions, cross-class attempts and privacy.
5. Only then enable the pilot flags and user-facing real rankings.

**Do not enable public rankings, use old Google Sheets summary stars, or report pilot tests as real classroom readiness.**
