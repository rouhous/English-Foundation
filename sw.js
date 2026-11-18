/* My English Journey - offline-first launch recovery, 2026-11-05.
 * Navigation must never wait for the network when the PWA shell is cached.
 * Never clear localStorage/IndexedDB or intercept remote student reports.
 */
const CACHE='mej-stations-boat-and-docks-20261118-v5';
const isStationsAsset=path=>/\/assets\/sea-map\/stations\.(?:js|css)$/.test(path);
const CORE=['./assets/sea-map/boat.webp','./assets/sea-map/castle.webp','./assets/sea-map/desktop.webp','./assets/sea-map/phone.webp','./assets/sea-map/stations.css','./assets/sea-map/stations.js','./coastal-arcade/index.html','./coastal-arcade/app-bridge.js','./coastal-arcade/quality-fixes.js','./assets/mej-sailor-host.js','./assets/mej-hidden-badges-v1.css','./hidden-objects/index.html','./hidden-objects/assets.js','./hidden-objects/photo-scenes.js','./hidden-objects/precision-v3-client.js','./hidden-objects/first-badge-practice.js','./hidden-objects/practice-region-library-a.js','./hidden-objects/practice-region-library-b.js','./hidden-objects/practice-region-library-c.js','./hidden-objects/practice-region-loader.js','./hidden-objects/museum-scene-practice-20261116.js','./hidden-objects/assets/stage04-badge03_museum.webp','./hidden-objects/airport-scene-practice-20261116.js','./hidden-objects/assets/stage08-badge05_airport.webp','./hidden-objects/generated-13-scene-practice-20261116.js','./hidden-objects/assets/base_classroom.webp','./hidden-objects/assets/variant_classroom.webp','./hidden-objects/assets/variant_souq_harbour.webp','./','./index.html','./mobile-home-fix.css','./assets/stage5-responsive.css',
 './manifest.webmanifest','./assets/mej-writing-curriculum-v3.js','./assets/mej-writing-skills-v1.js','./assets/mej-mobile-ui-v2.css','./assets/mej-companion-art-v1.js','./assets/mej-companion-live-v1.js','./assets/mej-skill-expansion-v1.js','./assets/mej-spelling-skills-v1.js','./assets/student-cloud-progress-v1.js','./assets/verified-offline-outbox-v1.js','./assets/verified-sync-bridge-v1.js','./icon-192.png','./icon-512.png',
 './assets/mej-user-voyage.png','./assets/background%20PC.png','./assets/class-ranking-v1.css','./assets/class-ranking-v1.js',
 './assets/class-ranking-route-v1.js',
 './reviews/owner-review.html','./reviews/pilot-full.html','./reviews/admin-levels.html',
 './reviews/learning.html','./reviews/admin-levels-catalog.json'];
const COASTAL_BADGES=Array.from({length:10},(_,i)=>'./coastal-arcade/badges/coast-'+String(i+1).padStart(2,'0')+'.webp');
const HIDDEN_BADGES=Array.from({length:10},(_,i)=>'./assets/mej-badges-20261112/badge-'+String(i+1).padStart(2,'0')+'.svg');
const OPTIONAL_REAL_SCENES=['01_harbour_market.webp','02_oasis_fortress.webp','03_fishing_harbour.webp','04_traditional_souq.webp','05_phonics_classroom.webp','06_omani_art_room.webp','07_omani_science_room.webp','08_omani_learning_room.webp','09_omani_music_room.webp','10_omani_harbour_market.webp'].map(file=>'./hidden-objects/real-scenes/'+file);
const HIDDEN_NEW_PHOTOS=['./hidden-objects/assets/stage04-badge03_museum.webp'];
const HIDDEN_13_SCENE_PHOTOS=["./hidden-objects/assets/stage08-badge01_sustainable-city.webp","./hidden-objects/assets/stage08-badge07_industrial-port.webp","./hidden-objects/assets/stage09-badge08_medical-clinic.webp","./hidden-objects/assets/stage09-badge10_transport-hub.webp","./hidden-objects/assets/stage10-badge09_field-expedition.webp","./hidden-objects/assets/stage11-badge02_architecture-studio.webp","./hidden-objects/assets/stage11-badge06_astronomy-observatory.webp","./hidden-objects/assets/stage12-badge02_sustainability-summit.webp","./hidden-objects/assets/stage12-badge03_environmental-lab.webp","./hidden-objects/assets/stage12-badge04_historical-archives.webp","./hidden-objects/assets/stage12-badge05_smart-city-control.webp","./hidden-objects/assets/stage12-badge08_medical-research.webp","./hidden-objects/assets/stage12-badge10_space-station.webp"];
const HIDDEN_PHOTO_LIBRARY=["./hidden-objects/assets/base_art_room.webp","./hidden-objects/assets/base_beach.webp","./hidden-objects/assets/base_canteen.webp","./hidden-objects/assets/base_classroom.webp","./hidden-objects/assets/base_classroom2.webp","./hidden-objects/assets/base_coastalpicnic.webp","./hidden-objects/assets/base_computer_lab.webp","./hidden-objects/assets/base_ecolab.webp","./hidden-objects/assets/base_familykitchen.webp","./hidden-objects/assets/base_familyliving.webp","./hidden-objects/assets/base_farm.webp","./hidden-objects/assets/base_kitchen2.webp","./hidden-objects/assets/base_library.webp","./hidden-objects/assets/base_market.webp","./hidden-objects/assets/base_music_studio.webp","./hidden-objects/assets/base_omani_market.webp","./hidden-objects/assets/base_park.webp","./hidden-objects/assets/base_renewables.webp","./hidden-objects/assets/base_s1_01.webp","./hidden-objects/assets/base_s1_02.webp","./hidden-objects/assets/base_s1_03.webp","./hidden-objects/assets/base_s1_04.webp","./hidden-objects/assets/base_s1_05.webp","./hidden-objects/assets/base_s1_06.webp","./hidden-objects/assets/base_s1_07.webp","./hidden-objects/assets/base_s1_08.webp","./hidden-objects/assets/base_s1_09.webp","./hidden-objects/assets/base_s1_10.webp","./hidden-objects/assets/base_school.webp","./hidden-objects/assets/base_school_garden.webp","./hidden-objects/assets/base_schoolcorridor.webp","./hidden-objects/assets/base_science_lab.webp","./hidden-objects/assets/base_sports_field.webp","./hidden-objects/assets/base_zoo.webp","./hidden-objects/assets/variant_beach.webp","./hidden-objects/assets/variant_classroom.webp","./hidden-objects/assets/variant_farm_A.webp","./hidden-objects/assets/variant_farm_B.webp","./hidden-objects/assets/variant_harbour_cafe.webp","./hidden-objects/assets/variant_kitchen.webp","./hidden-objects/assets/variant_market_A.webp","./hidden-objects/assets/variant_market_B.webp","./hidden-objects/assets/variant_market_C.webp","./hidden-objects/assets/variant_renewables_lab.webp","./hidden-objects/assets/variant_science_lab.webp","./hidden-objects/assets/variant_souq_harbour.webp","./hidden-objects/assets/variant_zoo.webp"];
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
/* Best-effort offline image warmer: 47 retained WebP scenes, never delays page navigation. */
let hiddenWarmStarted=false;
async function warmHiddenPictures(){
 if(hiddenWarmStarted)return;
 hiddenWarmStarted=true;
 try{
  const cache=await caches.open(CACHE);
  const everyPhoto=[...HIDDEN_PHOTO_LIBRARY,...HIDDEN_13_SCENE_PHOTOS];
  for(let i=0;i<everyPhoto.length;i+=3){
   await Promise.all(everyPhoto.slice(i,i+3).map(async path=>{
    try{if(!await cache.match(path))await cache.add(path)}
    catch(e){console.warn('Hidden photo offline cache postponed:',path)}
   }));
  }
 }finally{hiddenWarmStarted=false}
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // A single optional missing asset must never invalidate the entire app shell.
  await Promise.all([...CORE,...HIDDEN_13_SCENE_PHOTOS,...HIDDEN_BADGES,...COASTAL_BADGES,...OPTIONAL_REAL_SCENES].map(async item=>{
    try{
      const request=isStationsAsset(item)?new Request(new URL(item,self.location.href),{cache:'reload'}):item;
      await cache.add(request);
    }catch(error){console.warn('Optional shell item unavailable:',item)}
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
 if(isStationsAsset(path)){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),3500);
   try{
    const response=await fetch(request,{cache:'no-store',signal:controller.signal});
    if(response.ok){
     try{await cache.put(request,response.clone())}catch(_){}
     return response;
    }
   }catch(_){}
   finally{clearTimeout(timeout)}
   return (await cache.match(request,{ignoreSearch:true})) ||
     (await caches.match(request,{ignoreSearch:true})) || Response.error();
  })());
  return;
 }
 const isStaffPage=/\/reviews\/(?:teacher-portal|teacher-dashboard|school-dashboard|owner-login)\.html$/.test(path);
 const isStaffScript=/\/assets\/(?:teacher-dashboard-v2|school-dashboard-v1|teacher-progress-v1|staff-native-portal-v1)\.js$/.test(path);
 // Approved vocabulary image banks must always refresh online, while retaining
 // an offline copy of the latest successfully downloaded version.
 const isCompanionAsset=path.endsWith('/assets/mej-writing-skills-v1.js')||path.endsWith('/assets/mej-writing-curriculum-v3.js')||path.endsWith('/assets/mej-companion-art-v1.js')||path.endsWith('/assets/mej-companion-live-v1.js')||path.endsWith('/assets/mej-companion-setup-v1.js')||path.endsWith('/assets/mej-companion-motion-v1.js')||path.endsWith('/assets/mej-companion-3d-v1.js')||path.endsWith('/assets/mej-study-companion.js')||path.endsWith('/assets/student-cloud-progress-v1.js')||path.endsWith('/assets/mej-skill-expansion-v1.js')||path.endsWith('/assets/mej-spelling-skills-v1.js')||path.endsWith('/coastal-arcade/app-bridge.js')||/\/hidden-objects\/(?:precision-v3-client|first-badge-practice|photo-scenes|assets|practice-region-library-[abc]|practice-region-loader|museum-scene-practice-20261116|airport-scene-practice-20261116|generated-13-scene-practice-20261116)\.js$/.test(path);
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
   // Always refresh the badge-game portal online, but retain a usable offline copy.
   // Student Hidden Objects must receive corrected scene maps immediately online;
   // offline-first still works from the most recent saved game page.
   if(pathname===mainPath+'hidden-objects/index.html'){
     event.waitUntil(warmHiddenPictures().catch(()=>{}));
     const hiddenCache=await caches.open(CACHE);
     const offline=await hiddenCache.match('./hidden-objects/index.html');
     try{
       const response=await fetch(request,{cache:'no-store'});
       if(response.ok){try{await hiddenCache.put('./hidden-objects/index.html',response.clone())}catch(_){}}
       return response;
     }catch(_){return offline||Response.error()}
   }
   if(pathname===mainPath+'coastal-arcade/index.html'){
     const coastalCache=await caches.open(CACHE);
     const offline=await coastalCache.match('./coastal-arcade/index.html');
     try{
       const response=await fetch(request,{cache:'no-store'});
       if(response.ok){try{await coastalCache.put('./coastal-arcade/index.html',response.clone())}catch(_){}}
       return response;
     }catch(_){return offline||Response.error()}
   }
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
