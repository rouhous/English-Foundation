#!/usr/bin/env python3
"""Non-privileged Admin review entry, discoverable from Settings.

This must not grant any role, alter progress or store any privileged secret.
"""
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1"
if marker in s:
    print("Safe settings review entry already present")
    raise SystemExit(0)
if "</body>" not in s:
    raise RuntimeError("Could not find HTML body close")
snippet=r"""
<script id="mej-safe-admin-settings-entry">
// MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1
(function () {
 'use strict';
 const link = './reviews/owner-login.html';
 const label = 'Admin · دخول المالك';
 function add() {
   const roots = Array.from(document.querySelectorAll('h1,h2,h3,.section-title,[role="heading"]'));
   for(const heading of roots){
     const title = (heading.textContent||'').trim();
     if(!(/الإعدادات|إعدادات التطبيق|Settings/i.test(title))) continue;
     const parent = heading.closest('section,.card,main,[role="dialog"]') || heading.parentElement;
     if(!parent || parent.querySelector('[data-mej-admin-review]')) continue;
     const a = document.createElement('a');
     a.dataset.mejAdminReview='true';
     a.href=link;
     a.textContent='🔐 '+label;
     a.setAttribute('aria-label','Admin — مراجعة المستويات دون صلاحيات بيانات');
     a.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border-radius:12px;background:#155d48;color:white;text-decoration:none;font-weight:700;margin:10px 0;max-width:100%;';
     const note=document.createElement('small');
     note.dataset.mejAdminReview='note';
     note.textContent='تسجيل Google للتحقق من هوية المالك؛ الإدارة الكاملة لا تتاح قبل تفعيل الخدمة الآمنة.';
     note.style.cssText='display:block;line-height:1.6;color:#48695c;margin-bottom:6px';
     heading.insertAdjacentElement('afterend',a);
     a.insertAdjacentElement('afterend',note);
   }
 }
 let queued=false;
 const observer=new MutationObserver(function(){
   if(queued)return;
   queued=true;
   queueMicrotask(function(){queued=false;add()});
 });
 if(document.readyState==='loading'){
   document.addEventListener('DOMContentLoaded',function(){add();observer.observe(document.body,{childList:true,subtree:true})},{once:true});
 }else{add();observer.observe(document.body,{childList:true,subtree:true})}
})();
</script>
"""
s=s.replace("</body>",snippet+"</body>",1)
assert s.count(marker)==1
p.write_text(s,encoding="utf-8")
print("Installed safe review entry for dynamically rendered Settings.")
