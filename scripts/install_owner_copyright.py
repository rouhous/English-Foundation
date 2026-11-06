#!/usr/bin/env python3
"""Install project copyright notice and explicit owner review disclosure."""
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MEJ_OWNER_COPYRIGHT_NOTICE_2026"
if marker in s:
 print("Copyright notice already installed")
 raise SystemExit(0)
if "</body>" not in s:
 raise RuntimeError("Main app body tag missing")
snippet="""<style id="mej-copyright-notice-style">
#mej-owner-rights-notice{position:relative;z-index:1;text-align:center;padding:8px 14px;font:500 11px/1.7 system-ui,sans-serif;color:#42685d;direction:rtl;max-width:100%;background:rgba(255,255,255,.65)}
</style>
<div id="mej-owner-rights-notice" data-version="MEJ_OWNER_COPYRIGHT_NOTICE_2026" aria-label="حقوق الملكية">
© 2026 Houssem Lotfi Rouatbi — جميع الحقوق محفوظة. يمنع نسخ التطبيق أو تعديله أو إعادة نشره دون إذن كتابي، مع احترام حقوق المواد الخارجية.
</div>
"""
s=s.replace("</body>",snippet+"</body>",1)
assert s.count(marker)==1
p.write_text(s,encoding="utf-8")
print("Main app copyright notice installed without changing learner data.")
