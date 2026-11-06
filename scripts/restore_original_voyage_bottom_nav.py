#!/usr/bin/env python3
"""Restore original scene once, center it, lower navigation and anchor copyright.
Presentation only: no edits to student data, settings or authentication.
"""
from pathlib import Path
import base64,re,subprocess
root=Path('.')
p=root/'index.html'
s=p.read_text(encoding='utf8')
marker='MEJ_ORIGINAL_VOYAGE_FITTED_BOTTOM_NAV_20261106'
if marker in s:
 print('Already installed');raise SystemExit(0)
old=subprocess.check_output(['git','show','47ab81c20daccb2f536879c4e69c5366375ea955:index.html'],text=True,encoding='utf8')
source=re.compile(r'<div class="m31-art" aria-hidden="true"><img class="m31-sea" src="data:image/(webp|png|jpeg);base64,([^"]+)" alt=""\s*/></div>')
found=source.findall(old)
if len(found)!=1:raise RuntimeError('Original scene cannot be identified uniquely: '+str(len(found)))
kind,encoded=found[0]
ext='jpg' if kind=='jpeg' else kind
asset=root/'assets'/('home-voyage-original.'+ext)
data=base64.b64decode(encoded,validate=True)
if len(data)<4000:raise RuntimeError('Original artwork unexpectedly small')
asset.write_bytes(data)
print('Original scene restored:',asset,len(data),'bytes')

# Delete outdated image-free and other conflicting rules for home presentation.
for style_id in ('mej-image-free-home-preview','mej-final-no-double-ocean',
                 'mej-single-scene-viewport','mej-home-art-visibility-v2',
                 'mej-home-mobile-viewport-v1'):
 s,n=re.subn(r'<style id="'+re.escape(style_id)+r'">.*?</style>','',s,flags=re.S)
 print('obsolete style removed',style_id,n)

anchor='<div class="m31-lower"><button class="m31-start"'
if s.count(anchor)!=1:raise RuntimeError('Cannot locate home controls uniquely')
image_element='<div class="m31-art" aria-hidden="true"><img class="m31-sea" src="./'+asset.as_posix()+'" alt="" loading="eager" decoding="async" /></div>\n '
s=s.replace(anchor,image_element+anchor,1)

style=r"""
<style id="mej-home-voyage-bottom-nav-v1">
/* MEJ_ORIGINAL_VOYAGE_FITTED_BOTTOM_NAV_20261106 */
@media(max-width:900px){
 html:has(#app .mobile-ocean-v31),
 body:has(#app .mobile-ocean-v31){
  min-height:100%!important;
  height:auto!important;
  background:#076dbd!important;
  background-image:none!important;
 }
 body:has(#app .mobile-ocean-v31){
  display:flex!important;flex-direction:column!important;
  margin:0!important;padding:0!important;overflow-x:hidden!important;
  min-height:100dvh!important;
 }
 body:has(#app .mobile-ocean-v31) #app.container{
  display:flex!important;flex-direction:column!important;
  flex:1 0 auto!important;
  box-sizing:border-box!important;
  width:100%!important;max-width:100%!important;
  min-height:0!important;height:auto!important;
  margin:0!important;padding:0!important;
  background:#076dbd!important;background-image:none!important;
 }
 #app>.mobile-ocean-v31{
  display:flex!important;
  flex-direction:column!important;
  justify-content:flex-start!important;
  align-items:stretch!important;
  position:relative!important;isolation:isolate!important;
  box-sizing:border-box!important;
  width:100%!important;max-width:100%!important;
  min-height:calc(100dvh - 74px)!important;height:auto!important;
  flex:1 0 auto!important;
  margin:0 auto!important;
  padding:clamp(5px,1vh,12px) 10px clamp(4px,.8vh,10px)!important;
  gap:clamp(4px,.7vh,9px)!important;
  background:linear-gradient(180deg,#0a86d9,#0768b7)!important;
  background-image:linear-gradient(180deg,#0a86d9,#0768b7)!important;
  overflow:hidden!important;border:0!important;border-radius:0!important;
 }
 #app .mobile-ocean-v31::before,
 #app .mobile-ocean-v31::after{
  content:none!important;
  background-image:none!important;
 }
 #app .mobile-ocean-v31>.m31-head{
  position:relative!important;z-index:3!important;
  display:flex!important;flex-direction:column!important;
  align-items:center!important;
  order:1!important;flex:0 0 auto!important;
  width:100%!important;min-height:0!important;
  margin:0!important;padding:0!important;
  gap:clamp(3px,.6vh,7px)!important;
  background:transparent!important;background-image:none!important;
 }
 #app .mobile-ocean-v31 .m31-logos{
  height:auto!important;max-height:clamp(48px,9dvh,105px)!important;
  width:min(100%,550px)!important;
  object-fit:contain!important;margin:0 auto!important;
 }
 #app .mobile-ocean-v31 .m31-title{
  margin:0!important;padding:0!important;
  font-size:clamp(28px,6.7vw,43px)!important;line-height:1.05!important;
 }
 #app .mobile-ocean-v31 .m31-ar-title{
  margin:0!important;padding:0!important;
  font-size:clamp(24px,6.2vw,38px)!important;line-height:1.08!important;
 }
 #app .mobile-ocean-v31 .m31-dept{
  width:100%!important;margin:0!important;
  padding:clamp(5px,.8vh,9px) 7px!important;
  font-size:clamp(13px,3.2vw,18px)!important;
 }
 #app .mobile-ocean-v31 .m31-profile{
  width:100%!important;min-height:0!important;
  margin:0!important;padding:clamp(7px,1.1vh,12px)!important;
 }
 #app .mobile-ocean-v31>.m31-art{
  position:relative!important;inset:auto!important;z-index:1!important;
  order:2!important;
  display:flex!important;justify-content:center!important;align-items:center!important;
  flex:1 1 auto!important;
  width:100%!important;max-width:100%!important;
  min-height:clamp(135px,19dvh,225px)!important;height:auto!important;
  max-height:none!important;
  aspect-ratio:auto!important;
  margin:0!important;padding:0!important;
  border:0!important;border-radius:0!important;
  background:transparent!important;background-image:none!important;
  overflow:hidden!important;pointer-events:none!important;
 }
 #app .mobile-ocean-v31>.m31-art>img.m31-sea{
  display:block!important;position:relative!important;inset:auto!important;
  width:100%!important;height:100%!important;
  min-height:0!important;max-height:100%!important;
  object-fit:contain!important;object-position:center center!important;
  opacity:1!important;visibility:visible!important;
  border:0!important;border-radius:0!important;
  background:none!important;
  transform:none!important;filter:none!important;
 }
 #app .mobile-ocean-v31>.m31-lower{
  position:relative!important;z-index:3!important;order:3!important;
  display:flex!important;flex-direction:column!important;
  flex:0 0 auto!important;width:100%!important;
  margin:0!important;padding:0!important;
  gap:clamp(4px,.8vh,9px)!important;
  background:transparent!important;
 }
 #app .mobile-ocean-v31 .m31-start{
  display:flex!important;align-items:center!important;justify-content:center!important;
  width:min(85%,410px)!important;max-width:100%!important;
  min-height:46px!important;height:auto!important;
  padding:clamp(5px,.9vh,10px) 10px!important;margin:0 auto!important;
  font-size:clamp(22px,5vw,30px)!important;
  line-height:1.08!important;
 }
 #app .mobile-ocean-v31 .m31-start small{
  font-size:clamp(15px,3.5vw,20px)!important;
 }
 #app .mobile-ocean-v31 .m31-compass{
  font-size:clamp(23px,5.3vw,33px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav{
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  width:100%!important;max-width:100%!important;
  margin:0!important;padding:clamp(4px,.7vh,7px)!important;
  gap:3px!important;
 }
 #app .mobile-ocean-v31 .m31-nav button{
  display:flex!important;flex-direction:column!important;
  align-items:center!important;justify-content:center!important;
  min-width:0!important;min-height:52px!important;
  padding:4px 1px!important;
  font-size:clamp(19px,4.5vw,26px)!important;
 }
 #app .mobile-ocean-v31 .m31-nav button small{
  font-size:clamp(10px,2.6vw,14px)!important;
  line-height:1.2!important;white-space:normal!important;
 }
 body:has(#app .mobile-ocean-v31) #mej-owner-rights-notice{
  position:relative!important;z-index:2!important;
  flex:0 0 auto!important;
  width:100%!important;
  margin:auto 0 0!important;
  padding:clamp(6px,.9vh,10px) 9px calc(9px + env(safe-area-inset-bottom,0px))!important;
  background:#d9ecfa!important;
  font-size:clamp(11px,2.8vw,14px)!important;
  line-height:1.4!important;
 }
}
@media(max-width:900px) and (max-height:740px){
 #app>.mobile-ocean-v31{min-height:calc(100dvh - 62px)!important;gap:3px!important}
 #app .mobile-ocean-v31 .m31-logos{max-height:7dvh!important}
 #app .mobile-ocean-v31 .m31-profile{padding:5px!important}
 #app .mobile-ocean-v31>.m31-art{min-height:90px!important}
 #app .mobile-ocean-v31 .m31-start{min-height:42px!important;padding:4px!important}
 #app .mobile-ocean-v31 .m31-nav button{min-height:46px!important}
}
</style>
"""
if s.count("</head>")!=1:raise RuntimeError("No unique head close")
s=s.replace("</head>",style+"</head>",1)
assert s.count(marker)==1
assert s.count('class="m31-sea"')==1
assert 'MEJ_HOME_IMAGE_FREE_PREVIEW_20261106' not in s
assert 'onclick="letsGo()"' in s
p.write_text(s,encoding='utf8')
print('RESTORED_ORIGINAL_SCENE_AND_BOTTOM_NAV',asset)
