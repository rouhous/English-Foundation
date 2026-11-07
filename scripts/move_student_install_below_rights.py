from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf8')
mark='MEJ_STUDENT_INSTALL_BELOW_RIGHTS_20261107'
if mark in s:
 print('ALREADY_PATCHED');raise SystemExit(0)
notice=re.search(r'<div id="mej-student-install-hint" role="note">[^<]+</div>',s)
rights=re.search(r'<div id="mej-owner-rights-notice"[^>]*>[\s\S]*?</div>',s)
assert notice and rights and notice.start()<rights.start(),'Expected original notice above copyright'
notice_html=notice.group(0)
s=s[:notice.start()]+s[notice.end():]
rights=re.search(r'<div id="mej-owner-rights-notice"[^>]*>[\s\S]*?</div>',s)
assert rights
s=s[:rights.end()]+'\n'+notice_html+s[rights.end():]
# Replace existing notice rules with a scrolling section, rather than an overlay.
style_start=s.index('<style id="mej-student-install-hint-style">')
style_end=s.index('</style>',style_start)+len('</style>')
css='''<style id="mej-student-install-hint-style">
/* MEJ_STUDENT_INSTALL_BELOW_RIGHTS_20261107
   Rights remain at the end of the full-screen ocean welcome; install help
   is an ordinary flow section BELOW them, revealed only by scrolling down. */
#mej-student-install-hint{
 display:block!important;
 position:relative!important;
 inset:auto!important;
 transform:none!important;
 z-index:0!important;
 clear:both!important;
 box-sizing:border-box!important;
 width:min(94%,680px)!important;
 flex:0 0 auto!important;
 margin:12px auto 20px!important;
 padding:12px 14px!important;
 border:1px solid #aedaf1!important;
 border-radius:13px!important;
 background:#e6f5ff!important;
 color:#164d75!important;
 text-align:center!important;
 direction:rtl!important;
 font:600 clamp(12px,2.9vw,14px)/1.65 system-ui,Tahoma,Arial,sans-serif!important;
}
body:has(#app .mobile-ocean-v31) {overflow-y:auto!important;height:auto!important;min-height:100dvh!important}
html:has(#app .mobile-ocean-v31) {overflow-y:auto!important}
@media(max-width:480px){#mej-student-install-hint{width:92%!important;margin-top:13px!important;padding:11px 9px!important}}
</style>'''
s=s[:style_start]+css+s[style_end:]
p.write_text(s,encoding='utf8')
assert s.index('id="mej-owner-rights-notice"')<s.index('id="mej-student-install-hint"')
print('INSTALL_HINT_MOVED_BELOW_RIGHTS_IN_SCROLL_FLOW')

# Trigger verified relocation of install help.
