#!/usr/bin/env python3
from pathlib import Path
import re, json
s=Path("index.html").read_text(encoding="utf-8")
patterns=[
 "function levels(", "function skills(", "function beginLevel(", "function beginStagePart(",
 "function route(", "function displayQuestion(", "function endSession(", "function finish",
 "function back(", "function skill", "function practice", "function exit",
 "class=\"levels\"", "class=\"level\"", ".levels", ".level{",
 "onclick=\"route(", "activeSession.kind", "function showSkill", "function skillMenu",
 "function getBack", "function close", "function goBack",
 "mej-skill-expansion-v1.js","function selectSkill(","function stopQuiz(","function learnLevel(","function choose(","route('levels')","route('skills')","function startSkill("
]
out={"length":len(s),"lines":s.count("\n")+1,"matches":{}}
for term in patterns:
 matches=list(re.finditer(re.escape(term),s))
 out["matches"][term] = [{"pos":m.start(),"line":s.count("\n",0,m.start())+1,"context":s[max(0,m.start()-350):min(len(s),m.start()+3800)]} for m in matches[:7]]
Path("diagnostics").mkdir(exist_ok=True)
Path("diagnostics/mej-ui-target-audit.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
print("Captured",len(s))
