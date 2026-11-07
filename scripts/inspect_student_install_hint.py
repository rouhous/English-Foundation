from pathlib import Path
import re
s=Path("index.html").read_text(encoding="utf-8")
print("INDEX_LEN",len(s),"LINES",s.count("\n")+1)
terms=["ابدأ","ابدأ الرحلة","ابدأ الآن","بدء الرحلة","startBtn","startButton","btnStart","حقوق النشر","جميع الحقوق","©","copyright","footer","Copyright","installHint","تثبيت التطبيق","أضف إلى الشاشة","إضافة إلى الشاشة","حقوق"]
for term in terms:
 hits=list(re.finditer(re.escape(term),s,re.I))
 print("MATCH",repr(term),len(hits))
 for m in hits[:6]:
  fragment=s[max(0,m.start()-160):min(len(s),m.end()+190)]
  fragment=re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]{90,}',"[IMAGE]",fragment)
  print("CONTEXT",repr(fragment[:450]))

# Trigger read-only scan.
