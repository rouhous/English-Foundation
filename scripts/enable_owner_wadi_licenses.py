#!/usr/bin/env python3
"""Enable verified owner and invited student activation without opening public registration."""
from pathlib import Path
import re
p=Path('index.html')
root=Path('.')
marker='MEJ_WADI_OWNER_LICENSE_ROLLOUT_20261106'
api='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license'
gate=r'''<script id="mej-owner-only-gate">
/* MEJ_WADI_OWNER_LICENSE_ROLLOUT_20261106 */
(function(){
"use strict";
const LOGIN='/English-Foundation/reviews/owner-login.html';
const ACTIVATE='/English-Foundation/reviews/activate.html';
const API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license';
const OWNER='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-owner-verify';
const owner=sessionStorage.getItem('MEJ_OWNER_ACCESS_V1');
const student=localStorage.getItem('MEJ_STUDENT_ACCESS_V1');
function granted(role){
  window.__MEJ_ACCESS_ROLE=role;
  if(role==='owner')window.__MEJ_OWNER_VERIFIED_SESSION=true;
  document.getElementById('mej-owner-gate-style')?.remove();
}
async function verify(){
  if(owner){
    try{
      const r=await fetch(OWNER,{method:'GET',cache:'no-store',mode:'cors',headers:{Authorization:'Bearer '+owner},signal:AbortSignal.timeout(8500)});
      const d=await r.json();
      if(r.ok&&d.ok===true&&d.role==='owner'&&d.email==='rouhous@gmail.com'){granted('owner');return}
    }catch(_){}
    sessionStorage.removeItem('MEJ_OWNER_ACCESS_V1');
  }
  if(student){
    try{
      const r=await fetch(API,{method:'POST',cache:'no-store',mode:'cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify_student',accessToken:student}),signal:AbortSignal.timeout(8500)});
      const d=await r.json();
      if(r.ok&&d.ok===true&&d.role==='student'){granted('student');return}
    }catch(_){}
    localStorage.removeItem('MEJ_STUDENT_ACCESS_V1');
  }
  location.replace(ACTIVATE);
}
verify();
})();
</script>'''
paths=[p for p in root.rglob('*.html') if '.git' not in p.parts and p.as_posix() not in ('reviews/owner-login.html','reviews/activate.html')]
count=0
for file in paths:
 s=file.read_text(encoding='utf8')
 if marker in s:continue
 pattern=re.compile(r'<script id="mej-owner-only-gate">.*?</script>',re.S)
 if len(pattern.findall(s))!=1:raise RuntimeError('Missing one existing owner gate: '+str(file))
 s=pattern.sub(lambda _:gate,s,count=1)
 file.write_text(s,encoding='utf8')
 count+=1
s=p.read_text(encoding='utf8')
# Replace legacy seat-status gate and pilot registration. All quotas are now
# enforced by the separate license registration service.
pat=re.compile(r'async function mejPilotMayCreateStudent\(\)\{.*?^\}',re.S|re.M)
if len(pat.findall(s))!=1:raise RuntimeError('Missing unique old student availability handler')
s=pat.sub("""async function mejPilotMayCreateStudent(){
 if(window.__MEJ_ACCESS_ROLE==='owner')return true;
 if(window.__MEJ_ACCESS_ROLE==='student'&&localStorage.getItem('MEJ_STUDENT_ACCESS_V1'))return true;
 toast('يجب تفعيل ترخيص الطالب أولاً.');return false;
}""",s,count=1)
pat=re.compile(r'async function mejPilotReserveStudent\(profileId,teacherInvite\)\{.*?^\}',re.S|re.M)
if len(pat.findall(s))!=1:raise RuntimeError('Missing unique old reservation handler')
s=pat.sub("""async function mejPilotReserveStudent(profileId,teacherInvite){
 try{
  if(!window.crypto?.subtle)throw Error('CRYPTO_REQUIRED');
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(profileId)));
  const profileRef=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  const owner=window.__MEJ_ACCESS_ROLE==='owner'?sessionStorage.getItem('MEJ_OWNER_ACCESS_V1'):null;
  const student=window.__MEJ_ACCESS_ROLE==='student'?localStorage.getItem('MEJ_STUDENT_ACCESS_V1'):null;
  if(!owner&&!student)throw Error('LICENSE_REQUIRED');
  const response=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license',{
    method:'POST',cache:'no-store',mode:'cors',
    headers:{'Content-Type':'application/json',...(owner?{'Authorization':'Bearer '+owner}:{})},
    body:JSON.stringify({action:'enroll_profile',profileRef,...(student?{accessToken:student}:{})}),
    signal:AbortSignal.timeout(10000)
  });
  const result=await response.json();
  if(response.status===409){toast('بلغ الترخيص الحد المسموح به من الطلاب.');return false}
  if(!response.ok||result.ok!==true||result.enrolled!==true)throw Error('LICENSE_RESERVATION_DENIED');
  return true;
 }catch(_){toast('تعذر اعتماد الطالب. تأكد من الاتصال والترخيص ثم حاول مجددًا.');return false}
}""",s,count=1)
# Old teacher invitation input is no longer required for owner/school license pupils.
pat=re.compile(r"if\(!p\.name\)\{\s*if\(mejPilotSaving\)return false;\s*const inviteInput=document\.getElementById\('mejTeacherInviteInput'\);.*?finally\{mejPilotSaving=false;\}\s*\}",re.S)
if len(pat.findall(s))!=1:raise RuntimeError('Missing single old teacher invitation guard')
s=pat.sub("""if(!p.name){
 if(mejPilotSaving)return false;
 mejPilotSaving=true;
 try{if(!await mejPilotReserveStudent(p.id,null))return false}
 finally{mejPilotSaving=false}
}""",s,count=1)
s=s.replace('</head>','<style id="mej-license-invitation-hide">.mej-teacher-invite{display:none!important}</style></head>',1)
p.write_text(s,encoding='utf8')
# Owner dashboard, not a publicly revealed activation code.
login=Path('reviews/owner-login.html')
s=login.read_text(encoding='utf8')
if 'mej-license-admin-panel' not in s:
 anchor='<a id="openOwnerApp" href="../" style="margin:4px">فتح التطبيق</a>'
 if s.count(anchor)!=1:raise RuntimeError('Missing owner app shortcut')
 panel="""<div id="mej-license-admin-panel" style="margin:16px 0;padding:12px;background:#fff;border:1px solid #d4e4da;border-radius:12px">
 <strong>تراخيص رحلتي مع الإنجليزية</strong>
 <p style="font-size:13px">حساب المالك مفعل تلقائيًا دون حدود للطلاب. أنشئ رمزًا خاصًا لطلابك أو لمدرسة وادي الحواسنة.</p>
 <button type="button" id="mejIssueOwner" style="padding:10px">إصدار/تجديد رمز طلاب المالك</button>
 <button type="button" id="mejIssueWadi" style="padding:10px;margin-top:6px">إصدار/تجديد رمز وادي الحواسنة (2429)</button>
 <p id="mejLicenseMsg" role="status" aria-live="polite"></p>
 <input id="mejIssuedKey" readonly dir="ltr" style="display:none;width:100%;padding:10px;font-size:13px" aria-label="رمز التفعيل"/>
 <button type="button" id="mejCopyKey" style="display:none;padding:10px">نسخ الرمز</button>
 <p style="font-size:12px">تنبيه: إنشاء رمز جديد من نفس النوع يعطّل الرمز السابق للانضمامات الجديدة؛ لا يُلغى تقدم الطلاب المسجلين.</p>
 </div>"""
 s=s.replace(anchor,anchor+panel,1)
 insertion="""// MEJ_LICENSE_ISSUE_OWNER_VERIFIED_20261106
async function mejIssue(kind){
 const status=document.getElementById('mejLicenseMsg'),field=document.getElementById('mejIssuedKey'),copy=document.getElementById('mejCopyKey');
 status.textContent='جار إصدار رمز التفعيل...';field.style.display='none';copy.style.display='none';
 if(!ownerCredential){status.textContent='سجل الدخول بحساب المالك أولاً.';return}
 try{
  const r=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license',{method:'POST',mode:'cors',cache:'no-store',headers:{Authorization:'Bearer '+ownerCredential,'Content-Type':'application/json'},body:JSON.stringify({action:'owner_issue',kind}),signal:AbortSignal.timeout(12000)});
  const d=await r.json();
  if(!r.ok||!d.ok||!d.key)throw Error('LICENSE_ERROR');
  field.value=d.key;field.style.display='block';copy.style.display='inline-flex';
  status.textContent=kind==='owner_unlimited'?'رمز طلاب المالك (غير محدود) جاهز.':'ترخيص وادي الحواسنة جاهز (10 معلمين، 500 طالب).';
 }catch(_){status.textContent='تعذر إصدار الرمز. تحقق من تسجيل دخول المالك واتصال الإنترنت.'}
}
document.getElementById('mejIssueOwner').addEventListener('click',()=>mejIssue('owner_unlimited'));
document.getElementById('mejIssueWadi').addEventListener('click',()=>mejIssue('wadi_2429'));
document.getElementById('mejCopyKey').addEventListener('click',()=>navigator.clipboard?.writeText(document.getElementById('mejIssuedKey').value));
"""
 s=s.replace("let ownerCredential=null;", "let ownerCredential=null;\n"+insertion,1)
 # Important: license panel sits inside privateArea, hidden until Google owner verified.
 login.write_text(s,encoding='utf8')
# New activation screen, no public sign-up without a license code.
activation=Path('reviews/activate.html')
if not activation.exists():
 activation.write_text("""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="referrer" content="no-referrer"><title>تفعيل رحلتي مع الإنجليزية</title>
<style>*,*:before,*:after{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:linear-gradient(145deg,#e3f5ff,#f4ead6);font-family:system-ui,sans-serif;color:#164d69;padding:16px}main{background:#ffffffee;border:1px solid #c9dfe5;border-radius:22px;padding:24px;max-width:440px;width:100%;text-align:center;box-shadow:0 12px 34px #07557826}h1{font-size:23px}p{line-height:1.7}input,button,a{font:inherit}input{width:100%;padding:13px;border:1px solid #8fb6cc;border-radius:12px;text-align:center;direction:ltr}button{width:100%;padding:13px;background:#0f647e;border:0;color:white;border-radius:12px;margin-top:12px;font-weight:700}a{display:inline-block;margin-top:15px;color:#075b78}#status{min-height:28px;font-size:13px}</style></head><body>
<main><h1>رحلتي مع الإنجليزية</h1><p>تفعيل الدخول برمز المدرسة أو المعلم</p><label for="key">رمز التفعيل</label><input id="key" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="MEJ-XXXXXXXX-XXXXXXXX-..." maxlength="60"><button id="activate" type="button">تفعيل التطبيق</button><p id="status" role="status" aria-live="polite"></p><a href="./owner-login.html">دخول المالك بحساب Google</a></main>
<script>
'use strict';
(function(){
const API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-license';
const btn=document.getElementById('activate'),status=document.getElementById('status');
async function activate(){
  const code=document.getElementById('key').value.trim().toUpperCase();
  if(!/^MEJ-(?:[A-F0-9]{8}-){5}[A-F0-9]{8}$/.test(code)){status.textContent='تأكد من إدخال رمز التفعيل كاملًا.';return}
  btn.disabled=true;status.textContent='جار التحقق من الترخيص...';
  try{
   let id=localStorage.getItem('MEJ_STUDENT_DEVICE_REF_V1');
   if(!id){const bytes=crypto.getRandomValues(new Uint8Array(32));id=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('MEJ_STUDENT_DEVICE_REF_V1',id)}
   const response=await fetch(API,{method:'POST',mode:'cors',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'activate',code,studentRef:id}),signal:AbortSignal.timeout(12000)});
   const result=await response.json();
   if(response.status===409){status.textContent='اكتمل العدد المسموح للترخيص.';return}
   if(!response.ok||result.ok!==true||!result.accessToken){status.textContent='رمز التفعيل غير صحيح أو غير نشط.';return}
   localStorage.setItem('MEJ_STUDENT_ACCESS_V1',result.accessToken);
   location.replace('../');
  }catch(_){status.textContent='تعذر التحقق من الترخيص. تأكد من الاتصال بالإنترنت.'}
  finally{btn.disabled=false}
}
btn.addEventListener('click',activate);
document.getElementById('key').addEventListener('keydown',e=>{if(e.key==='Enter')activate()});
})();
</script></body></html>""",encoding='utf8')
sw=Path('sw.js');a=sw.read_text(encoding='utf8')
a,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-wadi-owner-license-20261106-v1';",a,count=1)
if n!=1:raise RuntimeError('No service worker CACHE')
sw.write_text(a,encoding='utf8')
print('MEJ_OWNER_WADI_LICENSE_FRONTEND_INSTALLED',count)
