from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='MEJ_VERIFIED_SCHOOL_PROFILE_20261106'
if marker in s: raise SystemExit('Already applied')
old='value="${esc(item.school||\'Wadi Al Hawasna School\')}"'
new='value="${esc(window.__MEJ_ACCESS_ROLE===\'student\'?(localStorage.getItem(\'MEJ_VERIFIED_SCHOOL_NAME_V1\')||item.school||\'\'):(item.school||\'\'))}" placeholder="سيحدد تلقائيا عند ارتباط الطالب بالمعلم"'
assert s.count(old)==1,(old,s.count(old))
s=s.replace(old,new,1)
needle="if(window.__MEJ_ACCESS_ROLE==='student'){\n const t=document.getElementById('teacherCode');"
replacement="/* MEJ_VERIFIED_SCHOOL_PROFILE_20261106 */\nif(window.__MEJ_ACCESS_ROLE==='student'){\n const schoolInput=document.getElementById('studentSchool');\n const verifiedSchool=(localStorage.getItem('MEJ_VERIFIED_SCHOOL_NAME_V1')||'').trim();\n const linked=localStorage.getItem('MEJ_VERIFIED_TEACHER_LINKED_V1')==='1';\n if(schoolInput&&verifiedSchool){schoolInput.value=verifiedSchool;if(linked){schoolInput.readOnly=true;schoolInput.title='المدرسة مرتبطة بالمعلم المعتمد';}}\n const t=document.getElementById('teacherCode');"
assert s.count(needle)==1,('modal',s.count(needle))
s=s.replace(needle,replacement,1)
needle="teacherCode=(localStorage.getItem('MEJ_ASSIGNED_TEACHER_CODE_V1')||'').trim();\n}\nif(!name)"
replacement="teacherCode=(localStorage.getItem('MEJ_ASSIGNED_TEACHER_CODE_V1')||'').trim();\n if(localStorage.getItem('MEJ_VERIFIED_TEACHER_LINKED_V1')==='1'){const approvedSchool=(localStorage.getItem('MEJ_VERIFIED_SCHOOL_NAME_V1')||'').trim();if(!approvedSchool){toast('المدرسة لم تتحقق، أعد التفعيل عبر الإنترنت');return false}school=approvedSchool;}\n}\nif(!name)"
assert s.count(needle)==1,('save',s.count(needle))
s=s.replace(needle,replacement,1)
old="p.school=school||'Wadi Al Hawasna School';"
assert s.count(old)==1
s=s.replace(old,"p.school=school||'';",1)
p.write_text(s,encoding='utf-8')
sw=Path('sw.js');c=sw.read_text(encoding='utf-8')
c,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-verified-school-profile-20261106-v1';",c,count=1)
assert n==1;sw.write_text(c,encoding='utf-8')
print('VERIFIED_SCHOOL_PROFILE_PATCHED')
