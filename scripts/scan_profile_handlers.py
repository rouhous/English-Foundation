from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
for fn in ('addUser','saveProfileModal','openProfileModal','showProfileModal','active'):
 match=re.search(r'function\s+'+fn+r'\s*\([^)]*\)\s*\{',s)
 if match:
  x=s[match.start():match.start()+750]
  x=re.sub(r'(?s)data:image/[a-zA-Z0-9+./;=,-]+','[IMAGE]',x)
  x=re.sub(r'(?:[a-zA-Z0-9+_-]{32,}\.){2,}[A-Za-z0-9+_-]{16,}','[TOKEN]',x)
  print('\nFUNCTION '+fn+'\n'+x+'\n')
 else:print('MISSING '+fn)
