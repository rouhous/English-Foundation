#!/usr/bin/env python3
"""Restore student landing appearance before install hint, retaining all other features."""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old=s
style=re.compile(r'<style id="mej-student-install-hint-style">[\s\S]*?</style>\s*')
note=re.compile(r'<div id="mej-student-install-hint" role="note">[\s\S]*?</div>\s*')
s,nstyle=style.subn("",s)
s,nnote=note.subn("",s)
if nstyle!=1 or nnote!=1:
 raise AssertionError(f"Expected one install hint and style; found {nstyle} style and {nnote} hint")
assert 'id="mej-owner-rights-notice"' in s
assert 'mej-student-install-hint' not in s
assert 'MEJ_INSTALL_VISIBLE_BETWEEN_START_RIGHTS_20261107' not in s
assert len(s)<len(old)
p.write_text(s,encoding="utf-8")
print("STUDENT_HOME_INSTALL_ADDITIONS_REMOVED",nstyle,nnote,len(old)-len(s))

# Apply verified restoration to the student page.
