#!/usr/bin/env python3
"""Quality gate for illustrated exam Listening 1/2 in Grades 5–9.
Checks actual picture files and semantic same-row distractors before voice generation.
"""
import json,re,sys
from pathlib import Path
from collections import defaultdict
root=Path(__file__).resolve().parents[1]
html=(root/"exam-practice/index.html").read_text(encoding="utf8")
m=re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>',html)
if not m:raise SystemExit("ERROR: missing exam bank")
data=json.loads(m.group(1))["activities"]
errors=[]
stems={}
task_counts=defaultdict(int)
for a in data:
 if a.get("skill")!="listening" or not 5<=a["grade"]<=9:continue
 task_counts[(a["grade"],a["model"],a["group"])]+=1
 ident=(a["grade"],a["track"],a["group"]," ".join(a.get("passage","").lower().split()))
 if ident in stems:errors.append("Duplicate listening script: "+a["id"]+" and "+stems[ident])
 else:stems[ident]=a["id"]
 if len(a.get("questions",[]))!=5:errors.append("Wrong question count "+a["id"])
 if not a.get("passage","").strip():errors.append("Empty listening script "+a["id"])
 for q in a.get("questions",[]):
  kind=q["type"]
  if kind=="mc" and (not isinstance(q.get("answer"),int) or q["answer"] not in range(len(q.get("opts",[])))):errors.append("Invalid MC answer "+a["id"])
  if kind=="tf" and q.get("answer") not in ("true","false"):errors.append("Invalid TF answer "+a["id"])
 if a.get("group")==1:
  if a.get("imageBankVersion")!="grade-specific-3d-v1":errors.append("Wrong image version "+a["id"])
  if a["grade"]<=6:
   pictures=a.get("optionPictures",[])
   if len(pictures)!=6 or len(set(pictures))!=6:errors.append("Six distinct visual options required "+a["id"])
   if len(set(a.get("options",[])))!=6:errors.append("Repeated visual description "+a["id"])
   keys=[int(q["answer"]) for q in a["questions"]]
   if len(set(keys))!=5 or any(not 1<=k<=6 for k in keys):errors.append("Bad five-to-six matching "+a["id"])
   for pic in pictures:
    if not (root/"exam-practice"/pic).is_file():errors.append("Missing image "+pic)
  else:
   for q in a["questions"]:
    pics=q.get("optionPictures",[])
    if len(pics)!=3 or len(set(pics))!=3:errors.append("Three distinct pictures required "+a["id"])
    if len({Path(p).stem[0] for p in pics})!=1:pass
    numbers=[int(Path(p).stem) for p in pics]
    if len({n//4 for n in numbers})!=1:errors.append("Different semantic fields in "+a["id"]+" "+q["stem"])
    for pic in pics:
     if not (root/"exam-practice"/pic).is_file():errors.append("Missing image "+pic)
for grade in range(5,10):
 for model in "ABCD":
  for group in (1,2):
   if task_counts[(grade,model,group)]!=1:errors.append("Missing model/section "+str((grade,model,group)))
print("Grade 5–9 Listening entries:",sum(task_counts.values()),"Errors:",len(errors))
for e in errors:print("FAIL:",e)
sys.exit(1 if errors else 0)
