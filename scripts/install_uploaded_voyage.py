#!/usr/bin/env python3
"""Import the user's approved portrait image from the connected Canva media CDN."""
from pathlib import Path
from urllib.request import Request,urlopen
import re
url='https://media.canva.com/v2/image-resize/format:JPG/height:1536/quality:90/uri:ifs%3A%2F%2FM%2Fd7e6685d-df96-4f72-b36e-5e4cf98d9070/watermark:F/width:864'
with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20) as resp:
    data=resp.read()
if len(data)<30000 or not data.startswith(b'\xff\xd8\xff'):
    raise RuntimeError('Image not available at high resolution')
asset=Path('assets/mej-user-voyage.jpg')
asset.write_bytes(data)
html=Path('index.html');s=html.read_text()
old='src="./assets/home-voyage-original.webp"'
if s.count(old)!=1:raise RuntimeError('Existing background not uniquely present')
s=s.replace(old,'src="./assets/mej-user-voyage.jpg"',1)
html.write_text(s)
sw=Path('sw.js');w=sw.read_text()
old="'./assets/home-voyage-original.webp'"
if w.count(old)!=1:raise RuntimeError('Offline asset path not uniquely present')
w=w.replace(old,"'./assets/mej-user-voyage.jpg'",1)
w=re.sub(r"const CACHE='[^']+';","const CACHE='mej-user-upload-20261106-v1';",w,count=1)
sw.write_text(w)
print('Artwork installed',len(data))
