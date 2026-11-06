#!/usr/bin/env python3
"""Remove redundant home navigation and lower/resize Let's Go over the sea.

Home-only layout: other page navigation, stars, student records, Supabase,
offline settings and teacher login code remain unchanged.
"""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_HOME_START_REPLACES_NAV_SEA_EXTENSION_20261106"
if marker in s: raise SystemExit("already applied")
# Remove navigation only from the home() template; route() and all non-home pages stay.
nav=r'<nav class="m31-nav" aria-label="أقسام البرنامج" dir="rtl">.*?</nav>'
matches=list(re.finditer(nav,s,re.S))
if len(matches)!=1:raise RuntimeError(f'Expected one home-only nav, found {len(matches)}')
s=s[:matches[0].start()]+s[matches[0].end():]

# The old poster CSS occupies the image width/height with a start and nav.
# Set an explicit no-nav single bottom-button treatment, plus more water visible.
style=r"""
<style id="mej-home-one-start-sea-extension">
/* MEJ_HOME_START_REPLACES_NAV_SEA_EXTENSION_20261106 */
@media(max-width:900px) {
 #app>.mobile-ocean-v31 {
   /* Image remains one continuous scene, no separate photo panel. */
   min-height:max(590px,calc(100dvh - 60px))!important;
   padding-bottom:clamp(9px,1.3vh,15px)!important;
   gap:clamp(4px,.7vh,9px)!important;
   background:#087dca!important;
 }
 #app>.mobile-ocean-v31>.m31-art{
   height:100%!important;
   min-height:0!important;
   max-height:none!important;
   background:linear-gradient(to bottom,#138ae1 0%,#0673c7 68%,#064a99 100%)!important;
 }
 #app>.mobile-ocean-v31>.m31-art>img.m31-sea{
   width:100%!important;
   height:100%!important;
   max-height:100%!important;
   object-fit:fill!important;
   object-position:center bottom!important;
 }
 #app>.mobile-ocean-v31>.m31-lower{
   position:relative!important;
   order:2!important;
   margin:auto 0 0!important;
   padding:0 0 clamp(2px,.4vh,6px)!important;
   gap:0!important;
   display:flex!important;
   flex:0 0 auto!important;
   flex-direction:column!important;
   justify-content:flex-end!important;
   align-items:center!important;
   background:transparent!important;
 }
 #app .mobile-ocean-v31 .m31-start{
   width:min(75%,390px)!important;
   min-height:48px!important;
   height:auto!important;
   padding:clamp(5px,.8vh,10px) 9px!important;
   margin:0 auto!important;
   font-size:clamp(21px,5.1vw,30px)!important;
   line-height:1.05!important;
 }
 #app .mobile-ocean-v31 .m31-start small{
   font-size:clamp(14px,3.5vw,19px)!important;
 }
 #app .mobile-ocean-v31 .m31-compass{
   font-size:clamp(22px,5.1vw,30px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav{
   display:none!important;
 }
 body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice{
   margin:0!important;
   padding:clamp(5px,.7vh,8px) 8px calc(5px + env(safe-area-inset-bottom,0px))!important;
 }
}
@media(max-width:900px) and (max-height:740px){
 #app>.mobile-ocean-v31{min-height:max(530px,calc(100dvh - 58px))!important}
 #app .mobile-ocean-v31 .m31-start{
   width:min(72%,365px)!important;min-height:43px!important;padding:4px 8px!important
 }
}
</style>
"""
assert s.count("</head>")==1
s=s.replace("</head>",style+"</head>",1)
assert s.count(marker)==1
assert 'class="m31-nav"' not in s
assert 'class="m31-start"' in s and 'onclick="letsGo()"' in s
p.write_text(s,encoding="utf8")
sw=Path("sw.js")
w=sw.read_text(encoding="utf8")
w,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-home-start-only-extended-sea-20261106-v1';",w,count=1)
if n!=1:raise RuntimeError("Unexpected worker cache definition")
sw.write_text(w,encoding="utf8")
print("HOME_ONLY_START_BUTTON, NO_HOME_NAV, MORE_SEA_VISIBLE")
