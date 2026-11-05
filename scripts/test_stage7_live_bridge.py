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
  page.wait_for_function("""() => {
    const frame=document.getElementById('ee-recovery-frame');
    return Boolean(frame && frame.contentWindow && (
      document.body.textContent.includes('متصل بخادم STAGING') ||
      document.body.textContent.includes('فشل الاتصال بخادم STAGING')
    ));
  }""",timeout=35000)
  text=page.locator("body").inner_text(timeout=5000)
  result["staging_ready_message"]= "متصل بخادم STAGING" in text
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
