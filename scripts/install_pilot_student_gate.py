#!/usr/bin/env python3
"""Wire actual new learner-profile saves to the isolated pilot seat service.

Existing named profiles remain accessible offline; only NEW accounts need
online seat reservation. This does not touch teacher accounts or copyrights.
"""
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
mark="MEJ_PILOT_CAPACITY_STUDENT_GATE_V1"
if mark in s:
 print("Student capacity gate already installed"); raise SystemExit(0)
helper=r"""// MEJ_PILOT_CAPACITY_STUDENT_GATE_V1
const MEJ_PILOT_STATUS_URL='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-pilot-status';
const MEJ_PILOT_REGISTER_URL='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-pilot-register';
let mejPilotSaving=false;
function mejPilotFull(){
 window.location.assign('./reviews/pilot-full.html');
}
async function mejPilotReadStatus(){
 const r=await fetch(MEJ_PILOT_STATUS_URL,{cache:'no-store',mode:'cors',credentials:'omit',signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('PILOT_STATUS_UNAVAILABLE');
 const d=await r.json();
 if(!d.ok||!d.registration||typeof d.registration.studentOpen!=='boolean')throw Error('PILOT_STATUS_INVALID');
 return d.registration;
}
async function mejPilotMayCreateStudent(){
 try{
  const state=await mejPilotReadStatus();
  if(!state.studentOpen){mejPilotFull();return false}
  return true;
 }catch(_){toast('تعذر التحقق من توفر التسجيل. تحقق من اتصال الإنترنت وحاول مجددًا.');return false}
}
async function mejPilotReserveStudent(profileId){
 try{
  if(!window.crypto?.subtle)throw Error('CRYPTO_REQUIRED');
  const buf=new TextEncoder().encode(String(profileId));
  const hash=await crypto.subtle.digest('SHA-256',buf);
  const accountRef=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  const response=await fetch(MEJ_PILOT_REGISTER_URL,{
   method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({role:'student',accountRef}),
   signal:AbortSignal.timeout(10000)
  });
  if(response.status===409){mejPilotFull();return false}
  if(!response.ok)throw Error('RESERVATION_FAILED');
  const out=await response.json();
  if(out.ok!==true||out.enrolled!==true)throw Error('ENROLLMENT_DENIED');
  return true;
 }catch(_){toast('تعذر إتمام تسجيل الطالب. تأكد من اتصال الإنترنت ثم أعد المحاولة.');return false}
}
"""
anchor="function saveStudent(){"
if s.count(anchor)!=1:raise RuntimeError("Cannot locate unique saveStudent entry")
s=s.replace(anchor,helper+"\nasync function saveStudent(){",1)
anchor2="p.name=name;p.grade=grade;p.school=school||'Wadi Al Hawasna School';"
if s.count(anchor2)!=1:raise RuntimeError("Cannot locate unique saveStudent validation completion")
s=s.replace(anchor2,"if(!p.name){if(mejPilotSaving)return false;mejPilotSaving=true;try{if(!await mejPilotReserveStudent(p.id))return false;}finally{mejPilotSaving=false;}}"+anchor2,1)
anchor3="persist(!!teacherCode);toast('تم حفظ ملف الطالب ✅');home()}"
if s.count(anchor3)!=1:raise RuntimeError("Cannot locate unique saveStudent ending")
s=s.replace(anchor3,"persist(!!teacherCode);toast('تم حفظ ملف الطالب ✅');home();return true}",1)
old="function addUser(){let p=newProfile();db.profiles[p.id]=p;db.active=p.id;activeSession=null;persist(false);home();document.getElementById('studentName')?.focus();toast('أضف اسم الطالب الجديد واحفظ بياناته')}"
new="async function addUser(){if(!await mejPilotMayCreateStudent())return;let p=newProfile();db.profiles[p.id]=p;db.active=p.id;activeSession=null;persist(false);home();document.getElementById('studentName')?.focus();toast('أضف اسم الطالب الجديد واحفظ بياناته')}"
if s.count(old)!=1:raise RuntimeError("Cannot locate exact addUser function")
s=s.replace(old,new,1)
old="function saveProfileModal(isNew){const name=document.getElementById('studentName').value.trim();if(!name){toast('يرجى كتابة اسم الطالب');return}if(isNew){const p=newProfile();db.profiles[p.id]=p;db.active=p.id}saveStudent();closeProfile()}"
new="async function saveProfileModal(isNew){const name=document.getElementById('studentName').value.trim();if(!name){toast('يرجى كتابة اسم الطالب');return}const oldId=db.active;let created=null;if(isNew){created=newProfile();db.profiles[created.id]=created;db.active=created.id}const ok=await saveStudent();if(!ok){if(created){delete db.profiles[created.id];db.active=oldId}return}closeProfile()}"
if s.count(old)!=1:raise RuntimeError("Cannot locate exact new-profile modal save")
s=s.replace(old,new,1)
assert s.count(mark)==1
p.write_text(s,encoding="utf-8")
print("Student profile creation now requires atomic server reservation.")
