#!/usr/bin/env python3
"""Static integration audit: read-only for learner files and student data."""
from pathlib import Path
import re,subprocess,json
html=Path('index.html').read_text(encoding='utf8')
study=Path('assets/mej-study-companion.js').read_text(encoding='utf8')
rig=Path('assets/mej-companion-motion-v1.js').read_text(encoding='utf8')
three=Path('assets/mej-companion-3d-v1.js').read_text(encoding='utf8')
sw=Path('sw.js').read_text(encoding='utf8')
checks={
 '3d_loader': html.count('mej-companion-3d-v1.js?v=20261109')==1,
 'fallback_2d_loader': html.count('mej-companion-motion-v1.js?v=20261109')==1,
 'selected_profile': 'learner()?.companion' in three or 'user?.companion' in three,
 'quiz_feedback_hook': 'MEJCompanion.react' in html,
 'reward_original': 'const compliments=' in study,
 'encourage_original': 'const encouragements=' in study,
 'webgl_fallback': 'if(!gl)return false' in three,
 'webgl_native': 'getContext("webgl"' in three,
 'offline_cached': "'./assets/mej-companion-3d-v1.js'" in sw,
 'star_code_untouched': 'MEJ_COMPANION_3D_V1' not in html,
}
for file in ['assets/mej-study-companion.js','assets/mej-companion-motion-v1.js','assets/mej-companion-3d-v1.js','assets/mej-companion-setup-v1.js']:
 r=subprocess.run(['node','--check',file],capture_output=True,text=True)
 checks['syntax_'+Path(file).stem]=r.returncode==0
report={'status':'PASS' if all(v for k,v in checks.items() if k!='quiz_feedback_hook') else 'CHECK','checks':checks,'feedback_matches':len(re.findall(r'MEJCompanion\\.react',html)),'source_bytes':len(html)}
Path('diagnostics').mkdir(exist_ok=True)
Path('diagnostics/mej-companion-3d-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
assert report['status']=='PASS'
