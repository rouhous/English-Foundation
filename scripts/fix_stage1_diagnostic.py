#!/usr/bin/env python3
"""Repair placement and two-part progression. No student data is read or modified."""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGE1_DIAGNOSTIC_V1"
if marker in s:
 print("Stage 1 already installed");raise SystemExit(0)
def change(before,after,name):
 global s
 n=s.count(before)
 if n!=1: raise RuntimeError(f"{name}: expected 1 match, got {n}")
 s=s.replace(before,after,1)
change("function mejStageMastered(g,part,p=active()){return mejStageQuestions(g,part).filter(q=>(p.correct||{})[q.id]>=2).length}",
"""function mejStageMastered(g,part,p=active()){return mejStageQuestions(g,part).filter(q=>(p.correct||{})[q.id]>=2).length}
// MEJ_STAGE1_DIAGNOSTIC_V1
function mejPartUnlocked(g,part,p=active()){if(part===1)return true;if(part!==2)return false;const first=mejStageQuestions(g,1);return first.length>0&&mejStageMastered(g,1,p)===first.length}""","mastery unlock")
change("function beginStagePart(g,part){if(!checkAccess(g))return;const p=active();const pool=mejStageQuestions(g,part);",
"function beginStagePart(g,part){if(!checkAccess(g))return;if(!mejPartUnlocked(g,part)){toast('أكمل المستوى الأول أولًا لفتح المستوى الثاني.');return}const p=active();const pool=mejStageQuestions(g,part);","part access")
change('<button class="btn small mint" onclick="beginStagePart(${g},${part})">▶ لعب</button>',
'<button class="btn small mint" ${mejPartUnlocked(g,part,p)?"":"disabled"} onclick="beginStagePart(${g},${part})">${mejPartUnlocked(g,part,p)?"▶ لعب":"🔒 مقفل"}</button>',"part card")
change('<button class="btn mint" onclick="beginLevel(${g})">▶ ابدأ اللعب</button>',
'<button class="btn mint" onclick="${part ? \'beginStagePart(\'+g+\',\'+part+\')\' : \'beginLevel(\'+g+\')\'}">▶ ابدأ اللعب</button>',"lesson play action")
change("let grade=1;for(const [min,g] of bounds){if(pc>=min){grade=g;break}}",
"let grade=0;for(const [min,g] of bounds){if(pc>=min){grade=g;break}}","allow foundation placement")
change("activeSession.mistakes.push(shownId);if(activeSession.kind==='practice')",
"activeSession.mistakes.push(shownId);activeSession.responses.push({grade:questionById[shownId].g,id:shownId,ok:false,skipped:true});if(activeSession.kind==='practice')","record diagnostic skips")
change("المستويات من 1 إلى ${s.placed} متاحة.",
"المستوى التأسيسي متاح دائمًا، والمراحل الأعلى تُفتح بحسب التقدم.","placement message")
assert s.count(marker)==1
assert "function startDiagnostic()" in s and "function placementPlan(" in s
blocks=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
with tempfile.TemporaryDirectory() as d:
 for i,block in enumerate(blocks):
  if not block.strip():continue
  f=Path(d)/f"inline-{i}.js";f.write_text(block,encoding="utf8")
  result=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(f"Inline JavaScript {i} invalid: {result.stderr[:1200]}")
p.write_text(s,encoding="utf8")
print("Stage 1 corrections applied, syntax valid")
