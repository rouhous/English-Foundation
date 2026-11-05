#!/usr/bin/env python3
"""Ensure general practice and study screens cannot bypass stage part 2 lock."""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html");s=p.read_text(encoding="utf8")
mark="MEJ_STAGE1_ALL_PATHS_GUARDED_V3"
if mark not in s:
 old="function beginLevel(g,type=null,wrongOnly=false){if(!checkAccess(g))return;let p=active();let pool=byGrade[g].filter(q=>!type||q.type===type);"
 new="""// MEJ_STAGE1_ALL_PATHS_GUARDED_V3
function beginLevel(g,type=null,wrongOnly=false){if(!checkAccess(g))return;let p=active();let permittedPool=mejPartUnlocked(g,2)?byGrade[g]:mejStageQuestions(g,1);let pool=permittedPool.filter(q=>!type||q.type===type);"""
 if s.count(old)!=1:raise RuntimeError("Could not locate general practice entry")
 s=s.replace(old,new,1)
 old="let items=(part?mejStageQuestions(g,part):byGrade[g]).filter(q=>q.word&&q.type==='Vocabulary');"
 new="let items=(part?mejStageQuestions(g,part):(mejPartUnlocked(g,2)?byGrade[g]:mejStageQuestions(g,1))).filter(q=>q.word&&q.type==='Vocabulary');"
 if s.count(old)!=1:raise RuntimeError("Could not locate learning list entry")
 s=s.replace(old,new,1)
assert s.count(mark)==1
assert "let permittedPool=mejPartUnlocked(g,2)?byGrade[g]:mejStageQuestions(g,1)" in s
blocks=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
with tempfile.TemporaryDirectory() as d:
 for i,block in enumerate(blocks):
  if not block.strip():continue
  f=Path(d)/f"inline-{i}.js";f.write_text(block,encoding="utf8")
  c=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if c.returncode:raise RuntimeError(c.stderr[:800])
p.write_text(s,encoding="utf8")
print("All practice and learning entry points honor two-part progression.")
