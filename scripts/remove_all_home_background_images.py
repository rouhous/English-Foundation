#!/usr/bin/env python3
"""Remove all illustrated home backgrounds; fit functional controls on mobile.

Does not touch localStorage keys, remote sync, student records, or saved settings.
Only alters home HTML and app-scoped presentation.
"""
from pathlib import Path
import re

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MEJ_HOME_IMAGE_FREE_PREVIEW_20261106"
if marker in s:
    # Follow-up correction for the already-published CSS override.
    if "width:100%!;" in s:
        s=s.replace("width:100%!;","width:100%!important;",1)
        p.write_text(s,encoding="utf-8")
        print("Corrected existing home width declaration")
    else:
        print("Already applied")
    raise SystemExit(0)

# Permanently remove the scene artwork element from home(), rather than
# leaving it rendered in the background with display:none.
scene=re.compile(r'<div class="m31-art" aria-hidden="true"><img class="m31-sea" src="[^"]+" alt=""\s*/></div>')
matches=list(scene.finditer(s))
if len(matches)!=1:
    raise RuntimeError(f"Expected one home illustration element; found {len(matches)}")
s=scene.sub("",s,count=1)

css=r"""
<style id="mej-image-free-home-preview">
/* MEJ_HOME_IMAGE_FREE_PREVIEW_20261106
   Intentionally no illustrated background until the owner approves a new one. */
html:has(#app .mobile-ocean-v31),
body:has(#app .mobile-ocean-v31),
body:has(#app .mobile-ocean-v31) #app.container{
  background:#086dc1!important;
  background-image:none!important;
}
body:has(#app .mobile-ocean-v31){
  margin:0!important;
  padding:0!important;
  overflow-x:hidden!important;
  overflow-y:auto!important;
}
body:has(#app .mobile-ocean-v31) #app.container{
  display:block!important;
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  min-height:0!important;
  height:auto!important;
  margin:0!important;
  padding:0!important;
  overflow:visible!important;
}
#app>.mobile-ocean-v31{
  display:flex!important;
  flex-direction:column!important;
  justify-content:flex-start!important;
  align-items:stretch!important;
  position:relative!important;
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  height:auto!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:clamp(6px,1vh,12px) 12px clamp(8px,1.2vh,15px)!important;
  gap:clamp(8px,1.5vh,15px)!important;
  overflow:visible!important;
  background:#086dc1!important;
  background-image:none!important;
  border:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
#app>.mobile-ocean-v31::before,
#app>.mobile-ocean-v31::after,
#app .mobile-ocean-v31>.m31-head::before,
#app .mobile-ocean-v31>.m31-head::after,
#app .mobile-ocean-v31>.m31-lower::before,
#app .mobile-ocean-v31>.m31-lower::after{
  content:none!important;
  background-image:none!important;
}
#app .mobile-ocean-v31>.m31-art,
#app .mobile-ocean-v31 .m31-boat-restored,
#app .mobile-ocean-v31 .m31-sea{
  display:none!important;
}
#app .mobile-ocean-v31>.m31-head{
  position:relative!important;
  z-index:2!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  order:1!important;
  width:100%!;
  height:auto!important;
  min-height:0!important;
  flex:0 0 auto!important;
  gap:clamp(4px,.75vh,9px)!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  background-image:none!important;
}
#app .mobile-ocean-v31 .m31-logos{
  display:block!important;
  width:min(100%,550px)!important;
  height:auto!important;
  max-height:clamp(46px,10dvh,105px)!important;
  margin:0 auto!important;
  object-fit:contain!important;
}
#app .mobile-ocean-v31 .m31-title{
  font-size:clamp(26px,6.8vw,44px)!important;
  line-height:1.08!important;
  margin:0!important;
  padding:0!important;
}
#app .mobile-ocean-v31 .m31-ar-title{
  font-size:clamp(25px,6.5vw,41px)!important;
  line-height:1.08!important;
  margin:0!important;
  padding:0!important;
}
#app .mobile-ocean-v31 .m31-dept{
  width:min(100%,600px)!important;
  padding:clamp(7px,1vh,12px) 9px!important;
  margin:0 auto!important;
  font-size:clamp(13px,3.3vw,19px)!important;
  line-height:1.25!important;
}
#app .mobile-ocean-v31 .m31-profile{
  box-sizing:border-box!important;
  display:flex!important;
  flex-wrap:wrap!important;
  align-items:center!important;
  justify-content:center!important;
  gap:clamp(5px,1vw,10px)!important;
  width:100%!important;
  margin:clamp(2px,.35vh,5px) 0 0!important;
  padding:clamp(8px,1.2vh,13px)!important;
  min-height:0!important;
}
#app .mobile-ocean-v31 .m31-profile-copy{
  flex:1 1 100%!important;
  width:100%!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
}
#app .mobile-ocean-v31 .m31-profile select,
#app .mobile-ocean-v31 .m31-profile>button{
  box-sizing:border-box!important;
  min-width:0!important;
  max-width:100%!important;
  min-height:44px!important;
  font-size:clamp(12px,3.2vw,16px)!important;
}
#app .mobile-ocean-v31 .m31-profile select{flex:1 1 48%!important;}
#app .mobile-ocean-v31 .m31-profile>button{flex:1 1 auto!important;}
#app .mobile-ocean-v31 .m31-profile>button[aria-label="الإعدادات ومعلومات المزامنة"]{
  flex:0 0 44px!important;
  width:44px!important;
  min-width:44px!important;
  padding:5px!important;
}
#app .mobile-ocean-v31>.m31-lower{
  position:relative!important;
  z-index:2!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:flex-start!important;
  align-items:stretch!important;
  order:2!important;
  box-sizing:border-box!important;
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  gap:clamp(7px,1.3vh,15px)!important;
  background:transparent!important;
  background-image:none!important;
}
#app .mobile-ocean-v31 .m31-start{
  position:relative!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  box-sizing:border-box!important;
  margin:0 auto!important;
  padding:clamp(9px,1.4vh,16px) 10px!important;
  width:min(100%,480px)!important;
  height:auto!important;
  min-height:58px!important;
  font-size:clamp(23px,5.8vw,35px)!important;
  line-height:1.1!important;
}
#app .mobile-ocean-v31 .m31-nav{
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  align-items:stretch!important;
  justify-items:stretch!important;
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  min-height:0!important;
  margin:0!important;
  padding:clamp(5px,.8vh,8px)!important;
  gap:clamp(2px,.5vw,6px)!important;
}
#app .mobile-ocean-v31 .m31-nav button{
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
  align-items:center!important;
  min-width:0!important;
  min-height:58px!important;
  width:100%!important;
  margin:0!important;
  padding:clamp(5px,.7vh,8px) 1px!important;
  font-size:clamp(19px,4.8vw,25px)!important;
  line-height:1.1!important;
}
#app .mobile-ocean-v31 .m31-nav button small{
  display:block!important;
  font-size:clamp(10px,2.6vw,14px)!important;
  line-height:1.25!important;
  white-space:normal!important;
  word-break:normal!important;
  text-align:center!important;
}
body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice{
  position:relative!important;
  margin:0 auto!important;
  padding:7px 10px 10px!important;
  font-size:clamp(11px,2.7vw,14px)!important;
  line-height:1.35!important;
  width:100%!important;
}
@media(max-width:390px){
 #app>.mobile-ocean-v31{
   padding:4px 7px 6px!important;
   gap:6px!important;
 }
 #app .mobile-ocean-v31>.m31-head{gap:4px!important;}
 #app .mobile-ocean-v31>.m31-lower{gap:6px!important;}
 #app .mobile-ocean-v31 .m31-logos{max-height:8dvh!important;}
 #app .mobile-ocean-v31 .m31-profile{padding:7px!important;}
 #app .mobile-ocean-v31 .m31-nav button{min-height:52px!important;}
}
@media(max-height:680px){
 #app .mobile-ocean-v31 .m31-logos{max-height:7dvh!important;}
 #app .mobile-ocean-v31>.m31-head{gap:3px!important;}
 #app .mobile-ocean-v31 .m31-profile{padding:6px!important;}
 #app .mobile-ocean-v31 .m31-start{min-height:50px!important;padding:6px!important;}
 #app .mobile-ocean-v31 .m31-nav button{min-height:46px!important;}
}
</style>
"""
# Ensure the override comes last in the <head> and its rules win over old CSS.
if s.count("</head>")!=1: raise RuntimeError("No unique head end")
s=s.replace("</head>",css+"</head>",1)
assert s.count(marker)==1
assert 'class="m31-sea"' not in s
assert 'class="m31-logos"' in s
assert "onclick=\"openJourneySettings()\"" in s
assert "onclick=\"letsGo()\"" in s
assert "onclick=\"route('levels')\"" in s
p.write_text(s,encoding="utf-8")
print("IMAGE_FREE_HOME_PREVIEW_APPLIED — no background artwork, controls retained, settings preserved")
