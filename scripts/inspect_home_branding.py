from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf-8')
terms=['Wadi Al Hawasna School','Designed by Teacher','Designed by','مدرسة وادي الحواسنة','mej-owner-rights-notice','قسم اللغة الإنجليزية','The English Department','جميع الحقوق محفوظة','Houssem Lotfi Rouatbi']
for term in terms:
 matches=list(re.finditer(re.escape(term),s,re.I))
 print('TERM',term,'COUNT',len(matches))
 for m in matches[:8]:
  area=s[max(0,m.start()-350):m.end()+500]
  area=re.sub(r'data:image/[^\s"\']{50,}','[IMAGE]',area)
  print('CONTEXT',repr(area[:1000]))
