#!/usr/bin/env python3
"""Install Stage 3 ranking tab without enabling real student scores.
This only exposes a safe inactive route until authenticated verified transport exists.
"""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGE3_RANKING_ROUTE_V1"
if marker in s:
 print("Stage 3 route already installed")
 raise SystemExit(0)
def one(old,new,where):
 global s
 if s.count(old)!=1:raise RuntimeError(f"{where} expected once, found {s.count(old)}")
 s=s.replace(old,new,1)
one(
 '<button class="navbutton" data-route="reports" onclick="route(\'reports\')">📊 معاينة</button>',
 '<button class="navbutton" data-route="reports" onclick="route(\'reports\')">📊 معاينة</button><button class="navbutton" data-route="ranking" onclick="route(\'ranking\')">🏆 ترتيب صفي</button>',
 "nav button")
one(
 "else if(page==='reports')reports();window.scrollTo({top:0,behavior:'instant'});",
 "else if(page==='reports')reports();else if(page==='ranking')window.showClassRanking();window.scrollTo({top:0,behavior:'instant'});",
 "route")
one('</head>',
 '<link rel="stylesheet" href="./assets/class-ranking-v1.css?v=20261105-stage3">\n</head>',
 "ranking stylesheet")
one('</body>',
 '<!-- MEJ_STAGE3_RANKING_ROUTE_V1: visible but not fed by unverified local scores -->\n<script src="./assets/class-ranking-v1.js?v=20261105-stage3"></script>\n<script src="./assets/class-ranking-route-v1.js?v=20261105-stage3"></script>\n</body>',
 "verified ranking scripts")
assert s.count(marker)==1
assert "route('ranking')" in s
assert "window.showClassRanking()" in s
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
with tempfile.TemporaryDirectory() as tmp:
 for i,block in enumerate(scripts):
  if not block.strip():continue
  f=Path(tmp)/f"inline-{i}.js"
  f.write_text(block,encoding="utf8")
  result=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(f"JS block {i} invalid: {result.stderr[:1200]}")
p.write_text(s,encoding="utf8")
print("Stage 3 ranking route added: no client-reported scores or live ranking enabled")
