#!/usr/bin/env python3
"""Move existing settings entry to Google owner login without granting privileges."""
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf8")
old="const link = './reviews/owner-review.html';"
new="const link = './reviews/owner-login.html';"
if old in s:
 s=s.replace(old,new,1)
elif new in s:
 print("Already linked")
 raise SystemExit(0)
else:
 raise SystemExit("Expected existing owner review settings entry not found; refusing blind update")
s=s.replace("const label = 'Admin · مراجعة المحتوى';","const label = 'Admin · دخول المالك';",1)
s=s.replace("مراجعة للمالك للمحتوى المنشور فقط؛ لا تتضمن تعديل بيانات الطلاب أو منح صلاحيات إدارية.","تسجيل Google للتحقق من هوية المالك؛ الإدارة الكاملة لا تتاح قبل تفعيل الخدمة الآمنة.",1)
assert s.count(new)==1
p.write_text(s,encoding="utf8")
print("Settings owner login link installed.")
