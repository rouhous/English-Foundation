#!/usr/bin/env python3
"""Install true WebGL 3D companion after 2D fallback scripts; preserve all learner progress."""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html");s=p.read_text(encoding="utf-8")
tag='<script src="./assets/mej-companion-3d-v1.js?v=20261109" defer></script>'
anchor='<script src="./assets/mej-companion-motion-v1.js?v=20261109" defer></script>'
if tag not in s:
 if s.count(anchor)!=1:raise RuntimeError("Companion 2D fallback script not located")
 s=s.replace(anchor,anchor+"\n"+tag,1)
assert s.count(tag)==1
for file in ["assets/mej-companion-3d-v1.js","assets/mej-companion-motion-v1.js","assets/mej-companion-setup-v1.js"]:
 check=subprocess.run(["node","--check",file],capture_output=True,text=True)
 if check.returncode:raise RuntimeError(check.stderr[:1500])
with tempfile.TemporaryDirectory() as tmp:
 for i,block in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
  if not block.strip():continue
  f=Path(tmp)/f"block{i}.js";f.write_text(block,encoding="utf-8")
  test=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if test.returncode:raise RuntimeError(test.stderr[:1500])
p.write_text(s,encoding="utf-8")
print("Verified and installed 3D renderer; 2D fallback retained")
