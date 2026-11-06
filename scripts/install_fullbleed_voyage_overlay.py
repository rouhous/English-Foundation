#!/usr/bin/env python3
"""Put functional app controls over one full-height voyage scene.

The former scene was a separate flex item: that produced a large cloud block
between the student header and footer. This changes ONLY home presentation,
keeping all student state, progress, identity, offline settings, and actions.
"""
from pathlib import Path
import re

index=Path("index.html")
doc=index.read_text(encoding="utf-8")
marker="MEJ_FULLBLEED_VOYAGE_FUNCTIONAL_OVERLAY_20261106"
if marker in doc:
    print("Already applied")
    raise SystemExit(0)
assert doc.count('class="mobile-ocean-v31"')==1
assert doc.count('class="m31-sea"')==1
assert doc.count('class="m31-logos"')==1
assert doc.count('class="m31-nav"')==1
assert 'home-voyage-original.webp' in doc
assert Path("assets/home-voyage-original.webp").is_file()
assert Path("assets/home-voyage-original.webp").stat().st_size>4000
# Remove the immediately preceding rigid-size layout, so a single authoritative
# set of home rules controls the composition.
old_id="mej-home-voyage-bottom-nav-v1"
doc,removed=re.subn(
    r'<style id="'+re.escape(old_id)+r'">.*?</style>',
    "",
    doc,
    count=1,
    flags=re.S
)
if removed!=1:raise RuntimeError("Prior home layout not found; aborting safely")
css=r'''
<style id="mej-portrait-voyage-overlay">
/* MEJ_FULLBLEED_VOYAGE_FUNCTIONAL_OVERLAY_20261106
   One real image, full viewport, interactive live HTML on top.
   Exact original art remains available in assets/home-voyage-original.webp. */
@media (max-width:900px) {
  html:has(#app .mobile-ocean-v31),
  body:has(#app .mobile-ocean-v31) {
    margin:0!important;
    padding:0!important;
    width:100%!important;
    min-height:100%!important;
    overflow-x:hidden!important;
    background:#076bc5!important;
    background-image:none!important;
  }
  body:has(#app .mobile-ocean-v31) {
    display:flex!important;
    flex-direction:column!important;
    min-height:100dvh!important;
  }
  body:has(#app .mobile-ocean-v31) #app.container {
    display:flex!important;
    flex-direction:column!important;
    flex:1 0 auto!important;
    box-sizing:border-box!important;
    min-height:0!important;
    height:auto!important;
    max-width:100%!important;
    width:100%!important;
    margin:0!important;
    padding:0!important;
    overflow:visible!important;
    background:transparent!important;
    background-image:none!important;
  }
  #app>.mobile-ocean-v31 {
    display:flex!important;
    position:relative!important;
    isolation:isolate!important;
    flex-direction:column!important;
    align-items:stretch!important;
    justify-content:space-between!important;
    flex:1 0 auto!important;
    box-sizing:border-box!important;
    margin:0!important;
    padding:clamp(4px,.8vh,10px) clamp(8px,2vw,14px) clamp(6px,.8vh,10px)!important;
    width:100%!important;
    max-width:100%!important;
    min-height:calc(100dvh - 72px)!important;
    height:auto!important;
    gap:clamp(5px,.9vh,10px)!important;
    border:0!important;
    border-radius:0!important;
    box-shadow:none!important;
    overflow:hidden!important;
    background:transparent!important;
    background-image:none!important;
  }
  #app>.mobile-ocean-v31::before,
  #app>.mobile-ocean-v31::after,
  #app .mobile-ocean-v31>.m31-art::before,
  #app .mobile-ocean-v31>.m31-art::after{
    content:none!important;
    display:none!important;
  }
  #app>.mobile-ocean-v31>.m31-art {
    display:block!important;
    position:absolute!important;
    inset:0!important;
    top:0!important;right:0!important;bottom:0!important;left:0!important;
    order:0!important;
    width:100%!important;
    height:100%!important;
    max-width:none!important;
    max-height:none!important;
    min-height:0!important;
    margin:0!important;
    padding:0!important;
    aspect-ratio:auto!important;
    border:0!important;
    border-radius:0!important;
    box-shadow:none!important;
    background:transparent!important;
    background-image:none!important;
    overflow:hidden!important;
    pointer-events:none!important;
    z-index:0!important;
  }
  #app>.mobile-ocean-v31>.m31-art>img.m31-sea {
    display:block!important;
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    max-width:none!important;
    max-height:none!important;
    min-height:0!important;
    /* Contain all of the boy, Oman boat and island trail. */
    object-fit:fill!important;
    object-position:center center!important;
    opacity:1!important;
    visibility:visible!important;
    filter:none!important;
    transform:none!important;
    border:0!important;
    border-radius:0!important;
  }
  #app>.mobile-ocean-v31>.m31-head {
    display:flex!important;
    position:relative!important;
    flex-direction:column!important;
    align-items:center!important;
    flex:0 0 auto!important;
    order:1!important;
    z-index:3!important;
    width:100%!important;
    min-height:0!important;
    gap:clamp(3px,.55vh,7px)!important;
    margin:0!important;
    padding:0!important;
    background:transparent!important;
    background-image:none!important;
  }
  #app .mobile-ocean-v31 .m31-logos {
    display:block!important;
    width:min(100%,530px)!important;
    height:auto!important;
    max-height:clamp(54px,8dvh,94px)!important;
    margin:0 auto!important;
    object-fit:contain!important;
  }
  #app .mobile-ocean-v31 .m31-title {
    font-size:clamp(28px,6.7vw,43px)!important;
    line-height:1.08!important;
    margin:0!important;
    padding:0!important;
  }
  #app .mobile-ocean-v31 .m31-ar-title {
    font-size:clamp(24px,6vw,38px)!important;
    line-height:1.06!important;
    margin:0!important;
    padding:0!important;
  }
  #app .mobile-ocean-v31 .m31-dept {
    box-sizing:border-box!important;
    width:100%!important;
    margin:0!important;
    padding:clamp(5px,.7vh,9px) 8px!important;
    font-size:clamp(13px,3.2vw,18px)!important;
    line-height:1.25!important;
    background:rgba(0,99,188,.88)!important;
  }
  #app .mobile-ocean-v31 .m31-profile {
    box-sizing:border-box!important;
    width:100%!important;
    margin:clamp(4px,.7vh,9px) 0 0!important;
    padding:clamp(7px,1.1vh,13px)!important;
    min-height:0!important;
    background:rgba(233,248,255,.95)!important;
  }
  #app>.mobile-ocean-v31>.m31-lower {
    display:flex!important;
    flex-direction:column!important;
    position:relative!important;
    order:2!important;
    z-index:3!important;
    flex:0 0 auto!important;
    width:100%!important;
    margin:auto 0 0!important;
    padding:0!important;
    gap:clamp(5px,.85vh,10px)!important;
    background:transparent!important;
  }
  #app .mobile-ocean-v31 .m31-start {
    box-sizing:border-box!important;
    width:min(81%,420px)!important;
    height:auto!important;
    min-height:48px!important;
    margin:0 auto!important;
    padding:clamp(5px,.8vh,10px) 10px!important;
    font-size:clamp(21px,5vw,29px)!important;
    line-height:1.07!important;
  }
  #app .mobile-ocean-v31 .m31-start small {
    font-size:clamp(14px,3.5vw,19px)!important;
    line-height:1.12!important;
  }
  #app .mobile-ocean-v31 .m31-compass {
    font-size:clamp(24px,5vw,32px)!important;
  }
  #app .mobile-ocean-v31 .m31-nav {
    display:grid!important;
    grid-template-columns:repeat(5,minmax(0,1fr))!important;
    width:100%!important;
    box-sizing:border-box!important;
    margin:0!important;
    padding:clamp(4px,.7vh,8px)!important;
    gap:clamp(2px,.5vw,5px)!important;
    background:rgba(0,79,164,.88)!important;
  }
  #app .mobile-ocean-v31 .m31-nav button {
    display:flex!important;
    flex-direction:column!important;
    justify-content:center!important;
    align-items:center!important;
    box-sizing:border-box!important;
    min-width:0!important;
    min-height:51px!important;
    margin:0!important;
    padding:4px 1px!important;
    font-size:clamp(19px,4.6vw,25px)!important;
    line-height:1.1!important;
  }
  #app .mobile-ocean-v31 .m31-nav button small {
    font-size:clamp(10px,2.7vw,14px)!important;
    line-height:1.22!important;
    white-space:normal!important;
    text-align:center!important;
  }
  body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice {
    display:block!important;
    position:relative!important;
    z-index:4!important;
    box-sizing:border-box!important;
    flex:0 0 auto!important;
    width:100%!important;
    margin:0!important;
    padding:clamp(5px,.7vh,8px) 8px calc(6px + env(safe-area-inset-bottom,0px))!important;
    line-height:1.35!important;
    font-size:clamp(11px,2.7vw,14px)!important;
    color:#153961!important;
    background:rgba(228,244,255,.95)!important;
  }
}
@media(max-width:900px) and (max-height:700px) {
  #app>.mobile-ocean-v31 {
    min-height:calc(100dvh - 61px)!important;
    gap:3px!important;
  }
  #app .mobile-ocean-v31 .m31-logos {max-height:6.5dvh!important}
  #app .mobile-ocean-v31>.m31-head {gap:3px!important}
  #app .mobile-ocean-v31 .m31-profile {padding:5px!important}
  #app .mobile-ocean-v31 .m31-start {min-height:42px!important;padding:3px!important}
  #app .mobile-ocean-v31 .m31-nav button {min-height:45px!important}
}
</style>
'''
assert doc.count('</head>')==1
doc=doc.replace('</head>',css+'</head>',1)
index.write_text(doc,encoding="utf-8")

# Invalidate old PWA shells without touching local progress or IndexedDB.
worker=Path("sw.js")
sw=worker.read_text(encoding="utf-8")
sw_new,n=re.subn(
  r"const CACHE='[^']+';",
  "const CACHE='mej-voyage-fullbleed-functional-overlay-20261106-v1';",
  sw,count=1
)
if n!=1:raise RuntimeError("Cannot update service-worker revision")
worker.write_text(sw_new,encoding="utf-8")
print("FULLBLEED_VOYAGE_OVERLAY_READY: one image, interactive controls, no scene panel")
