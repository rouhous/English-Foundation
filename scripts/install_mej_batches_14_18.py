#!/usr/bin/env python3
"""Install last five MEJ vocabulary batches, checking exact filenames and 384px dimensions."""
import io,json,pathlib,re,zipfile
from PIL import Image
ARCHIVE=pathlib.Path("assets/import/MEJ_Final_Batches_14-18_209-286_78images_384_REVIEW.zip")
OUT=pathlib.Path("assets/mej-batches-14-18")
BANK=pathlib.Path("assets/approved-images-12.js")
MARKER="// MEJ_BATCHES_14_18_209_286_V1"
assert ARCHIVE.exists(),f"Upload archive to {ARCHIVE}"
assert BANK.exists(),"Missing application image bank"
with zipfile.ZipFile(ARCHIVE) as archive:
    names=set(archive.namelist())
    entries=json.loads(archive.read("image_manifest.json").decode("utf-8"))
    assert len(entries)==78 and sorted(int(item["no"]) for item in entries)==list(range(209,287))
    data={}
    for item in entries:
        number=int(item["no"])
        word=str(item["word"]).strip().lower()
        location=item["filename"]
        assert re.fullmatch(r"batch_1[4-8]/\d{3}_[a-z0-9_]+\.webp",location),location
        assert location in names and int(location.split("/")[-1][:3])==number
        assert word not in data,word
        binary=archive.read(location)
        with Image.open(io.BytesIO(binary)) as image:
            assert image.format=="WEBP" and image.size==(384,384),location
        data[word]=(location.split("/")[-1],binary)
assert len(data)==78
OUT.mkdir(parents=True,exist_ok=True)
for filename,binary in data.values():
    (OUT/filename).write_bytes(binary)
mapping={word:[{"src":"/English-Foundation/assets/mej-batches-14-18/"+filename,"status":"approved","rejected":False,"width":384,"height":384,"source":"MEJ 4x4 batches 14-18"}] for word,(filename,_) in data.items()}
code="\n"+MARKER+"\n;(function(){const bank=window.MEJ_APPROVED_IMAGES||(window.MEJ_APPROVED_IMAGES={});const updates="+json.dumps(mapping,ensure_ascii=False,separators=(",",":"))+";for(const [word,newEntries] of Object.entries(updates)){const current=bank[word];const list=Array.isArray(current)?current:(current?[current]:[]);for(const entry of newEntries){if(!list.some(x=>x&&x.src===entry.src))list.push(entry)}bank[word]=list}})();\n"
old=BANK.read_text(encoding="utf-8")
if MARKER in old:old=old.split("\n"+MARKER)[0].rstrip()
BANK.write_text(old+code,encoding="utf-8")
print("Installed 78 checked image files and mapped words 209-286")
