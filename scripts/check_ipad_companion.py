#!/usr/bin/env python3
from pathlib import Path
import subprocess
s=Path("assets/mej-companion-3d-v1.js").read_text(encoding="utf8")
sw=Path("sw.js").read_text(encoding="utf8")
checks={
 "declared_previous_page":'previousPage="",lastWander=0' in s,
 "ipad_detection":'navigator.maxTouchPoints>1' in s and '/iPad/i.test(navigator.userAgent)' in s,
 "safe_mode_init":'if(safeMode)return false;' in s,
 "safe_mode_boot":'if(safeMode){window.MEJCompanion3D=' in s,
 "webgl_fallback_remains":'getContext("webgl"' in s,
 "service_worker_bumped":'ipad-freeze-hotfix-v1' in sw,
 "progress_unmodified":'p.stars' not in s and 'persist(' not in s,
}
r=subprocess.run(["node","--check","assets/mej-companion-3d-v1.js"],capture_output=True,text=True)
checks["javascript_syntax"]=r.returncode==0
if not checks["javascript_syntax"]:print(r.stderr)
print(checks)
assert all(checks.values())
