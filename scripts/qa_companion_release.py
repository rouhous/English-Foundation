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
assert "inDiagnostic()||!enabled()" in runtime
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
