from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
for term in ['معلومات تقنية','آخر رقم تقرير','آخر تقرير مؤكد','نتائج التقارير غير معتمدة','settingsConnection','function settings','function settingsPage','function settingsView']:
 matches=list(re.finditer(re.escape(term),s))
 print('TERM',term,'COUNT',len(matches))
 for m in matches[:2]:
  v=s[max(0,m.start()-600):m.start()+1800]
  v=re.sub(r'data:image/[^"\s]+','[image]',v)
  print('-----',v[:2400])
