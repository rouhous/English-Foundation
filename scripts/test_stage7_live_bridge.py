#!/usr/bin/env python3
"""Read-only live staging bridge smoke test. No student data or secrets.
Do not attempt registration, recovery challenge, or cloud write.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

url="https://rouhous.github.io/English-Foundation/"
result={"test":"Read-only Google Apps Script STAGING recovery bridge handshake",
        "source_url":"GitHub Pages live application",
        "uses_credentials":False,"writes_student_data":False,
        "status":"INCOMPLETE"}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  page=browser.new_page(viewport={"width":390,"height":844})
  console_errors=[]
  page.on("pageerror",lambda error:console_errors.append(str(error)[:250]))
  page.goto(url,wait_until="domcontentloaded",timeout=60000)
  result["app_loaded"]=page.locator("#app").count()==1
  frame=page.locator("#ee-recovery-frame")
  result["bridge_frame_found"]=frame.count()==1
  if not result["bridge_frame_found"]:raise RuntimeError("BRIDGE_IFRAME_MISSING")
  result["bridge_origin_is_google"]=frame.get_attribute("src").startswith("https://script.google.com/")
  if not result["bridge_origin_is_google"]:raise RuntimeError("UNEXPECTED_BRIDGE_ORIGIN")
  # The existing browser receives a ready postMessage when the STAGING page
  # successfully executes its embedded google.script.run bridge.
  try:
   page.wait_for_function("""() => {
     const status=document.getElementById('ee-cloud-status');
     return Boolean(status && /متصل بخادم STAGING|فشل الاتصال|خطأ|غير متصل/.test(status.textContent));
   }""",timeout=35000)
  except Exception: pass
  status=page.locator("#ee-cloud-status")
  # Only inspect the status UI; never expose student tokens or cloud rows.
  result["status_element_found"]=status.count()==1
  status_text=(status.text_content(timeout=5000) or "") if status.count() else ""
  result["status_text"]=status_text[:170]
  result["staging_ready_message"]="متصل بخادم STAGING" in status_text
  result["script_errors"]=console_errors[:6]
  result["status"]="STAGE7_LIVE_BRIDGE_HANDSHAKE_PASSED" if result["staging_ready_message"] else "STAGE7_LIVE_BRIDGE_HANDSHAKE_FAILED"
  browser.close()
except Exception as error:
 result["status"]="STAGE7_LIVE_BRIDGE_HANDSHAKE_FAILED"
 result["error"]=str(error).split("Call log:")[0][:500]
finally:
 path=Path("diagnostics/stage7-live-bridge-check.json")
 path.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf8")
 print(json.dumps(result,ensure_ascii=False))
 if result["status"]!="STAGE7_LIVE_BRIDGE_HANDSHAKE_PASSED":raise SystemExit(1)
