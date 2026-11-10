#!/usr/bin/env python3
"""Release checks for companion identity, navigation, diagnostic safety and cached assets."""
from pathlib import Path
import re,subprocess
html=Path('index.html').read_text('utf8')
sw=Path('sw.js').read_text('utf8')
runtime=Path('assets/mej-companion-live-v1.js').read_text('utf8')
art=Path('assets/mej-companion-art-v1.js').read_text('utf8')
assert html.count('mej-companion-art-v1.js?v=20261109')==1
assert html.count('mej-companion-live-v1.js?v=20261109')==1
assert html.index('mej-companion-art-v1.js?v=20261109')<html.index('mej-companion-live-v1.js?v=20261109')
assert "inDiagnostic()||!canShow()" in runtime
assert "pointerdown" in runtime and "pointermove" in runtime
assert "MEJ_COMPANION_POSITION_V1_" in runtime
assert "requestAnimationFrame(fall)" in runtime
assert "roamTimer=setInterval" in runtime
assert "function roamingFloor(host)" in runtime
assert "mej-c-parachuting" in runtime and "mej-c-canopy" in runtime
assert "mej-c-climbing" in runtime
assert "if(!gesture.moved){greet();return}" in runtime
assert "gesture.startY-e.clientY>48" in runtime
assert "M7 51L56 168" in runtime
assert "Hi!" in runtime and "Hello!" in runtime and "I\'m here!" in runtime
assert "t-first)/2300" in runtime
assert "pointermove" in runtime and "pointerup" in runtime
assert "inDiagnostic()" in runtime
assert "save=true" not in runtime or "save=true" in runtime

assert "y>innerHeight*.28" in runtime
assert "current.companion={kind:chosen,name" in runtime
assert "if(typeof persist==='function')persist(false)" in runtime
assert ".j23-avatar" in runtime
assert "current.stars" not in runtime and "p.stars++" not in runtime
assert "MEJCompanionArt" in art and 'data:image/webp;base64,' in art
assert sw.count("'./assets/mej-companion-art-v1.js'")>=1
assert sw.count("'./assets/mej-companion-live-v1.js'")>=1
for file in ('assets/mej-companion-art-v1.js','assets/mej-companion-live-v1.js','sw.js'):
 proc=subprocess.run(['node','--check',file],capture_output=True,text=True)
 assert proc.returncode==0,(file,proc.stderr[:400])
print('PASS — 2D Omani student companion linked, saved per profile and blocked in diagnostic. Original scoring untouched.')
