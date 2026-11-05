#!/usr/bin/env python3
"""Repair existing STAGING recovery transport for Google's nested HTML-service iframe.
Staging only. No student accounts, question bank, school data, or live v2 scoring altered.
"""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_STAGING_NESTED_BRIDGE_NONCE_V1"
if marker not in s:
  frame_pattern=r'(<iframe\b[^>]*\bid="ee-recovery-frame"\b[^>]*?)\bsrc="(https://script\.google\.com/macros/s/[^"]+/exec\?studentRecovery=1)"'
  m=re.search(frame_pattern,s)
  if not m:raise RuntimeError("Expected STAGING recovery frame not found")
  s=s[:m.start()]+m.group(1)+'data-staging-url="'+m.group(2)+'" src="about:blank"'+s[m.end():]
  old="const frame=document.getElementById('ee-recovery-frame');\n const status=document.getElementById('ee-cloud-status');"
  new="""const frame=document.getElementById('ee-recovery-frame');
 const status=document.getElementById('ee-cloud-status');
 // MEJ_STAGING_NESTED_BRIDGE_NONCE_V1
 // HTML Service runs in a nested googleusercontent iframe, not the outer
 // script.google.com wrapper. Bind replies to this page with a random nonce.
 const bridgeNonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
 let bridgeOrigin='';
 const trustedBridgeOrigin=origin=>/^https:\\/\\/[a-z0-9-]+-script\\.googleusercontent\\.com$/.test(origin);
 frame.src=frame.dataset.stagingUrl+'&bridgeNonce='+bridgeNonce;"""
  if s.count(old)!=1:raise RuntimeError("Cannot identify bridge client startup")
  s=s.replace(old,new,1)
  old="""window.addEventListener('message',function(event){
  if(event.source!==frame.contentWindow)return;
  const d=event.data||{};
  if(d.eeRecoveryBridge!==true)return;
  if(d.ready){ready=true;setStatus('✅ متصل بخادم STAGING — للاختبارات فقط');show();return;}"""
  new="""window.addEventListener('message',function(event){
  const nested=frame.contentWindow&&frame.contentWindow.frames[0];
  if(!nested||event.source!==nested||!trustedBridgeOrigin(event.origin))return;
  const d=event.data||{};
  if(d.eeRecoveryBridge!==true||d.bridgeNonce!==bridgeNonce)return;
  if(d.ready){bridgeOrigin=event.origin;ready=true;setStatus('✅ متصل بخادم STAGING — للاختبارات فقط');show();return;}"""
  if s.count(old)!=1:raise RuntimeError("Cannot identify expected bridge listener")
  s=s.replace(old,new,1)
  old="frame.contentWindow.postMessage({eeRecoveryRequest:true,requestId,action,payload},'*');"
  new="""const nested=frame.contentWindow&&frame.contentWindow.frames[0];
  if(!nested||!bridgeOrigin){clearTimeout(timeout);delete pending[requestId];reject(Error('تعذر تأمين اتصال STAGING'));return;}
  nested.postMessage({eeRecoveryRequest:true,bridgeNonce,requestId,action,payload},bridgeOrigin);"""
  if s.count(old)!=1:raise RuntimeError("Cannot identify client RPC")
  s=s.replace(old,new,1)
assert s.count(marker)==1
assert 'studentRecovery=1" src=' not in s
assert "nested.postMessage({eeRecoveryRequest:true,bridgeNonce" in s
with tempfile.TemporaryDirectory() as tmp:
 for i,js in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S|re.I)):
  if not js.strip():continue
  path=Path(tmp)/f"inline{i}.js";path.write_text(js,encoding="utf8")
  a=subprocess.run(["node","--check",str(path)],capture_output=True,text=True)
  if a.returncode:raise RuntimeError(f"JS {i}: {a.stderr[:900]}")
p.write_text(s,encoding="utf8")
print("STAGING_NESTED_BRIDGE_FIXED: nonce-bound nested Google frame RPC; legacy learning unchanged")
