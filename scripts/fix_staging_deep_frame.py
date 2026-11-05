#!/usr/bin/env python3
"""Stage 7: follow Google's two-layer HTML Service iframe hierarchy.
Keep strict origin checks and session nonce; no wildcard or credential exposure.
"""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGING_BRIDGE_DEEP_FRAME_V2"
if marker not in s:
 anchor="let bridgeOrigin='';"
 insert="""// MEJ_STAGING_BRIDGE_DEEP_FRAME_V2
 // Google HTML Service may nest script.googleusercontent inside another
 // sandboxed iframe. All WindowProxy accesses are cross-origin-safe.
 function actualBridgeWindow(){
   let win=frame.contentWindow;
   for(let depth=0;depth<4;depth++){
     try{if(!win||win.frames.length===0)break;win=win.frames[0];}
     catch(_){break}
   }
   return win;
 }
 let bridgeOrigin='';"""
 if s.count(anchor)!=1:raise RuntimeError("Bridge nonce transport not present")
 s=s.replace(anchor,insert,1)
 anchor="const nested=frame.contentWindow&&frame.contentWindow.frames[0];"
 if s.count(anchor)!=2:raise RuntimeError("Expected two nested-frame references")
 s=s.replace(anchor,"const nested=actualBridgeWindow();")
assert s.count(marker)==1
assert s.count("const nested=actualBridgeWindow();")==2
with tempfile.TemporaryDirectory() as tmp:
 for i,js in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
  if not js.strip():continue
  f=Path(tmp)/f"script{i}.js";f.write_text(js,encoding="utf8")
  x=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if x.returncode:raise RuntimeError(x.stderr[:1000])
p.write_text(s,encoding="utf8")
print("BRIDGE_DEEP_FRAME_V2: strict authenticated postMessage now targets deepest HTML Service frame")
