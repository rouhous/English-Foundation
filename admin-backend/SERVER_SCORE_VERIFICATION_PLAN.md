# Server-side learning score verification — implementation boundary

Status: design and safety gate only; not deployed and not yet a certified scoring pipeline.

## Current database findings (read-only inspection, 2026-11-28)

- `public.mej_student_progress.score_source` defaults to `CLIENT_REPORTED_UNVERIFIED`.
- The current `public.mej_progress_submit(p_access_hash, p_expected_revision, p_payload)` RPC accepts stars, attempts, correct answers, mastered counts, level stats and private state from the submitted payload, then stores the row with `score_source='CLIENT_REPORTED_UNVERIFIED'`.
- The current `public.mej_arcade_action(..., p_score)` RPC validates the run, attempt count and score range, but the score itself is supplied by the browser and the result is labelled `CLIENT_REPORTED_UNVERIFIED`.
- The deployed `mej-class-ranking` function was reading those unverified rows for the class ranking.

## Safety change in this branch

The repository copy of `mej-class-ranking` now fails closed: only rows marked `SERVER_VERIFIED` can appear in class competition results. Existing client-reported rows remain available in teacher reports but are not eligible for ranking.

The Edge Function source in this branch is not deployed. The live function and live database have not been changed.

## Required work before any score can be marked SERVER_VERIFIED

1. Keep an authoritative answer-key module on the server, generated from the approved question bank and excluded from public client assets.
2. Change the answer submission contract: send the question ID, raw student response, and a unique attempt/event ID. Never accept a client-supplied `ok`, `earnedStars`, total score, or mastered count as proof.
3. Verify the response on the server using the same normalization rules as the learning app. Reject unknown question IDs, invalid payloads, duplicate/replayed event IDs and malformed responses.
4. Persist accepted events in a server-owned append-only ledger with a unique key per student and event. Use a transactional RPC with the existing student revision/advisory-lock model so offline retries are idempotent and concurrent devices cannot double-award.
5. Derive verified attempts, two-correct mastery, per-island stars (capped at the 50-star island target for progress), and ranking eligibility from the verified ledger. Do not promote old client snapshots automatically.
6. Preserve offline use: local results may remain provisional; queued raw answers are verified after reconnection. Only acknowledged server results enter competitions.
7. Add tests for correct/incorrect responses, tampered `ok` flags, repeated event IDs, answer replay, out-of-order offline sync, revision conflicts, legacy accounts and student identity isolation.

## Migration and release rule

A schema migration and coordinated Edge Function/client release are required. They must be tested against an isolated Supabase branch before production deployment. Do not change the live database, deploy functions, or mark old scores as verified as part of this draft.
