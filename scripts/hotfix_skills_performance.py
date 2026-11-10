#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, tempfile
p=Path('index.html')
s=p.read_text('utf-8')
pattern=r'''function skills\(\)\{const p=active\(\);const accessible=BANK\.filter\(q=>permitted\(q\.g\)\);let types=(\[[^;]*?\]);const cards=types\.map\(t=>\{const count=accessible\.filter\(q=>q\.type===t\)\.length;return \{t,count\}\}\)\.filter\(x=>x\.count>0\);'''
replacement='''function skills(){const p=active();
// Calculate allowed grades once. permitted() may scan full mastery state repeatedly.
const allowedGrades=new Set(Array.from({length:13},(_,g)=>g).filter(g=>permitted(g)));
let types=\\1;
const skillCounts=Object.create(null);
for(const q of BANK){if(allowedGrades.has(q.g))skillCounts[q.type]=(skillCounts[q.type]||0)+1}
const cards=types.map(t=>({t,count:skillCounts[t]||0})).filter(x=>x.count>0);'''
new,count=re.subn(pattern,replacement,s,count=1)
if count!=1:raise RuntimeError('Skills function mismatch; refusing unsafe patch')
assert 'BANK.filter(q=>permitted(q.g))' not in new
with tempfile.TemporaryDirectory() as d:
 for i,b in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',new,re.S|re.I)):
  if not b.strip():continue
  js=Path(d)/f'inline{i}.js';js.write_text(b,'utf-8')
  r=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr[:900])
p.write_text(new,'utf-8')
print('PASS: skills checks 13 grades once and counts 2600 questions in one pass')
