/* Temporary maintenance mode for My English Journey.
 * Preserve all student data. Do not clear localStorage or IndexedDB.
 * Restore the normal index.html and sw.js together when maintenance ends.
 */
const MAINTENANCE_HTML = "<!doctype html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#124f43\">\n<meta name=\"robots\" content=\"noindex,nofollow\">\n<title>رحلتي مع الإنجليزية | تحديث مؤقت</title>\n<style>\n:root{color-scheme:light;--green:#124f43;--gold:#d7b36e;--cream:#fff4dc}\n*{box-sizing:border-box}\nhtml,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,\"Segoe UI\",sans-serif}\nbody{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 12%,#fff3d9,#dfc18e 70%,#b58a56);color:#17392e}\nmain{width:min(100%,520px);padding:clamp(26px,7vw,46px) 24px;text-align:center;background:linear-gradient(150deg,#fffaf0,#fff0d2);border:2px solid var(--gold);border-radius:24px;box-shadow:0 12px 35px #3d2b1838}\n.emblem{width:78px;height:78px;margin:0 auto 18px;display:grid;place-items:center;border-radius:50%;background:var(--green);border:3px solid var(--gold);color:var(--cream);font-size:38px}\nh1{margin:0 0 12px;color:var(--green);font-size:clamp(25px,6vw,34px)}\np{margin:0;font-size:clamp(16px,4vw,19px);line-height:1.9}\n.note{margin-top:18px;color:#6b5637;font-size:14px}\n</style>\n</head>\n<body>\n<main>\n<a class=\"emblem\" href=\"/English-Foundation/reviews/owner-login.html\" aria-label=\"دخول المالك\" title=\"دخول المالك\">⚓</a>\n<h1>رحلتي مع الإنجليزية</h1>\n<p>التطبيق متوقف مؤقتًا لإجراء بعض التحديثات والتحسينات.</p>\n<p class=\"note\">سنعود إليكم قريبًا بإصدار أفضل. شكرًا لصبركم وتفهمكم.</p>\n</main>\n</body>\n</html>";
const CACHE = 'mej-maintenance-20261128-v3';
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
  event.waitUntil((async () => { await self.clients.claim(); })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith(new URL('./reviews/', self.registration.scope).pathname)) return;
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(new URL('./index.html', self.registration.scope));
    return saved || new Response(MAINTENANCE_HTML, {
      headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
    });
  })());
});
