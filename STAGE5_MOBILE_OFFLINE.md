# My English Journey — Stage 5: mobile and offline-first readiness

**Status: Responsive code and Chromium offline smoke tests passed; physical device acceptance still pending.**

## Implemented in original app

- Added `assets/stage5-responsive.css` to the existing `index.html`. It respects iPhone safe areas/notches, maintains visible controls at narrow viewport widths, uses 44px minimum touch targets where possible, supports landscape layouts and reduced-motion preferences, and preserves the original sea/boat homepage artwork.
- Retained the original `mobile-home-fix.css` and all 1,136 previously approved vocabulary pictures.
- Refreshed `sw.js` for the new PWA version. The service worker pre-caches the app shell plus all **12 curated approved-image JS bundles** at install time (best effort per bundle), then uses same-origin cache-first loading. It never caches cross-origin Google Apps Script requests or POST submissions.
- Made cache completeness inspectable through a `MEJ_OFFLINE_STATUS` service-worker message: `imageShardsCached/12`. This is a diagnostic capability, not a visible classroom banner.
- No changes to student accounts or cloud credentials were made during this stage.

## Automated checks passed

`diagnostics/stage5-browser-qa.json` records a real headless Chromium layout check at:
- 320×700 (small phone)
- 390×844 (phone)
- 768×1024 (tablet)
- 1280×800 (desktop)
- 844×390 (landscape)

All five layouts rendered the application, retained all six navigation options, loaded the responsive stylesheet and reported **zero document-level horizontal overflow**.

`diagnostics/stage5-offline-browser.json` records an isolated Chrome browser run. Following an online PWA install, the test checked that all 12 image bundles were stored, disconnected the browser's actual network, reloaded the homepage, opened levels, and returned to the homepage. **All these checks passed.**

`scripts/test_stage5_offline.js` additionally checks that no school-cloud request is intercepted by the offline cache and that the offline core and image shards install correctly in a synthetic service-worker environment.

## Important limitations

- The full image cache requires enough free browser storage and an initial successful online installation. On low-storage devices, some large image banks may fail to cache. The service worker logs this; the app must not claim complete offline picture availability until all 12 bundles are cached.
- The browser tests emulate screen sizes in Chromium. **No actual iPhone Safari or Android Firefox/Chrome hardware tests have been performed**.
- The existing app's local-first student learning remains intact. However, the new Stage 2/3/4 verified authentication and server-reported scoring are **not connected to the live student app**. New cloud synchronization and verified rankings must not be described as active.
- Browsers may clear local storage or PWA caches under storage pressure. An unconfirmed offline answer is not recoverable after a lost/cleared device.

## Recommended physical-device acceptance

1. Install/open the app once while online. On Android Chrome and Firefox and on iPhone Safari, check the entire homepage, game cards, vocabulary pictures, touch targets, and portrait/landscape rotations.
2. Wait for the initial image cache to complete. Then activate airplane mode, **fully close the app**, reopen, check several pictures and activities in multiple stages, and confirm progress saves locally.
3. Restore connectivity. Confirm the **existing configured** cloud reporting flow acknowledges receipt; for the future v2 verified-scoring feature, separately finish authenticated integration and end-to-end response validation.
4. Test on a second device only after verified enrollment/recovery has been deployed to an isolated, school-approved staging project; do not use real children's accounts for this unapproved test.

**Release gate:** A successful browser smoke test does not equal final student deployment approval. Device QA and verified-server deployment remain outstanding.
