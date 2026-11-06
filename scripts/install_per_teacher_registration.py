#!/usr/bin/env python3
"""Require valid teacher invitation for every new student account."""
from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
mark='MEJ_PER_TEACHER_100_SEATS_V2'
if mark in s: raise SystemExit(0)
old='async function mejPilotReserveStudent(profileId){'
new='async function mejPilotReserveStudent(profileId,teacherInvite){'
assert s.count(old)==1
s=s.replace(old,new,1)
old="body:JSON.stringify({role:'student',accountRef}),"
new="body:JSON.stringify({role:'student',accountRef,teacherInvite}),"
assert s.count(old)==1
s=s.replace(old,new,1)
old="if(!p.name){if(mejPilotSaving)return false;mejPilotSaving=true;try{if(!await mejPilotReserveStudent(p.id))return false;}finally{mejPilotSaving=false;}}"
new="""if(!p.name){
 if(mejPilotSaving)return false;
 const inviteInput=document.getElementById('mejTeacherInviteInput');
 const teacherInvite=(inviteInput?.value||'').trim().toLowerCase();
 if(!/^[a-f0-9]{48}$/.test(teacherInvite)){
  toast('أدخل رمز الانضمام الصحيح الذي حصلت عليه من معلمك.');return false;
 }
 mejPilotSaving=true;
 try{if(!await mejPilotReserveStudent(p.id,teacherInvite))return false;}
 finally{mejPilotSaving=false;}
}"""
assert s.count(old)==1
s=s.replace(old,new,1)
anchor="// MEJ_PILOT_CAPACITY_STUDENT_GATE_V1"
assert s.count(anchor)==1
setup="""// MEJ_PER_TEACHER_100_SEATS_V2
// An input is attached only to student-registration views; never to existing
// profiles or the teacher code that routes student reports.
function mejAttachTeacherInvitation(){
 const name=document.getElementById('studentName');
 if(!name||document.getElementById('mejTeacherInviteInput'))return;
 const wrapper=document.createElement('div');
 wrapper.className='field mej-teacher-invite';
 wrapper.style.cssText='margin:10px 0';
 const title=document.createElement('label');
 title.htmlFor='mejTeacherInviteInput';
 title.textContent='رمز الانضمام الذي استلمته من معلمك';
 const input=document.createElement('input');
 input.id='mejTeacherInviteInput';
 input.maxLength=48;
 input.placeholder='رمز الانضمام';
 input.autocomplete='off';
 input.autocapitalize='off';
 input.spellcheck=false;
 input.style.cssText='width:100%;max-width:100%;direction:ltr;text-align:left';
 wrapper.append(title,input);
 name.closest('.field')?.insertAdjacentElement('afterend',wrapper);
}
let mejInviteQueued=false;
function mejScheduleTeacherInvite(){
 if(mejInviteQueued)return;
 mejInviteQueued=true;
 queueMicrotask(()=>{mejInviteQueued=false;mejAttachTeacherInvitation()});
}
if(document.readyState==='loading')
 document.addEventListener('DOMContentLoaded',()=>{
  mejAttachTeacherInvitation();
  new MutationObserver(mejScheduleTeacherInvite).observe(document.body,{childList:true,subtree:true});
 },{once:true});
else {
 mejAttachTeacherInvitation();
 new MutationObserver(mejScheduleTeacherInvite).observe(document.body,{childList:true,subtree:true});
}
"""
s=s.replace(anchor,setup+anchor,1)
p.write_text(s,encoding='utf-8')
print('Student registration now requires a teacher-specific invitation.')
