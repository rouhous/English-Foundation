/* My English Journey stage-3 route. A verified provider is NOT installed yet.
 * This route never exposes local or legacy cloud scores as peer rankings.
 */
(function(){
 'use strict';
 let requestSequence=0;
 window.showClassRanking=function(){
  const host=document.getElementById('app');
  if(!host)return;
  host.replaceChildren();
  const mount=document.createElement('div');
  mount.id='mej-ranking-root';
  host.appendChild(mount);
  if(!window.MEJClassRanking){
   mount.textContent='ترتيب الصف غير متاح حاليًا.';
   return;
  }
  const provider=window.MEJ_VERIFIED_RANKING_PROVIDER;
  if(typeof provider!=='function'){
   window.MEJClassRanking.unavailable(mount,
     'ترتيب صفي سيظهر بعد اعتماد تسجيل الطالب وحماية النجوم على الخادم. لا يتم عرض نتائج الحسابات التجريبية.');
   return;
  }
  const sequence=++requestSequence;
  window.MEJClassRanking.unavailable(mount,'جار التحقق من ترتيب طلاب الصف...');
  // A future authenticated transport must bind this request to the actual
  // student credential; the local profile ID is not authentication.
  Promise.resolve().then(()=>provider()).then(payload=>{
   if(sequence!==requestSequence||!mount.isConnected)return;
   window.MEJClassRanking.render(mount,payload);
  }).catch(()=>{
   if(sequence===requestSequence&&mount.isConnected)
    window.MEJClassRanking.unavailable(mount,
      'تعذر التحقق من ترتيب الصف. لن تُعرض نتائج غير موثقة.');
  });
 };
})();
