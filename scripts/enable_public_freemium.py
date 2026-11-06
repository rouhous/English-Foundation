from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf-8')
if 'MEJ_FREEMIUM_PUBLIC_THREE_STAGES_20261107' in s:raise SystemExit('Already installed')
pattern=re.compile(r'<script id="mej-owner-only-gate">.*?</script>',re.S)
assert len(pattern.findall(s))==1
gate='''<script id="mej-owner-only-gate">
/* MEJ_FREEMIUM_PUBLIC_THREE_STAGES_20261107 */
(function(){
 'use strict';
 const OWNER='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-owner-verify';
 const LICENSE='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license';
 const owner=sessionStorage.getItem('MEJ_OWNER_ACCESS_V1');
 const student=localStorage.getItem('MEJ_STUDENT_ACCESS_V1');
 window.__MEJ_ACCESS_ROLE='public';
 const reveal=()=>document.getElementById('mej-owner-gate-style')?.remove();
 const allowed=(role,data)=>{
   window.__MEJ_ACCESS_ROLE=role;
   if(role==='owner')window.__MEJ_OWNER_VERIFIED_SESSION=true;
   if(role==='student'&&typeof data?.schoolName==='string'){
      localStorage.setItem('MEJ_VERIFIED_SCHOOL_NAME_V1',data.schoolName);
      localStorage.setItem('MEJ_VERIFIED_TEACHER_LINKED_V1',data.teacherLinked===true?'1':'0');
   }
   reveal();
 };
 const check=async()=>{
   if(owner){
     try{
       const r=await fetch(OWNER,{method:'GET',mode:'cors',cache:'no-store',
         headers:{Authorization:'Bearer '+owner},signal:AbortSignal.timeout(8500)});
       const d=await r.json();
       if(r.ok&&d.ok===true&&d.role==='owner'&&d.email==='rouhous@gmail.com'){allowed('owner',d);return;}
     }catch(_){}
     sessionStorage.removeItem('MEJ_OWNER_ACCESS_V1');
   }
   if(student){
     try{
       const r=await fetch(LICENSE,{method:'POST',mode:'cors',cache:'no-store',
         headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_student',accessToken:student}),
         signal:AbortSignal.timeout(8500)});
       const d=await r.json();
       if(r.ok&&d.ok===true&&d.role==='student'){allowed('student',d);return;}
     }catch(_){
       // Offline: preserve an existing local licence without granting elevated
       // access until server validation; public content stays available.
     }
   }
   allowed('public',null);
 };
 check();
})();
</script>'''
s=pattern.sub(lambda _:gate,s,count=1)
assert s.count('function permitted(g){return Number(g)===0 || (active().diagnosed&&Number(g)<=maxAllowed())}')==1
s=s.replace('function permitted(g){return Number(g)===0 || (active().diagnosed&&Number(g)<=maxAllowed())}',
'''function permitted(g){
 const limit=window.__MEJ_ACCESS_ROLE==='owner'||window.__MEJ_ACCESS_ROLE==='student'?12:3;
 return Number(g)===0 || (active().diagnosed&&Number(g)<=limit&&Number(g)<=maxAllowed());
}''',1)
needle="function checkAccess(g){if(!permitted(g)){toast('المستوى مقفل. أكمل التشخيص وأتقن جميع أنشطة الجزيرة السابقة.');return false}return true}"
replacement="function checkAccess(g){if(!permitted(g)){toast(window.__MEJ_ACCESS_ROLE==='public'&&Number(g)>3?'لإكمال الرحلة أدخل رمز المعلم المكون من 6 أرقام عند تسجيل الطالب.':'المستوى مقفل. أكمل التشخيص وأتقن جميع أنشطة الجزيرة السابقة.');return false}return true}"
assert needle in s;s=s.replace(needle,replacement,1)
needle="async function mejPilotMayCreateStudent(){\n if(window.__MEJ_ACCESS_ROLE==='owner')return true;"
assert needle in s;s=s.replace(needle,"async function mejPilotMayCreateStudent(){\n if(window.__MEJ_ACCESS_ROLE==='public')return true;\n if(window.__MEJ_ACCESS_ROLE==='owner')return true;",1)
needle="async function mejPilotReserveStudent(profileId,teacherInvite){\n try{"
assert needle in s;s=s.replace(needle,"async function mejPilotReserveStudent(profileId,teacherInvite){\n if(window.__MEJ_ACCESS_ROLE==='public')return true;\n try{",1)
needle="function openProfile(isNew=false){let p=active();let item=isNew?{name:'',grade:'',school:'Wadi Al Hawasna School',className:'',teacherCode:''}:p;"
assert needle in s;s=s.replace(needle,"function openProfile(isNew=false){let p=active();let item=isNew?{name:'',grade:'',school:'',className:'',teacherCode:''}:p;",1)
needle='id="teacherCode" maxlength="80" type="password"'
assert s.count(needle)==1;s=s.replace(needle,'id="teacherCode" maxlength="6" pattern="[0-9٠-٩]{6}" inputmode="numeric" type="text" placeholder="6 أرقام، اختياري للتفعيل الكامل"',1)
needle="if(teacherCode && !/^(?:[1-9]|1[0-2])$/.test(grade)){toast('اختر صفًا من 1 إلى 12 لإرسال التقارير');return}"
assert needle in s
insert='''if(window.__MEJ_ACCESS_ROLE==='public'&&teacherCode){
  const digits=teacherCode.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
  if(!/^[0-9]{6}$/.test(digits)){toast('رمز المعلم يجب أن يتكون من 6 أرقام');return false}
  if(!crypto?.subtle){toast('التحقق من رمز المعلم يتطلب اتصالًا آمنًا');return false}
  try{
    let device=localStorage.getItem('MEJ_STUDENT_DEVICE_REF_V1');
    if(!device){device=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('MEJ_STUDENT_DEVICE_REF_V1',device)}
    const response=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license',{method:'POST',mode:'cors',cache:'no-store',
       headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'activate_short',code:digits,studentRef:device}),signal:AbortSignal.timeout(12000)});
    const d=await response.json();
    if(!response.ok||!d.ok||!d.accessToken){toast(d.error==='LICENSE_CAPACITY_REACHED'?'وصل الترخيص إلى عدد الطلاب المسموح':'رمز المعلم غير صحيح أو لم يُفعّل. تحقق من المدرسة والمعلم.');return false}
    localStorage.setItem('MEJ_STUDENT_ACCESS_V1',d.accessToken);
    localStorage.setItem('MEJ_VERIFIED_SCHOOL_NAME_V1',String(d.schoolName||''));
    localStorage.setItem('MEJ_VERIFIED_TEACHER_LINKED_V1',d.teacherLinked===true?'1':'0');
    if(d.teacherLinked===true){
      localStorage.setItem('MEJ_ASSIGNED_TEACHER_CODE_V1',digits);
      localStorage.setItem('MEJ_ASSIGNED_TEACHER_NAME_V1',String(d.teacherName||''));
    }else{localStorage.removeItem('MEJ_ASSIGNED_TEACHER_CODE_V1');localStorage.removeItem('MEJ_ASSIGNED_TEACHER_NAME_V1')}
    window.__MEJ_ACCESS_ROLE='student';
    school=String(d.schoolName||'');teacherCode=d.teacherLinked===true?digits:'';
  }catch(_){toast('تعذر التحقق من الرمز، تأكد من الاتصال بالإنترنت');return false}
}
'''
s=s.replace(needle,insert+needle,1)
needle="if(!name){toast('اكتب اسم الطالب أولاً');return}"
assert needle in s
if "function levels(){const p=active();" not in s:raise RuntimeError('levels missing')
s=s.replace("function levels(){const p=active();","function levels(){const p=active();",1)
p.write_text(s,encoding='utf-8')
sw=Path('sw.js');w=sw.read_text(encoding='utf-8')
w,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-freemium-public-20261107-v1';",w,count=1)
assert n==1;sw.write_text(w,encoding='utf-8')
print('FREEMIUM_PUBLIC_FIRST_THREE_STAGES_AND_SIX_DIGIT_SIGNUP_PATCHED')

# Activate approved freemium rollout.
