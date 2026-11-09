#!/usr/bin/env python3
"""Wire the offline Omani boy/girl motion rig without editing student progress."""
from pathlib import Path
import re,subprocess,tempfile
p=Path('index.html')
s=p.read_text(encoding='utf-8')
tag='<script src="./assets/mej-companion-motion-v1.js?v=20261109" defer></script>'
if tag not in s:
    anchor='<script src="./assets/mej-companion-setup-v1.js?v=20261109" defer></script>'
    if s.count(anchor)!=1:raise RuntimeError('Companion settings loader missing')
    s=s.replace(anchor,anchor+'\n'+tag,1)
assert s.count(tag)==1
with tempfile.TemporaryDirectory() as d:
    for n,block in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
        if not block.strip():continue
        target=Path(d)/f'in{n}.js';target.write_text(block,encoding='utf8')
        result=subprocess.run(['node','--check',str(target)],capture_output=True,text=True)
        if result.returncode:raise RuntimeError(result.stderr[:1000])
for filename in ['assets/mej-companion-setup-v1.js','assets/mej-companion-motion-v1.js','assets/mej-study-companion.js']:
    result=subprocess.run(['node','--check',filename],capture_output=True,text=True)
    if result.returncode:raise RuntimeError(filename+': '+result.stderr[:700])
p.write_text(s,encoding='utf8')
print('Omani companion motion installed; all JS syntax checks passed.')
