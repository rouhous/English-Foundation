#!/usr/bin/env python3
"""Keep all earlier journey levels accessible without changing stars or learner data."""
from pathlib import Path
import re, subprocess, tempfile
path=Path("index.html")
source=path.read_text(encoding="utf-8")
marker="MEJ_PRIOR_PARTS_UNLOCKED_V1"
pattern=r"function mejPartUnlocked\(g,part,p=active\(\)\)\{[^\n]*\}"
matches=list(re.finditer(pattern,source))
if len(matches)!=1:
    raise RuntimeError(f"Expected exactly one mejPartUnlocked definition, got {len(matches)}")
replacement="""// MEJ_PRIOR_PARTS_UNLOCKED_V1
function mejPartUnlocked(g,part,p=active()){
  g=Number(g);part=Number(part);
  if(part===1)return true;
  if(part!==2||!Number.isInteger(g)||g<0||g>12)return false;
  // The student has already reached a later stage: all earlier parts stay open.
  if(g<maxAllowed(p))return true;
  // At the current stage, part 2 only opens after completing part 1.
  const first=mejStageQuestions(g,1);
  return first.length>0&&mejStageMastered(g,1,p)===first.length;
}"""
start,end=matches[0].span()
source=source[:start]+replacement+source[end:]
assert source.count(marker)==1
assert source.count("function mejPartUnlocked(")==1
assert "if(g<maxAllowed(p))return true" in source
# Do not touch grades, badges, localStorage, or the question banks.
blocks=re.findall(r'<script[^>]*>(.*?)</script>',source,re.S|re.I)
with tempfile.TemporaryDirectory() as tmp:
    for i,block in enumerate(blocks):
        if not block.strip():continue
        js=Path(tmp)/f"inline-{i}.js"
        js.write_text(block,encoding="utf-8")
        result=subprocess.run(["node","--check",str(js)],capture_output=True,text=True)
        if result.returncode:raise RuntimeError(f"Invalid inline JS {i}: {result.stderr[:1000]}")
path.write_text(source,encoding="utf-8")
print("Unlocks previous levels and keeps current part 2 gated; syntax checked.")
