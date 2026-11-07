from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='MEJ_INSTALL_VISIBLE_BETWEEN_START_RIGHTS_20261107'
if marker in s:
 print('ALREADY_UPDATED')
 raise SystemExit(0)
notice=re.search(r'<div id="mej-student-install-hint" role="note">[^<]+</div>',s)
rights=re.search(r'<div id="mej-owner-rights-notice"[^>]*>[\s\S]*?</div>',s)
assert notice and rights and notice.start()>rights.end(),'Expected install hint after rights'
hint=notice.group(0)
s=s[:notice.start()]+s[notice.end():]
rights=re.search(r'<div id="mej-owner-rights-notice"[^>]*>[\s\S]*?</div>',s)
s=s[:rights.start()]+hint+'\n'+s[rights.start():]
# Rework all previous installation hint CSS and reserve footer space in a fixed viewport
# using flex layout, rather than extending the page below its visible boundary.
a=s.index('<style id="mej-student-install-hint-style">')
b=s.index('</style>',a)+len('</style>')
css='''<style id="mej-student-install-hint-style">
/* MEJ_INSTALL_VISIBLE_BETWEEN_START_RIGHTS_20261107
   Three vertical sections within a single viewport on mobile:
   [ocean home and Let\\'s Go] [install note] [copyright].
   Keep every section in normal flow; nothing overlays the rights strip. */
#mej-student-install-hint{
 display:block!important;
 position:relative!important;
 inset:auto!important;
 transform:none!important;
 z-index:1!important;
 box-sizing:border-box!important;
 width:min(96%,680px)!important;
 margin:0 auto 3px!important;
 padding:5px 10px!important;
 border:1px solid #a5d4eb!important;
 border-radius:10px!important;
 background:rgba(231,246,255,.94)!important;
 color:#153e60!important;
 text-align:center!important;
 direction:rtl!important;
 font:600 clamp(11px,2.6vw,13px)/1.4 system-ui,Tahoma,Arial,sans-serif!important;
}
@media(max-width:900px){
 html:has(#app>.mobile-ocean-v31){
  height:100%!important;min-height:0!important;overflow:hidden!important;
 }
 body:has(#app>.mobile-ocean-v31){
  display:flex!important;
  flex-direction:column!important;
  height:100dvh!important;
  min-height:0!important;
  max-height:100dvh!important;
  overflow:hidden!important;
  margin:0!important;
 }
 body:has(#app>.mobile-ocean-v31) > #app{
  flex:1 1 0!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  padding:0!important;
  margin:0!important;
  overflow:hidden!important;
 }
 body:has(#app>.mobile-ocean-v31) #app>.mobile-ocean-v31{
  display:flex!important;
  flex-direction:column!important;
  flex:1 1 auto!important;
  min-height:0!important;
  height:100%!important;
  max-height:100%!important;
  margin:0!important;
  overflow:hidden!important;
 }
 body:has(#app>.mobile-ocean-v31) > #mej-student-install-hint{
  flex:0 0 auto!important;
  width:min(94%,620px)!important;
  margin:2px auto 3px!important;
  padding:4px 8px!important;
  line-height:1.3!important;
 }
 body:has(#app>.mobile-ocean-v31) > #mej-owner-rights-notice{
  flex:0 0 auto!important;
  margin:0!important;
  padding:6px 8px!important;
  font-size:clamp(11px,2.7vw,13px)!important;
  line-height:1.35!important;
 }
}
</style>'''
s=s[:a]+css+s[b:]
p.write_text(s,encoding='utf-8')
assert s.index('id="mej-student-install-hint"')<s.index('id="mej-owner-rights-notice"')
assert marker in s
assert s.count('id="mej-student-install-hint"')==1
print('FIXED_VIEWPORT_INSTALL_NOTE_BETWEEN_START_AND_RIGHTS')

# Trigger validated fixed-height layout migration.
