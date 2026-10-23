ENGLISH EXPLORER PWA — GitHub Pages upload

1. Create a repository (e.g. english-explorer) on GitHub.
2. Upload ALL five files in this directory to the repository ROOT:
   index.html, manifest.webmanifest, sw.js, icon-192.png, icon-512.png.
3. Settings > Pages > Deploy from a branch > main / (root).
4. Visit the https://<username>.github.io/<repository>/ address in Chrome.
5. On Android Chrome, choose menu > Add to Home screen > Install app (if available).
6. Open the installed application, open speaking and choose Allow while visiting site.

Microphone:
- The site MUST be served over HTTPS, not embedded in a restricted LMS iframe.
- Browser / phone microphone permission still required.
- Some browsers do not support speech recognition even when recording works.
- Avoid "Allow this time" if a persistent permission is desired.
- Recording fallback is available, with no automatic score.
- Speech recognition may require the internet, even if lessons are cached offline.

Google Sheets:
- The existing receiver URL is embedded; NO Google Apps Script changes for this update.
- The PWA does not implement multi-device cloud restore; progress remains per browser/device.
- Export progress as JSON before replacing or moving the app to a new domain/path.
- Offline reporting waits until the application is online. Check the progress dashboard to verify.

For standalone use, open Wadi_English_Explorer_Mobile_Mic_Audio_Fixed.html;
PWA installation needs the whole directory above.

Placement test update (October 2026):
- Select/save the student's registered grade before placement.
- Grade 7 samples only Levels 0-7; other grades work the same way.
- Other/Foundation samples only Levels 0-5.
- The 24 questions are spread across eligible levels, weighted slightly toward the highest ones.
- Placement never exceeds the student's registered grade; the normal progression system is unchanged.
- Cache version updated so installed PWAs can receive the new test.
