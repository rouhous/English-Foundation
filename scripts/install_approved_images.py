#!/usr/bin/env python3
"""Activate only user-approved vocabulary image bundles in the existing app."""
from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf8')
paths=[f'assets/approved-images-{i:02d}.js' for i in range(1,13)]
missing=[x for x in paths if not Path(x).is_file()]
if missing:raise RuntimeError('Missing approved image shards: '+', '.join(missing))
for f in paths:
 if 'window.MEJ_APPROVED_IMAGES' not in Path(f).read_text(encoding='utf8'):raise RuntimeError('Invalid image shard '+f)
tags='\n'.join(f'<script defer src="./{f}?v=20261104-approved"></script>' for f in paths)
marker='<!-- MEJ_APPROVED_IMAGE_BUNDLES_V1 -->'
if marker not in s:
 if '</head>' not in s:raise RuntimeError('Cannot find HTML head')
 s=s.replace('</head>',marker+'\n'+tags+'\n</head>',1)
old="function imageHtml(word,size='standard'){let src=realPhoto(word);"
new="""function mejApprovedPhoto(word){
 const key=String(word||'').trim().toLowerCase();
 const choices=(window.MEJ_APPROVED_IMAGES||{})[key]||[];
 if(!choices.length)return '';
 const winner=choices.slice().sort((a,b)=>Number(b.preferred)-Number(a.preferred)||((b.w*b.h)-(a.w*a.h))||a.id-b.id)[0];
 return winner.src;
}
function imageHtml(word,size='standard'){let src=mejApprovedPhoto(word);"""
if 'function mejApprovedPhoto(word)' not in s:
 if old not in s:raise RuntimeError('Existing imageHtml signature differs')
 s=s.replace(old,new,1)
assert s.count('function mejApprovedPhoto(word)')==1
assert s.count(marker)==1
assert all(s.count('./'+f+'?v=20261104-approved')==1 for f in paths)
p.write_text(s,encoding='utf8')
sw=Path('sw.js');w=sw.read_text(encoding='utf8')
w2=re.sub(r"const CACHE='[^']+';","const CACHE='english-explorer-approved-vocabulary-20261104-v1';",w,count=1)
if w2==w:raise RuntimeError('Cannot update cache version')
sw.write_text(w2,encoding='utf8')
print('Linked 12 approved image shards into existing imageHtml renderer')