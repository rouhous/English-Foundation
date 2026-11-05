#!/usr/bin/env python3
"""Export a curriculum-only QA catalog from the actual running learner app.

A clean isolated Chromium profile is used; no school accounts, tokens, teacher
codes or persistent student state are read. The output is read-only curriculum
data (which already resides in the public client); it must never be mistaken
for an authenticated admin dashboard.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json, threading
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self, *args): pass

server=ThreadingHTTPServer(("127.0.0.1",0),
    partial(Quiet,directory=str(Path(".").resolve())))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  context=browser.new_context(service_workers="block")
  page=context.new_page()
  page.goto(f"http://127.0.0.1:{server.server_port}/index.html",wait_until="domcontentloaded",timeout=60000)
  page.wait_for_function("typeof byGrade!=='undefined' && typeof LV!=='undefined' && typeof mejStageQuestions==='function'", timeout=30000)
  catalog=page.evaluate("""() => {
    const clean = x => x == null ? '' : String(x).slice(0,600);
    const stages=Array.from({length:13},(_,g)=>{
      const title=LV[g] || ['المستوى '+g, ''];
      const parts=[1,2].map(part=>{
        const q=mejStageQuestions(g,part).map(x=>({
          id:clean(x.id),
          type:clean(x.type),
          mode:clean(x.mode),
          word:clean(x.word),
          prompt:clean(x.prompt),
          options:Array.isArray(x.options)?x.options.slice(0,12).map(clean):[],
          answer:clean(x.answer),
          pictureWord:clean(x.pic||x.word||'')
        }));
        return {part, questionCount:q.length, questions:q};
      });
      return {grade:g,title:clean(title[0]),description:clean(title[1]),parts};
    });
    return {schema:'mej-admin-curriculum-review-v1',
      reviewerAccess:'PUBLIC_CURRICULUM_ONLY_NOT_AUTHENTICATED_ADMIN',
      generatedFrom:'index.html (same-commit browser execution)',
      levels:stages};
  }""")
  browser.close()
 assert len(catalog["levels"])==13
 for i,item in enumerate(catalog["levels"]):
  assert item["grade"]==i
  assert len(item["parts"])==2
  for part in item["parts"]:
   assert part["questionCount"]==len(part["questions"])
   assert len(part["questions"])>0, f"Missing questions at grade {i} part {part['part']}"
   for q in part["questions"]:
    assert q["id"].startswith("L"), q["id"]
 total=sum(p["questionCount"] for lev in catalog["levels"] for p in lev["parts"])
 assert total==2600, f"Expected 2600 questions, found {total}"
 ids=[q["id"] for l in catalog["levels"] for p in l["parts"] for q in p["questions"]]
 assert len(set(ids))==2600
 dest=Path("reviews/admin-levels-catalog.json")
 dest.parent.mkdir(parents=True,exist_ok=True)
 dest.write_text(json.dumps(catalog,ensure_ascii=False,separators=(",",":")),encoding="utf8")
 print("CURRICULUM_QA_CATALOG_EXPORTED: 13 stages × 2 parts, 2600 real questions. No learner data.")
finally:
 server.shutdown()
