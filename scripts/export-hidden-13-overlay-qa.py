#!/usr/bin/env python3
"""Visual-only QA sheets for ten manually estimated target masks per original photo."""
import base64,io,json,pathlib
from PIL import Image,ImageDraw,ImageFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((ROOT/"hidden-objects/GENERATED_13_TARGET_DRAFTS_20261116.json").read_text())
assert len(data["scenes"])==13
out=ROOT/"hidden-objects/qa-preview"
out.mkdir(parents=True,exist_ok=True)
try:font=ImageFont.truetype("DejaVuSans.ttf",17)
except OSError:font=ImageFont.load_default()
for offset in range(0,13,4):
  sheet=Image.new("RGB",(1600,960),"#17394a");draw=ImageDraw.Draw(sheet)
  for i,s in enumerate(data["scenes"][offset:offset+4]):
    x0=(i%2)*800;y0=(i//2)*480
    with Image.open(ROOT/"hidden-objects/assets"/s["filename"]) as src:
      img=src.convert("RGB").resize((800,450),Image.Resampling.LANCZOS)
      sheet.paste(img,(x0,y0+30))
    draw.rectangle((x0,y0,x0+799,y0+29),fill="#102a42")
    draw.text((x0+10,y0+3),s["sceneId"]+" [10 draft targets]",font=font,fill="white")
    for n,(word,obj) in enumerate(s["targets"].items(),1):
      polygon=[(x0+int(p[0]*8),y0+30+int(p[1]*4.5)) for p in obj["points"]]
      draw.line(polygon+[polygon[0]],fill=(255,235,24),width=3,joint="curve")
      tx,ty=polygon[0]
      tx=max(x0,min(tx,x0+757));ty=max(y0+30,min(ty,y0+451))
      draw.rectangle((tx,ty,tx+37,ty+20),fill="#182c38")
      draw.text((tx+3,ty),str(n),font=font,fill="#faffce")
  buf=io.BytesIO();sheet.save(buf,"JPEG",quality=85,optimize=True)
  path=out/("sheet-%02d-overlay.jpg.b64"%(offset//4))
  path.write_text(base64.b64encode(buf.getvalue()).decode("ascii"))
  print("ANNOTATED_SHEET",path.name,len(buf.getvalue()))
