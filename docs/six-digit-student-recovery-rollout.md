# Six-digit student recovery — rollout notes

## Implemented in the student-account Edge Function
- New licensed and free student registrations receive a cryptographically generated six-digit decimal recovery code, including possible leading zeros.
- Existing authenticated licensed students can request a new six-digit code through the existing `rotate` action. The existing `claim` action issues a code for an identity that did not have one.
- Existing free-profile students can exchange their *currently valid* recovery code for a six-digit one using the new `free_upgrade` action, with `name`, `grade`, `profileRef`, and `recoveryCode`.
- Both twenty-character legacy codes and six-digit codes remain accepted in `recover` and `free_recover`.
- Progress and student references are unchanged by code rotation. Old codes stop working once rotated.

## Remaining before release
1. Update the large `index.html` frontend to display and accept six digits, invoke `rotate` for authenticated existing licensed students and `free_upgrade` for existing free profiles. Keep a one-time conspicuous display and secure copy/print option. Prevent automatic repeated rotation on each launch.
2. Test live endpoint with a temporary registered student, an older 20-character code, free and licensed account recovery, offline sync, teacher linkage, and rate limiting.
3. Deploy the Edge Function from this branch to Supabase after review, then release the frontend.
4. To reissue codes for **students who cannot access their original device or old code**, implement an authorized owner/teacher identity-verification and distribution workflow; **never** expose bulk student codes or overwrite them silently in the public browser. Cryptographic hashes of existing recovery codes cannot be reversed.
5. Six digits are weaker than the previous 20-character codes. Preserve strict rate limits and consider additional cooldowns/account lockouts, since a 6-digit space has only one million possibilities.

**This branch does not bulk-rotate live students and is not deployed.**
