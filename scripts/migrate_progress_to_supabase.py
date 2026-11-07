#!/usr/bin/env python3
"""Switch production student report trigger to local-first Supabase transport.
No databases or existing stored student profiles are altered by this patch.
"""
from pathlib import Path
p=Path('index.html')
src=p.read_text(encoding='utf-8')
MARK='MEJ_STUDENT_SUPABASE_PROGRESS_V1'
if MARK in src:
 print('ALREADY_PATCHED')
 raise SystemExit(0)
before='</head>'
assert src.count(before)==1, 'HTML head must be unique'
src=src.replace(before,'<script src="assets/student-cloud-progress-v1.js" defer></script>'+before,1)
old="function scheduleReport(){clearTimeout(reportTimer);if(!String(active().teacherCode||'').trim())return;reportTimer=setTimeout(()=>sendReport(),2100)}"
new="""function scheduleReport(){
 clearTimeout(reportTimer);
 // Supabase is the only new student reporting destination. Other roles stay local.
 if(window.__MEJ_ACCESS_ROLE!=='student'||!localStorage.getItem('MEJ_STUDENT_ACCESS_V1'))return;
 reportTimer=setTimeout(()=>sendReport(),2100);
}"""
assert src.count(old)==1,'Expected one legacy report scheduling hook'
src=src.replace(old,new,1)
start='async function sendReport(manual=false){'
assert src.count(start)==1,'Expected one report sending hook'
inject="""async function sendReport(manual=false){
 /* MEJ_STUDENT_SUPABASE_PROGRESS_V1
  * Use existing locally saved learning state, but no Google Sheets receiver.
  * The private Supabase function checks the student's activation credential and
  * profile linkage before updating a per-student cloud snapshot.
  */
 const profile=active();
 if(window.__MEJ_ACCESS_ROLE!=='student')return;
 if(!profile.name||!/^([1-9]|1[0-2])$/.test(String(profile.grade||''))){
  if(manual)toast('أكمل اسم الطالب والصف أولاً.');
  return;
 }
 if(!window.MEJStudentCloudProgress){if(manual)toast('خدمة المزامنة لم تُحمّل؛ تقدمك محفوظ محلياً.');return;}
 const profileId=String(profile.id||'');
 if(!profileId)return;
 try{
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(profileId));
  const profileRef=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
  const levelStats=Array.from({length:13},(_,g)=>{
   const mastered=Math.max(0,Math.min(200,countMaster(g,profile)));
   return {level:g,mastered,total:200,masteryPercent:Math.round(mastered*100/200)};
  });
  const week=new Date();week.setDate(week.getDate()-((week.getDay()+1)%7));week.setHours(0,0,0,0);
  const attempts=Math.max(0,Math.min(10000000,Number(profile.attempts)||0));
  const snapshot={
   studentName:String(profile.name).slice(0,120),className:String(profile.className||'').slice(0,35),
   grade:Number(profile.grade),stars:Math.max(0,Math.min(2600,Number(profile.stars)||0)),
   attempts,correctAnswers:Math.min(attempts,Math.max(0,Number(profile.right)||0)),
   masteredItems:Math.max(0,Math.min(2600,totalMaster(profile))),
   weeklyAttempts:(profile.activity||[]).filter(x=>new Date(x.day)>=week).length,
   diagnosticDone:profile.diagnosed===true,
   diagnosticLevel:profile.diagnosed?Math.max(0,Math.min(12,Number(profile.assigned)||0)):null,
   highestLevel:Math.max(0,Math.min(12,maxAllowed(profile))),levelStats
  };
  const result=await window.MEJStudentCloudProgress.queue(profileRef,snapshot);
  const messages={
    synced:'✅ تم تأكيد حفظ التقدم في السحابة. يظهر لدى المعلم المرتبط.',
    offline_pending:'📴 التقدم محفوظ محلياً وسيُرسل تلقائياً عند عودة الإنترنت.',
    pending:'⏳ التقدم محفوظ محلياً، وستُعاد المزامنة تلقائياً.',
    needs_review:'⚠️ توجد نسخة سحابية مختلفة؛ لم نكتب فوقها. يلزم مراجعة الاسترجاع.',
    not_linked:'🔒 يلزم تفعيل الطالب وربطه بمعلمه أولاً.',
    incomplete:'📝 أكمل بيانات الطالب قبل إرسال التقدم.',
    storage_full:'⚠️ تعذّر حفظ قائمة الانتظار. صدّر نسخة احتياطية محلية.'
  };
  profile.syncStatus=messages[result.state]||'⏳ التقدم محفوظ محلياً بانتظار المزامنة.';
  const indicator=document.getElementById('syncStatus');
  if(indicator)indicator.textContent=profile.syncStatus;
  if(manual)toast(profile.syncStatus);
  try{localStorage.setItem(DBKEY,JSON.stringify(db))}catch(_){}
  refreshJourneySettingsStatus();
 }catch(_){
  profile.syncStatus='⚠️ المزامنة السحابية غير متاحة الآن؛ تقدمك محفوظ على الجهاز.';
  if(manual)toast(profile.syncStatus);
 }
 return;
"""
src=src.replace(start,inject,1)
# Replace legacy-only health-check UI with the new transport status, retaining
# old implementation as unreachable fallback for compatibility during transition.
check="async function checkSheetConnection(){"
assert src.count(check)==1
src=src.replace(check,"""async function checkSheetConnection(){
 {const p=active();const s=window.MEJStudentCloudProgress?.status();
  p.syncStatus=s?.tokenPresent?(s.pending?'⏳ توجد نتائج محفوظة محلياً بانتظار المزامنة.':'✅ خدمة المزامنة الداخلية جاهزة.'):
      '🔒 المزامنة الداخلية تحتاج تفعيل حساب الطالب أولاً.';
  const el=document.getElementById('syncStatus');if(el)el.textContent=p.syncStatus;
  return s||null;
 }
""",1)
p.write_text(src,encoding='utf-8')
print('PATCHED_SUCCESSFULLY',len(src))
