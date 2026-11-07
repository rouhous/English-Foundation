from pathlib import Path
import re
s=Path('index.html').read_text(encoding='utf8')
for term in ['mobile-ocean-v31','m31-art','m31-sea','m31-boat-restored','mobile-home-fix.css','background PC.png','home-voyage-original.webp','body{','@media(min-width','@media (min-width']:
  matches=list(re.finditer(re.escape(term),s,re.I))
  print('TERM',repr(term),'COUNT',len(matches))
  for m in matches[:6]:
    ctx=s[max(0,m.start()-220):m.end()+440]
    print('LINE',s.count('\\n',0,m.start())+1,repr(ctx[:750]))
print('HTML_LENGTH',len(s))

# Execute read-only audit.

for term in ['<style id="mej-poster-functional-home">','journey-home ocean-landing actual-v18','<div class="journey-home','actual-v18{','@media(min-width:901px)','desktop-poster']:
 hits=list(re.finditer(re.escape(term),s,re.I))
 print('DETAIL',repr(term),len(hits))
 for m in hits[-3:]:
  print('CTX',repr(s[max(0,m.start()-350):m.start()+3100][:3400]))
