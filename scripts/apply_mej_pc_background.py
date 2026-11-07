from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
mark='MEJ_DESKTOP_BACKGROUND_PC_20261107'
if mark in s:
 print('ALREADY_CONFIGURED');raise SystemExit(0)
assert Path('assets/background PC.png').exists(),'Approved PC image not present'
assert s.count('</head>')==1,'Unexpected document structure'
block='''<style id="mej-desktop-background-pc">
/* MEJ_DESKTOP_BACKGROUND_PC_20261107
   Use the user-uploaded 16:9 desktop picture; do not change mobile artwork. */
@media (min-width:901px){
 body:has(#app .journey-home.ocean-landing.actual-v18) {
   background:#0876c9 url("./assets/background%20PC.png") center center / cover no-repeat fixed !important;
 }
 body #app .journey-home.ocean-landing.actual-v18 {
   background-image:url("./assets/background%20PC.png") !important;
   background-size:cover !important;
   background-position:center center !important;
   background-repeat:no-repeat !important;
   background-color:#0876c9 !important;
 }
}
</style>
'''
s=s.replace('</head>',block+'</head>',1)
assert s.count(mark)==1
assert 'background%20PC.png' in s
assert '@media (min-width:901px)' in block
p.write_text(s,encoding='utf8')
print('DESKTOP_BACKGROUND_ADDED_NO_MOBILE_CHANGES',len(s))

# Trigger validated installation of the approved desktop image.
