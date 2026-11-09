#!/usr/bin/env python3
"""Install the approved offline 2D companion; never alter student data or question scoring."""
from pathlib import Path
import subprocess,re,tempfile
index=Path("index.html")
s=index.read_text(encoding="utf-8")
paths=["./assets/mej-companion-art-v1.js?v=20261109","./assets/mej-companion-live-v1.js?v=20261109"]
for path in paths:
 tag='<script defer src="'+path+'"></script>'
 if tag not in s:
  assert "</head>" in s
  s=s.replace("</head>",tag+"\n</head>",1)
 assert s.count(tag)==1
assert s.index(paths[0])<s.index(paths[1])
for f in ["assets/mej-companion-art-v1.js","assets/mej-companion-live-v1.js"]:
 r=subprocess.run(["node","--check",f],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr[:1000])
with tempfile.TemporaryDirectory() as folder:
 for i,b in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
  if not b.strip():continue
  f=Path(folder)/(str(i)+".js");f.write_text(b,encoding="utf-8")
  r=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr[:800])
index.write_text(s,encoding="utf-8")
print("Approved Omani 2D companion linked without changing student progress.")
