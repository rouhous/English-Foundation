/* My English Journey: temporary full-app maintenance mode (2026-11-14).
 * Never touch localStorage, IndexedDB, student records or saved progress.
 * To restore the app, restore both index.html and sw.js from the pre-maintenance
 * commit. Do not leave this service worker enabled after restoration.
 */
const MAINTENANCE_HTML="<!doctype html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#073a64\">\n<meta name=\"robots\" content=\"noindex\">\n<title>جاري التحديث | رحلتي مع الإنجليزية</title>\n<style>\n:root{color-scheme:light;font-family:system-ui,-apple-system,\"Segoe UI\",Tahoma,Arial,sans-serif}\n*{box-sizing:border-box}\nhtml,body{min-height:100%;margin:0}\nbody{background:radial-gradient(ellipse at 80% 2%,#2d91b9 0%,#0f648e 28%,#063f6e 67%,#05294f 100%);color:#173952;display:flex;align-items:center;justify-content:center;padding:30px 16px;overflow-x:hidden}\nbody:before{content:\"\";position:fixed;left:-15%;right:-15%;bottom:-22vh;height:44vh;background:radial-gradient(ellipse at top,#37bdc7bb,#1b80ac20 62%,transparent 75%);border-radius:50%;pointer-events:none}\n.glow{position:fixed;width:55vw;height:55vw;max-width:600px;max-height:600px;top:-23vw;left:-17vw;background:#55dcdf29;filter:blur(55px);border-radius:50%;pointer-events:none}\n.panel{position:relative;isolation:isolate;width:min(100%,610px);background:linear-gradient(165deg,#fffefd 0%,#f0fbff 100%);border:1px solid #ffffffb3;border-radius:30px;box-shadow:0 30px 70px #03274885,0 2px 15px #062c4540;overflow:hidden;text-align:center;padding:36px clamp(18px,5vw,46px) 38px}\n.panel:before{content:\"\";position:absolute;left:0;top:0;width:100%;height:7px;background:linear-gradient(90deg,#06a6bd,#e7b656,#0a85aa)}\n.brand{color:#08718e;font-size:clamp(14px,2.8vw,17px);font-weight:800;letter-spacing:.1px;margin:0 0 3px}\n.subbrand{display:block;font-size:13px;color:#5c7b89;direction:ltr;font-weight:650;letter-spacing:.4px}\n.scene{width:100%;max-width:350px;height:auto;display:block;margin:15px auto 3px;filter:drop-shadow(0 8px 9px #1a70892a)}\n.status{display:inline-flex;align-items:center;gap:9px;background:#fff5da;border:1px solid #efda9e;border-radius:99px;padding:9px 17px;font-size:14px;color:#96651b;font-weight:800;margin:14px auto 5px}\n.dot{height:9px;width:9px;border-radius:50%;background:#dd9d28;box-shadow:0 0 0 4px #ebc86d55;animation:pulse 1.8s ease-in-out infinite}\nh1{font-size:clamp(24px,5.4vw,33px);line-height:1.45;color:#103d62;margin:12px 0 12px;font-weight:900}\n.message{margin:0 auto 13px;max-width:490px;font-size:clamp(16px,3.7vw,19px);line-height:1.85;color:#33596d}\n.highlight{display:block;font-size:clamp(20px,4.4vw,26px);color:#087d91;font-weight:900;line-height:1.6;margin:16px 0}\n.foot{font-size:14px;line-height:1.8;color:#67808d;border-top:1px solid #dcecf2;padding-top:17px;margin-top:20px}\n@keyframes pulse{50%{opacity:.45;transform:scale(.8)}}\n@media(prefers-reduced-motion:reduce){.dot{animation:none}}\n</style>\n</head>\n<body>\n<div class=\"glow\" aria-hidden=\"true\"></div>\n<main class=\"panel\">\n  <p class=\"brand\">رحلتي مع الإنجليزية <span class=\"subbrand\" lang=\"en\">My English Journey</span></p>\n  <svg class=\"scene\" viewBox=\"0 0 360 190\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"قارب عماني يبحر نحو قلعة ونجوم\">\n    <defs><linearGradient id=\"sea\" x2=\"0\" y2=\"1\"><stop stop-color=\"#37b8c8\"/><stop offset=\"1\" stop-color=\"#0f719e\"/></linearGradient><linearGradient id=\"sail\" x2=\"0\" y2=\"1\"><stop stop-color=\"#fff6d2\"/><stop offset=\"1\" stop-color=\"#e8c780\"/></linearGradient></defs>\n    <circle cx=\"268\" cy=\"44\" r=\"31\" fill=\"#ffe8a1\"/>\n    <path d=\"M4 144q65-27 124-4t116-2 112 7v35H4z\" fill=\"#81d6d7\"/>\n    <path d=\"M0 158q62 20 120 2t117-3 123 3v30H0z\" fill=\"url(#sea)\"/>\n    <path d=\"M278 122V80h12V68h26v15h11v39z\" fill=\"#e9c18b\"/>\n    <path d=\"M278 80h48m-37-12v-9m27 9v-9\" stroke=\"#bb9364\" stroke-width=\"4\"/>\n    <rect x=\"298\" y=\"94\" width=\"8\" height=\"28\" rx=\"4\" fill=\"#b68c60\"/>\n    <path d=\"M56 131h183l-24 25H82z\" fill=\"#84552f\"/><path d=\"M71 132h150\" stroke=\"#e9ba69\" stroke-width=\"6\"/>\n    <path d=\"M133 34v98\" stroke=\"#765333\" stroke-width=\"5\"/>\n    <path d=\"M129 40L74 122h55z\" fill=\"url(#sail)\" stroke=\"#d7b579\" stroke-width=\"2\"/>\n    <path d=\"M139 48l69 75h-69z\" fill=\"#ffffff\" stroke=\"#d5dde0\" stroke-width=\"2\"/>\n    <path d=\"M133 33l28 8-28 9z\" fill=\"#e34b45\"/>\n    <path d=\"M32 44l5 10 11 2-9 7 2 11-9-5-9 5 2-11-9-7 11-2zM234 21l3 6 7 2-6 5 1 7-5-4-7 3 1-7-6-4 7-2z\" fill=\"#f3c565\"/>\n    <path d=\"M26 171q18 7 36 0m181 5q18 7 36 0m31-14q12 5 25 0\" stroke=\"#e9ffff\" stroke-linecap=\"round\" stroke-width=\"4\" fill=\"none\"/>\n  </svg>\n  <div class=\"status\" aria-label=\"حالة التطبيق\"><span class=\"dot\" aria-hidden=\"true\"></span> جاري التحديث...</div>\n  <h1>نعتذر عن إيقاف التطبيق مؤقتًا</h1>\n  <p class=\"message\">نعمل على تطوير <strong>رحلتي مع الإنجليزية</strong> وتحسين الألعاب والأنشطة التعليمية، لنقدم لكم تجربة أكثر متعة وتفاعلًا.</p>\n  <strong class=\"highlight\">🎮 ترقبوا مزيدًا من الألعاب قريبًا!</strong>\n  <p class=\"message\">شكرًا لتفهمكم وصبركم. نراكم قريبًا في رحلة جديدة من التعلّم والمغامرة.</p>\n  <footer class=\"foot\" lang=\"en\">We're updating My English Journey. More exciting games are coming soon!</footer>\n</main>\n<script>\n(function(){\n  if(!(\"serviceWorker\" in navigator))return;\n  let reloaded=false;\n  navigator.serviceWorker.addEventListener(\"controllerchange\",function(){\n    if(!reloaded){reloaded=true;location.reload()}\n  });\n  navigator.serviceWorker.register(\"./sw.js\",{updateViaCache:\"none\"})\n    .then(function(reg){return reg.update()})\n    .catch(function(){});\n})();\n</script>\n</body>\n</html>\n";
const APP_SCOPE=new URL(self.registration.scope);
function maintenanceResponse(){
  return new Response(MAINTENANCE_HTML,{
    status:200,headers:{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'no-store, max-age=0',
      'X-Robots-Tag':'noindex'
    }
  });
}
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(windows.map(async client=>{
      if(client.url.startsWith(APP_SCOPE.href)){
        try{await client.navigate(APP_SCOPE.href)}catch(_){}
      }
    }));
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||req.mode!=='navigate')return;
  const url=new URL(req.url);
  if(url.origin!==APP_SCOPE.origin||!url.pathname.startsWith(APP_SCOPE.pathname))return;
  event.respondWith(maintenanceResponse());
});
