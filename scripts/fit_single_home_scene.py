#!/usr/bin/env python3
"""Remove duplicate scene image and fit one complete illustration above nav."""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MEJ_SINGLE_SCENE_FIT_VIEWPORT_20261106"
if marker in s:raise SystemExit("Scene patch already applied")
# Keep m31-sea (the main scenery containing the boy/boat/island trail);
# remove only the redundant inset m31-boat-restored image.
pat=r'<img class="m31-boat-restored" src="[^"]+" alt=""\s*/>'
m=list(re.finditer(pat,s))
if len(m)!=1:raise RuntimeError(f"Expected exactly 1 duplicated scene image, found {len(m)}")
s=s[:m[0].start()]+s[m[0].end():]
css=r'''
<style id="mej-single-scene-viewport">
/* MEJ_SINGLE_SCENE_FIT_VIEWPORT_20261106
   Home uses one contained image: boat, learner, and treasure trail visible.
   Older absolute-cover backgrounds are explicitly overridden. */
@media (max-width:900px){
 body:has(#app .mobile-ocean-v31) #app.container{
    min-height:0!important;height:auto!important;overflow:visible!important;
 }
 #app>.mobile-ocean-v31{
    position:relative!important;display:flex!important;flex-direction:column!important;
    justify-content:flex-start!important;align-items:stretch!important;
    height:auto!important;min-height:0!important;
    width:100%!important;max-width:100%!important;
    padding:clamp(3px,0.6vh,7px) 10px 4px!important;
    gap:clamp(3px,.65vh,8px)!important;overflow:visible!important;
 }
 #app .mobile-ocean-v31>.m31-head{
    order:1!important;flex:0 0 auto!important;width:100%!important;
    padding:0!important;gap:clamp(2px,.45vh,5px)!important;
    margin:0!important;
 }
 #app .mobile-ocean-v31 .m31-logos{
    max-height:clamp(48px,9vh,87px)!important;height:auto!important;
 }
 #app .mobile-ocean-v31 .m31-title{
    margin:0!important;line-height:1.06!important;
    font-size:clamp(29px,6.5vw,40px)!important;
 }
 #app .mobile-ocean-v31 .m31-ar-title{
    margin:0!important;line-height:1.04!important;
    font-size:clamp(25px,5.6vw,35px)!important;
 }
 #app .mobile-ocean-v31 .m31-dept{
    margin:0!important;padding:clamp(4px,.55vh,7px) 10px!important;
 }
 #app .mobile-ocean-v31>.m31-art{
    order:2!important;position:relative!important;inset:auto!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    z-index:1!important;flex:0 1 auto!important;
    width:100%!important;height:auto!important;min-height:0!important;
    max-height:clamp(170px,34dvh,380px)!important;
    aspect-ratio:auto!important;margin:0!important;padding:0!important;
    border:0!important;border-radius:0!important;background:none!important;
    box-shadow:none!important;overflow:hidden!important;pointer-events:none!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-sea{
    position:relative!important;inset:auto!important;
    display:block!important;width:100%!important;height:auto!important;
    max-height:clamp(170px,34dvh,380px)!important;min-height:0!important;
    object-fit:contain!important;object-position:center center!important;
    opacity:1!important;transform:none!important;
    border:0!important;border-radius:0!important;filter:none!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-boat-restored{
    display:none!important;
 }
 #app .mobile-ocean-v31>.m31-lower{
    order:3!important;position:relative!important;z-index:3!important;
    flex:0 0 auto!important;width:100%!important;
    margin:0!important;padding:0!important;
    gap:clamp(3px,.6vh,7px)!important;
 }
 #app .mobile-ocean-v31 .m31-start{
    width:min(90%,440px)!important;min-height:48px!important;
    margin:0 auto!important;padding-block:clamp(5px,.7vh,10px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav{
    width:100%!important;margin:0!important;
    padding:clamp(3px,.5vh,6px)!important;
 }
}
@media(max-width:900px) and (max-height:720px){
 #app>.mobile-ocean-v31>.m31-art,
 #app>.mobile-ocean-v31>.m31-art>img.m31-sea{
   max-height:27dvh!important;
 }
}
</style>'''
if "</head>" not in s: raise RuntimeError("No head")
s=s.replace("</head>",css+"</head>",1)
assert s.count(marker)==1
assert 'class="m31-boat-restored"' not in s
assert 'class="m31-sea"' in s
p.write_text(s,encoding="utf-8")
print("SINGLE_CONTAINED_SCENE_WITH_COMPACT_NAV")
