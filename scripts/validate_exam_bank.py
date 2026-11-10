#!/usr/bin/env python3
"""Grade 5–12 / semester 1 exam bank structural validation (SAH September 2026).

Checks structure, marks, image/chart links and objective answer keys.
Draft content remains subject to human academic review and audio testing.
"""
from collections import Counter, defaultdict
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / "exam-practice"
HTML = (EXAM / "index.html").read_text(encoding="utf-8")
match = re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>', HTML)
if not match:
    raise SystemExit("ERROR: missing activityData")
activities = json.loads(match.group(1))["activities"]
errors = []
warnings = []

def check(ok, reason):
    if not ok:
        errors.append(reason)

def expected(grade, track):
    if track == "Elective":
        if grade == 12:
            return {"listening:1": 10, "listening:2": 10, "reading:1": 12,
                    "reading:2": 13, "writing:1": 15, "writing:2": 10}
        return {"listening:1": 10, "listening:2": 10, "reading:1": 10,
                "reading:2": 10, "writing:1": 10, "writing:2": 10}
    if grade >= 11:
        a = {"listening:1": 7, "listening:2": 8, "grammar:1": 5,
             "vocabulary:1": 5, "reading:1": 7 if grade == 12 else 5,
             "reading:2": 8 if grade == 12 else 7,
             "reading:3": 10 if grade == 12 else 8,
             "writing:1": 10 if grade == 12 else 5, "writing:2": 10}
        return a
    if grade == 10:
        return {"listening:1": 7, "listening:2": 8, "vocabulary:1": 5,
                "grammar:1": 5, "reading:1": 10, "reading:2": 10,
                "writing:1": 5, "writing:2": 10}
    if grade == 9:
        return {"listening:1": 5, "listening:2": 5, "grammar-vocabulary:1": 10,
                "reading:1": 4, "reading:2": 6, "writing:1": 5, "writing:2": 5}
    if grade >= 7:
        return {"listening:1": 5, "listening:2": 5, "grammar-vocabulary:1": 10,
                "reading:1": 5, "reading:2": 5, "writing:1": 5, "writing:2": 5}
    return {"listening:1": 5, "listening:2": 5, "vocabulary:1": 5,
            "grammar:1": 5, "reading:1": 5, "reading:2": 5,
            "writing:1": 5, "writing:2": 5}

def minimum_words(a):
    grade, track, group = a["grade"], a["track"], a["group"]
    if grade == 12:
        return 150 if track == "Elective" else 100
    if grade == 11:
        return 100 if track == "Elective" or group == 2 else 85
    if grade in (9, 10):
        return 100
    if grade == 8:
        return 80
    if grade == 7:
        return 0 if group == 1 else 80
    if grade == 6:
        return 50
    return 40

def file_exists(ref):
    return bool(ref) and (EXAM / ref).is_file()

seen_ids = set()
models = defaultdict(list)
for a in activities:
    aid = a["id"]
    check(aid not in seen_ids, f"Duplicate activity id: {aid}")
    seen_ids.add(aid)
    if a["model"] != "Pool":
        models[(a["grade"], a["track"], a["model"])].append(a)
    if a["skill"] == "writing":
        check(a.get("minWords", 0) >= minimum_words(a),
              f"{aid}: writing minimum words below official requirement")
    else:
        check(len(a.get("questions", [])) == a["marks"], f"{aid}: question count does not match marks")
        for j, q in enumerate(a.get("questions", []), 1):
            label = f"{aid} Q{j}"
            qtype = q.get("type")
            check(qtype in ("mc", "text", "tf", "match"), label + ": unknown answer type")
            if qtype == "mc":
                opts = q.get("opts", [])
                check(len(opts) in (2, 3, 4) and isinstance(q.get("answer"), int)
                      and 0 <= q.get("answer", -1) < len(opts), label + ": invalid multiple-choice key")
                for pic in q.get("optionPictures", []):
                    check(file_exists(pic), label + ": missing image " + pic)
                if q.get("optionPictures"):
                    check(len(q["optionPictures"]) == len(opts), label + ": image/option mismatch")
            elif qtype == "text":
                check(bool(q.get("answer")) and isinstance(q.get("answer"), list),
                      label + ": missing short-answer key")
            elif qtype == "tf":
                check(q.get("answer") in ("true", "false"), label + ": invalid TRUE/FALSE key")
            elif qtype == "match":
                check(bool(a.get("options")) and 1 <= int(q.get("answer", 0)) <= len(a["options"]),
                      label + ": missing/out-of-range matching option")
            if q.get("image"):
                check(file_exists(q["image"]), label + ": missing image")
    if a.get("optionPictures"):
        check(len(a["optionPictures"]) == len(a.get("options", [])),
              aid + ": activity picture/option mismatch")
        for pic in a["optionPictures"]:
            check(file_exists(pic), aid + ": missing activity picture " + pic)
    if a.get("chart"):
        check(file_exists(a["chart"]), aid + ": missing chart")
    if a.get("scenePicture"):
        check(file_exists(a["scenePicture"]), aid + ": missing writing picture")
    for pic in a.get("storyPictures", []):
        check(file_exists(pic), aid + ": missing story picture " + pic)
    if a.get("audioReady") is True:
        check(file_exists(a.get("audio")), aid + ": audio marked ready but file missing")
    if a.get("status") == "ready":
        check(not a.get("mediaPending"), aid + ": ready status while media missing")
        if a["skill"] == "listening":
            check(a.get("audioReady") is True, aid + ": ready listening without audio")
    if a["skill"] == "listening" and not a.get("audioReady"):
        warnings.append(aid + ": audio not yet verified")

for grade in range(5, 13):
    tracks = ("Core", "Elective") if grade >= 11 else ("Standard",)
    for track in tracks:
        for model in "ABCD":
            key = (grade, track, model)
            pack = models.get(key, [])
            blueprint = expected(grade, track)
            seen_sections = Counter(f"{x['skill']}:{x['group']}" for x in pack)
            check(set(seen_sections) == set(blueprint), f"{key}: sections missing or extra")
            check(all(v == 1 for v in seen_sections.values()), f"{key}: duplicate section")
            for slot, marks in blueprint.items():
                matches = [x for x in pack if f"{x['skill']}:{x['group']}" == slot]
                if matches:
                    check(matches[0]["marks"] == marks, f"{key} {slot}: wrong marks")
            check(sum(x["marks"] for x in pack) ==
                  (70 if grade == 12 else 60 if grade >= 10 else 40),
                  f"{key}: total marks incorrect")

print(f"Validated {len(activities)} activities, {len(models)} fixed exam models.")
print(f"Listening drafts awaiting final audio stage: {len(warnings)}")
if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)
print("Structural checks passed; editorial review and audio tests remain.")
