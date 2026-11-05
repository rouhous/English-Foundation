#!/usr/bin/env python3
"""Stage 6 isolated end-to-end browser: exercise practice, star persistence,
diagnostic count and locked sublevels while fully offline.
No real accounts, teacher codes, Cloud Apps Script or personal data.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright
import json,threading

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass

server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(Path(".").resolve())))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"status":"INCOMPLETE","test":"Offline learner diagnostic and local scoring",
 "uses_synthetic_student_only":True,"real_school_cloud_access":False}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  context=browser.new_context(viewport={"width":390,"height":844},service_workers="allow")
  page=context.new_page()
  page.goto(f"http://127.0.0.1:{server.server_port}/",wait_until="domcontentloaded",timeout=60000)
  page.wait_for_function("typeof active==='function' && typeof gradeAnswer==='function' && typeof route==='function'",timeout=30000)
  page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller",timeout=45000)
  # No real name, school ID or teacher code. The service worker must have
  # cached all bundles before the browser is deliberately disconnected.
  page.wait_for_function("""async () => {
   const c=await caches.open('english-explorer-fast-launch-20261105-v1');
   return (await Promise.all(Array.from({length:12},(_,i)=>
      c.match('./assets/approved-images-'+String(i+1).padStart(2,'0')+'.js?v=20261104-approved').then(Boolean)))).every(Boolean);
  }""",timeout=90000)
  context.set_offline(True)
  page.reload(wait_until="domcontentloaded",timeout=45000)
  outcome=page.evaluate("""() => {
   const p=active();
   p.name='TEST STAGE6 STUDENT';
   p.grade='9';
   p.school='TEST_ONLY';
   p.className='TEST_9A';
   p.teacherCode='';
   p.diagnosed=false;
   p.assigned=0;
   p.correct={};p.wrong={};p.stars=0;p.attempts=0;p.right=0;
   p.activity=[];p.completed={};
   if(!persist(false))throw Error('LOCAL_SAVE_FAILED');
   route('diagnostic');startDiagnostic();
   if(!activeSession||activeSession.kind!=='diagnostic'||activeSession.ids.length!==24)
    throw Error('DIAGNOSTIC_24_QUESTIONS_MISSING');
   const lockedBefore=mejPartUnlocked(0,2);
   if(lockedBefore)throw Error('SECOND_SUBLEVEL_ALREADY_UNLOCKED');
   // End diagnostic without modifying local mastery.
   activeSession=null;
   const question=mejStageQuestions(0,1)[0];
   if(!question)throw Error('NO_STAGE0_QUESTIONS');
   const runAnswer=()=>{
     activeSession={kind:'practice',grade:0,stagePart:1,ids:[question.id],
       index:0,score:0,mistakes:[],responses:[]};
     displayQuestion();
     gradeAnswer(question.answer,null);
     const answered=activeSession.responses[0];
     if(!answered||!answered.ok)throw Error('PRACTICE_ANSWER_FAILED');
   };
   runAnswer();
   if(p.correct[question.id]!==1||p.stars!==0)throw Error('EARLY_STAR_AWARDED');
   runAnswer();
   if(p.correct[question.id]!==2||p.stars!==1)throw Error('SECOND_CORRECT_NO_STAR');
   runAnswer();
   if(p.correct[question.id]!==2||p.stars!==1)throw Error('DUPLICATED_STAR');
   if(mejPartUnlocked(0,2))throw Error('SECOND_SUBLEVEL_BYPASS');
   if(!persist(false))throw Error('FINAL_LOCAL_SAVE_FAILED');
   return {diagnosticQuestions:24,questionId:question.id,
     stars:p.stars,mastered:p.correct[question.id],attempts:p.attempts,
     stage2Locked:!mejPartUnlocked(0,2)};
  }""")
  report.update(outcome)
  page.reload(wait_until="domcontentloaded",timeout=45000)
  restored=page.evaluate("""() => {
    const p=active();
    return {name:p.name,stars:p.stars,questionCount:Object.values(p.correct||{}).filter(v=>v>=2).length,
      attempts:p.attempts,stage2Locked:!mejPartUnlocked(0,2)};
  }""")
  report["restored_after_offline_reload"]=restored
  assert restored["stars"]==1 and restored["questionCount"]==1 and restored["attempts"]==3
  assert restored["stage2Locked"] and restored["name"]=="TEST STAGE6 STUDENT"
  report["status"]="STAGE6_OFFLINE_LEARNER_ACCEPTANCE_PASSED"
  browser.close()
except Exception as error:
 report["status"]="STAGE6_OFFLINE_LEARNER_ACCEPTANCE_FAILED"
 report["failure"]=str(error)[:1800]
finally:
 server.shutdown()
 path=Path("diagnostics/stage6-learner-browser.json")
 path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
 print(json.dumps(report,ensure_ascii=False))
 if report["status"]!="STAGE6_OFFLINE_LEARNER_ACCEPTANCE_PASSED":raise SystemExit(1)
