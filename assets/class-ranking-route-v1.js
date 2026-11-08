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
  const provider=window.MEJ_VERIFIED_RANKING_PROVIDER || (async function(){
   const token=localStorage.getItem('MEJ_STUDENT_ACCESS_V1')||'';
   if(!/^[a-f0-9]{64}$/.test(token))throw Error('STUDENT_LOGIN_REQUIRED');
   const response=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-class-ranking',{
    method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'my_class'}),signal:AbortSignal.timeout(16000)
   });
   const result=await response.json();
   if(!response.ok||result.ok!==true)throw Error(result.error||'RANKING_UNAVAILABLE');
   return result;
  });
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
      'تعذر تحميل الترتيب. تأكد من ربط حساب الطالب وحفظ تقدمه سحابيًا، ثم حاول مجددًا.');
  });
 };
  // Settings entry: content inspection only, without elevating student permissions.
  // Do not treat a public GitHub Pages view as authenticated administrator access.
  const originalOpenSettings=window.openJourneySettings;
  if(typeof originalOpenSettings==='function'){
    window.openJourneySettings=function(){
      const result=originalOpenSettings.apply(this,arguments);
      const modal=document.getElementById('journeySettingsModal');
      const inner=modal?.querySelector('.journey-modal-inner');
      if(inner&&!inner.querySelector('#mej-admin-review-link')){
        const section=document.createElement('section');
        section.className='card';
        section.style.cssText='margin:12px 0;padding:14px;text-align:right';
        const heading=document.createElement('h3');
        heading.textContent='🛡️ Admin — مراجعة المستويات';
        const note=document.createElement('p');
        note.className='caption';
        note.textContent='مراجعة جميع المستويات دون قيود التعلم أو تغيير بيانات الطلاب. الدخول الإداري الموثق يتطلب تسجيل هوية وصلاحيات خادمية.';
        const link=document.createElement('a');
        link.id='mej-admin-review-link';
        link.className='btn mint';
        link.href='./reviews/admin-levels.html';
        link.textContent='🛡️ Admin — فتح مراجعة جميع المستويات';
        section.append(heading,note,link);
        const technical=Array.from(inner.querySelectorAll('h3')).find(h=>h.textContent.includes('معلومات تقنية'));
        if(technical?.parentElement)inner.insertBefore(section,technical.parentElement);
        else inner.appendChild(section);
      }
      return result;
    };
  }
})();
