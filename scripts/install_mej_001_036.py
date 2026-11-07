#!/usr/bin/env python3
"""Install 36 user-approved images, words 1-36, without removing other image banks."""
import pathlib, zipfile, json, re, io
from PIL import Image
ZIP=pathlib.Path("assets/import/MEJ_Approved_001-036_36_images_384.zip")
OUT=pathlib.Path("assets/mej-batch-001-036")
BANK=pathlib.Path("assets/approved-images-12.js")
MARKER="// MEJ_APPROVED_001_036_FROM_6X6"
assert ZIP.is_file(), "Upload MEJ_Approved_001-036_36_images_384.zip to assets/import"
assert BANK.is_file(), "Approved image bank missing"
with zipfile.ZipFile(ZIP) as z:
    data=json.loads(z.read("image_manifest.json").decode("utf-8"))
    assert len(data)==36 and sorted(int(x["no"]) for x in data)==list(range(1,37))
    prepared={}
    for row in data:
        name=row["filename"]
        word=row["word"].strip().lower()
        assert re.fullmatch(r"[0-9]{3}_[a-z0-9_]+\.webp", name), name
        assert name in z.namelist() and word not in prepared, word
        content=z.read(name)
        with Image.open(io.BytesIO(content)) as im:
            assert im.format=="WEBP" and im.size==(384,384),name
        prepared[word]=(name,content)
OUT.mkdir(parents=True,exist_ok=True)
for name,content in prepared.values(): (OUT/name).write_bytes(content)
mapping={word:{"src":"/English-Foundation/assets/mej-batch-001-036/"+name,"status":"approved","rejected":False,"preferred":True,"width":384,"height":384,"source":"User-approved 6x6 001-036; enlarged from native 256px"} for word,(name,_) in prepared.items()}
addon="\n"+MARKER+"\n;(function(){const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});const entries="+json.dumps(mapping,separators=(",",":"),ensure_ascii=False)+";for(const [word,image] of Object.entries(entries)){const previous=bank[word];const arr=Array.isArray(previous)?previous:(previous?[previous]:[]);for(const old of arr)if(old&&old.preferred)old.preferred=false;if(!arr.some(x=>x&&x.src===image.src))arr.unshift(image);else{const found=arr.find(x=>x&&x.src===image.src);Object.assign(found,image)}bank[word]=arr}})();\n"
old=BANK.read_text(encoding="utf-8")
if MARKER in old: old=old.split("\n"+MARKER)[0].rstrip()
BANK.write_text(old+addon,encoding="utf-8")
print(f"Installed {len(prepared)} pictures and linked words 1 through 36")
