#!/usr/bin/env python3
"""Read-only live staging bridge smoke test. No student data or secrets.
Do not attempt registration, recovery challenge, or cloud write.
"""
import json
from urllib.parse import urlparse
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
  # Observe bridge message presence without copying secrets or payloads.
  page.add_init_script("""() => {
    window.__mejBridgeObservations=[];
    window.addEventListener('message',e=>{
      if(e.data&&e.data.eeRecoveryBridge){
        const f=document.getElementById('ee-recovery-frame');
        const inner=f&&f.contentWindow&&f.contentWindow.frames[0];
        window.__mejBridgeObservations.push({
          fromGoogle:/googleusercontent\\.com$/.test(new URL(e.origin).hostname),
          nestedSource:e.source===inner,
          hasNonce:typeof e.data.bridgeNonce==='string'&&e.data.bridgeNonce.length===32,
          ready:e.data.ready===true
        });
      }
    });
  }""")

  console_errors=[]
  request_failures=[]
  bridge_http=[]
  page.on("requestfailed",lambda req:request_failures.append({"host":urlparse(req.url).hostname,"kind":req.resource_type}))
  page.on("response",lambda resp:bridge_http.append({"host":urlparse(resp.url).hostname,"status":resp.status}) if "script.google" in resp.url else None)
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
  result["nonce_in_frame_url"]="bridgeNonce=" in (frame.get_attribute("src") or "")
  result["observed_bridge_messages"]=page.evaluate("window.__mejBridgeObservations||[]")[:5]
  result["google_inner_bridge_loaded"]=[]
  for inner in page.frames[1:]:
   if "googleusercontent.com" in inner.url:
    try:
     result["google_inner_bridge_loaded"].append(inner.evaluate("""() => ({
       title:document.title,
       nonceBasedScript:document.documentElement.innerHTML.includes('bridgeNonce'),
       isNested:window.parent!==window.top
     })"""))
    except Exception: pass
  result["staging_ready_message"]="متصل بخادم STAGING" in status_text
  result["script_errors"]=console_errors[:6]
  result["request_failures"]=request_failures[:8]
  result["google_responses"]=bridge_http[:12]
  result["iframe_hosts"]=[urlparse(f.url).hostname for f in page.frames][1:8]
  result["iframe_titles"]=[f.title()[:65] for f in page.frames[1:5] if f.url.startswith("https://") and f.url != "about:blank"]
  result["inner_frame_access"]=page.evaluate("""() => {
    const outer=document.getElementById('ee-recovery-frame').contentWindow;
    const attempt=(fn)=>{try{return fn()}catch(e){return e.name}};
    return {
      childFrames:attempt(()=>outer.length),
      innerFrameExists:attempt(()=>Boolean(outer.frames[0])),
      innerFramePostMessageCallable:attempt(()=>typeof outer.frames[0].postMessage === 'function')
    };
  }""")
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
