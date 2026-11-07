#!/usr/bin/env python3
"""Install the 80 curated 384px WebP files from the verified MEJ batch archive."""
import json, zipfile, pathlib, shutil, re, sys
from PIL import Image
ZIP = pathlib.Path("assets/import/MEJ_5_Batches_49-128_80_Images_384.zip")
DEST = pathlib.Path("assets/mej-batches-04-08")
SHARD = pathlib.Path("assets/approved-images-12.js")
MARKER = "// MEJ_BATCHES_04_TO_08_49_128_V1"
assert ZIP.is_file(), f"Missing archive: {ZIP}"
assert SHARD.is_file(), f"Missing approved image bank: {SHARD}"
with zipfile.ZipFile(ZIP) as z:
    members = z.namelist()
    manifest_file = next((x for x in members if x.endswith("/image_manifest.json")), None)
    assert manifest_file, "Missing image_manifest.json"
    records = json.loads(z.read(manifest_file))
    assert len(records) == 80, f"Expected 80 entries, got {len(records)}"
    assert sorted(x["no"] for x in records) == list(range(49,129))
    images = {}
    for r in records:
        no = int(r["no"])
        word = r["word"].strip().lower()
        relative = pathlib.PurePosixPath(r["filename"])
        assert re.fullmatch(r"[a-z0-9][a-z0-9 _'-]*",word), word
        assert ".." not in relative.parts and relative.suffix == ".webp"
        key = next((x for x in members if x.endswith("/"+str(relative))), None)
        assert key, f"Missing image for {word}"
        with z.open(key) as data:
            from io import BytesIO
            b = data.read()
            im = Image.open(BytesIO(b))
            assert im.size == (384,384) and im.format == "WEBP", f"Bad image: {key}"
        images[word] = (no, relative.name, b)
assert len(images) == 80, "Duplicate normalized vocabulary keys"
DEST.mkdir(parents=True,exist_ok=True)
for word,(no,name,b) in images.items():
    (DEST/name).write_bytes(b)
mapping = {word:[{"src":f"/English-Foundation/assets/mej-batches-04-08/{name}","status":"approved","rejected":False,"width":384,"height":384,"source":"MEJ curated batches 04-08"}] for word,(no,name,b) in images.items()}
script = "\n"+MARKER+"\n;(function(){\n  const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});\n  const additions="+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+";\n  for(const [word,entries] of Object.entries(additions)){\n    const existing=bank[word];\n    const list=Array.isArray(existing)?existing:(existing?[existing]:[]);\n    const known=new Set(list.map(x=>x&&x.src));\n    for(const entry of entries) if(!known.has(entry.src)) list.push(entry);\n    bank[word]=list;\n  }\n})();\n"
old=SHARD.read_text(encoding="utf-8")
if MARKER in old:
    old=old.split("\n"+MARKER)[0].rstrip()
SHARD.write_text(old+script,encoding="utf-8")
print(f"Installed {len(mapping)} verified WebP images and mapped {len(mapping)} vocabulary labels")
