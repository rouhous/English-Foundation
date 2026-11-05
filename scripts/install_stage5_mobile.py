#!/usr/bin/env python3
"""Stage 5: link responsive stylesheet to original application without changing UI content."""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGE5_RESPONSIVE_V1"
if marker not in s:
  needle="</head>"
  if s.count(needle)!=1:raise RuntimeError("Expected one document HEAD")
  s=s.replace(needle,
    '<!-- MEJ_STAGE5_RESPONSIVE_V1: safe-area, responsive menus, landscape -->\n'
    '<link rel="stylesheet" href="./assets/stage5-responsive.css?v=20261105-stage5">\n'
    '</head>',1)
  assert s.count(marker)==1
  assert 'mobile-ocean-v31' in s
  assert './mobile-home-fix.css?v=20261104-release' in s
  scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
  with tempfile.TemporaryDirectory() as tmp:
    for i,js in enumerate(scripts):
      if not js.strip():continue
      f=Path(tmp)/f"inline-{i}.js"
      f.write_text(js,encoding="utf8")
      result=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
      if result.returncode:raise RuntimeError("Inline JS invalid: "+result.stderr[:1000])
  p.write_text(s,encoding="utf8")
print("STAGE5_RESPONSIVE_CSS_LINKED_AND_JS_VALID")
