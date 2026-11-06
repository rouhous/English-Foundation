from pathlib import Path
import re,json
s=Path('index.html').read_text(encoding='utf8')
terms=['register','registration','createProfile','addProfile','saveProfile','teacher','profiles.push','profiles[','db.profiles','enroll']
results={}
for term in terms:
 hits=[m.start() for m in re.finditer(re.escape(term),s,re.I)]
 results[term]={'count':len(hits),'nearby_functions':[]}
 for pos in hits[:40]:
  window=s[max(0,pos-1200):pos]
  declarations=list(re.finditer(r'function\s+([a-zA-Z_$][\w$]*)\s*\(',window))
  name=declarations[-1].group(1) if declarations else 'unknown'
  if name not in results[term]['nearby_functions']:
   results[term]['nearby_functions'].append(name)
Path('diagnostics/registration-structure.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print('Registration structure audit generated')
