from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_SETTINGS_GEAR_BESIDE_START_20261106"
if marker in s:
    raise SystemExit("Already installed")
gear='<button type="button" onclick="openJourneySettings()" aria-label="الإعدادات ومعلومات المزامنة" title="الإعدادات">⚙️</button>'
home_start=s.find('<div class="m31-profile" dir="rtl">')
if home_start<0:raise RuntimeError("Cannot locate home profile")
home_end=s.find('</section>',home_start)
if home_end<0:raise RuntimeError("Cannot locate home section end")
home=s[home_start:home_end]
if home.count(gear)!=1:
    raise RuntimeError(f"Expected one settings gear in active home, found {home.count(gear)}")
home=home.replace(gear,"",1)
lower=re.compile(r'(<div class="m31-lower"><button class="m31-start".*?</button>)(\s*</div>)',re.S)
if len(lower.findall(home))!=1:
    raise RuntimeError("Expected exactly one start area in active home")
home=lower.sub(lambda m:m.group(1)+'<button class="m31-settings-near-start" type="button" onclick="openJourneySettings()" aria-label="الإعدادات ومعلومات المزامنة" title="الإعدادات">⚙️</button>'+m.group(2),home,count=1)
s=s[:home_start]+home+s[home_end:]
style=r"""
<style id="mej-settings-near-start">
/* MEJ_SETTINGS_GEAR_BESIDE_START_20261106 */
@media(max-width:900px){
 #app>.mobile-ocean-v31>.m31-lower{
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:clamp(6px,2vw,12px)!important;
  padding:0 8px!important;
 }
 #app .mobile-ocean-v31 .m31-start{
  flex:0 1 auto!important;
  width:min(67%,340px)!important;
  max-width:calc(100% - 58px)!important;
  min-width:0!important;
  margin:0!important;
 }
 #app .mobile-ocean-v31 .m31-settings-near-start{
  position:relative!important;
  display:flex!important;
  flex:0 0 44px!important;
  align-items:center!important;
  justify-content:center!important;
  width:44px!important;
  height:44px!important;
  min-width:44px!important;
  min-height:44px!important;
  max-width:44px!important;
  padding:3px!important;
  margin:0!important;
  border:1px solid rgba(186,232,255,.94)!important;
  border-radius:50%!important;
  background:rgba(232,247,255,.92)!important;
  color:#174c75!important;
  box-shadow:0 2px 8px rgba(0,49,100,.18)!important;
  font-size:23px!important;
  line-height:1!important;
  z-index:8!important;
 }
}
</style>
"""
if s.count("</head>")!=1:raise RuntimeError("Unexpected head section")
s=s.replace("</head>",style+"</head>",1)
assert s.count(marker)==1
assert s.count("onclick=\"openJourneySettings()\"")>=2
assert s.count("class=\"m31-settings-near-start\"")==1
assert 'onclick="letsGo()"' in s
p.write_text(s,encoding="utf8")
w=Path("sw.js")
worker=w.read_text(encoding="utf8")
worker,n=re.subn(r"const CACHE='[^']+';","const CACHE='mej-gear-beside-start-20261106-v1';",worker,count=1)
if n!=1:raise RuntimeError("Service worker version missing")
w.write_text(worker,encoding="utf8")
print("SETTINGS_GEAR_MOVED_BESIDE_START")
