from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='MEJ_STUDENT_INSTALL_HINT_20261107'
if marker in s:
 print('INSTALL_HINT_ALREADY_PRESENT')
 raise SystemExit(0)
target='<div id="mej-owner-rights-notice"'
assert s.count(target)==1,'Copyright anchor must be unique'
insertion='''<style id="mej-student-install-hint-style">
/* MEJ_STUDENT_INSTALL_HINT_20261107 - simple PWA instructions above copyright */
#mej-student-install-hint{width:min(96%,680px);box-sizing:border-box;position:relative;z-index:2;margin:8px auto 3px;padding:7px 12px;text-align:center;color:#124c78;background:#eaf7ffed;border:1px solid #bbe2f8;border-radius:12px;font:600 clamp(12px,2.7vw,14px)/1.7 system-ui,Tahoma,Arial,sans-serif;direction:rtl}
@media(max-width:480px){#mej-student-install-hint{max-width:93%;padding:6px 9px}}
</style>
<div id="mej-student-install-hint" role="note">لتثبيت التطبيق: افتح قائمة المتصفح (⋮) ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</div>
'''
s=s.replace(target,insertion+target,1)
p.write_text(s,encoding='utf-8')
assert s.index(marker)<s.index('id="mej-owner-rights-notice"')
print('STUDENT_INSTALL_HINT_ADDED_ABOVE_COPYRIGHT')

# Run checked landing page patch.
