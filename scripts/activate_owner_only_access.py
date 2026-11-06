#!/usr/bin/env python3
"""Put a verified-owner sign-in gate on the published app and HTML previews.

The database registration endpoints are independently disabled at Supabase.
The gate is a public-UI stopgap: GitHub Pages cannot hide static source files.
"""
from pathlib import Path
import re
base=Path('.')
marker='MEJ_OWNER_ONLY_ACCESS_GATE_20261106'
login=base/'reviews/owner-login.html'
gate=r'''
<style id="mej-owner-gate-style">html{visibility:hidden!important}</style>
<script id="mej-owner-only-gate">
/* MEJ_OWNER_ONLY_ACCESS_GATE_20261106 */
(function(){
  "use strict";
  const LOGIN='/English-Foundation/reviews/owner-login.html';
  const TOKEN_KEY='MEJ_OWNER_ACCESS_V1';
  const ENDPOINT='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-owner-verify';
  const timeout=new AbortController();
  const timer=setTimeout(()=>timeout.abort(),6500);
  const token=sessionStorage.getItem(TOKEN_KEY);
  if(!token){
    clearTimeout(timer);
    location.replace(LOGIN);
    return;
  }
  fetch(ENDPOINT,{
    method:'GET',mode:'cors',credentials:'omit',cache:'no-store',
    headers:{Authorization:'Bearer '+token},
    signal:timeout.signal
  }).then(async response=>{
    if(!response.ok)throw Error('OWNER_NOT_AUTHENTICATED');
    const data=await response.json();
    if(data.ok!==true || data.role!=='owner' || data.email!=='rouhous@gmail.com')
      throw Error('OWNER_NOT_AUTHENTICATED');
    window.__MEJ_OWNER_VERIFIED_SESSION=true;
    document.getElementById('mej-owner-gate-style')?.remove();
  }).catch(()=>{
    sessionStorage.removeItem(TOKEN_KEY);
    location.replace(LOGIN);
  }).finally(()=>clearTimeout(timer));
})();
</script>
'''
files=sorted(base.rglob('*.html'))
count=0
for p in files:
  if '.git' in p.parts or p==login:continue
  s=p.read_text(encoding='utf8')
  if marker in s:continue
  m=re.search(r'<head(?:\s[^>]*)?>',s,re.I)
  if m:
    s=s[:m.end()]+gate+s[m.end():]
  else:
    # A few standalone review exports are fragments without a <head>.
    # Prepend the same gate so direct links remain locked too.
    s=gate+s
  p.write_text(s,encoding='utf8')
  count+=1

owner=login.read_text(encoding='utf8')
if 'MEJ_OWNER_LOGIN_PAUSE_ENROLMENT_V1' not in owner:
  if owner.count('ownerCredential=response.credential;')!=1:raise RuntimeError('Cannot locate verified owner login')
  owner=owner.replace('ownerCredential=response.credential;',
    "ownerCredential=response.credential;\n  sessionStorage.setItem('MEJ_OWNER_ACCESS_V1',response.credential);",1)
  owner=owner.replace('teacherPanel.hidden=false;','teacherPanel.hidden=true;',1)
  anchor='<a id="reviewLink" href="owner-review.html" hidden>مراجعة المحتوى</a>'
  if owner.count(anchor)!=1:raise RuntimeError('Cannot find owner review link')
  owner=owner.replace(anchor,
      '<a id="openOwnerApp" href="../" style="margin:4px">فتح التطبيق</a>\n '+anchor,1)
  owner=owner.replace('</style>',
    '/* MEJ_OWNER_LOGIN_PAUSE_ENROLMENT_V1 */\n#teacherPanel{display:none!important}\n</style>',1)
  owner=owner.replace('<section id="teacherPanel" hidden>',
                      '<section id="teacherPanel" hidden aria-hidden="true">',1)
  login.write_text(owner,encoding='utf8')
print('OWNER_ONLY_UI_GATE_INSTALLED',count,'HTML pages; owner login preserved.')
assert count>=8
# Offline shell revision. Existing cached installations can only update when online.
worker=Path('sw.js')
sw=worker.read_text(encoding='utf8')
sw,n=re.subn(r"const CACHE='[^']+';",
              "const CACHE='mej-owner-only-closed-20261106-v1';",sw,count=1)
if n!=1:raise RuntimeError('Missing cache version')
worker.write_text(sw,encoding='utf8')
