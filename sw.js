// English Explorer PWA – core offline cache, no caching of Google reporting requests.
const CACHE='english-explorer-mobile-viewport-20261104-v2';
const CORE=['./','./mobile-home-fix.css','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
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
    event.respondWith((async()=>{
      const isHome=(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html'));
      const patch=async response=>{
        if(!isHome||!response.ok)return response;
        const html=await response.text();
        const tag='<link rel="stylesheet" href="./mobile-home-fix.css?v=20261104-2">';
        if(!html.includes('</head>'))return new Response(html,response);
        const fixed=html.replace('</head>',tag+'</head>');
        return new Response(fixed,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}});
      };
      try{
        const res=await fetch(request);
        if(!res.ok)return res;
        const decorated=await patch(res);
        const cache=await caches.open(CACHE);
        if(isHome)await cache.put('./index.html',decorated.clone());
        return decorated;
      }catch(e){
        const cached=await caches.match('./index.html');
        return cached?await patch(cached):Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(async res=>{if(res.ok){let cache=await caches.open(CACHE);cache.put(request,res.clone())}return res})));
});
