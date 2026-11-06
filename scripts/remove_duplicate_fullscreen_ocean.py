#!/usr/bin/env python3
"""Remove duplicated full-screen artwork at its CSS source; keep one fitted image."""
from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf8')
marker='MEJ_NO_DOUBLE_OCEAN_BACKGROUND_20261106'
if marker in s:raise SystemExit('Already applied')

# Root cause: an earlier .mobile-ocean-v31 rule embeds the same picture as
# a huge full-screen CSS background. A separate img.m31-sea repeats it.
prefix='background:linear-gradient(90deg,rgba(1,69,146,.22),rgba(5,92,176,.03)),url(data:image/webp;base64,'
matches=list(re.finditer(re.escape(prefix)+r'[A-Za-z0-9+/=]+\)[^;}]*;',s))
if len(matches)!=1:
 raise RuntimeError(f'Expected one fullscreen embedded ocean background, got {len(matches)}')
m=matches[0]
s=s[:m.start()]+'background:linear-gradient(180deg,#1687da 0%,#0064b9 65%,#034799 100%)!important;'+s[m.end():]

# The standalone art is the ONLY visual: no background overlay or crop.
css=r'''
<style id="mej-final-no-double-ocean">
/* MEJ_NO_DOUBLE_OCEAN_BACKGROUND_20261106 */
@media(max-width:900px){
 html:has(#app .mobile-ocean-v31),body:has(#app .mobile-ocean-v31){
   height:auto!important;min-height:100%!important;
   background:#086fc4!important;background-image:none!important;
 }
 body:has(#app .mobile-ocean-v31) #app.container{
   min-height:0!important;height:auto!important;padding:0!important;
 }
 #app>.mobile-ocean-v31{
   background:linear-gradient(180deg,#178cdb 0%,#086dc6 58%,#03499e 100%)!important;
   background-image:linear-gradient(180deg,#178cdb,#03499e)!important;
   display:flex!important;flex-direction:column!important;
   min-height:0!important;height:auto!important;
   justify-content:flex-start!important;
   gap:clamp(3px,.55vh,7px)!important;
   padding:3px 10px 8px!important;
   overflow:visible!important;
 }
 #app .mobile-ocean-v31>.m31-art{
   position:relative!important;inset:auto!important;
   order:2!important;width:100%!important;max-width:100%!important;
   height:auto!important;max-height:28dvh!important;min-height:0!important;
   aspect-ratio:auto!important;overflow:visible!important;
   background:transparent!important;background-image:none!important;
   margin:0!important;padding:0!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-sea{
   display:block!important;position:relative!important;inset:auto!important;
   width:100%!important;height:auto!important;max-height:28dvh!important;
   object-fit:contain!important;object-position:center!important;
   background:transparent!important;
   opacity:1!important;
 }
 #app .mobile-ocean-v31>.m31-head{
   order:1!important;margin:0!important;padding:0!important;gap:4px!important;
 }
 #app .mobile-ocean-v31>.m31-lower{
   order:3!important;margin:0!important;padding:0!important;
   gap:4px!important;
 }
 #app .mobile-ocean-v31 .m31-start{
   margin:0 auto!important;min-height:48px!important;padding:4px 8px!important;
 }
 #app .mobile-ocean-v31 .m31-nav{
   margin:0!important;padding:4px!important;
 }
}
@media(max-width:900px) and (max-height:690px){
 #app .mobile-ocean-v31>.m31-art,
 #app .mobile-ocean-v31>.m31-art>img.m31-sea{max-height:23dvh!important}
}
</style>'''
assert '</head>' in s
s=s.replace('</head>',css+'</head>',1)
assert marker in s and s.count(marker)==1
assert 'class="m31-sea"' in s
assert 'class="m31-boat-restored"' not in s
assert prefix not in s
p.write_text(s,encoding='utf8')
print('Removed embedded full-screen duplicated sea background and kept contained illustration only.')
