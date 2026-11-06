from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf8')
marker='MEJ_SIX_DIGIT_TEACHER_PROFILE_LINK_20261106'
if marker in s:raise SystemExit('Already integrated')
old="teacherCode=(document.getElementById('teacherCode')?.value||'').trim();if(!name)"
new="""teacherCode=(document.getElementById('teacherCode')?.value||'').trim();
/* MEJ_SIX_DIGIT_TEACHER_PROFILE_LINK_20261106 */
if(window.__MEJ_ACCESS_ROLE==='student'){
  // Teacher affiliation was approved by the server during six-digit activation.
  // Do not trust a different teacher code typed inside the student's profile.
  teacherCode=(localStorage.getItem('MEJ_ASSIGNED_TEACHER_CODE_V1')||'').trim();
}
if(!name)"""
if s.count(old)!=1:raise RuntimeError('Could not locate the unique original teacherCode save handler')
s=s.replace(old,new,1)
oldmodal="document.body.appendChild(modal);document.getElementById('studentName')?.focus()"
newmodal="""document.body.appendChild(modal);
if(window.__MEJ_ACCESS_ROLE==='student'){
 const t=document.getElementById('teacherCode');
 if(t){
   t.value=(localStorage.getItem('MEJ_ASSIGNED_TEACHER_CODE_V1')||'').trim();
   t.readOnly=true;
   const row=t.closest('.field');
   if(row)row.style.display='none';
 }
}
document.getElementById('studentName')?.focus()"""
if s.count(oldmodal)!=1:raise RuntimeError('Could not locate unique profile modal injection')
s=s.replace(oldmodal,newmodal,1)
assert s.count(marker)==1
assert 'async function mejPilotReserveStudent(' in s
assert 'action:\'enroll_profile\'' in s
p.write_text(s,encoding='utf8')
sw=Path('sw.js');worker=sw.read_text(encoding='utf8')
worker,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-six-digit-teacher-student-link-20261106-v1';",worker,count=1)
if n!=1:raise RuntimeError('Missing service worker cache')
sw.write_text(worker,encoding='utf8')
print('SIX_DIGIT_TEACHER_CODE_ASSOCIATED_WITH_STUDENT_PROFILE')
