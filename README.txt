English Explorer Oman PWA icons

Upload all PNG files to the same folder as index.html in GitHub Pages.
If the existing manifest already works, keep it and change only its icons array to reference these names. Otherwise upload manifest.webmanifest and ensure index.html contains <link rel="manifest" href="manifest.webmanifest"> in <head>.
For iOS add <link rel="apple-touch-icon" href="icon-192.png"> in <head>.
If icons do not change after uploading, update the service-worker cache version and reinstall/refresh the PWA.
