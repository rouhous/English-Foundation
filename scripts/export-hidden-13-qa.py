#!/usr/bin/env python3
"""Human-readable picture inspection contact sheets for visual hotspot QA."""
import base64,io,json,pathlib
from PIL import Image,ImageDraw,ImageFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=json.loads((ROOT/"hidden-objects/GENERATED_13_SCENES_SOURCE_20261116.json").read_text())
scenes=source["scenes"]
out=ROOT/"hidden-objects/qa-preview"
out.mkdir(parents=True,exist_ok=True)
try:font=ImageFont.truetype("DejaVuSans.ttf",22)
except OSError:font=ImageFont.load_default()
for offset in range(0,len(scenes),4):
  selection=scenes[offset:offset+4]
  sheet=Image.new("RGB",(1600,960),"#15394a")
  draw=ImageDraw.Draw(sheet)
  for i,scene in enumerate(selection):
    col=i%2;row=i//2;x=col*800;y=row*480
    with Image.open(ROOT/"hidden-objects/assets"/scene["filename"]) as original:
      tile=original.convert("RGB").resize((800,450),Image.Resampling.LANCZOS)
      sheet.paste(tile,(x,y+30))
    draw.rectangle((x,y,x+800,y+30),fill="#102a42")
    draw.text((x+8,y+3),scene["scene_id"]+"  "+scene["filename"],fill="white",font=font)
  stream=io.BytesIO();sheet.save(stream,"JPEG",quality=83,optimize=True)
  file=out/("sheet-%02d.jpg.b64"%(offset//4))
  file.write_text(base64.b64encode(stream.getvalue()).decode("ascii"))
  print("REVIEW_SHEET",file.name,len(stream.getvalue()))
