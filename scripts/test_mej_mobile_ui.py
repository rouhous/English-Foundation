#!/usr/bin/env python3
from pathlib import Path
import re,subprocess,tempfile,json
html=Path("index.html").read_text(encoding="utf-8")
js=Path("assets/mej-skill-expansion-v1.js").read_text(encoding="utf-8")
css=Path("assets/mej-mobile-ui-v2.css").read_text(encoding="utf-8")
checks={
 "compact_grid": "#app > .levels" in css and "repeat(2,minmax(0,1fr))" in css,
 "head_stylesheet": 'mej-mobile-ui-v2.css?v=20261109' in html,
 "skill_origin": "mejQuizOrigin=type?'skills':'levels'" in html,
 "exit_origin": "function stopQuiz(){const target=activeSession?.origin" in html,
 "result_origin": "const returnTarget=s.origin==='skills'?'skills':'levels'" in html,
 "match_modal": "MEJ_COMPACT_ACTIVITY_MODAL_V2" in js,
 "no_disclaimer": "دون تغيير النجوم أو إتقان الأنشطة الأصلية حتى اعتماد التقييم" not in js,
 "match_close": "route('skills')" in js,
}
with tempfile.TemporaryDirectory() as tmp:
 for i,block in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',html,re.S|re.I)):
  if not block.strip():continue
  file=Path(tmp)/f"inline_{i}.js"
  file.write_text(block,encoding="utf-8")
  run=subprocess.run(["node","--check",str(file)],capture_output=True,text=True)
  if run.returncode:raise AssertionError(f"inline {i}: {run.stderr[:1000]}")
 run=subprocess.run(["node","--check","assets/mej-skill-expansion-v1.js"],capture_output=True,text=True)
 checks["modal_js_syntax"]=run.returncode==0
 if run.returncode:print(run.stderr)
result={"status":"PASS" if all(checks.values()) else "FAIL","checks":checks}
Path("diagnostics/mej-mobile-ui-qa.json").write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf-8")
assert all(checks.values()),result
print(json.dumps(result,indent=2,ensure_ascii=False))
