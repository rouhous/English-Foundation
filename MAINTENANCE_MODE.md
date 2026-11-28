# Temporary maintenance mode — My English Journey
Date: 2026-11-28

The public app is temporarily replaced by an Arabic maintenance notice. This does **not** delete application code, student progress, localStorage, IndexedDB, or database records.

- Repository: rouhous/English-Foundation
- Public app: https://rouhous.github.io/English-Foundation/
- Pre-maintenance commit: `2f4ca213ca488cf33ddd8b328dde2d9217a2ef11`
- Original application entry point `index.html` blob SHA: `06dca0ebc9f60cc37d09a46b5f20110371da100a`
- Original service worker `sw.js` blob SHA: `8a3a016f743590118baf3ac4c042aaabe9d74492`
- Maintenance notice commit: `9d90b3e215aee3e4dde18273f8f48d413aab6233`
- Maintenance service-worker commit: `d4bb6baa3d39e777dabdec75f5cf837726fa2ab8`

## Reopening the application
When the owner says maintenance is complete, restore **both** `index.html` and `sw.js` from the pre-maintenance commit above (or their exact original blob SHAs) in new commits. Preserve any newer intended edits to these files by merging them before restoration. Do not revert unrelated files or commits. The latest market bilingual-label update is in commit `2f4ca213ca488cf33ddd8b328dde2d9217a2ef11` and must remain.

The temporary service worker claims control of the app and serves the maintenance notice for page navigations, including installed PWAs after they receive the updated worker. It does not clear or modify user data. Devices that have not connected since deployment may continue to display an older offline build until they reconnect and receive the service-worker update. As this is a static GitHub Pages deployment, raw source and static asset URLs are not access-controlled by this maintenance notice.
