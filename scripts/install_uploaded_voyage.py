#!/usr/bin/env python3
"""Import the user's approved portrait image from the connected Canva media CDN."""
from pathlib import Path
import hashlib
from urllib.request import Request,urlopen
import re
url="https://d2jqrm6oza8nb6.cloudfront.net/datasets/b46b7b3a-7533-47bb-a20a-d854f5739391.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTVjNTU2ZTRjZWNhNWM0NCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDA1MTE3Mn0.9bFbe-hvy5Y6LCiXCy9PWRCb8PoAVGwOO9tF_EOiXuk"
with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20) as resp:
    data=resp.read()
if hashlib.sha256(data).hexdigest() != 'a527714bce31651f6a1b916d1db4fca1672985cf81869ca4213448d04e328241':
    raise RuntimeError('Image not available at high resolution')
asset=Path('assets/mej-user-voyage.png')
asset.write_bytes(data)
html=Path('index.html');s=html.read_text()
old='src="./assets/home-voyage-original.webp"'
if s.count(old)!=1:raise RuntimeError('Existing background not uniquely present')
s=s.replace(old,'src="./assets/mej-user-voyage.png"',1)
html.write_text(s)
sw=Path('sw.js');w=sw.read_text()
old="'./assets/home-voyage-original.webp'"
if w.count(old)!=1:raise RuntimeError('Offline asset path not uniquely present')
w=w.replace(old,"'./assets/mej-user-voyage.png'",1)
w=re.sub(r"const CACHE='[^']+';","const CACHE='mej-user-upload-20261106-v1';",w,count=1)
sw.write_text(w)
print('Artwork installed',len(data))
