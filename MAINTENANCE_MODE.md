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
