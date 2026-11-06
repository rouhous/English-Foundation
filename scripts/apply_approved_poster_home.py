#!/usr/bin/env python3
"""Make the user-approved poster composition the functional app home.

One artwork stretched behind *real* dynamic controls. No duplicated scene box,
no persistent empty cloud panel, and no changes to saved profiles or scores.
"""
from pathlib import Path
import re

file=Path("index.html")
s=file.read_text(encoding="utf-8")
marker="MEJ_APPROVED_POSTER_FULL_SCREEN_LAYOUT_20261106"
if marker in s:
 print("Already installed");raise SystemExit(0)
assert s.count('class="mobile-ocean-v31"')==1
assert s.count('class="m31-sea"')==1
assert s.count('class="m31-art"')==1
assert s.count('class="m31-nav"')==1
assert 'onclick="letsGo()"' in s
assert 'onclick="openJourneySettings()"' in s
assert 'home-voyage-original.webp' in s

# Eliminate the previous fullscreen attempt to avoid contradictory sizing.
s,n=re.subn(r'<style id="mej-portrait-voyage-overlay">.*?</style>',"",s,count=1,flags=re.S)
if n!=1:raise RuntimeError("Expected previous overlay not found")

css=r'''
<style id="mej-poster-functional-home">
/* MEJ_APPROVED_POSTER_FULL_SCREEN_LAYOUT_20261106
   One full-viewport scenic backdrop with functional overlays.
   Target: logos/title atop sky, live student selection upper third;
   live start/nav pinned low over sea, copyright at end of viewport. */
@media(max-width:900px) {
 html:has(#app .mobile-ocean-v31),
 body:has(#app .mobile-ocean-v31) {
   width:100%!important;
   margin:0!important;padding:0!important;
   background:#0677cd!important;background-image:none!important;
   min-height:100%!important;
   overflow-x:hidden!important;
 }
 body:has(#app .mobile-ocean-v31) {
   display:flex!important;flex-direction:column!important;
   min-height:100dvh!important;
 }
 body:has(#app .mobile-ocean-v31) #app.container {
   box-sizing:border-box!important;
   display:flex!important;flex-direction:column!important;
   flex:1 1 auto!important;
   margin:0!important;padding:0!important;
   width:100%!important;max-width:100%!important;
   min-height:0!important;height:auto!important;
   overflow:visible!important;
   background:transparent!important;background-image:none!important;
 }
 #app>.mobile-ocean-v31 {
   box-sizing:border-box!important;
   position:relative!important;isolation:isolate!important;
   display:flex!important;flex-direction:column!important;
   align-items:stretch!important;
   justify-content:space-between!important;
   flex:1 1 auto!important;
   width:100%!important;max-width:100%!important;
   /* Remaining viewport minus two-line rights strip. */
   min-height:max(640px,calc(100dvh - 68px))!important;
   height:auto!important;
   padding:max(5px,env(safe-area-inset-top,0px))
           clamp(9px,2.2vw,15px)
           clamp(6px,.9vh,13px)!important;
   margin:0!important;
   gap:clamp(6px,.8vh,12px)!important;
   overflow:hidden!important;
   border:0!important;border-radius:0!important;
   background:#117ed0!important;background-image:none!important;
   box-shadow:none!important;
 }
 #app>.mobile-ocean-v31::before,#app>.mobile-ocean-v31::after {
   content:none!important;display:none!important;
   background-image:none!important;
 }
 #app>.mobile-ocean-v31>.m31-art {
   position:absolute!important;
   inset:0!important;
   display:block!important;
   order:0!important;
   z-index:0!important;
   width:100%!important;height:100%!important;
   min-height:0!important;max-height:none!important;
   aspect-ratio:auto!important;
   margin:0!important;padding:0!important;
   border:0!important;border-radius:0!important;
   overflow:hidden!important;
   background:none!important;background-image:none!important;
   pointer-events:none!important;
 }
 #app>.mobile-ocean-v31>.m31-art>img.m31-sea {
   position:absolute!important;
   inset:0!important;
   display:block!important;
   width:100%!important;height:100%!important;
   max-width:none!important;max-height:none!important;min-height:0!important;
   /* Keep the entire scene in one frame, no second rectangle. */
   object-fit:fill!important;object-position:center center!important;
   opacity:1!important;visibility:visible!important;
   transform:none!important;filter:none!important;
   background:none!important;border:0!important;
 }
 #app>.mobile-ocean-v31>.m31-head {
   position:relative!important;z-index:3!important;
   display:flex!important;flex-direction:column!important;
   order:1!important;
   align-items:center!important;
   flex:0 0 auto!important;
   box-sizing:border-box!important;
   width:100%!important;min-height:0!important;
   gap:clamp(3px,.65vh,9px)!important;
   margin:0!important;padding:0!important;
   background:none!important;background-image:none!important;
 }
 #app .mobile-ocean-v31 .m31-logos {
   width:min(100%,530px)!important;
   max-height:clamp(52px,9dvh,110px)!important;
   height:auto!important;object-fit:contain!important;
   margin:0 auto!important;
 }
 #app .mobile-ocean-v31 .m31-title {
   font-size:clamp(26px,7vw,45px)!important;
   line-height:1.07!important;margin:0!important;padding:0!important;
 }
 #app .mobile-ocean-v31 .m31-ar-title {
   font-size:clamp(24px,6.3vw,40px)!important;
   line-height:1.07!important;margin:0!important;padding:0!important;
 }
 #app .mobile-ocean-v31 .m31-dept {
   box-sizing:border-box!important;width:100%!important;
   margin:0!important;
   padding:clamp(6px,.85vh,11px) 6px!important;
   font-size:clamp(12px,3.25vw,19px)!important;
   line-height:1.22!important;
   border:2px solid #b8ecff!important;
   background:rgba(0,94,193,.82)!important;
   box-shadow:0 2px 9px #00254c44!important;
 }
 #app .mobile-ocean-v31 .m31-profile {
   box-sizing:border-box!important;
   width:100%!important;
   margin:clamp(4px,.9vh,11px) 0 0!important;
   padding:clamp(8px,1.2vh,13px)!important;
   min-height:0!important;
   border-radius:24px!important;
   background:rgba(234,246,255,.95)!important;
   box-shadow:0 4px 10px #06386133!important;
 }
 #app .mobile-ocean-v31 .m31-profile-copy {min-width:0!important}
 #app>.mobile-ocean-v31>.m31-lower {
   position:relative!important;z-index:3!important;
   order:2!important;flex:0 0 auto!important;
   display:flex!important;flex-direction:column!important;
   align-items:center!important;
   box-sizing:border-box!important;
   width:100%!important;min-height:0!important;
   gap:clamp(5px,1vh,12px)!important;
   margin:auto 0 0!important;padding:0!important;
   background:transparent!important;background-image:none!important;
 }
 #app .mobile-ocean-v31 .m31-start {
   box-sizing:border-box!important;
   display:flex!important;align-items:center!important;justify-content:center!important;
   width:min(79%,430px)!important;max-width:100%!important;
   height:auto!important;min-height:53px!important;
   margin:0 auto!important;
   padding:clamp(6px,.85vh,12px) 10px!important;
   font-size:clamp(22px,5.5vw,33px)!important;
   line-height:1.05!important;
   border-radius:999px!important;
 }
 #app .mobile-ocean-v31 .m31-start small {
   font-size:clamp(15px,3.7vw,22px)!important;line-height:1.05!important;
 }
 #app .mobile-ocean-v31 .m31-compass {
   font-size:clamp(24px,5.5vw,34px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav {
   box-sizing:border-box!important;
   display:grid!important;
   grid-template-columns:repeat(5,minmax(0,1fr))!important;
   align-items:stretch!important;
   width:100%!important;margin:0!important;
   padding:clamp(5px,.85vh,9px)!important;
   gap:clamp(2px,.5vw,6px)!important;
   border-radius:24px!important;
   background:rgba(0,77,170,.9)!important;
   box-shadow:0 3px 10px #002c6044!important;
 }
 #app .mobile-ocean-v31 .m31-nav button {
   box-sizing:border-box!important;
   display:flex!important;flex-direction:column!important;
   align-items:center!important;justify-content:center!important;
   min-width:0!important;width:100%!important;
   min-height:57px!important;
   padding:6px 1px!important;
   font-size:clamp(19px,4.8vw,28px)!important;line-height:1.1!important;
 }
 #app .mobile-ocean-v31 .m31-nav button small {
   display:block!important;
   font-size:clamp(10px,2.7vw,14px)!important;
   line-height:1.2!important;
   text-align:center!important;white-space:normal!important;
 }
 body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice {
   box-sizing:border-box!important;
   position:relative!important;z-index:5!important;
   display:block!important;
   flex:0 0 auto!important;
   margin:0!important;
   width:100%!important;
   padding:clamp(5px,.8vh,9px) 8px
           calc(5px + env(safe-area-inset-bottom,0px))!important;
   font-size:clamp(11px,2.8vw,14px)!important;
   line-height:1.35!important;
   background:rgba(222,242,252,.97)!important;
 }
}
@media(max-width:900px) and (max-height:735px) {
 #app>.mobile-ocean-v31 {
   min-height:max(575px,calc(100dvh - 59px))!important;
   gap:3px!important;
 }
 #app .mobile-ocean-v31 .m31-logos {max-height:7dvh!important}
 #app .mobile-ocean-v31>.m31-head {gap:3px!important}
 #app .mobile-ocean-v31 .m31-profile {padding:6px!important}
 #app .mobile-ocean-v31 .m31-start {min-height:46px!important;padding:4px!important}
 #app .mobile-ocean-v31 .m31-nav button {min-height:49px!important}
}
</style>
'''
assert s.count('</head>')==1
s=s.replace('</head>',css+'</head>',1)
file.write_text(s,encoding='utf-8')
sw=Path('sw.js')
contents=sw.read_text(encoding='utf-8')
new,changed=re.subn(r"const CACHE='[^']+';",
                    "const CACHE='mej-approved-poster-20261106-v1';",
                    contents,count=1)
assert changed==1
sw.write_text(new,encoding='utf-8')
print("APPROVED_POSTER_LAYOUT_INSTALLED")
