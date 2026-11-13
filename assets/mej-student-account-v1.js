/* MEJ verified student identity UI v1. Teacher-linked profiles only; no paid APIs. */
(function(w){
'use strict';if(w.MEJStudentAccount)return;
const API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-student-account';
const KEY='MEJ_STUDENT_RECOVERY_CODES_V1';
const token=()=>localStorage.getItem('MEJ_STUDENT_ACCESS_V1')||'';
const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let busy=false,dialog=null;
async function profileRef(id){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(id)));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function codes(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}
function remember(id,code){if(!id||!code)return;try{const c=codes();c[id]=code;localStorage.setItem(KEY,JSON.stringify(c))}catch(_){}}
async function post(action,data={},auth=false){
 const h={'Content-Type':'application/json'};if(auth){const t=token();if(!/^[a-f0-9]{64}$/.test(t))throw Error('STUDENT_LOGIN_REQUIRED');h.Authorization='Bearer '+t}
 const r=await fetch(API,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',headers:h,body:JSON.stringify({action,...data}),signal:AbortSignal.timeout(13000)});
 const j=await r.json().catch(()=>({}));if(!r.ok||j.ok!==true){const err=new Error(j.error||'SERVICE_UNAVAILABLE');err.status=r.status;throw err}return j;
}
const css=document.createElement('style');css.textContent=`
#mej-student-account-dialog{position:fixed;z-index:100090;inset:0;background:#001e3cbb;display:grid;place-items:center;padding:16px;direction:rtl}
#mej-student-account-dialog section{background:#f2fbff;color:#153e5c;max-width:450px;width:100%;max-height:90dvh;overflow:auto;border-radius:22px;border:2px solid #94cadd;box-shadow:0 20px 50px #00182f88;padding:18px;font:16px/1.7 system-ui}
#mej-student-account-dialog h2{margin:0 0 9px;font-size:21px}
#mej-student-account-dialog input{display:block;width:100%;font:16px system-ui;border:1px solid #95bdcc;border-radius:12px;padding:12px;background:#fff;color:#123;margin:5px 0 12px}
#mej-student-account-dialog button{min-height:45px;border:0;border-radius:12px;padding:11px 15px;font:700 15px system-ui;cursor:pointer;background:#116b91;color:white}
#mej-student-account-dialog .secondary{background:#d9e8ee;color:#174159}
#mej-student-account-dialog .code{font:800 clamp(18px,5vw,26px) ui-monospace,monospace;direction:ltr;text-align:center;padding:14px;border:2px dashed #3281a5;border-radius:13px;letter-spacing:1px;margin:12px 0;overflow-wrap:anywhere}
#mej-student-account-dialog .error{color:#a32533;min-height:24px;font-size:14px}
#mej-name-four{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;grid-column:1/-1}
#mej-name-four label{font-size:13px;font-weight:800}#mej-name-four input{width:100%}
@media(max-width:430px){#mej-name-four{grid-template-columns:1fr 1fr}#mej-student-account-dialog section{padding:14px}}
`;document.head.append(css);
function base(title,html){
 dialog?.remove();dialog=document.createElement('div');dialog.id='mej-student-account-dialog';
 dialog.innerHTML='<section role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><h2>'+esc(title)+'</h2>'+html+'</section>';
 document.body.append(dialog);
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 return dialog.querySelector('section');
}
function close(){dialog?.remove();dialog=null}
function message(e){return e?.message==='ALREADY_REGISTERED'?'هذا الطالب مسجل من قبل. استخدم رمز الطالب لاستعادة التقدم.':e?.message==='RECOVERY_CODE_NOT_VALID'?'رمز الاستعادة لا يطابق البيانات.':e?.message==='TOO_MANY_ATTEMPTS'?'محاولات كثيرة؛ حاول لاحقًا.':'تعذر التحقق الآن. تأكد من اتصال الإنترنت ثم أعد المحاولة.'}
function showCode(code,repeat=false){
 const root=base('🔑 رمز الطالب الخاص بك','<p>هذا الرمز أُصدر تلقائيًا لحسابك. احتفظ به في مكان آمن لتستعيد نفس التقدم والنجوم على جهاز آخر.</p><div class="code" id="mej-show-code"></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button id="mej-copy">نسخ الرمز</button><button class="secondary" id="mej-close">تم</button></div><small>لا تشارك الرمز مع زملائك. استعادة الحساب تُنهي جلسة الجهاز السابق حفاظًا على الأمان.</small>');
 root.querySelector('#mej-show-code').textContent=code;
 root.querySelector('#mej-copy').onclick=()=>navigator.clipboard?.writeText(code).then(()=>{root.querySelector('#mej-copy').textContent='تم النسخ ✓'}).catch(()=>{root.querySelector('#mej-copy').textContent='حدّد الرمز لنسخه'});
 root.querySelector('#mej-close').onclick=close;
}
async function check(name,grade,teacherCode){return post('check',{name,grade,teacherCode})}
async function claim(name,grade,id){
 const d=await post('claim',{name,grade,profileRef:await profileRef(id)},true);
 if(d.recoveryCode){remember(id,d.recoveryCode);showCode(d.recoveryCode)}return d;
}
async function showCurrentCode(){
 const p=typeof active==='function'?active():null;
 if(!p?.name)return;
 const saved=codes()[p.id];
 if(saved){showCode(saved,true);return}
 try{const d=await post('rotate',{},true);remember(p.id,d.recoveryCode);showCode(d.recoveryCode)}catch(e){alert(message(e))}
}
function promptRestore(initial={}){
 const root=base('🔐 استعادة حساب طالب','<p>هذا الطالب لديه حساب مفعل سابقًا. اكتب رمز الطالب لاستعادة تقدمه تلقائيًا دون أسئلة تحقق.</p>'+
 '<form id="mej-restore-form">'+
 '<label>الاسم الكامل<input name="name" required maxlength="120" autocomplete="name"></label>'+
 '<label>الصف<input name="grade" required type="number" min="1" max="12" inputmode="numeric"></label>'+
 '<label>رمز المعلم<input name="teacher" required inputmode="numeric" maxlength="6" pattern="[0-9٠-٩۰-۹]{6}"></label>'+
 '<label>رمز الطالب<input name="code" required autocapitalize="characters" autocomplete="off" placeholder="XXXXX-XXXXX-XXXXX-XXXXX"></label>'+
 '<p class="error" id="mej-restore-error" role="status"></p>'+
 '<div style="display:flex;gap:8px"><button type="submit" id="mej-restore-submit">استعادة التقدم</button><button class="secondary" type="button" id="mej-restore-cancel">إلغاء</button></div></form>');
 for(const [k,v] of [['name',initial.name],['grade',initial.grade],['teacher',initial.teacherCode]])if(v!=null)root.querySelector('[name="'+k+'"]').value=String(v);
 root.querySelector('#mej-restore-cancel').onclick=close;
 root.querySelector('form').onsubmit=async e=>{
   e.preventDefault();if(busy)return;busy=true;const form=e.currentTarget,button=root.querySelector('#mej-restore-submit'),error=root.querySelector('#mej-restore-error');
   button.disabled=true;error.textContent='';
   const name=norm(form.elements.name.value),grade=Number(form.elements.grade.value),teacherCode=form.elements.teacher.value,code=form.elements.code.value;
   try{
     if(typeof newProfile!=='function'||typeof persist!=='function'||typeof mejCapture!=='function')throw Error('APP_NOT_READY');
     const p=newProfile(); const ref=await profileRef(p.id);
     const recovered=await post('recover',{name,grade,teacherCode,recoveryCode:code,newProfileRef:ref});
     const cloud=recovered.progress||{},data=cloud.private_state||{};
     p.name=cloud.student_name||name;p.grade=String(cloud.grade||grade);
     p.className=cloud.class_name||String(grade);p.school=recovered.schoolName||'';
     p.teacherCode=teacherCode;p.correct=data.correct||{};p.wrong=data.wrong||{};p.writing=data.writing||{};
     p.activity=Array.isArray(data.activity)?data.activity:[];p.stars=Number(cloud.stars)||0;
     p.attempts=Number(cloud.attempts)||0;p.right=Number(cloud.correct_answers)||0;
     p.diagnosed=cloud.diagnostic_done===true;p.assigned=Number(cloud.diagnostic_level)||0;
     p.diagnosticScore=data.diagnosticScore??null;p.diagnosticDate=data.diagnosticDate||'';
     p.journeyIsland=Number.isInteger(data.journeyIsland)?data.journeyIsland:0;
     p.hiddenObjectsLedger=data.hiddenObjectsLedger||{};
     const prior=db.active;mejCapture(prior);db.profiles[p.id]=p;db.active=p.id;
     localStorage.setItem('MEJ_STUDENT_ACCESS_V1',recovered.accessToken);
     localStorage.setItem('MEJ_VERIFIED_SCHOOL_NAME_V1',p.school);
     localStorage.setItem('MEJ_VERIFIED_TEACHER_LINKED_V1',recovered.teacherLinked?'1':'0');
     localStorage.setItem('MEJ_ASSIGNED_TEACHER_CODE_V1',teacherCode);
     window.__MEJ_ACCESS_ROLE='student';mejCapture(p.id);remember(p.id,code);
     try{const revisions=JSON.parse(localStorage.getItem('MEJ_PROGRESS_SERVER_REVISIONS_V1')||'{}');revisions[ref]=Number(cloud.revision)||0;localStorage.setItem('MEJ_PROGRESS_SERVER_REVISIONS_V1',JSON.stringify(revisions))}catch(_){}
     persist(false);close();document.getElementById('journeyModal')?.remove();
     if(typeof route==='function')route('home');
     if(typeof toast==='function')toast('تم استرجاع الحساب ونجومه بنجاح ✓');
   }catch(err){error.textContent=message(err)}finally{button.disabled=false;busy=false}
 };
}
function renderSettings(profile,root){
 if(!profile?.name||!root)return;
 const card=document.createElement('div');card.className='card';card.style.cssText='margin:12px 0;padding:14px';
 const enrolled=/^[a-f0-9]{64}$/.test(token())&&window.__MEJ_ACCESS_ROLE==='student';
 card.innerHTML='<h3>🔑 رمز الطالب واستعادة التقدم</h3>'+
 '<p>'+ (enrolled?'يمكنك عرض رمز الطالب أو استعادة حسابك على جهاز آخر.':'للحصول على رمز سحابي، سجّل الطالب برمز المعلم المعتمد أولًا.') +'</p>'+
 '<button class="btn mint" id="mej-code-show" '+(enrolled?'':'disabled')+'>🔑 إظهار رمز الطالب</button> '+
 '<button class="btn light" id="mej-code-restore">📲 استعادة حساب سابق</button>';
 root.querySelector('.journey-modal-inner')?.append(card);
 card.querySelector('#mej-code-show').onclick=showCurrentCode;
 card.querySelector('#mej-code-restore').onclick=()=>promptRestore({name:profile.name,grade:profile.grade,teacherCode:profile.teacherCode});
}
w.MEJStudentAccount={check,claim,promptRestore,renderSettings,showCurrentCode,profileRef};
})(window);
