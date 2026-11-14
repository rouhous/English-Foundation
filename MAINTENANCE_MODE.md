# Temporary maintenance mode — My English Journey
Date: 2026-11-14

The full application is temporarily replaced with an Arabic maintenance notice. **This is not a deletion of application code, stored student progress, or database records.**

- Repository: rouhous/English-Foundation
- Original application entry point: `index.html`
- Original `index.html` blob SHA: `5403a68a727665566c81a8af89ee3f754e3a2d0b`
- Original `sw.js` blob SHA: `b3bb0105f36c33f6cb775122086923c4d2d54f29`
- Pre-maintenance branch commit: `9049142891a22445522f4c5e8cb089d43adf10f7`

To reopen the application, **restore both `index.html` and `sw.js`** from the pre-maintenance commit (or their documented blob SHAs) in a new commit, preserving all intervening work. Do not revert unrelated changes. If any newer updates to these two files exist, merge them before restoring.

The maintenance service worker responds to app navigation, including installed PWAs after they receive the updated worker, with the maintenance notice even when offline. It does not delete or modify localStorage, IndexedDB, or persistent data. Devices that have not connected since the change may continue displaying an earlier offline build until they reconnect and receive the update. As this is a static GitHub Pages deployment, server-side authorization/blocking of raw source files is not provided.

## Owner-only preview review path (2026-11-14)
- A small gear in the maintenance artwork links to `reviews/admin-preview.html`. The whole student site stays in maintenance.
- The owner must verify their Google identity and enter the **existing** 6-digit Admin code; the Supabase `mej-owner-preview-gate` stores only its salted hash on first owner-only enrollment, and returns a short-lived session.
- `mej-owner-preview-content` independently verifies the Google ID token and that session before serving the pre-maintenance HTML (source pinned to `9049142891a22445522f4c5e8cb089d43adf10f7`).
- The client creates a temporary Blob iframe; it never writes the full app back as a normal public `index.html` or into the arcade. The review toolbar also has a games-only preview. Game release remains false for ordinary visitors.
- GitHub's public source history is still readable. This controls the normal preview UI and its server-backed session, **not access to public source code**. Backend student data still requires its own authorization.
- The review is not proven to be data-write-safe; avoid changing real student records from the preview. Never claim a complete ten-game release based on the current 4-game subset.
