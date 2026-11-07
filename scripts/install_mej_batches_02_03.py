#!/usr/bin/env python3
"""Install 32 curated approved vocabulary pictures, preserving existing approved bank."""
import csv,io,pathlib,re,zipfile
from PIL import Image
ZIP=pathlib.Path("assets/import/MEJ_Batches_02_03_17-48_32images_384.zip")
DEST=pathlib.Path("assets/mej-batches-02-03")
SHARD=pathlib.Path("assets/approved-images-12.js")
MARKER="// MEJ_BATCHES_02_03_17_48"
assert ZIP.is_file(), "Upload the exact approved ZIP under assets/import"
assert SHARD.is_file(), "Missing approved-image shard"
with zipfile.ZipFile(ZIP) as z:
    records=list(csv.DictReader(io.StringIO(z.read('image_manifest.csv').decode('utf-8'))))
    assert len(records)==32 and sorted(int(x['no']) for x in records)==list(range(17,49))
    images={}
    for row in records:
        word=row['word'].strip().lower()
        filename=row['filename']
        assert re.fullmatch(r"\d{3}_[a-z0-9_]+\.png",filename),filename
        assert filename in z.namelist(),filename
        raw=z.read(filename)
        with Image.open(io.BytesIO(raw)) as pic:
            assert pic.format=='PNG' and pic.size==(384,384),filename
        assert word not in images,word
        images[word]=(filename,raw)
DEST.mkdir(parents=True,exist_ok=True)
for name,raw in images.values(): (DEST/name).write_bytes(raw)
import json
mapping={word:[dict(src='/English-Foundation/assets/mej-batches-02-03/'+name,status='approved',rejected=False,preferred=True,width=384,height=384,source='MEJ approved batch 02/03')] for word,(name,_) in images.items()}
addon='\n'+MARKER+'\n;(function(){const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});const additions='+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+';for(const [word,entries] of Object.entries(additions)){const old=bank[word];const list=Array.isArray(old)?old:(old?[old]:[]);for(const entry of entries){if(!list.some(x=>x&&x.src===entry.src))list.push(entry)}bank[word]=list}})();\n'
old=SHARD.read_text(encoding='utf-8')
if MARKER in old:old=old.split('\n'+MARKER)[0].rstrip()
SHARD.write_text(old+addon,encoding='utf-8')
print('Installed',len(mapping),'approved images; included career and chapter')
