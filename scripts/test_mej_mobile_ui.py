#!/usr/bin/env python3
from pathlib import Path
import json, re, subprocess, tempfile, sys, time
from urllib.request import urlopen
html=Path("index.html").read_text(encoding="utf-8")
js=Path("assets/mej-skill-expansion-v1.js").read_text(encoding="utf-8")
css=Path("assets/mej-mobile-ui-v2.css").read_text(encoding="utf-8")
checks={
 "compact_grid": "#app > .levels" in css and "repeat(2,minmax(0,1fr))" in css,
 "head_stylesheet": 'mej-mobile-ui-v2.css?v=20261109' in html,
 "skill_origin": "mejQuizOrigin=type?'skills':'levels'" in html,
 "exit_origin": "const target=activeSession?.origin||mejQuizOrigin||'levels';activeSession=null;route(target)" in html,
 "result_origin": "const returnTarget=s.origin==='journey'?'journey':s.origin==='skills'?'skills':'levels'" in html,
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
run=subprocess.run(["node","scripts/test_five_skill_stage_bars.cjs"],capture_output=True,text=True)
checks["five_skill_bank_and_floor_tests"]=run.returncode==0
if run.returncode:print(run.stdout,run.stderr)
else:print(run.stdout)
# Render the real journey header at a phone viewport and retain its screenshot for review.
def mobile_capture():
 try:
  from playwright.sync_api import sync_playwright
 except ImportError:
  subprocess.run([sys.executable,"-m","pip","install","playwright"],check=True)
  subprocess.run([sys.executable,"-m","playwright","install","--with-deps","chromium"],check=True)
  import site
  sys.path.append(site.getusersitepackages())
  from playwright.sync_api import sync_playwright
 bank_start=html.index("const BANK=")+len("const BANK=")
 bank_end=html.index("];",bank_start)+1
 bank=json.loads(html[bank_start:bank_end])
 mapping={"Listening":"listening","Phonics":"listening","Blend":"listening","Reading":"reading","Spelling":"writing","Writing":"writing","Vocabulary":"vocabulary","Match":"vocabulary","Grammar":"grammar","Order":"grammar","Writing Builder":"grammar","WritingBuilder":"grammar"}
 correct={}
 chosen=set()
 for q in bank:
  if q.get("g")!=1:continue
  skill=mapping.get(q.get("type"))
  if skill and skill not in chosen:
   correct[q["id"]]=2
   chosen.add(skill)
 profile={"id":"qa-five-skill-bars","name":"طالب تجريبي","grade":"1","school":"مدرسة تجريبية","className":"1/1",
  "correct":correct,"wrong":{},"stars":0,"attempts":0,"right":0,"diagnosed":True,"assigned":1,
  "diagnosticScore":None,"completed":{},"activity":[],"writing":{},"speaking":{},"journeyIsland":1}
 db={"profiles":{profile["id"]:profile},"active":profile["id"],"version":1}
 server=subprocess.Popen([sys.executable,"-m","http.server","8765","--bind","127.0.0.1"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  for _ in range(40):
   try:
    urlopen("http://127.0.0.1:8765/index.html",timeout=1).close()
    break
   except Exception:time.sleep(.25)
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
   page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
   db_json=json.dumps(db,ensure_ascii=False,separators=(",",":"))
   page.add_init_script("localStorage.setItem('MEJ_TEST_ACCOUNT_RESET_20261105_V1_DONE','1');localStorage.setItem('WADI_ENGLISH_EXPLORER_PROFILES_V1',"+json.dumps(db_json)+");")
   page.goto("http://127.0.0.1:8765/index.html",wait_until="domcontentloaded",timeout=60000)
   page.evaluate("route('journey')")
   page.locator(".mej-skill-progress").wait_for(timeout=30000)
   rtl=page.evaluate("document.documentElement.dir==='rtl'")
   columns=page.locator(".mej-skill-grid").evaluate("(el)=>getComputedStyle(el).gridTemplateColumns.trim().split(/\\s+/).length")
   Path("diagnostics").mkdir(exist_ok=True)
   page.screenshot(path="diagnostics/mej-five-skill-bars-mobile.png",full_page=False)
   browser.close()
   return rtl,columns,Path("diagnostics/mej-five-skill-bars-mobile.png").stat().st_size
 finally:
  server.terminate()
  server.wait(timeout=10)
try:
 rtl,columns,size=mobile_capture()
 checks["mobile_rtl"]=rtl
 checks["mobile_two_column_grid"]=columns==2
 checks["mobile_screenshot"]=size>10000
 if Path(".git").exists():subprocess.run(["git","add","diagnostics/mej-five-skill-bars-mobile.png"],check=True)
except Exception as exc:
 checks["mobile_rtl"]=False
 checks["mobile_two_column_grid"]=False
 checks["mobile_screenshot"]=False
 print("Mobile screenshot failed:",repr(exc))
result={"status":"PASS" if all(checks.values()) else "FAIL","checks":checks}
Path("diagnostics/mej-mobile-ui-qa.json").write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf-8")
assert all(checks.values()),result
print(json.dumps(result,indent=2,ensure_ascii=False))
