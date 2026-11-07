/* In-app teacher application and student code administration (no Google Apps Script). */
(function(root){
'use strict';
const ENDPOINT='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-staff-native';
async function call(token,action,body={}){
 const resp=await fetch(ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
  body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(16000)});
 const out=await resp.json();if(!resp.ok||out.ok!==true)throw Error(out.error||'SERVER_REJECTED');
 return out;
}
function text(tag,value){const e=document.createElement(tag);e.textContent=value;return e;}
async function applications(token,host){
 host.replaceChildren(text('p','جار تحميل طلبات المعلمين...'));
 try{
  const d=await call(token,'manager_pending');
  host.replaceChildren(text('h3','طلبات تسجيل المعلمين'));
  if(!d.applications?.length){host.append(text('p','لا توجد طلبات معلقة.'));return;}
  for(const app of d.applications){
   const row=document.createElement('div');row.className='panel';row.style.background='#fff';
   row.append(text('strong',app.teacher_name||'معلم'),text('p','البريد: '+app.google_email),text('p','الأقسام: '+app.requested_classes));
   const tools=document.createElement('div');tools.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
   for(const [action,label] of [['manager_approve','اعتماد المعلم'],['manager_reject','رفض الطلب']]){
    const button=text('button',label);button.type='button';button.style.cssText='font:inherit;padding:10px;border:1px solid #91c7c1;border-radius:9px;background:#e5f4f1;color:#114757';
    button.onclick=async()=>{
     button.disabled=true;
     try{await call(token,action,{applicationId:app.id});await applications(token,host)}
     catch(_){button.disabled=false;host.prepend(text('p','لم تكتمل العملية؛ حاول مجددًا بعد مراجعة صلاحية الحساب.'))}
    };
    tools.append(button);
   }
   row.append(tools);host.append(row);
  }
 }catch(_){host.replaceChildren(text('p','تعذر تحميل طلبات التسجيل. يجب الدخول بحساب مدير مدرسة معتمد.'))}
}
root.MEJNativeStaff={call,applications};
})(window);