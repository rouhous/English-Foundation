#!/usr/bin/env python3
"""Show ONE complete voyage image behind functional app controls, with no cropping."""
from pathlib import Path
import re

page=Path("index.html")
html=page.read_text(encoding="utf-8")
marker="MEJ_SINGLE_UNCROPPED_BACKGROUND_OVERLAY_V2"
if marker in html:
    print("Already installed")
    raise SystemExit(0)
assert html.count('class="m31-art"')==1
assert html.count('class="m31-sea"')==1
assert html.count('class="m31-logos"')==1
assert html.count('class="m31-lower"')==1
assert html.count('onclick="letsGo()"')==1
assert Path('assets/home-voyage-original.webp').exists()
# Remove current home-scene override to stop contradictory rules.
html,n=re.subn(r'<style id="mej-home-voyage-bottom-nav-v1">.*?</style>',"",html,flags=re.S)
assert n==1, f"Expected one previous layout style, got {n}"
# Restrict to the homepage only: protect forms, other pages, offline progress.
style=r"""
<style id="mej-single-uncropped-background">
/* MEJ_SINGLE_UNCROPPED_BACKGROUND_OVERLAY_V2.
   Only one scene image, never crop it, never display a separate illustration card. */
@media (max-width:900px){
 html:has(#app .mobile-ocean-v31),
 body:has(#app .mobile-ocean-v31){
   background:#0875c7!important;
   background-image:none!important;
   margin:0!important;
   overflow-x:hidden!important;
 }
 body:has(#app .mobile-ocean-v31){
   display:flex!important;
   flex-direction:column!important;
   min-height:100dvh!important;
 }
 body:has(#app .mobile-ocean-v31) #app.container{
   box-sizing:border-box!important;
   display:flex!important;flex-direction:column!important;
   flex:1 0 auto!important;
   width:100%!important;max-width:100%!important;
   min-height:0!important;margin:0!important;padding:0!important;
   background:transparent!important;background-image:none!important;
 }
 #app>.mobile-ocean-v31{
   display:flex!important;flex-direction:column!important;
   justify-content:flex-start!important;align-items:stretch!important;
   position:relative!important;isolation:isolate!important;
   box-sizing:border-box!important;
   flex:1 0 auto!important;
   width:100%!important;max-width:none!important;
   min-height:max(690px,calc(100dvh - 68px))!important;
   height:auto!important;margin:0!important;
   padding:clamp(6px,1vh,12px) clamp(8px,2.5vw,16px) 8px!important;
   gap:clamp(5px,.9vh,11px)!important;
   overflow:hidden!important;
   border:0!important;border-radius:0!important;box-shadow:none!important;
   background:#0875c7!important;background-image:none!important;
 }
 #app>.mobile-ocean-v31::before,
 #app>.mobile-ocean-v31::after{content:none!important;background-image:none!important}
 /* Keep the ORIGINAL voyage visible from edge to edge of its source.
    Object-fit:contain guarantees no cropped boat, learner, islands or trail. */
 #app .mobile-ocean-v31>.m31-art{
   position:absolute!important;
   inset:0!important;
   display:block!important;
   order:0!important;
   width:100%!important;height:100%!important;
   min-width:0!important;min-height:0!important;
   max-height:none!important;aspect-ratio:auto!important;
   margin:0!important;padding:0!important;
   z-index:0!important;pointer-events:none!important;
   border:0!important;border-radius:0!important;
   box-shadow:none!important;overflow:hidden!important;
   background:#0875c7!important;background-image:none!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-sea{
   position:absolute!important;inset:0!important;
   display:block!important;
   width:100%!important;height:100%!important;
   min-height:0!important;max-height:none!important;max-width:none!important;
   object-fit:contain!important;
   object-position:center center!important;
   margin:0!important;padding:0!important;
   border:0!important;border-radius:0!important;
   visibility:visible!important;opacity:1!important;
   filter:none!important;transform:none!important;
 }
 #app .mobile-ocean-v31>.m31-head{
   display:flex!important;flex-direction:column!important;align-items:center!important;
   position:relative!important;z-index:2!important;
   order:1!important;flex:0 0 auto!important;
   width:100%!important;min-width:0!important;min-height:0!important;
   gap:clamp(3px,.6vh,8px)!important;margin:0!important;padding:0!important;
   background:transparent!important;background-image:none!important;
 }
 #app .mobile-ocean-v31 .m31-logos{
   width:min(100%,550px)!important;height:auto!important;
   max-height:clamp(49px,9vh,98px)!important;
   display:block!important;object-fit:contain!important;
   margin:0 auto!important;
 }
 #app .mobile-ocean-v31 .m31-title{
   font-size:clamp(28px,6.4vw,42px)!important;
   line-height:1.08!important;margin:0!important;
 }
 #app .mobile-ocean-v31 .m31-ar-title{
   font-size:clamp(24px,5.9vw,37px)!important;
   line-height:1.1!important;margin:0!important;
 }
 #app .mobile-ocean-v31 .m31-dept{
   margin:0!important;width:100%!important;
   padding:clamp(5px,.75vh,10px) 7px!important;
   font-size:clamp(13px,3.1vw,18px)!important;
 }
 #app .mobile-ocean-v31 .m31-profile{
   box-sizing:border-box!important;
   width:100%!important;min-height:0!important;
   margin:0!important;padding:clamp(7px,1vh,11px)!important;
 }
 /* Lower the functional start button + navigation to the bottom of the scene. */
 #app .mobile-ocean-v31>.m31-lower{
   display:flex!important;flex-direction:column!important;
   position:relative!important;z-index:3!important;
   order:3!important;flex:0 0 auto!important;
   box-sizing:border-box!important;
   width:100%!important;min-height:0!important;
   margin:auto 0 0!important;padding:0!important;
   gap:clamp(5px,.9vh,10px)!important;
   background:transparent!important;background-image:none!important;
 }
 #app .mobile-ocean-v31 .m31-start{
   box-sizing:border-box!important;
   width:min(80%,400px)!important;max-width:100%!important;
   height:auto!important;min-height:48px!important;
   margin:0 auto!important;padding:6px 10px!important;
   font-size:clamp(23px,5vw,31px)!important;
   line-height:1.1!important;
 }
 #app .mobile-ocean-v31 .m31-start small{
   font-size:clamp(14px,3.4vw,19px)!important;
 }
 #app .mobile-ocean-v31 .m31-compass{
   font-size:clamp(24px,5vw,33px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav{
   display:grid!important;
   grid-template-columns:repeat(5,minmax(0,1fr))!important;
   box-sizing:border-box!important;
   width:100%!important;max-width:100%!important;
   margin:0!important;padding:5px!important;gap:3px!important;
 }
 #app .mobile-ocean-v31 .m31-nav button{
   display:flex!important;flex-direction:column!important;
   align-items:center!important;justify-content:center!important;
   width:100%!important;min-width:0!important;
   min-height:50px!important;
   padding:4px 1px!important;
   font-size:clamp(20px,4.6vw,26px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav button small{
   font-size:clamp(10px,2.5vw,14px)!important;
   line-height:1.2!important;
   white-space:normal!important;
 }
 body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice{
   position:relative!important;z-index:2!important;
   flex:0 0 auto!important;
   width:100%!important;margin:0!important;
   padding:6px 10px calc(7px + env(safe-area-inset-bottom,0px))!important;
   background:#d9ecfa!important;
   font-size:clamp(11px,2.7vw,14px)!important;
   line-height:1.4!important;
 }
}
@media(max-width:900px) and (max-height:730px){
 #app>.mobile-ocean-v31{min-height:calc(100dvh - 60px)!important}
 #app .mobile-ocean-v31 .m31-logos{max-height:7vh!important}
 #app .mobile-ocean-v31 .m31-profile{padding:6px!important}
 #app .mobile-ocean-v31 .m31-start{min-height:42px!important}
 #app .mobile-ocean-v31 .m31-nav button{min-height:44px!important}
}
</style>
"""
assert html.count("</head>")==1
html=html.replace("</head>",style+"</head>",1)
assert html.count(marker)==1
assert html.count('class="m31-sea"')==1
assert html.count('class="m31-logos"')==1
assert html.count('class="m31-nav"')==1
page.write_text(html,encoding="utf-8")
print("UNCROPPED_BACKGROUND_OVERLAY_PUBLISHED")
