#!/usr/bin/env python3
"""Import already-generated original Hidden Objects art into the GitHub repository.

Never invent objects or certify click polygons. This script handles original image bytes
only; registration remains practice/review mode until each hotspot is verified.
"""
import hashlib,io,json,os,pathlib,time,urllib.parse,urllib.request
from PIL import Image,ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest=ROOT/"hidden-objects/GENERATED_13_SCENES_SOURCE_20261116.json"
data=json.loads(manifest.read_text())
assert len(data["scenes"])==13
outdir=ROOT/"hidden-objects/assets"
outdir.mkdir(exist_ok=True)
results=[]
for entry in data["scenes"]:
  url=entry["source_url"]
  parsed=urllib.parse.urlparse(url)
  if parsed.scheme!="https" or parsed.hostname!="d8j0ntlcm91z4.cloudfront.net":
    raise ValueError("Unexpected external media host")
  path=outdir/entry["filename"]
  if not path.resolve().is_relative_to(outdir.resolve()) or path.suffix!=".webp":
    raise ValueError("Unexpected output path")
  if path.exists():
    print("Existing file retained:",path.name)
  else:
    payload=None
    for attempt in range(4):
      try:
        req=urllib.request.Request(url,headers={"User-Agent":"MEJHiddenSceneImporter/1.0"})
        with urllib.request.urlopen(req,timeout=35) as f:
          payload=f.read(22_000_001)
        if len(payload)>22_000_000:
          raise ValueError("Unexpected image download size")
        break
      except Exception:
        if attempt==3:raise
        time.sleep(3*(attempt+1))
    image=Image.open(io.BytesIO(payload))
    image.load()
    if image.width<512 or image.height<288:
      raise ValueError("Generated image resolution is too small: "+path.name)
    image=ImageOps.fit(ImageOps.exif_transpose(image).convert("RGB"),(1599,900),method=Image.Resampling.LANCZOS)
    image.save(path,"WEBP",quality=88,method=5)
  with Image.open(path) as img:
    if img.size!=(1599,900):raise ValueError("Incorrect game size "+path.name)
    img.verify()
  raw=path.read_bytes()
  results.append({"scene_id":entry["scene_id"],"filename":path.name,"sha256":hashlib.sha256(raw).hexdigest(),"size_bytes":len(raw),"width":1599,"height":900,"review_status":"image-installed-hotspots-unverified"})
outfile=ROOT/"hidden-objects/GENERATED_13_IMPORTED_AUDIT_20261116.json"
outfile.write_text(json.dumps({"version":"2026-11-16","count":len(results),"originals_preserved":True,"bonus_scoring_enabled":False,"scenes":results},ensure_ascii=False,indent=2)+"\n")
print("IMPORTED_SCENES",len(results), "PHOTO_AUDIT",outfile)
