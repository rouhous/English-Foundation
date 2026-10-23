// English Explorer PWA – core offline cache, no caching of Google reporting requests.
const CACHE='english-explorer-2026-v5-teacher-code-20261023';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('english-explorer-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(async res=>{if(res.ok){let cache=await caches.open(CACHE);cache.put('./index.html',res.clone())}return res}).catch(async()=>await caches.match('./index.html')||Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(async res=>{if(res.ok){let cache=await caches.open(CACHE);cache.put(request,res.clone())}return res})));
});
