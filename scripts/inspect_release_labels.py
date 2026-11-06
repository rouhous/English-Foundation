from pathlib import Path
import re
s=Path("index.html").read_text(encoding="utf-8")
patterns=[r"STAGING",r"تجريب",r"نسخة تجريبية",r"مرحلة تجريب",r"Release Candidate",r"فترة اختبار",r"بيانات وهمية",r"fake",r"pilot",r"رسالة التسجيل"]
for pattern in patterns:
 hits=list(re.finditer(pattern,s,re.I))
 print("\nTERM",pattern,"TOTAL",len(hits))
 for m in hits[:14]:
  t=s[max(0,m.start()-95):m.end()+120]
  t=re.sub(r'data:image/[^\s"\']+','[image]',t)
  print(repr(t[:230]))
