from pathlib import Path
s=Path('index.html').read_text(encoding='utf8')
def crop(x,a=300,b=850):
 print(s[max(0,x-a):min(len(s),x+b)].replace('data:image/png;base64,','data:image/png;base64,[IMAGE]').replace('data:image/webp;base64,','data:image/webp;base64,[IMAGE]')[:1500])
for needle in ['<body','<main','id="app"','id="mej-owner-rights-notice"','id="mej-student-install-hint"',"min-height:max(640px,calc(100dvh - 68px))", 'height:100dvh','footer']:
 i=s.find(needle); print('POS',needle,i);crop(i,150,480)
print('ENDCSS BEFORE RIGHTS',s[s.find('<style id="mej-copyright-notice-style">')-400:s.find('<style id="mej-copyright-notice-style">')+40].replace('data:image/png;base64,','[IMAGE]')[:1000])

# Trigger layout audit.
