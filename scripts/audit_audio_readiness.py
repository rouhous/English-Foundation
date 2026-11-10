#!/usr/bin/env python3
"""Audit exam-bank readiness before recording any listening audio.

Reads the current HTML without modifying it. Exit nonzero if blocking issues remain.
"""
import json, re, sys
from pathlib import Path
from collections import Counter, defaultdict
html=Path(__file__).resolve().parents[1].joinpath("exam-practice/index.html").read_text(encoding="utf-8")
m=re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>',html)
if not m: raise SystemExit("ERROR: activityData is missing")
activities=json.loads(m.group(1))["activities"]
models=defaultdict(list)
seen={}
duplicates=[]
invalid=[]
scripts=[]
for a in activities:
    key=(a["grade"],a["track"],a["model"])
    models[key].append(a)
    signature=" ".join((a.get("passage") or a.get("topic") or "").lower().split())
    slot=(a["grade"],a["track"],a["skill"],a["group"],signature)
    if signature and slot in seen: duplicates.append((a["id"],seen[slot]))
    else: seen[slot]=a["id"]
    for q in a.get("questions",[]):
        if q.get("type")=="mc" and (not isinstance(q.get("opts"),list) or not isinstance(q.get("answer"),int) or not 0<=q["answer"]<len(q["opts"])):
            invalid.append(a["id"]+": invalid multiple choice")
    if a["skill"]=="listening":
        scripts.append(a)
        if not a.get("passage","").strip():invalid.append(a["id"]+": missing listening script")
for grade,track in sorted(set((a["grade"],a["track"]) for a in activities)):
    counts=[len(models[(grade,track,model)]) for model in "ABCD"]
    if not all(counts) or len(set(counts))!=1:invalid.append(f"Grade {grade} {track}: A-D uneven: {counts}")
print(f"Activities: {len(activities)} | Listening scripts: {len(scripts)} | Duplicate stimuli: {len(duplicates)} | Structural issues: {len(invalid)}")
for a,b in duplicates: print(f"DUPLICATE {a} matches {b}")
for issue in invalid: print("ERROR",issue)
print("Audio production gate:", "BLOCKED" if duplicates or invalid else "READY FOR CONTENT AND HUMAN REVIEW")
sys.exit(1 if duplicates or invalid else 0)
