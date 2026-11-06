#!/usr/bin/env python3
"""Hide the Admin entry under the settings-title gear, without bypassing auth."""
from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
start='<script id="mej-safe-admin-settings-entry">'
pattern=re.compile(re.escape(start)+r'.*?</script>',re.S)
matches=list(pattern.finditer(s))
if len(matches)!=1:
 raise RuntimeError('Expected exactly one existing Admin settings script; got '+str(len(matches)))
new=r'''<script id="mej-safe-admin-settings-entry">
// MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1
// MEJ_HIDDEN_GEAR_ADMIN_ENTRY_V2
(function(){
 'use strict';
 const link='./reviews/owner-login.html';
 const label='Admin · دخول المالك';
 function enhance(){
   const roots=document.querySelectorAll('h1,h2,h3,.section-title,[role="heading"]');
   for(const heading of roots){
     const headingText=(heading.textContent||'').replace(/[⚙️🔧]/g,'').trim();
     if(!/^(?:الإعدادات|إعدادات التطبيق|Settings)$/i.test(headingText))continue;
     if(heading.querySelector('[data-mej-admin-gear]'))continue;
     const btn=document.createElement('button');
     btn.type='button';
     btn.dataset.mejAdminGear='true';
     btn.textContent='⚙️';
     btn.title='خيارات الإعدادات';
     btn.setAttribute('aria-label','خيارات الإعدادات');
     btn.setAttribute('aria-expanded','false');
     btn.style.cssText='display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-inline-start:9px;padding:4px;border:0;background:transparent;font:inherit;cursor:pointer;min-width:36px;min-height:36px;border-radius:9px';
     const panel=document.createElement('div');
     panel.dataset.mejAdminPanel='true';
     panel.hidden=true;
     panel.style.cssText='margin:10px 0;padding:10px;background:#f4faf7;border:1px solid #d4e6da;border-radius:12px;font-size:14px';
     const a=document.createElement('a');
     a.dataset.mejAdminReview='true';
     a.href=link;
     a.textContent='🔐 '+label;
     a.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border-radius:12px;background:#155d48;color:white;text-decoration:none;font-weight:700;max-width:100%';
     const note=document.createElement('small');
     note.textContent='دخول Google للمالك فقط. ظهور الرابط لا يمنح صلاحيات إدارة أو تعديل بيانات.';
     note.style.cssText='display:block;margin-top:8px;line-height:1.6;color:#48695c';
     panel.append(a,note);
     btn.addEventListener('click',()=>{
       panel.hidden=!panel.hidden;
       btn.setAttribute('aria-expanded',String(!panel.hidden));
     });
     heading.append(btn);
     heading.insertAdjacentElement('afterend',panel);
   }
 }
 let queued=false;
 const observer=new MutationObserver(()=>{
   if(queued)return;
   queued=true;
   queueMicrotask(()=>{queued=false;enhance()});
 });
 const start=()=>{
   enhance();
   observer.observe(document.body,{childList:true,subtree:true});
 };
 if(document.readyState==='loading'){
   document.addEventListener('DOMContentLoaded',start,{once:true});
 }else start();
})();
</script>'''
s=pattern.sub(lambda _:new,s,count=1)
if s.count('MEJ_HIDDEN_GEAR_ADMIN_ENTRY_V2')!=1:raise RuntimeError('marker not unique')
p.write_text(s,encoding='utf-8')
print('HIDDEN_GEAR_ADMIN_ENTRY_V2_INSTALLED')
