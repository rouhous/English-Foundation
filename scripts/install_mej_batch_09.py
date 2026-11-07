#!/usr/bin/env python3
"""Install uploaded, user-approved vocabulary pictures for words 129–144."""
import io,json,pathlib,re,zipfile
from PIL import Image
ZIP=pathlib.Path("assets/import/MEJ_Batch09_129-144_FOR_REVIEW.zip")
DEST=pathlib.Path("assets/mej-batch-09-129-144")
SHARD=pathlib.Path("assets/approved-images-12.js")
MARKER="// MEJ_BATCH_09_129_144"
assert ZIP.is_file(),f"Upload missing: {ZIP}"
assert SHARD.is_file(),"Approved images bank missing"
with zipfile.ZipFile(ZIP) as z:
    records=json.loads(z.read("image_manifest.json"))
    assert len(records)==16 and sorted(int(r["no"]) for r in records)==list(range(129,145))
    mapping={}
    assets={}
    for r in records:
        word=r["word"].strip().lower()
        filename=r["filename"]
        assert re.fullmatch(r"[0-9]{3}_[a-z0-9_]+\.webp",filename),filename
        assert filename in z.namelist() and word not in mapping
        raw=z.read(filename)
        with Image.open(io.BytesIO(raw)) as img:
            assert img.format=="WEBP" and img.size==(384,384),filename
        assets[filename]=raw
        mapping[word]=[{"src":"/English-Foundation/assets/mej-batch-09-129-144/"+filename,"status":"approved","rejected":False,"preferred":True,"width":384,"height":384,"source":"MEJ user-submitted batch 09"}]
DEST.mkdir(parents=True,exist_ok=True)
for name,raw in assets.items(): (DEST/name).write_bytes(raw)
addon="\n"+MARKER+"\n;(function(){const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});const incoming="+json.dumps(mapping,separators=(',',':'))+";for(const [word,pics] of Object.entries(incoming)){const old=bank[word];const arr=Array.isArray(old)?old:(old?[old]:[]);for(const p of pics){if(!arr.some(x=>x&&x.src===p.src))arr.unshift(p)}bank[word]=arr}})();\n"
old=SHARD.read_text(encoding="utf-8")
if MARKER in old:old=old.split("\n"+MARKER)[0].rstrip()
SHARD.write_text(old+addon,encoding="utf-8")
print("Verified and linked",len(mapping),"approved vocabulary images")
