from pathlib import Path
import re
s=Path("index.html").read_text(encoding="utf-8")
out=["HOME SCENE AUDIT"]
for word in ["m31-art","m31-sea","m31-boat-restored","actual-boat","island","جزيرة","boat","child","homeScene","home()","m31-hero"]:
    out.append("\n==== "+word+" ====")
    hits=list(re.finditer(re.escape(word),s,re.I))
    out.append("COUNT "+str(len(hits)))
    for m in hits[:12]:
        a=max(0,m.start()-380);b=min(len(s),m.end()+440)
        frag=re.sub(r'data:image/[^"\\\'\\s)]+','[IMAGE_DATA]',s[a:b])
        frag=re.sub(r'([A-Za-z0-9+/]{200})[A-Za-z0-9+/=]+',r'\\1...[BASE64]',frag)
        out.append(f"POSITION {m.start()} "+frag[:850])
Path("diagnostics").mkdir(exist_ok=True)
Path("diagnostics/home-scene.txt").write_text("\n".join(out),encoding="utf-8")
