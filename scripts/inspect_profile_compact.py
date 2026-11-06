from pathlib import Path
import re
s=Path('index.html').read_text()
for token in ('class="m31-profile"','class="m31-profile-copy"','class="m31-start"','class="m31-lower"','id="mej-owner-rights-notice"','🎓'):
 p=s.find(token)
 if p==-1: print(token,'NOT FOUND');continue
 v=s[max(0,p-360):p+1650]
 v=re.sub(r'data:image/[^"\']+','[IMAGE]',v)
 print('\nKEY',token,'\n',v)
