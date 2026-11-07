from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
anchor='<div id="mej-owner-rights-notice" data-version="MEJ_OWNER_COPYRIGHT_NOTICE_2026" aria-label="حقوق الملكية">'
marker='id="mej-install-help-inline-rights"'
if marker in s:
 print('INSTALL_HELP_ALREADY_PRESENT')
 raise SystemExit(0)
assert s.count(anchor)==1,'Copyright container anchor must occur exactly once'
assert 'mej-student-install-hint' not in s,'Previous separate install box unexpectedly remains'
addition='\n<span id="mej-install-help-inline-rights" style="display:block;font-size:12px;line-height:1.4;font-weight:600">للتثبيت: افتح قائمة المتصفح (⋮) واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</span>'
updated=s.replace(anchor,anchor+addition,1)
assert updated.count(marker)==1
assert updated.replace(addition,'')==s,'Only the single instruction line may change'
assert updated.index(marker)<updated.index('class="mej-rights-statement"')
p.write_text(updated,encoding='utf-8')
print('INSTALL_HELP_INSERTED_AS_FIRST_LINE_OF_EXISTING_RIGHTS_BOX_ONLY')

# Run targeted copyright-box insertion.
