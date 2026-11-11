(() => {
 'use strict';
 let opening=false;
 const current=p=>currentIsland(p);
 window.mejSailorStage=p=>{
   const g=current(p);
   if(countMaster(g,p)>=40)return g;
   for(let i=12;i>=0;i--)if(permitted(i)&&countMaster(i,p)>=40)return i;
   return g;
 };
 window.openMejSailor=async function(){
   if(opening||document.getElementById('mejSailorWindow'))return;
   const student=active(),stage=mejSailorStage(student);
   if(countMaster(stage,student)<40)return toast('تفتح اللعبة عند الشارة الثانية في المرحلة.');
   const token=localStorage.getItem('MEJ_STUDENT_ACCESS_V1');
   if(!token)return toast('اربط حساب الطالب بالمعلم للتحقق من نجوم المرحلة.');
   opening=true;
   try{
     if(typeof sendReport==='function')await sendReport(false);
     const response=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-progress',{
       method:'POST',cache:'no-store',headers:{authorization:'Bearer '+token,'content-type':'application/json'},
       body:JSON.stringify({action:'student_get'}),signal:AbortSignal.timeout(10000)});
     if(!response.ok)throw Error('sync');
     const result=await response.json();
     if(active().id!==student.id||token!==localStorage.getItem('MEJ_STUDENT_ACCESS_V1'))return;
     const device=localStorage.getItem('MEJ_STUDENT_DEVICE_REF_V1');
     if(!result.ok||!result.hasSnapshot||!device||result.studentRef!==device)return toast('يلزم مزامنة حساب الطالب قبل فتح اللعبة.');
     const row=result.progress?.level_stats?.find(item=>Number(item.level)===stage);
     const stars=Math.min(countMaster(stage,student),Number(row?.mastered)||0);
     if(stars<40)return toast('بانتظار تأكيد ٤٠ نجمة في هذه المرحلة. أعد المحاولة بعد المزامنة.');
     const dialog=document.createElement('dialog'),frame=document.createElement('iframe'),back=document.createElement('button');
     dialog.id='mejSailorWindow';dialog.style='padding:0;border:0;background:#064859;width:100vw;height:100dvh;max-width:100vw;max-height:100dvh';
     back.textContent='↩ العودة إلى رحلتي';back.style='height:42px;width:100%;font:bold 16px system-ui;background:#064859;color:white;border:none';
     frame.title='مغامرة البحّار العُماني';frame.style='display:block;width:100%;height:calc(100% - 42px);border:0';
     const link=()=>{if(dialog.open&&active().id===student.id)frame.contentWindow.postMessage({type:'mej:sailor-link',studentId:result.studentRef,stageId:String(stage),phase:Math.max(1,stage),stageStars:stars},location.origin)};
     function receive(e){if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='mej:sailor-ready')link()}
     window.addEventListener('message',receive);frame.addEventListener('load',link);
     dialog.onclose=()=>{window.removeEventListener('message',receive);dialog.remove()};
     back.onclick=()=>dialog.close();frame.src='./omani-sailor/index.html';dialog.append(back,frame);document.body.append(dialog);dialog.showModal();
   }catch{toast('تعذّر التحقق من نجوم الطالب. تأكد من الاتصال ثم أعد المحاولة.')}finally{opening=false}
 };
})();
