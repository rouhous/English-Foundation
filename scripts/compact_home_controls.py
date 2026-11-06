from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf8")
mark="MEJ_COMPACT_HOME_CONTROLS_20261106"
if mark in s:raise SystemExit(0)
pattern=r'<div class="m31-profile-copy"><span aria-hidden="true">👨🏻‍🎓</span><div>المستخدم الحالي<small>.*?</small></div></div>'
s,n=re.subn(pattern,'',s,count=1,flags=re.S)
if n!=1:raise RuntimeError("Old student avatar block not found")
s,n=re.subn(r'<select aria-label="اختيار الطالب"','<select aria-label="المستخدم الحالي"',s,count=1)
if n!=1:raise RuntimeError("Current user selector missing")
old='onclick="openProfile(true)">＋ مستخدم جديد</button>'
if s.count(old)!=1:raise RuntimeError("New user button missing")
s=s.replace(old,'onclick="openProfile(true)">＋ إضافة مستخدم</button>',1)
css=r'''
<style id="mej-compact-controls-final">
/* MEJ_COMPACT_HOME_CONTROLS_20261106 */
@media(max-width:900px){
 #app .mobile-ocean-v31 .m31-profile{
   display:grid!important;grid-template-columns:1.1fr .9fr!important;
   gap:6px!important;align-items:center!important;
   box-sizing:border-box!important;width:min(92%,470px)!important;
   margin:4px auto 0!important;padding:4px!important;
   min-height:0!important;background:transparent!important;
   border:0!important;border-radius:12px!important;box-shadow:none!important;
 }
 #app .mobile-ocean-v31 .m31-profile>select{
   box-sizing:border-box!important;
   grid-column:1!important;grid-row:1!important;
   width:100%!important;min-width:0!important;max-width:100%!important;
   height:44px!important;min-height:44px!important;
   padding:5px 7px!important;border-radius:12px!important;
   border:1px solid #b8e7ff!important;
   background:rgba(239,248,255,.91)!important;
   color:#15456e!important;
   font-size:clamp(12px,3.3vw,15px)!important;
   text-align:center!important;
 }
 #app .mobile-ocean-v31 .m31-profile>button[onclick="openProfile(true)"]{
   box-sizing:border-box!important;grid-column:2!important;grid-row:1!important;
   width:100%!important;min-width:0!important;max-width:100%!important;
   height:44px!important;min-height:44px!important;
   margin:0!important;padding:5px!important;
   border:1px solid #b8e7ff!important;border-radius:12px!important;
   background:rgba(239,248,255,.91)!important;
   color:#15456e!important;
   font-size:clamp(12px,3vw,15px)!important;font-weight:800!important;
   white-space:normal!important;
 }
 #app .mobile-ocean-v31 .m31-profile>button[onclick="openJourneySettings()"]{
   position:fixed!important;right:9px!important;
   top:calc(env(safe-area-inset-top,0px) + 8px)!important;
   z-index:12!important;grid-column:auto!important;grid-row:auto!important;
   width:42px!important;min-width:42px!important;
   height:42px!important;min-height:42px!important;
   margin:0!important;padding:3px!important;
   border-radius:50%!important;
   background:rgba(232,247,255,.92)!important;
   font-size:21px!important;
 }
 #app .mobile-ocean-v31 .m31-profile-copy{display:none!important}
 #app>.mobile-ocean-v31>.m31-lower{
   position:absolute!important;left:0!important;right:0!important;
   bottom:clamp(115px,17dvh,175px)!important;
   margin:0!important;padding:0 8px!important;
   width:100%!important;box-sizing:border-box!important;
   z-index:5!important;
 }
 #app .mobile-ocean-v31 .m31-start{
   width:min(67%,350px)!important;
   min-height:45px!important;height:auto!important;
   padding:5px 8px!important;margin:0 auto!important;
   font-size:clamp(19px,4.7vw,27px)!important;
 }
 #app .mobile-ocean-v31 .m31-start small{font-size:clamp(13px,3.2vw,18px)!important}
 #app .mobile-ocean-v31 .m31-compass{font-size:clamp(20px,4.5vw,28px)!important}
 body:has(#app>.mobile-ocean-v31) #mej-owner-rights-notice{
   display:block!important;position:fixed!important;
   left:50%!important;bottom:clamp(15px,3.8dvh,42px)!important;
   transform:translateX(-50%)!important;z-index:15!important;
   width:calc(100% - 22px)!important;max-width:560px!important;
   min-height:0!important;margin:0!important;padding:6px!important;
   border:1px solid #a6dbfcaa!important;border-radius:11px!important;
   background:rgba(4,55,119,.78)!important;
   color:white!important;font-size:clamp(10px,2.65vw,13px)!important;
   line-height:1.22!important;box-shadow:none!important;
 }
 body:has(#app>.mobile-ocean-v31) #mej-owner-rights-notice *{color:#fff!important}
}
@media(max-width:900px) and (max-height:710px){
 #app>.mobile-ocean-v31>.m31-lower{bottom:105px!important}
 body:has(#app>.mobile-ocean-v31) #mej-owner-rights-notice{bottom:10px!important}
}
</style>
'''
s=s.replace('</head>',css+'</head>',1)
assert s.count(mark)==1
assert 'onclick="letsGo()"' in s
assert 'onclick="openProfile(true)"' in s
assert 'onclick="openJourneySettings()"' in s
p.write_text(s,encoding="utf8")
w=Path("sw.js");v=w.read_text(encoding="utf8")
v,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-compact-home-20261106-v1';",v,count=1)
if n!=1:raise RuntimeError("Worker cache missing")
w.write_text(v,encoding="utf8")
print("COMPACT_HOME_CONTROLS_INSTALLED")
