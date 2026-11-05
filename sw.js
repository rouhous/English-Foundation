/* My English Journey — Stage 5 offline-first PWA.
 * The app and its curated vocabulary JS image banks are cached for offline use.
 * Google Apps Script requests are NEVER intercepted, stored or faked.
 */
const CACHE='english-explorer-stage5-offline-20261105-v1';
const CORE=['./','./index.html','./mobile-home-fix.css','./assets/stage5-responsive.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/class-ranking-v1.css','./assets/class-ranking-v1.js','./assets/class-ranking-route-v1.js'];
const IMAGE_SHARDS=Array.from({length:12},(_,i)=>'./assets/approved-images-'+String(i+1).padStart(2,'0')+'.js?v=20261104-approved');
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Essential HTML/CSS/scripts install atomically. If these are unavailable
    // we keep the previous service worker active rather than shipping a broken shell.
    await cache.addAll(CORE);
    // Shards are large: cache in small batches and tolerate quota/network limits.
    // A partial cache is not called "fully offline-ready" in the release audit.
    for(let i=0;i<IMAGE_SHARDS.length;i+=3){
      await Promise.all(IMAGE_SHARDS.slice(i,i+3).map(async url=>{
        try{await cache.add(url)}catch(e){console.warn('Offline image shard not cached:',url)}
      }));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    // Keep older caches until the new core is installed, then remove obsolete versions.
    await Promise.all(keys.filter(k=>k.startsWith('english-explorer-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='MEJ_OFFLINE_STATUS'){
    event.waitUntil((async()=>{
      const cache=await caches.open(CACHE);
      const hits=await Promise.all(IMAGE_SHARDS.map(path=>cache.match(path).then(Boolean)));
      event.source?.postMessage({
        type:'MEJ_OFFLINE_STATUS',coreCached:!!(await cache.match('./index.html')),
        imageShardsCached:hits.filter(Boolean).length,imageShardsTotal:IMAGE_SHARDS.length
      });
    })());
  }
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  // Reporting, student credentials and remote APIs are never cached or redirected.
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const isHome=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
      const patch=async response=>{
        if(!isHome||!response.ok)return response;
        const html=await response.text();
        const tag='<link rel="stylesheet" href="./mobile-home-fix.css?v=20261104-2">';
        if(!html.includes('</head>'))return new Response(html,response);
        return new Response(html.replace('</head>',tag+'</head>'),{
          status:response.status,statusText:response.statusText,
          headers:{'Content-Type':'text/html; charset=utf-8'}
        });
      };
      try{
        const fresh=await fetch(request);
        if(!fresh.ok)throw Error('HTTP '+fresh.status);
        const result=await patch(fresh);
        if(isHome)(await caches.open(CACHE)).put('./index.html',result.clone()).catch(()=>{});
        return result;
      }catch(_){
        const cached=await caches.match(request,{ignoreSearch:true})||await caches.match('./index.html');
        return cached?await patch(cached):Response.error();
      }
    })());
    return;
  }
  // Cache-first for local files, fetch & cache missing files when online.
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>
    cached||fetch(request).then(async response=>{
      if(response.ok){
        try{await (await caches.open(CACHE)).put(request,response.clone())}catch(_){}
      }
      return response;
    })
  ));
});
