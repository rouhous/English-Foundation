from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf-8')
marker='MEJ_REFRESH_VERIFIED_SCHOOL_CONTEXT_20261106'
if marker in s: raise SystemExit('Already applied')
old="if(r.ok&&d.ok===true&&d.role==='student'){granted('student');return}"
new="""if(r.ok&&d.ok===true&&d.role==='student'){
  /* MEJ_REFRESH_VERIFIED_SCHOOL_CONTEXT_20261106 */
  if(typeof d.schoolName==='string'&&d.schoolName.trim()){
    localStorage.setItem('MEJ_VERIFIED_SCHOOL_NAME_V1',d.schoolName.trim());
    localStorage.setItem('MEJ_VERIFIED_TEACHER_LINKED_V1',d.teacherLinked===true?'1':'0');
  }
  granted('student');return
 }"""
if s.count(old)!=1: raise RuntimeError('Need exactly one gate block: '+str(s.count(old)))
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
sw=Path('sw.js');v=sw.read_text(encoding='utf-8')
v,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-school-affiliation-refresh-20261106-v1';",v,count=1)
assert n==1;sw.write_text(v,encoding='utf-8')
print('SERVER_SCHOOL_CONTEXT_REFRESH_INSTALLED')

# Apply verified backend school on student gate refresh.
