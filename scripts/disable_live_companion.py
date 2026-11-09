#!/usr/bin/env python3
"""Unhook unstable companion scripts from live student pages without changing quiz or progress."""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html");s=p.read_text(encoding="utf-8")
paths=["mej-companion-setup-v1.js","mej-companion-motion-v1.js","mej-companion-3d-v1.js"]
for name in paths:
 s,n=re.subn(r'^[ \t]*<script\b[^>]*\bsrc=["\'][^"\']*'+re.escape(name)+r'[^"\']*["\'][^>]*>\s*</script>[ \t]*\n?', '',s,flags=re.M|re.I)
 print("Removed from live app",name,n)
assert all(name not in s for name in paths)
with tempfile.TemporaryDirectory() as d:
 for i,b in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
  if not b.strip():continue
  q=Path(d)/f"js{i}.js";q.write_text(b,encoding="utf8")
  result=subprocess.run(["node","--check",str(q)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr[:700])
p.write_text(s,encoding="utf-8")
print("Live app now has no setup, motion or WebGL companion script links.")
