#!/usr/bin/env python3
"""Live-browser-style isolated review QA. Never opens a real student account."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import threading
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(Path(".").resolve())))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  context=browser.new_context(viewport={"width":390,"height":844},service_workers="block")
  page=context.new_page()
  page.goto(f"http://127.0.0.1:{server.server_port}/reviews/admin-levels.html",wait_until="domcontentloaded",timeout=30000)
  page.wait_for_function("document.getElementById('summary').textContent.includes('2,600')",timeout=20000)
  assert page.locator("#cards article").count()==12
  page.select_option("#grade","12")
  page.select_option("#part","2")
  page.wait_for_function("document.getElementById('cards').children.length>0",timeout=10000)
  assert page.locator("#cards article").count()>0
  page.locator("#cards article button").first.click()
  assert page.locator("#cards article .answer:not(.hidden)").count()==1
  page.select_option("#grade","0")
  page.select_option("#part","1")
  assert page.locator("#cards article").count()>0
  # Do not trigger any external student or reporting endpoint.
  assert page.locator("#ee-recovery-frame").count()==0
  assert page.locator("input[type=password]").count()==0
  print("REVIEWER_UI_PASSED: 2600 questions, Grade 12 part 2, foundation, answer toggle; no student state")
  browser.close()
finally:
 server.shutdown()
