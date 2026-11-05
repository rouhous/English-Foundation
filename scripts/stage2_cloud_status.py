#!/usr/bin/env python3
"""Clarify cloud saves are provisional, not authenticated achievement scores."""
from pathlib import Path
import re,subprocess,tempfile
p=Path('index.html');s=p.read_text(encoding='utf8')
marker='MEJ_STAGE2_CLOUD_TRUST_LABEL_V1'
if marker not in s:
 def one(a,b,label):
  global s
  if s.count(a)!=1:raise RuntimeError(f'{label}: expected one occurrence, got {s.count(a)}')
  s=s.replace(a,b,1)
 one("p.syncStatus='✅ تم التأكد من حفظ تقدم '+p.name+' في Google Sheets ('+new Date().toLocaleString('ar-OM')+').'","p.syncStatus='✅ تم استلام تقرير '+p.name+' في Google Sheets ('+new Date().toLocaleString('ar-OM')+'). النتائج المرسلة من الجهاز غير موثقة بعد، ولا تُستخدم للترتيب.'","receipt acknowledgement")
 one("else{p.syncStatus='✅ الوصول إلى خدمة الاستقبال ناجح ('+status.version+'). أرسل تقريرًا فعليًا للتحقق من تسجيله.';}","else{p.syncStatus='✅ الوصول إلى خدمة الاستقبال ناجح ('+status.version+'). '+(status.scoreVerification==='SERVER_VERIFIED'?'الخادم يعلن تحقق النتائج؛ يلزم اختبار مستقل قبل اعتمادها.':'⚠️ النتائج غير موثقة على الخادم، ولا تُستخدم لترتيب الطلاب.');}","health trust label")
 one("const REPORT_ERROR_AR={","// MEJ_STAGE2_CLOUD_TRUST_LABEL_V1\nconst REPORT_ERROR_AR={","version marker")
 scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.I|re.S)
 with tempfile.TemporaryDirectory() as d:
  for i,b in enumerate(scripts):
   if not b.strip():continue
   f=Path(d)/f'script_{i}.js';f.write_text(b,encoding='utf8')
   check=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
   if check.returncode:raise RuntimeError(f'JavaScript syntax error {i}: '+check.stderr[:900])
 p.write_text(s,encoding='utf8')
print('CLOUD_TRUST_LABEL_INSTALLED')
