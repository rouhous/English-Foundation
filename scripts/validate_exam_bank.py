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
# Cross-grade structural audit for the complete Grade 5–12 bank.
required = {
    5: {("listening",1):5,("listening",2):5,("vocabulary",1):5,("grammar",1):5,("reading",1):5,("reading",2):5,("writing",1):5,("writing",2):5},
    6: {("listening",1):5,("listening",2):5,("vocabulary",1):5,("grammar",1):5,("reading",1):5,("reading",2):5,("writing",1):5,("writing",2):5},
    7: {("listening",1):5,("listening",2):5,("grammar-vocabulary",1):10,("reading",1):5,("reading",2):5,("writing",1):5,("writing",2):5},
    8: {("listening",1):5,("listening",2):5,("grammar-vocabulary",1):10,("reading",1):5,("reading",2):5,("writing",1):5,("writing",2):5},
    9: {("listening",1):5,("listening",2):5,("grammar-vocabulary",1):10,("reading",1):4,("reading",2):6,("writing",1):5,("writing",2):5},
    10: {("listening",1):7,("listening",2):8,("vocabulary",1):5,("grammar",1):5,("reading",1):10,("reading",2):10,("writing",1):5,("writing",2):10},
    11: {("listening",1):7,("listening",2):8,("vocabulary",1):5,("grammar",1):5,("reading",1):5,("reading",2):7,("reading",3):8,("writing",1):5,("writing",2):10},
    12: {("listening",1):7,("listening",2):8,("vocabulary",1):5,("grammar",1):5,("reading",1):7,("reading",2):8,("reading",3):10,("writing",1):10,("writing",2):10},
}
elective11={("listening",1):10,("listening",2):10,("reading",1):10,("reading",2):10,("writing",1):10,("writing",2):10}
elective12={("listening",1):10,("listening",2):10,("reading",1):12,("reading",2):13,("writing",1):15,("writing",2):10}
for grade in range(5,13):
    tracks=("Core","Elective") if grade>=11 else ("Standard",)
    for track in tracks:
        for model in ("A","B"):
            a=[x for x in items if (x["grade"],x["track"],x["model"])==(grade,track,model)]
            blueprint= elective12 if grade==12 and track=="Elective" else elective11 if grade==11 and track=="Elective" else required[grade]
            keyed={(x["skill"],x["group"]):x for x in a}
            check(len(keyed)==len(a),f"G{grade} {track} {model}: duplicate section")
            check(set(keyed)==set(blueprint),f"G{grade} {track} {model}: wrong section list")
            for k,marks in blueprint.items():
                if k in keyed: check(keyed[k]["marks"]==marks,f"G{grade} {track} {model}: {k} wrong marks")
            check(sum(x["marks"] for x in a)==(70 if grade==12 else 60 if grade>=10 else 40),f"G{grade} {track} {model}: total marks")
            for x in a:
                if x["status"]=="ready":
                    check(not x.get("mediaPending"),x["id"]+": media required")
                    if x["skill"]=="listening":check(x.get("audioReady") is True,x["id"]+": audio not ready")
# Additional content checks for Grades 10–11 against SAH September 2026.
for a in items:
    g, track, skill, group = a["grade"],a["track"],a["skill"],a["group"]
    if g not in (10,11): continue
    bounds = None
    if g==10:
        if skill=="listening": bounds=(250,300)
        elif skill=="reading": bounds=(350,400) if group==1 else (400,450)
        elif skill in ("grammar","vocabulary"): bounds=(80,90)
    elif track=="Core":
        if skill=="listening": bounds=(300,350) if group==1 else (350,400)
        elif skill=="reading": bounds=(300,350) if group==2 else (350,400) if group==3 else None
        elif skill=="grammar": bounds=(50,60)
        elif skill=="vocabulary": bounds=(70,80)
    else:
        if skill in ("listening","reading"): bounds=(400,450)
    if bounds:
        words=len(a.get("passage","").split())
        check(bounds[0]<=words<=bounds[1],
              f"{a['id']}: expected {bounds[0]}-{bounds[1]} words, got {words}")
    if a.get("passage") and not a["passage"].strip().endswith((".", "!", "?", ":", "\\")):
        check(False, a["id"]+": text ends in an incomplete sentence")
    if skill in ("grammar","vocabulary") and g==10:
        check(a.get("passage","").count("______")>=5,a["id"]+": missing contextual gaps")
print(f"Validated {len(items)} activities across Grades 5–12 and both Grade 11/12 tracks.")
if errors:
    print("\n".join("ERROR: "+e for e in errors))
    sys.exit(1)
print("Grade 12 structural checks passed. Audio quality and content still need human review.")
