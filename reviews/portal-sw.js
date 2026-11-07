/* Dedicated portal service worker: no private data, OAuth tokens, or API responses are cached. */
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 // Network-first, intentionally no caching of auth pages or data.
 event.respondWith(fetch(req));
});
