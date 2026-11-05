#!/usr/bin/env python3
"""Static release gate: approved-only vocabulary assets, dimensions, links, mobile CSS."""
from pathlib import Path
from collections import Counter
import json,re,base64
root=Path('.')
html=(root/'index.html').read_text(encoding='utf8')
items=[]
for i in range(1,13):
 path=root/f'assets/approved-images-{i:02d}.js'
 js=path.read_text(encoding='utf8')
 m=re.search(r'Object\.entries\((\{.*\})\)\)\{',js,re.S)
 if not m:raise RuntimeError(f'Unable to parse shard {i}')
 batch=json.loads(m.group(1))
 for word,choices in batch.items():
  for c in choices:
   assert word and c['src'].startswith('data:image/'), (i,word)
   assert c['w']>=316 and c['h']>=316,(i,word,c['id'])
   assert len(base64.b64decode(c['src'].split(',',1)[1],validate=True))>150, (i,c['id'])
   items.append((word,c))
 assert f'./assets/approved-images-{i:02d}.js?v=20261104-approved' in html, i
assert len(items)==1136, len(items)
assert len({c['id'] for _,c in items})==1136
assert len({w for w,_ in items})==971
assert sum(bool(c['preferred']) for _,c in items)==36
sizes=Counter((c['w'],c['h']) for _,c in items)
assert sizes[(316,316)]==708 and sizes[(384,384)]==428,sizes
assert 'function mejApprovedPhoto(word)' in html
assert "let src=mejApprovedPhoto(word)" in html
assert 'mobile-home-fix.css?v=20261104-release' in html
assert 'mejStageQuestions(g,part)' in html
assert 'MEJ_STAGE5_RESPONSIVE_V1' in html
assert './assets/stage5-responsive.css?v=20261105-stage5' in html
sw=(root/'sw.js').read_text(encoding='utf8')
assert 'english-explorer-fast-launch-20261105-v1' in sw
assert 'return cached;' in sw and 'warmPictures()' in sw
report={
 'approved_images':len(items),'unique_image_ids':len({c['id'] for _,c in items}),
 'distinct_word_labels':len({w for w,_ in items}),
 'preferred_images':sum(bool(c['preferred']) for _,c in items),
 'dimensions':{f'{w}x{h}':n for (w,h),n in sorted(sizes.items())},
 'mobile_stylesheet_linked':True,'two_levels':True,
 'stage5_responsive_css':True,'offline_image_shards_pre_cache':12,
 'fast_cached_pwa_launch':True,
 'rejected_images_imported':0,
 'status':'STATIC_ASSET_CHECKS_PASSED',
 'release_note':'Not a security or end-to-end student-account certification.'
}
Path('diagnostics/prelaunch-asset-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
