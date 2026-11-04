#!/usr/bin/env python3
"""Fix HOME scene visibility across desktop-mode/mobile browsers. Do not alter student data."""
from pathlib import Path
import re

p=Path("index.html")
s=p.read_text(encoding="utf-8")
assert 'class="m31-sea"' in s, "Existing scene sea image missing"
assert 'class="m31-boat-restored"' in s, "Existing boat art missing"
assert 'class="mobile-ocean-v31"' in s, "Expected homepage component missing"
assert 'class="actual-boat"' in s, "Original artwork reference missing"

start='<style id="mej-home-art-visibility-v2">'
end='</style>'
if start in s:
    s=re.sub(re.escape(start)+r".*?"+re.escape(end),"",s,flags=re.S)

css="""<style id="mej-home-art-visibility-v2">
/* This overrides legacy negative z-index and desktop-only/mobile-only positioning.
   Sea is the rear layer; existing original Omani boat artwork is above it.
   Keep the original card and navigation readable and clickable. */
#app .mobile-ocean-v31{
  position:relative!important;
  isolation:isolate!important;
  overflow:hidden!important;
}
#app .mobile-ocean-v31>.m31-art{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  max-height:none!important;
  aspect-ratio:auto!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  order:0!important;
  overflow:hidden!important;
  display:block!important;
  z-index:0!important;
  pointer-events:none!important;
  background:transparent!important;
}
#app .mobile-ocean-v31>.m31-art>img.m31-sea{
  position:absolute!important;
  inset:0!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  max-height:none!important;
  min-height:0!important;
  opacity:1!important;
  visibility:visible!important;
  object-fit:cover!important;
  object-position:center center!important;
  z-index:0!important;
}
#app .mobile-ocean-v31>.m31-art>img.m31-boat-restored{
  position:absolute!important;
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  inset:auto!important;
  top:57%!important;
  left:7%!important;
  width:86%!important;
  height:34%!important;
  min-height:0!important;
  max-height:none!important;
  object-fit:contain!important;
  object-position:center center!important;
  z-index:2!important;
  transform:none!important;
  filter:drop-shadow(0 12px 12px rgba(0,55,104,.27))!important;
}
#app .mobile-ocean-v31>.m31-head,
#app .mobile-ocean-v31>.m31-lower{
  position:relative!important;
  z-index:3!important;
}
@media (max-width:900px){
 #app .mobile-ocean-v31>.m31-art{
   position:absolute!important;
   inset:0!important;
   width:100%!important;
   height:100%!important;
   aspect-ratio:auto!important;
   margin:0!important;
   border:0!important;
   border-radius:0!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-boat-restored{
   top:59%!important;
   left:1%!important;
   width:98%!important;
   height:32%!important;
 }
}
@media (min-width:901px){
 #app .mobile-ocean-v31>.m31-art>img.m31-boat-restored{
   top:48%!important;
   left:17%!important;
   width:66%!important;
   height:43%!important;
 }
}
</style>"""
if "</head>" not in s:raise RuntimeError("Document head not found")
s=s.replace("</head>",css+"</head>",1)
assert s.count('id="mej-home-art-visibility-v2"')==1
assert s.count('class="m31-boat-restored"')==1
p.write_text(s,encoding="utf-8")
sw=Path("sw.js")
w=sw.read_text(encoding="utf-8")
w2=re.sub(r"const CACHE='[^']+';","const CACHE='english-explorer-2026-home-boat-fix-20261104';",w,count=1)
if w2==w:raise RuntimeError("Could not update offline cache key")
sw.write_text(w2,encoding="utf-8")
print("Home scene visibility CSS applied; image sources and student data unchanged.")
