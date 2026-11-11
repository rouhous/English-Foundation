const prefix='omani-dhow:'+self.registration.scope+':';
const cacheName=prefix+'6';
const assets=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(assets)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(prefix)&&key!==cacheName).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const root=new URL(self.registration.scope);
 if(event.request.mode==='navigate'&&[root.pathname,root.pathname+'index.html'].includes(url.pathname)){
   event.respondWith(caches.open(cacheName).then(cache=>cache.match('./index.html')).then(hit=>hit||fetch(event.request)));return;
 }
 if(assets.some(path=>new URL(path,root).href===url.href))event.respondWith(caches.open(cacheName).then(cache=>cache.match(event.request)).then(hit=>hit||fetch(event.request)));
});
