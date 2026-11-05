#!/usr/bin/env python3
"""Stage 2 continuation: restrict recovery iframe messages and remove teacher codes from exports."""
from pathlib import Path
import re,subprocess,tempfile
p=Path('index.html')
s=p.read_text(encoding='utf8')
marker='MEJ_STAGE2_PRIVACY_HARDENING_V2'
if marker not in s:
 def change(old,new,why):
  global s
  n=s.count(old)
  if n!=1:raise RuntimeError(f'{why}: expected 1, got {n}')
  s=s.replace(old,new,1)
 change(
 "if(event.source!==frame.contentWindow)return;",
 "if(event.source!==frame.contentWindow || !['https://script.google.com','https://script.googleusercontent.com'].includes(event.origin))return;",
 'Iframe sender origin guard')
 change(
 "profiles:db.profiles,active:db.active",
 "profiles:Object.fromEntries(Object.entries(db.profiles).map(([id,profile])=>[id,{...profile,teacherCode:''}])),active:db.active",
 'Strip teacher code from exported backup')
 # Preserve the app's own local stored teacher code; exports are portable data, not login credentials.
 s=s.replace("function exportProgress(){let blob=", "// MEJ_STAGE2_PRIVACY_HARDENING_V2\nfunction exportProgress(){let blob=",1)
 assert s.count(marker)==1
 assert 'profiles:db.profiles,active:db.active' not in s
 scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
 with tempfile.TemporaryDirectory() as tmp:
  for n,block in enumerate(scripts):
   if not block.strip():continue
   f=Path(tmp)/f'inline_{n}.js';f.write_text(block,encoding='utf8')
   result=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
   if result.returncode:raise RuntimeError('JS syntax '+str(n)+': '+result.stderr[:1200])
 p.write_text(s,encoding='utf8')
print('STAGE2_PRIVACY_HARDENING_APPLIED')
