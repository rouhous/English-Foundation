/* My English Journey - offline-first launch recovery, 2026-11-05.
 * Navigation must never wait for the network when the PWA shell is cached.
 * Never clear localStorage/IndexedDB or intercept remote student reports.
 */
const CACHE='mej-public-20261109-multi-pupil-profiles-v9-companion2d-v1';
const CORE=['./','./index.html','./mobile-home-fix.css','./assets/stage5-responsive.css',
 './manifest.webmanifest','./assets/mej-writing-curriculum-v3.js','./assets/mej-writing-skills-v1.js','./assets/mej-mobile-ui-v2.css','./assets/mej-companion-art-v1.js','./assets/mej-companion-live-v1.js','./assets/mej-skill-expansion-v1.js','./assets/student-cloud-progress-v1.js','./assets/verified-offline-outbox-v1.js','./assets/verified-sync-bridge-v1.js','./icon-192.png','./icon-512.png',
 './assets/mej-user-voyage.png','./assets/background%20PC.png','./assets/class-ranking-v1.css','./assets/class-ranking-v1.js',
 './assets/class-ranking-route-v1.js',
 './reviews/owner-review.html','./reviews/pilot-full.html','./reviews/admin-levels.html',
 './reviews/learning.html','./reviews/admin-levels-catalog.json'];
const IMAGE_SHARDS=Array.from({length:21},(_,i)=>
 './assets/approved-images-'+String(i+1).padStart(2,'0')+'.js?v=20261107-approved-all');
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
  // A single optional missing asset must never invalidate the entire app shell.
  await Promise.all(CORE.map(async item=>{
    try{await cache.add(item)}catch(error){console.warn('Optional shell item unavailable:',item)}
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  await self.clients.claim();
  // Leave older caches until the new shell is present. Preserve all user data.
  const current=await caches.open(CACHE);
  if(!await current.match('./index.html'))return; // Keep an older working offline shell if upgrade was interrupted.
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE && /^(?:english-explorer-|my-english-journey-|mej-)/.test(k))
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
    imageShardsCached:found.filter(Boolean).length,imageShardsTotal:IMAGE_SHARDS.length});
  })());
 }
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 // Staff portals and their JavaScript must always use the current network build.
 // Never serve stale reports, registration pages, or dashboard scripts from the PWA cache.
 const path=url.pathname;
 const isStaffPage=/\/reviews\/(?:teacher-portal|teacher-dashboard|school-dashboard|owner-login)\.html$/.test(path);
 const isStaffScript=/\/assets\/(?:teacher-dashboard-v2|school-dashboard-v1|teacher-progress-v1|staff-native-portal-v1)\.js$/.test(path);
 // Approved vocabulary image banks must always refresh online, while retaining
 // an offline copy of the latest successfully downloaded version.
 const isCompanionAsset=path.endsWith('/assets/mej-companion-art-v1.js')||path.endsWith('/assets/mej-companion-live-v1.js')||path.endsWith('/assets/mej-companion-setup-v1.js')||path.endsWith('/assets/mej-companion-motion-v1.js')||path.endsWith('/assets/mej-companion-3d-v1.js')||path.endsWith('/assets/mej-study-companion.js')||path.endsWith('/assets/student-cloud-progress-v1.js')||path.endsWith('/assets/mej-skill-expansion-v1.js');
 if(isCompanionAsset){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE);
     try{
       const response=await fetch(request,{cache:'no-store'});
       if(response.ok)await cache.put(request,response.clone());
       return response;
     }catch(_){return (await cache.match(request,{ignoreSearch:true}))||Response.error()}
   })());
   return;
 }
 const isRankingAsset=/\/assets\/class-ranking-(?:route-)?v1\.js$/.test(path);
 if(isRankingAsset){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE);
     try{
       const fresh=await fetch(request,{cache:'no-store'});
       if(fresh.ok)await cache.put(request,fresh.clone());
       return fresh;
     }catch(_){
       return (await cache.match(request,{ignoreSearch:true}))||Response.error();
     }
   })());
   return;
 }
 const isApprovedImageBank=/\/assets\/approved-images-\d{2}\.js$/.test(path);
 if(isApprovedImageBank){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE);
     try{
       const fresh=await fetch(request,{cache:'no-store'});
       if(fresh.ok)await cache.put(request,fresh.clone());
       return fresh;
     }catch(error){
       return (await cache.match(request,{ignoreSearch:true}))||Response.error();
     }
   })());
   return;
 }
 // The teacher's learning-image review must show the newest published images,
 // not an old cache-first HTML page. Still allow previously saved offline access.
 if(path.endsWith('/reviews/learning.html')){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE);
     const cacheKey='./reviews/learning.html';
     try{
       const response=await fetch(request,{cache:'no-store'});
       if(response.ok)await cache.put(cacheKey,response.clone());
       return response;
     }catch(error){
       return (await cache.match(cacheKey))||Response.error();
     }
   })());
   return;
 }
 if(isStaffPage||isStaffScript){
   event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>new Response('تحتاج بوابة المعلم والمدرسة إلى اتصال بالإنترنت لتحميل أحدث إصدار.',{
      status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
   })));
   return;
 }
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
   // Main learner HTML must update immediately online; preserve cached offline startup.
   if(isMain){
    const cache=await caches.open(CACHE);
    const prior=await cache.match('./index.html') ||
      await caches.match(new URL('./index.html',self.location.href),{ignoreSearch:true});
    // Do not strand installed Android PWAs on their OS splash while a
    // slow connection waits indefinitely. Network refresh is bounded.
    const controller=new AbortController();
    const refresh=async()=>{
      try{
        const fresh=await fetch(request,{cache:'no-store',signal:controller.signal});
        if(fresh.ok){
          try{await cache.put('./index.html',fresh.clone())}catch(_){}
          return fresh;
        }
      }catch(_){}
      return null;
    };
    // Give the latest deployed build a short chance, then open the
    // already installed shell instead of leaving the OS splash visible.
    const timeout=new Promise(resolve=>setTimeout(()=>{controller.abort();resolve(null)},prior?1800:4500));
    return (await Promise.race([refresh(),timeout])) ||
      prior ||
      await caches.match(new URL('./index.html',self.location.href),{ignoreSearch:true}) ||
      Response.error();
   }
   const cached=cacheKey?await(await caches.open(CACHE)).match(cacheKey):null;
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
