#!/usr/bin/env python3
"""Validate exam-practice activity bank against the 2026 Grade 12 task blueprints."""
import json,re,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"exam-practice/index.html"
html=p.read_text(encoding="utf-8")
m=re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>',html)
if not m: raise SystemExit("ERROR: activityData not found")
items=json.loads(m.group(1))["activities"]
errors=[]
def check(ok,msg):
    if not ok: errors.append(msg)
for a in items:
    key=a["id"]
    if a["skill"]=="writing":
        check(a.get("minWords",0)>=100,key+": writing minWords below 100")
    else:
        check(len(a.get("questions",[]))==a["marks"],key+": expected one-mark question per mark")
        for q in a.get("questions",[]):
            check(q["type"] in ("mc","tf","text","match"),key+": unknown question type")
            if q["type"]=="mc":
                check(isinstance(q["answer"],int) and 0<=q["answer"]<len(q["opts"]),key+": invalid MC answer")
            elif q["type"]=="text":
                check(isinstance(q["answer"],list) and bool(q["answer"]),key+": text answer missing")
            elif q["type"]=="tf":
                check(q["answer"] in ("true","false"),key+": bad true/false key")
    if a.get("audioReady") is True:
        check((p.parent/a["audio"]).is_file(),key+": audio marked ready but file absent")
for track in ("Core","Elective"):
    blueprint=({"listening:1":7,"listening:2":8,"grammar:1":5,"vocabulary:1":5,"reading:1":7,"reading:2":8,"reading:3":10,"writing:1":10,"writing:2":10}
        if track=="Core" else {"listening:1":10,"listening:2":10,"reading:1":12,"reading:2":13,"writing:1":15,"writing:2":10})
    for model in ("A","B"):
        acts=[a for a in items if a["grade"]==12 and a["track"]==track and a["model"]==model]
        keys={a["skill"]+":"+str(a["group"]):a for a in acts}
        check(set(keys)==set(blueprint),f"{track} Model {model}: missing/extra sections")
        for name,marks in blueprint.items():
            if name in keys: check(keys[name]["marks"]==marks,f"{track} Model {model} {name}: wrong marks")
        check(sum(x["marks"] for x in acts)==70,f"{track} Model {model}: total != 70")
        if track=="Core":
            for a in acts:
                wc=len(a.get("passage","").split())
                if a["skill"]=="grammar": check(60<=wc<=70,a["id"]+": grammar length")
                if a["skill"]=="vocabulary": check(80<=wc<=90,a["id"]+": vocabulary length")
                if a["skill"]=="reading" and a["group"]==2: check(350<=wc<=400,a["id"]+": reading 2 length")
                if a["skill"]=="reading" and a["group"]==3: check(400<=wc<=450,a["id"]+": reading 3 length")
                if a["skill"]=="reading" and a["group"]==1:
                    parts=re.split(r'\n\s*\n',a["passage"].strip())
                    check(len(parts)==7,a["id"]+": needs seven independent texts")
                    for n,part in enumerate(parts,1): check(35<=len(part.split())<=45,f"{a['id']} text {n}: length")
                if a["skill"]=="listening": check(350<=wc<=450,a["id"]+": listening length")
print(f"Validated {len(items)} activities across two Grade 12 tracks.")
if errors:
    print("\n".join("ERROR: "+e for e in errors))
    sys.exit(1)
print("Grade 12 structural checks passed. Audio quality and content still need human review.")
