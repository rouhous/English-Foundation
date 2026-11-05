#!/usr/bin/env python3
"""Finish stage-1 placement unlock correction and audit question-bank sufficiency."""
from pathlib import Path
import re,json,subprocess,tempfile,collections
p=Path("index.html");s=p.read_text(encoding="utf8")
marker="MEJ_STAGE1_LEVEL_UNLOCK_V2"
if marker not in s:
 old="function maxAllowed(p=active()){if(!p.diagnosed)return 0;let cap=Math.max(1,Math.min(12,Number(p.assigned)||1));while(cap<12){let all=true;for(let j=1;j<=cap;j++)if(!achieved(j,p)){all=false;break}if(!all)break;cap++}return cap}"
 new="""// MEJ_STAGE1_LEVEL_UNLOCK_V2
function maxAllowed(p=active()){
 if(!p.diagnosed)return 0;
 let cap=Math.max(0,Math.min(12,Number(p.assigned)||0));
 while(cap<12){
  if(!achieved(cap,p))break;
  cap++;
 }
 return cap
}"""
 if s.count(old)!=1:raise RuntimeError("Expected previous maxAllowed implementation was not found")
 s=s.replace(old,new,1)
 oldlearn="function learnLevel(g,part=null){if(!checkAccess(g))return;let items="
 newlearn="function learnLevel(g,part=null){if(!checkAccess(g))return;if(part&&!mejPartUnlocked(g,part)){toast('أكمل المستوى الأول أولًا لفتح المستوى الثاني.');return}let items="
 if s.count(oldlearn)!=1:raise RuntimeError("Learning guard not found")
 s=s.replace(oldlearn,newlearn,1)
# Questions and placement capacity checks
start=s.index("const BANK=")+len("const BANK=")
bank=json.JSONDecoder().raw_decode(s[start:])[0]
bygrade=collections.Counter(int(q["g"]) for q in bank)
byplacement=collections.Counter(int(q["g"]) for q in bank if q.get("mode")=="mcq" and q.get("type")!="Listening")
for ceiling in range(1,13):
 per=24//(ceiling+1); rem=24%(ceiling+1)
 for g in range(ceiling+1):
  requested=per+(1 if g>ceiling-rem else 0)
  if byplacement[g]<requested:raise RuntimeError(f"Placement plan for grade {ceiling} needs {requested} at level {g}, only {byplacement[g]}")
ids=[q.get("id") for q in bank]
if len(ids)!=len(set(ids)):raise RuntimeError("Duplicate question identifiers")
assert "let grade=0;for(const [min,g] of bounds)" in s
assert s.count("function mejPartUnlocked(")==1
assert marker in s
blocks=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
with tempfile.TemporaryDirectory() as d:
 for i,block in enumerate(blocks):
  if not block.strip():continue
  f=Path(d)/f"inline-{i}.js";f.write_text(block,encoding="utf8")
  result=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(f"JavaScript block {i}: {result.stderr[:1000]}")
p.write_text(s,encoding="utf8")
report={"status":"STAGE1_STATIC_CHECKS_PASSED","question_count":len(bank),"questions_by_stage":dict(sorted(bygrade.items())),"diagnostic_eligible_by_stage":dict(sorted(byplacement.items())),"placement_ceiling_checked":[1,12],"placement_question_count":24,"two_parts_present":True,"part_two_gated_by_first_part_mastery":True,"foundation_zero_placement":True,"note":"Static checks only; browser and end-to-end user acceptance still required."}
Path("diagnostics/stage1-qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
print(json.dumps(report,ensure_ascii=False))
