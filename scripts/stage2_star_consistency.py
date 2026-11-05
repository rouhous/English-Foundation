#!/usr/bin/env python3
"""Stage 2: make the local stars display deterministic from mastered question IDs.
This is a consistency measure, not authentication or anti-cheat security.
"""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGE2_LOCAL_STAR_CONSISTENCY_V1"
if marker not in s:
    original="function persist(send=true){active().lastActivity=Date.now();let saved=false;"
    patched="""// MEJ_STAGE2_LOCAL_STAR_CONSISTENCY_V1
// Browser scores are advisory: only the authenticated server can certify a ranking.
function mejReconcileLocalStars(profile){
 if(!profile)return 0;
 const raw=profile.correct&&typeof profile.correct==='object'?profile.correct:{};
 let total=0;
 for(const [id,value] of Object.entries(raw)){
  if(!Object.prototype.hasOwnProperty.call(questionById,id))continue;
  const n=Number(value);
  if(Number.isFinite(n)&&n>=2)total++;
 }
 profile.stars=Math.min(2600,total);
 return profile.stars
}
function persist(send=true){mejReconcileLocalStars(active());active().lastActivity=Date.now();let saved=false;"""
    if s.count(original)!=1:raise RuntimeError("Cannot safely locate existing persist function")
    s=s.replace(original,patched,1)
    assert s.count(marker)==1
    assert "function gradeAnswer(response,node)" in s
    blocks=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
    with tempfile.TemporaryDirectory() as d:
     for i,block in enumerate(blocks):
      if not block.strip():continue
      f=Path(d)/f"inline{i}.js";f.write_text(block,encoding="utf8")
      check=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
      if check.returncode:raise RuntimeError(f"Invalid JS in inline block {i}: {check.stderr[:1200]}")
    p.write_text(s,encoding="utf8")
print("Stage 2: local stars reconciled from unique mastered question IDs; no student data changed in repository.")
