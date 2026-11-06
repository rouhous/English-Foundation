from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
terms=['function home(){','class="mobile-ocean-v31"','class="m31-sea"','background-image','background: url','background:url','.mobile-ocean-v31','m31-art','MEJ_SINGLE_SCENE_FIT_VIEWPORT_20261106']
for term in terms:
 hits=list(re.finditer(re.escape(term),s))
 print('\nTERM',term,'COUNT',len(hits))
 for m in hits[-6:]:
  snippet=s[max(0,m.start()-300):m.start()+700]
  snippet=re.sub(r'data:image/[^"\s]{60,}', '[BASE64_IMAGE]',snippet)
  print('POSITION',m.start(),repr(snippet[:1000]))
