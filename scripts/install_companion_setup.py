#!/usr/bin/env python3
"""Load companion onboarding in My English Journey without touching learner records."""
from pathlib import Path
import re,subprocess,tempfile
page=Path("index.html")
s=page.read_text(encoding="utf-8")
marker='<script src="./assets/mej-companion-setup-v1.js?v=20261109" defer></script>'
if marker not in s:
    assert "</head>" in s
    s=s.replace("</head>",marker+"\n</head>",1)
assert s.count(marker)==1
with tempfile.TemporaryDirectory() as tmp:
    for i,block in enumerate(re.findall(r"<script[^>]*>(.*?)</script>",s,re.S|re.I)):
        if not block.strip():continue
        js=Path(tmp)/f"inline{i}.js"
        js.write_text(block,encoding="utf-8")
        result=subprocess.run(["node","--check",str(js)],capture_output=True,text=True)
        if result.returncode:raise RuntimeError(result.stderr[:1200])
    result=subprocess.run(["node","--check","assets/mej-companion-setup-v1.js"],capture_output=True,text=True)
    if result.returncode:raise RuntimeError(result.stderr[:1200])
page.write_text(s,encoding="utf-8")
print("Companion onboarding is loaded for existing and new student profiles.")
