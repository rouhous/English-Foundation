#!/usr/bin/env python3
"""Compact level tiles and return skill-launched quizzes to the skill centre."""
from pathlib import Path
import re, subprocess, tempfile

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MEJ_COMPACT_SKILLS_NAV_V2"
style_link='<link rel="stylesheet" href="./assets/mej-mobile-ui-v2.css?v=20261109">'
if style_link not in s:
    assert "</head>" in s
    s=s.replace("</head>",style_link+"\n</head>",1)

def once(old,new,label):
    global s
    n=s.count(old)
    if n != 1:
        raise RuntimeError(f"{label}: expected one match, found {n}")
    s=s.replace(old,new,1)

if marker not in s:
    once("let current='home',activeSession=null,shownId=null,answerLock=false,speakTarget='';",
         "// "+marker+"\nlet mejQuizOrigin='levels';\nlet current='home',activeSession=null,shownId=null,answerLock=false,speakTarget='';",
         "origin state")
    once("function beginLevel(g,type=null,wrongOnly=false){if(!checkAccess(g))return;",
         "function beginLevel(g,type=null,wrongOnly=false){if(!checkAccess(g))return;mejQuizOrigin=type?'skills':'levels';",
         "skill launch")
    once("activeSession={kind:'practice',grade:g,ids,index:0,score:0,mistakes:[],responses:[]};",
         "activeSession={kind:'practice',grade:g,origin:mejQuizOrigin,skillType:type,ids,index:0,score:0,mistakes:[],responses:[]};",
         "typed session")
    once("function beginStagePart(g,part){if(!checkAccess(g))return;",
         "function beginStagePart(g,part){if(!checkAccess(g))return;mejQuizOrigin='levels';",
         "stage session source")
    once("function stopQuiz(){activeSession=null;route('levels')}",
         "function stopQuiz(){const target=activeSession?.origin||mejQuizOrigin||'levels';activeSession=null;route(target)}",
         "exit skill quiz")
    once("function displayQuestion(){if(!activeSession){route('levels');return}",
         "function displayQuestion(){if(!activeSession){route(mejQuizOrigin||'levels');return}",
         "missing session")
    once("function endSession(){let s=activeSession;if(!s)return;const p=active();const pc=pct(s.score,s.ids.length);",
         "function endSession(){let s=activeSession;if(!s)return;const returnTarget=s.origin==='skills'?'skills':'levels';const p=active();const pc=pct(s.score,s.ids.length);",
         "results page origin")
    # Only replace the results CTA, not the global levels navigation link.
    old='onclick="route(' + chr(39) + 'levels' + chr(39) + ')">خريطة المستويات'
    new='onclick="route(' + chr(39) + chr(36) + '{returnTarget}' + chr(39) + ')">' + chr(36) + "{returnTarget==='skills'?'مركز المهارات':'خريطة المستويات'}"
    once(old,new,"results back CTA")
    # Remove inaccurate and distracting star notice from the Match activity menu.
    once('<p>من بنك المفردات وصور التعلم المعتمدة حسب الصف. نشاط مراجعة لا يغيّر النجوم.</p>',
         '',"match menu explanation")
    # Keep a new round inside the originally selected skill.
    old='onclick="beginLevel(' + chr(36) + '{s.grade})">جولة جديدة'
    new='onclick="beginLevel(' + chr(36) + '{s.grade},' + chr(36) + "{s.skillType?jsStr(s.skillType):'null'}" + ')">جولة جديدة'
    once(old,new,"results new round skill")

assert s.count(marker)==1
assert s.count(style_link)==1
assert "function stopQuiz(){const target=activeSession?.origin" in s
assert "mejQuizOrigin=type?'skills':'levels'" in s
# Check all inline JS, including the merged older 3MB script.
blocks=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)
with tempfile.TemporaryDirectory() as tmp:
    for i,block in enumerate(blocks):
        if not block.strip():
            continue
        js=Path(tmp)/f"block-{i}.js"
        js.write_text(block,encoding="utf-8")
        result=subprocess.run(["node","--check",str(js)],capture_output=True,text=True)
        if result.returncode:
            raise RuntimeError(f"JS script {i}: {result.stderr[:1100]}")
p.write_text(s,encoding="utf-8")
print("MEJ UI routes and compact levels updated. Student progress untouched.")
