#!/usr/bin/env python3
"""Install approved vocabulary batches 10-13, numbers 145-208, without deleting previous images."""
import pathlib,zipfile,json,io,re
from PIL import Image
ZIP=pathlib.Path('assets/import/MEJ_Batches_10-13_145-208_64images_384.zip')
OUT=pathlib.Path('assets/mej-batches-10-13')
BANK=pathlib.Path('assets/approved-images-12.js')
MARKER='// MEJ_BATCHES_10_13_145_208'
PREFIX='MEJ_Batches_10-13_145-208/'
assert ZIP.is_file(), f'Archive not found: {ZIP}'
assert BANK.is_file(), f'Image bank not found: {BANK}'
with zipfile.ZipFile(ZIP) as z:
    names=set(z.namelist())
    manifest=json.loads(z.read(PREFIX+'image_manifest.json').decode('utf-8'))
    assert len(manifest)==64 and sorted(int(i['no']) for i in manifest)==list(range(145,209)), 'Unexpected vocabulary range'
    result={}
    for row in manifest:
        word=str(row['word']).strip().lower()
        no=int(row['no'])
        relative=str(row['filename'])
        assert re.fullmatch(r'Batch1[0-3]_\d{3}-\d{3}/\d{3}_[a-z0-9_]+\.webp',relative),relative
        assert int(relative.split('/')[-1][:3])==no and word not in result
        entry=PREFIX+relative
        assert entry in names, f'Missing picture {entry}'
        raw=z.read(entry)
        with Image.open(io.BytesIO(raw)) as im:
            assert im.size==(384,384) and im.format=='WEBP', entry
        result[word]=(relative.split('/')[-1],raw)
assert len(result)==64
OUT.mkdir(parents=True,exist_ok=True)
for filename,raw in result.values(): (OUT/filename).write_bytes(raw)
mapping={word:[{'src':'/English-Foundation/assets/mej-batches-10-13/'+filename,'status':'approved','rejected':False,'width':384,'height':384,'source':'MEJ curated batches 10-13'}] for word,(filename,raw) in result.items()}
addon='\n'+MARKER+'\n;(function(){const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});const incoming='+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+';for(const [word,items] of Object.entries(incoming)){const old=bank[word];const arr=Array.isArray(old)?old:(old?[old]:[]);for(const item of items){if(!arr.some(x=>x&&x.src===item.src))arr.push(item)}bank[word]=arr}})();\n'
existing=BANK.read_text(encoding='utf-8')
if MARKER in existing: existing=existing.split('\n'+MARKER)[0].rstrip()
BANK.write_text(existing+addon,encoding='utf-8')
print('Installed and mapped',len(mapping),'images for words 145-208')

# Trigger installation for archive uploaded before the workflow existed.
