from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_PROFILE_BUTTON_STATIC_ALIGN_V2_20261106"
if marker in s:raise SystemExit("Already fixed")
css=r'''
<style id="mej-static-user-profile-row">
/* MEJ_PROFILE_BUTTON_STATIC_ALIGN_V2_20261106 */
@media(max-width:900px){
 #app>.mobile-ocean-v31>.m31-head>.m31-profile{
   position:relative!important;
   display:grid!important;
   grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)!important;
   grid-auto-flow:row!important;
   align-items:center!important;
   justify-items:stretch!important;
   gap:6px!important;
   height:auto!important;
   min-height:0!important;
   margin:4px auto 0!important;
   padding:4px!important;
   overflow:visible!important;
 }
 #app>.mobile-ocean-v31>.m31-head>.m31-profile>select{
   position:static!important;inset:auto!important;
   top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;
   transform:none!important;float:none!important;
   grid-column:1!important;grid-row:1!important;
   width:100%!important;height:44px!important;min-height:44px!important;
   margin:0!important;padding:5px 7px!important;
 }
 #app>.mobile-ocean-v31>.m31-head>.m31-profile>button[onclick="openProfile(true)"]{
   position:static!important;inset:auto!important;
   top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;
   transform:none!important;float:none!important;
   grid-column:2!important;grid-row:1!important;
   justify-self:stretch!important;align-self:center!important;
   width:100%!important;height:44px!important;min-height:44px!important;
   max-width:none!important;
   margin:0!important;padding:5px 4px!important;
   z-index:auto!important;
 }
}
</style>
'''
assert s.count("</head>")==1
s=s.replace("</head>",css+"</head>",1)
assert s.count(marker)==1
assert 'onclick="openProfile(true)"' in s
assert 'onclick="letsGo()"' in s
p.write_text(s,encoding="utf8")
w=Path("sw.js");a=w.read_text(encoding="utf8")
a,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-user-profile-static-align-v2-20261106';",a,count=1)
assert n==1
w.write_text(a,encoding="utf8")
print("PROFILE_USER_CONTROLS_NOW_STATIC_GRID_ROW")
