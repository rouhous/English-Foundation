#!/usr/bin/env python3
"""Keep only the ORIGINAL Settings title gear; remove secondary admin/technical UI.

No data, credentials, progress, or backend behavior is changed.
"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8")
pattern = re.compile(r'<script id="mej-safe-admin-settings-entry">.*?</script>', re.S)
if len(pattern.findall(html)) != 1:
    raise RuntimeError("Expected exactly one existing settings integration script")

script = r'''<script id="mej-safe-admin-settings-entry">
// MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1
// MEJ_SINGLE_EXISTING_SETTINGS_GEAR_V4
(() => {
  'use strict';
  const loginPath = './reviews/owner-login.html';
  const gearPattern = /⚙\uFE0F?|⚙|🔧/gu;
  const settingsPattern = /^(?:الإعدادات|إعدادات التطبيق|Settings)$/i;
  const headerSelector = 'h1,h2,h3,h4,.section-title,[role="heading"]';
  const cardSelector = '.card,.settings-card,.setting-card,section';

  function linkGear(el) {
    if (el.dataset.mejOwnerGear === 'yes') return;
    el.dataset.mejOwnerGear = 'yes';
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-label','الإعدادات');
    el.style.cursor = 'pointer';
    function go(event) {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(loginPath);
    }
    el.addEventListener('click',go);
    el.addEventListener('keydown',event=>{
      if (event.key==='Enter'||event.key===' ') go(event);
    });
  }

  function findOriginalGear(heading) {
    // Do not insert a second gear: use an existing icon or emoji only.
    for (const el of heading.querySelectorAll('button,span,i,svg,img')) {
      if (el.dataset.mejAdminGear || el.dataset.mejOwnerGear) continue;
      const cls = typeof el.className==='string' ? el.className : (el.getAttribute('class')||'');
      if (gearPattern.test((el.textContent||'').trim()) || /(?:fa-cog|fa-gear|settings-icon|lucide-settings)/i.test(cls)) {
        gearPattern.lastIndex=0;
        return el;
      }
      gearPattern.lastIndex=0;
    }
    for (const node of [...heading.childNodes]) {
      if (node.nodeType!==Node.TEXT_NODE) continue;
      const text=node.nodeValue||'';
      const match=/⚙️|⚙|🔧/u.exec(text);
      if (!match) continue;
      const span=document.createElement('span');
      span.textContent=match[0];
      span.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-width:32px;min-height:32px;vertical-align:middle';
      node.replaceWith(document.createTextNode(text.slice(0,match.index)),
        span,document.createTextNode(text.slice(match.index+match[0].length)));
      return span;
    }
    return null;
  }

  function settingsView(heading) {
    const t=(heading.textContent||'').replace(gearPattern,'').trim();
    gearPattern.lastIndex=0;
    return settingsPattern.test(t);
  }

  function cleanUi(root) {
    root.querySelectorAll('[data-mej-admin-gear],[data-mej-admin-panel],[data-mej-admin-review]').forEach(el=>el.remove());
    for(const el of root.querySelectorAll('h2,h3,h4,.card-title,.section-title,strong')) {
      const title=(el.textContent||'').trim();
      if (/Admin\s*[—-]\s*مراجعة المستويات/i.test(title) ||
          /^معلومات تقنية$/.test(title)) {
        const card=el.closest(cardSelector);
        if(card && card!==root && root.contains(card)) card.remove();
      }
    }
    // Never claim a successful connection if the underlying status says otherwise.
    // Shorten only the known successful-but-unverified diagnostic message.
    for(const box of root.querySelectorAll('div,p,span')) {
      if(box.children.length>1)continue;
      const raw=(box.textContent||'').trim();
      if(raw.length<60 || raw.length>1200)continue;
      if(/الوصول إلى خدمة الاستقبال ناجح/.test(raw) && /verified-ministry|النتائج غير موثوقة/.test(raw)) {
        box.textContent='✅ تم الاتصال بالخدمة. نتائج التقارير غير معتمدة لترتيب الطلاب.';
      }
    }
  }

  let busy=false;
  function update() {
    for(const heading of document.querySelectorAll(headerSelector)) {
      if(!settingsView(heading)) continue;
      const root=heading.closest('[role="dialog"],.settings-modal,.modal,.dialog') ||
        heading.closest('.card,section') || heading.parentElement;
      if(!root)continue;
      cleanUi(root);
      let gear=heading.querySelector('[data-mej-owner-gear]');
      if(!gear)gear=findOriginalGear(heading);
      if(gear)linkGear(gear);
    }
  }
  const observer=new MutationObserver(()=>{
    if(busy)return;
    busy=true;
    queueMicrotask(()=>{busy=false;update()});
  });
  function start(){update();observer.observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>'''
html=pattern.sub(lambda _:script,html,count=1)
assert html.count('MEJ_SINGLE_EXISTING_SETTINGS_GEAR_V4')==1
p.write_text(html,encoding='utf-8')
print("SETTINGS_SINGLE_GEAR_V4_INSTALLED")
