/* My English Journey temporary maintenance worker v4.
 * Keep learner data untouched: no localStorage, IndexedDB, or progress operations.
 * Owner review routes under /reviews/ always fall through to the network.
 * Registration update checks are driven by the controlled maintenance page,
 * because a service worker may be suspended between events.
 */
const CACHE = 'mej-maintenance-20261128-v4';
const MAINTENANCE_HTML = "<!doctype html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#124f43\">\n<meta name=\"robots\" content=\"noindex,nofollow\">\n<title>رحلتي مع الإنجليزية | تحديث مؤقت</title>\n<style>\n:root{color-scheme:light;--green:#124f43;--gold:#d7b36e;--cream:#fff4dc}\n*{box-sizing:border-box}\nhtml,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,\"Segoe UI\",sans-serif}\nbody{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 12%,#fff3d9,#dfc18e 70%,#b58a56);color:#17392e}\nmain{width:min(100%,520px);padding:clamp(26px,7vw,46px) 24px;text-align:center;background:linear-gradient(150deg,#fffaf0,#fff0d2);border:2px solid var(--gold);border-radius:24px;box-shadow:0 12px 35px #3d2b1838}\n.emblem{width:78px;height:78px;margin:0 auto 18px;display:grid;place-items:center;border-radius:50%;background:var(--green);border:3px solid var(--gold);color:var(--cream);font-size:38px;text-decoration:none}\nh1{margin:0 0 12px;color:var(--green);font-size:clamp(25px,6vw,34px)}\np{margin:0;font-size:clamp(16px,4vw,19px);line-height:1.9}\n.note{margin-top:18px;color:#6b5637;font-size:14px}\nbutton{margin-top:24px;padding:12px 28px;border:0;border-radius:999px;background:var(--green);color:#fff4dc;font:inherit;font-weight:700;cursor:pointer}\nbutton:focus-visible{outline:3px solid #b58a56;outline-offset:3px}\n</style>\n</head>\n<body>\n<main>\n<a class=\"emblem\" href=\"./reviews/owner-login.html\" aria-label=\"دخول المالك\" title=\"دخول المالك\">⚓</a>\n<h1>رحلتي مع الإنجليزية</h1>\n<p>التطبيق متوقف مؤقتًا لإجراء بعض التحديثات والتحسينات.</p>\n<p class=\"note\">سنعود إليكم قريبًا بإصدار أفضل. شكرًا لصبركم وتفهمكم.</p>\n<button id=\"refresh-now\" type=\"button\">تحديث الآن</button>\n</main>\n<script>\n(() => {\n  let reloadIssued = false;\n  let registration = null;\n  const reloadOnce = () => {\n    if (reloadIssued) return;\n    reloadIssued = true;\n    location.reload();\n  };\n  const checkForUpdate = async () => {\n    try {\n      if (!registration && navigator.serviceWorker) {\n        registration = await navigator.serviceWorker.register('./sw.js', {scope:'./'});\n      }\n      if (registration) await registration.update();\n    } catch (error) {\n      console.warn('Maintenance update check failed:', error);\n    }\n  };\n  if ('serviceWorker' in navigator) {\n    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);\n    checkForUpdate();\n    window.addEventListener('online', checkForUpdate);\n    document.addEventListener('visibilitychange', () => {\n      if (document.visibilityState === 'visible') checkForUpdate();\n    });\n    window.setInterval(checkForUpdate, 6 * 60 * 60 * 1000);\n  }\n  document.getElementById('refresh-now').addEventListener('click', async () => {\n    await checkForUpdate();\n    reloadOnce();\n  });\n})();\n</script>\n</body>\n</html>";

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.put(new URL('./index.html', self.registration.scope), new Response(MAINTENANCE_HTML, {
      headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const keys = await caches.keys();
    await Promise.all(keys.filter(name => name.startsWith('mej-maintenance-') && name !== CACHE)
      .map(name => caches.delete(name)));
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const scopePath = new URL(self.registration.scope).pathname;
  const reviewsPath = scopePath + 'reviews/';
  if (url.pathname.startsWith(reviewsPath)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(new URL('./index.html', self.registration.scope));
    return saved || new Response(MAINTENANCE_HTML, {
      headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
    });
  })());
});
