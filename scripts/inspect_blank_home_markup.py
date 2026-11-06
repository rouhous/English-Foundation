from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
a=s.find('<section class="mobile-ocean-v31"')
b=s.find('</section>',a)
v=s[a:b+10]
v=re.sub(r'data:image/[^"\']+', '[IMAGE_DATA]',v)
print('HOME_SECTION_START',a,'BYTES',len(v))
print(v[:12000])
