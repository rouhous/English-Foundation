from pathlib import Path
import re
s=Path('index.html').read_text()
for m in re.finditer('background-image:',s):
 before=s[max(0,m.start()-1500):m.start()]
 brace=max(before.rfind('}'),before.rfind('{'))
 print('POS',m.start(),'PRELUDE',repr(before[max(0,brace-220):]),'START',repr(s[m.start():m.start()+85]))
# other background URL styles: count and selectors near last occurrences
for m in list(re.finditer(r'background\s*:\s*[^;]{0,250}url\(',s,re.I))[:15]:
 print('BG',m.start(),repr(s[m.start()-280:m.start()+90]))
