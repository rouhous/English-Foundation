#!/usr/bin/env python3
"""Inspect only: locate existing student state/report hooks for safe Supabase migration."""
from pathlib import Path
import re,json
p=Path("index.html")
s=p.read_text(encoding="utf-8")
patterns=["MEJ_STUDENT_ACCESS_V1","MEJ_STUDENT_DEVICE_REF_V1","MEJ_ASSIGNED_TEACHER_CODE_V1",
"reportId","english-foundation-oman-progress-v1","function queueReport","function sendReport",
"studentGrade","weeklyAttempts","levelStats","navigator.onLine","saveProfile","saveProgress",
"localStorage.setItem","WADI_RECEIPT_CALLBACK","MEJ_VERIFIED_SCHOOL_NAME_V1",
"fetch(", "function sync", "const MEJ_","MEJVerifiedSync"]
out={"fileBytes":len(s),"lineCount":s.count("\n")+1,"matches":{}}
for needle in patterns:
 matches=[]
 for m in list(re.finditer(re.escape(needle),s))[:8]:
  start=max(0,m.start()-320);end=min(len(s),m.end()+440)
  sample=s[start:end]
  # protect accidental output of credentials/encoded image assets
  sample=re.sub(r'data:image/[^;,]+;base64,[A-Za-z0-9+/=]{80,}', '[embedded-image]',sample)
  if len(sample)>900: sample=sample[:900]
  matches.append({"offset":m.start(),"line":s.count("\n",0,m.start())+1,"context":sample})
 out["matches"][needle]=matches
lines=s.splitlines()
out["sections"]={}
for name,lo,hi in [("reporting",2085,2210),("local_storage",1425,1470),("profile_creation",1700,1748),("app_tail",2490,2550)]:
 sample=[]
 for i in range(lo-1,min(hi,len(lines))):
  line=lines[i]
  sample.append(str(i+1)+": "+(line[:1100]+(" [TRUNCATED]" if len(line)>1100 else "")))
 out["sections"][name]="\\n".join(sample)
out["save_locations"]=[{"line":i+1,"excerpt":line[:600]} for i,line in enumerate(lines) if re.search(r'function (?:save|persist|record|complete|attempt|commit|scheduleReport|autoReport)',line,re.I)][:50]
Path("diagnostics").mkdir(exist_ok=True)
Path("diagnostics/mej-progress-hook-audit.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
print("AUDIT_OK", len(s),sum(len(v) for v in out["matches"].values()))

# Trigger read-only audit workflow after initial installation.
