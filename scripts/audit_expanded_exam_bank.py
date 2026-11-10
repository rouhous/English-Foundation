#!/usr/bin/env python3
"""Report progress toward four fixed exams and eight unique activities per section."""
import json,re
from collections import defaultdict
from pathlib import Path
html=(Path(__file__).resolve().parents[1]/"exam-practice/index.html").read_text(encoding="utf-8")
m=re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>',html)
if not m:raise SystemExit("Missing activityData")
items=json.loads(m.group(1))["activities"]
groups=defaultdict(list)
for a in items:groups[(a["grade"],a["track"])].append(a)
required={
 5:["listening:1","listening:2","vocabulary:1","grammar:1","reading:1","reading:2","writing:1","writing:2"],
 6:["listening:1","listening:2","vocabulary:1","grammar:1","reading:1","reading:2","writing:1","writing:2"],
 7:["listening:1","listening:2","grammar-vocabulary:1","reading:1","reading:2","writing:1","writing:2"],
 8:["listening:1","listening:2","grammar-vocabulary:1","reading:1","reading:2","writing:1","writing:2"],
 9:["listening:1","listening:2","grammar-vocabulary:1","reading:1","reading:2","writing:1","writing:2"],
 10:["listening:1","listening:2","vocabulary:1","grammar:1","reading:1","reading:2","writing:1","writing:2"],
 11:["listening:1","listening:2","vocabulary:1","grammar:1","reading:1","reading:2","reading:3","writing:1","writing:2"],
 12:["listening:1","listening:2","vocabulary:1","grammar:1","reading:1","reading:2","reading:3","writing:1","writing:2"]
}
elective=["listening:1","listening:2","reading:1","reading:2","writing:1","writing:2"]
print("Fixed target: 4 models per grade/track; independent pool target: 8 distinct tasks per section.")
for key in sorted(groups):
 grade,track=key
 tasks=groups[key]
 slots=elective if track=="Elective" else required[grade]
 fixed={mod:sum(1 for a in tasks if a["model"]==mod) for mod in "ABCD"}
 deficits=[]
 for slot in slots:
  pool=[a for a in tasks if a["skill"]+":"+str(a["group"])==slot]
  signatures=set((a.get("passage",""),a.get("topic",""),tuple(q.get("stem","") for q in a.get("questions",[]))) for a in pool)
  deficits.append(slot+":"+str(len(signatures))+"/8")
 print(f"G{grade} {track} fixed={fixed} | "+", ".join(deficits))
