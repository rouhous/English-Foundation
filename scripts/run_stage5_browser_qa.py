#!/usr/bin/env python3
"""Stage 5 headless Chromium viewport smoke with no external service or student data."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json,re,shutil,subprocess,threading,html,sys
from functools import partial
chrome=next((shutil.which(name) for name in ("google-chrome","chromium","chromium-browser") if shutil.which(name)),None)
if not chrome:
    print("STAGE5_BROWSER_NOT_AVAILABLE: Static checks passed, but real browser verification not run")
    raise SystemExit(0)
server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory=str(Path('.').resolve())))
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
url=f"http://127.0.0.1:{server.server_port}/scripts/stage5-viewport-harness.html"
try:
    cmd=[chrome,"--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
         "--disable-background-networking","--disable-features=Translate",
         "--virtual-time-budget=45000","--dump-dom",url]
    result=subprocess.run(cmd,capture_output=True,text=True,timeout=110)
    match=re.search(r"STAGE5_RESULT:(\[.*?\])</pre>",result.stdout,re.S)
    if not match:raise RuntimeError("Missing viewport report. Browser stderr: "+result.stderr[-1500:])
    records=json.loads(html.unescape(match.group(1)))
    failures=[]
    for item in records:
        if item.get("error"):failures.append(item)
        if not item.get("hasApp") or item.get("appChildCount",0)==0:failures.append({"missing_app":item})
        if not item.get("responsiveCSS"):failures.append({"missing_stage5_css":item})
        if item.get("navCount",0)<6:failures.append({"navigation_incomplete":item})
        if item.get("overflow",100)>12:failures.append({"horizontal_overflow":item})
    report={"status":"STAGE5_BROWSER_CHECKS_PASSED" if not failures else "STAGE5_BROWSER_CHECKS_FAILED",
      "engine":"headless Chrome/Chromium","viewports":records,"failures":failures,
      "notes":"Desktop-engine emulation of width/height; not an actual Android or iPhone device test."}
    Path("diagnostics/stage5-browser-qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
    print(json.dumps(report,ensure_ascii=False))
    if failures:raise SystemExit(1)
finally:
    server.shutdown()
