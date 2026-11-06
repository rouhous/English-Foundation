/* My English Journey - offline-first launch recovery, 2026-11-05.
 * Navigation must never wait for the network when the PWA shell is cached.
 * Never clear localStorage/IndexedDB or intercept remote student reports.
 */
const CACHE='mej-image-free-home-20261106-v1';
const CORE=['./','./index.html','./mobile-home-fix.css','./assets/stage5-responsive.css',
 './manifest.webmanifest','./icon-192.png','./icon-512.png',
 './assets/class-ranking-v1.css','./assets/class-ranking-v1.js',
 './assets/class-ranking-route-v1.js',
 './reviews/owner-review.html','./reviews/pilot-full.html','./reviews/admin-levels.html',
 './reviews/learning.html','./reviews/admin-levels-catalog.json'];
const IMAGE_SHARDS=Array.from({length:12},(_,i)=>
 './assets/approved-images-'+String(i+1).padStart(2,'0')+'.js?v=20261105-stage0-69');
let warmStarted=false;
async function warmPictures(){
 if(warmStarted)return;
 warmStarted=true;
 try{
  const cache=await caches.open(CACHE);
  // Keep each request optional; never hold a PWA launch or activation open.
  for(let i=0;i<IMAGE_SHARDS.length;i+=2){
   await Promise.all(IMAGE_SHARDS.slice(i,i+2).map(async path=>{
    try{if(!await cache.match(path))await cache.add(path)}
    catch(e){console.warn('Offline picture cache postponed:',path)}
   }));
  }
 }finally{warmStarted=false}
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  await self.clients.claim();
  // Leave older caches until the new shell is present. Preserve all user data.
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('english-explorer-')&&k!==CACHE)
   .map(k=>caches.delete(k)));
 })());
 // After activation, fill 12 image banks without blocking navigation.
 warmPictures().catch(()=>{});
});
self.addEventListener('message',event=>{
 if(event.data?.type==='MEJ_OFFLINE_STATUS'){
  event.waitUntil((async()=>{
   const cache=await caches.open(CACHE);
   const found=await Promise.all(IMAGE_SHARDS.map(p=>cache.match(p).then(Boolean)));
   event.source?.postMessage({type:'MEJ_OFFLINE_STATUS',
    coreCached:!!(await cache.match('./index.html')),
    imageShardsCached:found.filter(Boolean).length,imageShardsTotal:12});
  })());
 }
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   // Use a separate cache key for each page. Never serve the main app as an
   // admin/review page, and never cache query parameters as authorization.
   const appRoot=new URL('./',self.location.href);
   const pathname=url.pathname;
   const mainPath=appRoot.pathname;
   const isMain=pathname===mainPath||pathname===mainPath+'index.html';
   const cacheKey=isMain?'./index.html':pathname.startsWith(mainPath)?'.'+pathname.slice(mainPath.length-1):null;
   // Authentication pages must not be served stale from the offline cache.
   // Require a fresh page; ordinary learning stays offline-first.
   if(pathname===mainPath+'reviews/owner-login.html'){
    try {return await fetch(request,{cache:'no-store'})}
    catch(_){return new Response('Login requires an internet connection.',{
     status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
    })}
   }
   const cached=cacheKey?await caches.match(cacheKey):null;
   if(cached){
    event.waitUntil(fetch(request).then(async response=>{
     if(response.ok && cacheKey){
      try{await(await caches.open(CACHE)).put(cacheKey,response.clone())}
      catch(_){}
     }
    }).catch(()=>{}));
    return cached;
   }
   try{
    const response=await fetch(request);
    if(response.ok && cacheKey){
     try{await(await caches.open(CACHE)).put(cacheKey,response.clone())}
     catch(_){}
    }
    return response;
   }catch(_){return Response.error()}
  })());
  return;
 }
 event.respondWith(caches.match(request,{ignoreSearch:true}).then(async cached=>{
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok){try{await(await caches.open(CACHE)).put(request,response.clone())}catch(_){}}
  return response;
 }));
});
