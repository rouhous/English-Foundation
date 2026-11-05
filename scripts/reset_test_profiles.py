#!/usr/bin/env python3
"""One-time, idempotent reset of old My English Journey TEST accounts on each browser.
Runs before profile migration/loading; never touches students in other apps.
The school has explicitly authorized retiring all legacy learner/teacher test accounts.
"""
from pathlib import Path
import re,subprocess,tempfile
p=Path("index.html")
html=p.read_text(encoding="utf8")
marker="MEJ_TEST_ACCOUNT_RESET_20261105_V1"
reset=String.raw if False else None
if marker not in html:
 old="const DBKEY='WADI_ENGLISH_EXPLORER_PROFILES_V1';"
 new="""const DBKEY='WADI_ENGLISH_EXPLORER_PROFILES_V1';
// MEJ_TEST_ACCOUNT_RESET_20261105_V1
// Clean ONLY legacy trial profiles and staging recovery credentials, ONCE per
// device. This precedes reading DBKEY and precedes the obsolete-data migrator.
try{
 const migrationKey='MEJ_TEST_ACCOUNT_RESET_20261105_V1_DONE';
 if(localStorage.getItem(migrationKey)!=='1'){
  const retiring=['WADI_ENGLISH_EXPLORER_PROFILES_V1','EBO_OMAN_V4','EE_V38_RECOVERY_SESSIONS'];
  for(const key of retiring)localStorage.removeItem(key);
  localStorage.setItem(migrationKey,'1');
 }
}catch(err){console.warn('Trial account reset deferred; local browser storage unavailable')}
"""
 if html.count(old)!=1:raise RuntimeError("Cannot locate the one intended DBKEY declaration")
 html=html.replace(old,new,1)
assert html.count(marker)==2,html.count(marker)
assert html.index(marker)<html.index("let db={profiles:")
assert "localStorage.removeItem('EBO_OMAN_V4')" not in html # only list-based cleanup
# Explicitly do not erase unconnected notebooks or any other application's storage.
blocks=re.findall(r'<script[^>]*>(.*?)</script>',html,re.S|re.I)
with tempfile.TemporaryDirectory() as d:
 for i,block in enumerate(blocks):
  if not block.strip():continue
  f=Path(d)/f"inline{i}.js";f.write_text(block,encoding="utf8")
  x=subprocess.run(["node","--check",str(f)],capture_output=True,text=True)
  if x.returncode:raise RuntimeError("Invalid app JS: "+x.stderr[:1200])
p.write_text(html,encoding="utf8")
print("MEJ_TEST_RESET_READY: old trial browser profiles, older migration, and staging recovery tokens are retired once per device")
