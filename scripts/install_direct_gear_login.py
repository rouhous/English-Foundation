#!/usr/bin/env python3
"""Reuse the original settings title gear as the sole owner-login trigger."""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8")
pattern=re.compile(r'<script id="mej-safe-admin-settings-entry">.*?</script>',re.S)
if len(pattern.findall(s))!=1:
 raise RuntimeError("Expected exactly one settings-entry script")
replacement=r'''<script id="mej-safe-admin-settings-entry">
// MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1
// MEJ_SETTINGS_EXISTING_GEAR_DIRECT_LOGIN_V3
(function(){
 "use strict";
 const target="./reviews/owner-login.html";
 function removeLegacyAdminCards(root){
   // Remove both the earlier injected entry and the separately rendered
   // 'Admin — review levels' card in the settings panel, not student content.
   root.querySelectorAll("[data-mej-admin-gear],[data-mej-admin-panel],[data-mej-admin-review]").forEach(el=>el.remove());
   const headings=root.querySelectorAll("h1,h2,h3,h4,.section-title,.card-title");
   for(const h of headings){
     const label=(h.textContent||"").trim();
     if(!/^(?:🔐\s*)?Admin\s*[—-]\s*مراجعة المستويات/i.test(label))continue;
     const card=h.closest(".card,.settings-card,section");
     if(card&&card!==root)card.remove();
     else h.remove();
   }
 }
 function markClick(element){
   if(!element||element.dataset.mejSettingsGearBound==="1")return;
   element.dataset.mejSettingsGearBound="1";
   element.style.cursor="pointer";
   element.setAttribute("role","button");
   element.setAttribute("tabindex","0");
   element.setAttribute("aria-label","الإعدادات");
   element.addEventListener("click",event=>{
     event.preventDefault();
     event.stopPropagation();
     location.assign(target);
   });
   element.addEventListener("keydown",event=>{
     if(event.key==="Enter"||event.key===" "){
       event.preventDefault();location.assign(target);
     }
   });
 }
 function bindExistingGear(heading){
   if(heading.querySelector("[data-mej-settings-gear-bound]"))return;
   const nodes=[...heading.childNodes];
   for(const node of nodes){
     if(node.nodeType===3){
       const val=node.nodeValue||"";
       const match=/⚙️|⚙/u.exec(val);
       if(!match)continue;
       const before=document.createTextNode(val.slice(0,match.index));
       const gear=document.createElement("span");
       gear.textContent=match[0];
       gear.style.cssText="display:inline-flex;align-items:center;justify-content:center;min-width:32px;min-height:32px;vertical-align:middle";
       const after=document.createTextNode(val.slice(match.index+match[0].length));
       node.replaceWith(before,gear,after);
       markClick(gear);
       return;
     }
     if(node.nodeType===1){
       const el=node;
       if((el.textContent||"").trim().match(/^(⚙️|⚙)$/u)){
         markClick(el);return;
       }
       const classNames=String(el.className&&typeof el.className==="string"?el.className:"");
       if(/(?:gear|cog|settings)/i.test(classNames) && !(el.textContent||"").trim()){
         markClick(el);return;
       }
     }
   }
 }
 function update(){
   const all=[...document.querySelectorAll("h1,h2,h3,h4,.section-title,[role=heading]")];
   for(const h of all){
     const text=(h.textContent||"").replace(/⚙️?|🔧/gu,"").trim();
     if(!/^(?:الإعدادات|إعدادات التطبيق|Settings)$/i.test(text))continue;
     const root=h.closest(".card,.modal,.dialog,section,[role=dialog]")||h.parentElement;
     if(root)removeLegacyAdminCards(root);
     bindExistingGear(h);
   }
 }
 let scheduled=false;
 const observer=new MutationObserver(()=>{
   if(scheduled)return;
   scheduled=true;
   queueMicrotask(()=>{scheduled=false;update()});
 });
 function start(){update();observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();
</script>'''
s=pattern.sub(lambda _:replacement,s,count=1)
assert s.count("MEJ_SETTINGS_EXISTING_GEAR_DIRECT_LOGIN_V3")==1
p.write_text(s,encoding="utf-8")
print("Existing settings gear wired to owner login; legacy UI removed.")
