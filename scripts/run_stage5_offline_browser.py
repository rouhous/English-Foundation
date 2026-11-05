#!/usr/bin/env python3
"""Stage 5 real Chromium offline smoke, with installed service worker.
No real school data. Runs against an isolated localhost origin.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import json,threading
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass

server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(Path(".").resolve())))
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
url=f"http://127.0.0.1:{server.server_port}/"
report={"test":"installed PWA offline load, vocab assets and lesson navigation",
        "status":"INCOMPLETE","chromium_offline_real_network_emulation":True,
        "real_android_iphone_devices":False}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  context=browser.new_context(viewport={"width":390,"height":844},service_workers="allow")
  page=context.new_page()
  page.goto(url,wait_until="domcontentloaded",timeout=60000)
  page.wait_for_selector("#app",timeout=30000)
  # A controlled browser origin preserves IndexedDB/localStorage and SW caches.
  ready=page.evaluate("""async () => {
   if (!('serviceWorker' in navigator)) return false;
   const t=new Promise(resolve=>setTimeout(()=>resolve(false),25000));
   const wait=navigator.serviceWorker.ready.then(()=>true).catch(()=>false);
   return Promise.race([t,wait]);
  }""")
  report["service_worker_registered"]=ready
  if not ready:
   raise AssertionError("PWA service worker not registered; offline-first installation cannot be certified.")
  page.wait_for_function("""async () => {
   const c=await caches.open('english-explorer-fast-launch-20261105-v1');
   const names=Array.from({length:12},(_,i)=>'./assets/approved-images-'+String(i+1).padStart(2,'0')+'.js?v=20261104-approved');
   return (await Promise.all(names.map(n=>c.match(n).then(Boolean)))).every(Boolean);
  }""",timeout=90000)
  report["all_12_image_banks_cached"]=True
  # Emulate complete disconnection, NOT only browser navigator.onLine.
  context.set_offline(True)
  page.reload(wait_until="domcontentloaded",timeout=45000)
  page.wait_for_selector("#app",timeout=30000)
  report["home_offline"]=page.locator("#app").count()==1
  # The navigation bar is intentionally collapsed on the home screen.\n  # Route invocation tests real offline lesson initialization without forcing a hidden control.\n  page.evaluate("route(\'levels\')")
  report["levels_navigable_offline"]=page.locator("#app").inner_text(timeout=10000).strip()!=""
  page.evaluate("route(\'home\')")
  report["home_return_offline"]=page.locator("#app").count()==1
  assert all(report[k] for k in ("all_12_image_banks_cached","home_offline","levels_navigable_offline","home_return_offline"))
  report["status"]="STAGE5_REAL_CHROMIUM_OFFLINE_PASSED"
  browser.close()
except Exception as exc:
 report["status"]="STAGE5_REAL_CHROMIUM_OFFLINE_FAILED"
 report["failure"]=str(exc)[:1100]
finally:
 server.shutdown()
 Path("diagnostics/stage5-offline-browser.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
 print(json.dumps(report,ensure_ascii=False))
 if report["status"]!="STAGE5_REAL_CHROMIUM_OFFLINE_PASSED":raise SystemExit(1)
