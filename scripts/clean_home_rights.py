#!/usr/bin/env python3
"""Apply approved home-screen cleanup on all responsive home templates.

Only presentation elements change; identity and school metadata in saved student
records and learning reports remain untouched.
"""
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
mark="MEJ_HOME_RIGHTS_SIMPLIFIED_20261106"
if mark in s:
 print("Already installed");raise SystemExit(0)

def replace_exact(old,new,label,expected=1):
 global s
 n=s.count(old)
 if n!=expected:raise RuntimeError(f"{label}: expected {expected}, found {n}")
 s=s.replace(old,new)
 print("CLEANED",label,n)

# All three home variants: leave department badge unchanged; remove school
# and creator attribution only from prominent public-facing banners.
replace_exact('<div class="m31-school"><b>Wadi Al Hawasna School | مدرسة وادي الحواسنة</b><b>Designed by Teacher Houssem Rouatbi</b></div>','','modern-home-banner')
replace_exact('<div class="actual-school"><strong>مدرسة وادي الحواسنة | Wadi Al Hawasna School</strong><strong>Designed by Teacher Houssem Rouatbi</strong></div>','','alternate-home-banner')
replace_exact('<div class="school"><b>قسم اللغة الإنجليزية | The English Department</b><span>مدرسة وادي الحواسنة | Wadi Al Hawasna School</span></div>','<div class="school"><b>قسم اللغة الإنجليزية | The English Department</b></div>','legacy-header-banner')

# Remove outdated footer credit. Keep exactly one accessible rights notice.
replace_exact('<footer class="footer">My English Journey · Designed by Teacher Houssem Rouatbi</footer>','','legacy-credit-footer')
old='© 2026 Houssem Lotfi Rouatbi — جميع الحقوق محفوظة. يمنع نسخ التطبيق أو تعديله أو إعادة نشره دون إذن كتابي، مع احترام حقوق المواد الخارجية.'
new='''<span class="mej-rights-statement">© 2026 — جميع الحقوق محفوظة، يمنع النسخ أو التعديل</span>
<span class="mej-rights-owner"><b>حسام لطفي الرواتبي</b> <span aria-hidden="true">|</span> <b dir="ltr" lang="en">Houssem Lotfi Rouatbi</b></span>'''
replace_exact(old,new,'one-bilingual-rights-notice')
old_css='#mej-owner-rights-notice{position:relative;z-index:1;text-align:center;padding:8px 14px;font:500 11px/1.7 system-ui,sans-serif;color:#42685d;direction:rtl;max-width:100%;background:rgba(255,255,255,.65)}'
new_css='''/* MEJ_HOME_RIGHTS_SIMPLIFIED_20261106 */
#mej-owner-rights-notice{position:relative;z-index:1;box-sizing:border-box;text-align:center;padding:10px 12px 12px;margin:0 auto;width:100%;font:600 clamp(12px,3.1vw,15px)/1.55 system-ui,sans-serif;color:#153961;direction:rtl;max-width:100%;background:rgba(236,247,255,.84)}
#mej-owner-rights-notice .mej-rights-statement,
#mej-owner-rights-notice .mej-rights-owner{display:block;text-wrap:balance;overflow-wrap:break-word}
#mej-owner-rights-notice .mej-rights-owner{margin-top:2px}
#mej-owner-rights-notice [dir=ltr]{unicode-bidi:isolate;display:inline-block}
@media(max-width:390px){#mej-owner-rights-notice{font-size:12px;padding:9px 9px 13px}}'''
replace_exact(old_css,new_css,'compact-rights-styling')
assert s.count(mark)==1
assert 'Designed by Teacher Houssem Rouatbi' not in s
assert '<div class="m31-school">' not in s and '<div class="actual-school">' not in s
assert s.count('id="mej-owner-rights-notice"')==1
assert s.count('حسام لطفي الرواتبي')==1
p.write_text(s,encoding="utf8")
print("HOME_BANNER_REMOVED_BILINGUAL_RIGHTS_ONE_FOOTER")
