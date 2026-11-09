/* MEJ_COMPANION_FIRST_SETUP_V1 — profile-scoped, offline-first.
   Keep progress, stars, login and teacher relationships intact. */
(function(){
'use strict';
const STYLE=`
#mej-companion-setup{position:fixed;inset:0;z-index:110000;background:rgba(2,31,77,.83);display:grid;place-items:center;padding:12px;box-sizing:border-box;direction:rtl}
#mej-companion-setup .mej-comp-sheet{box-sizing:border-box;width:min(100%,510px);max-height:calc(100dvh - 24px);overflow:auto;border-radius:23px;border:2px solid #9edffd;background:linear-gradient(150deg,#f5fcff,#d5efff);color:#153e6b;padding:17px;box-shadow:0 14px 38px #002c6377}
#mej-companion-setup h2{font-size:clamp(20px,5vw,26px);margin:3px 0 4px;text-align:center;color:#113b75}
#mej-companion-setup p{font-size:14px;text-align:center;margin:5px 0 13px;line-height:1.6;color:#315b81}
#mej-companion-setup .mej-comp-picks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0 15px}
#mej-companion-setup .mej-comp-option{border:2px solid #8bc8ee;border-radius:17px;background:#fff;min-width:0;min-height:142px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;cursor:pointer;color:#164a79;padding:8px}
#mej-companion-setup .mej-comp-option[aria-pressed=true]{border-color:#efa923;background:#fff5d2;box-shadow:0 0 0 2px #ffe08e}
#mej-companion-setup .mej-comp-figure{font-size:54px;line-height:1.1}
#mej-companion-setup .mej-comp-option strong{font-size:17px}
#mej-companion-setup label{font-weight:800;font-size:15px}
#mej-companion-setup input{display:block;width:100%;box-sizing:border-box;margin:8px 0 11px;min-height:45px;border:2px solid #9acbe7;border-radius:12px;background:white;color:#173b67;text-align:center;font:600 17px system-ui}
#mej-companion-setup .mej-comp-save{width:100%;border:none;border-radius:14px;background:linear-gradient(#ffe878,#ffc52d);color:#18365f;font:900 18px system-ui;min-height:48px;cursor:pointer}
#mej-companion-setup .mej-comp-alert{color:#a32020;min-height:20px;text-align:center;font-size:13px}
#mej-companion-settings{margin:8px 0!important}
`;
const css=document.createElement('style');css.textContent=STYLE;document.head.append(css);
let showingId='',pending=false,editing=false;
const profile=()=>{
 try {return typeof active==='function'?active():null;}catch(_){return null;}
};
function valid(p){return p&&typeof p.id==='string'&&p.id&&String(p.name||'').trim().length>0}
function close(){document.getElementById('mej-companion-setup')?.remove();showingId='';editing=false;}
function open(force){
 const p=profile();
 if(!valid(p))return;
 if(p.companion?.kind&&p.companion?.name&&!force){close();return;}
 if(showingId===p.id && document.getElementById('mej-companion-setup'))return;
 close();showingId=p.id;editing=!!force;
 const root=document.createElement('div');root.id='mej-companion-setup';
 root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
 root.setAttribute('aria-label','اختر رفيق رحلتك');
 const sheet=document.createElement('div');sheet.className='mej-comp-sheet';
 const title=document.createElement('h2');title.textContent='اختر رفيق رحلتك';
 const intro=document.createElement('p');intro.textContent='اختر الشخصية ثم امنحها اسمًا من اختيارك.';
 const picks=document.createElement('div');picks.className='mej-comp-picks';
 let chosen=p.companion?.kind==='girl'?'girl':p.companion?.kind==='boy'?'boy':null;
 const buttons={};
 for(const [kind,figure,arabic,english] of [['boy','👦🏻','ولد','Boy'],['girl','👧🏻','بنت','Girl']]){
  const btn=document.createElement('button');btn.type='button';btn.className='mej-comp-option';
  btn.setAttribute('aria-pressed',String(kind===chosen));
  const pic=avatarNode(kind,94);pic.classList.add('mej-comp-figure');
  const label=document.createElement('strong');label.textContent=arabic+' • '+english;
  btn.append(pic,label);btn.onclick=()=>{chosen=kind;Object.entries(buttons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===kind)))};
  buttons[kind]=btn;picks.append(btn);
 }
 const label=document.createElement('label');label.textContent='ما اسم رفيقك؟';
 const input=document.createElement('input');input.type='text';input.maxLength=24;input.placeholder='اسم رفيق الرحلة';
 input.value=p.companion?.name||'';input.autocomplete='off';
 const alert=document.createElement('div');alert.className='mej-comp-alert';alert.setAttribute('role','status');
 const save=document.createElement('button');save.className='mej-comp-save';save.type='button';save.textContent='متابعة الرحلة';
 save.onclick=()=>{
  const current=profile(),name=input.value.trim();
  if(!current||current.id!==showingId){close();return;}
  if(!chosen){alert.textContent='اختر الولد أو البنت أولًا.';return}
  if(!name){alert.textContent='اكتب اسم رفيق رحلتك.';input.focus();return}
  current.companion={kind:chosen,name,configuredAt:new Date().toISOString()};
  // This updates the existing learner profile instead of creating another user.
  if(typeof persist==='function')persist(false);
  close();attachAvatar();
  window.dispatchEvent(new CustomEvent('mej-companion-change',{detail:{id:current.id,kind:chosen,name}}));
 };
 sheet.append(title,intro,picks,label,input,alert,save);
 if(force){const cancel=document.createElement('button');cancel.type='button';cancel.textContent='إلغاء';cancel.style.cssText='margin-top:10px;width:100%;padding:8px;border:0;background:transparent;color:#13559a';cancel.onclick=close;sheet.append(cancel)}
 root.append(sheet);document.body.append(root);
}

/* MEJ_COMPANION_AVATAR_ENTRY_V2 */
function avatarSVG(kind){
 const girl=kind==='girl';
 // Fully offline, lightweight shaded cartoon avatar. No external image requests.
 const cap=girl?
 '<path d="M18 61Q7 19 51 11Q90 13 83 72L75 90H25L18 61Z" fill="url(#hijab)" stroke="#7d3b7e" stroke-width="2"/><path d="M23 45Q28 17 51 20Q76 21 77 46Q69 33 51 32Q35 31 23 45" fill="#faf5ff" stroke="#b994cf" stroke-width="2"/>':
 '<path d="M18 38Q17 9 52 8Q85 10 84 38L78 44H23Z" fill="#f9f9ff" stroke="#8e9fc5" stroke-width="2"/><path d="M21 23Q49 9 80 24" fill="none" stroke="#974b75" stroke-width="4" stroke-dasharray="5 5"/><path d="M24 32Q51 20 79 32" fill="none" stroke="#416ab2" stroke-width="3" stroke-dasharray="4 5"/>';
 const clothes=girl?'#8a326c':'#fafbff';
 const cloak=girl?'<path d="M15 98Q6 70 22 54L30 72L35 103Z" fill="#973979"/>':'';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 108" role="img" aria-hidden="true"><defs><radialGradient id="bg"><stop stop-color="#a9e8ff"/><stop offset="1" stop-color="#167cc8"/></radialGradient><linearGradient id="skin" x1="0" y1="0" x2="1" y2=".75"><stop stop-color="#ffdfb4"/><stop offset="1" stop-color="#dc946b"/></linearGradient><linearGradient id="hijab" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e1bcf5"/><stop offset="1" stop-color="#753b94"/></linearGradient></defs><rect width="104" height="108" rx="52" fill="url(#bg)"/><circle cx="81" cy="20" r="15" fill="#fff" opacity=".12"/><path d="M14 108Q17 75 52 76Q87 76 92 108Z" fill="'+clothes+'" stroke="#d7b2bf" stroke-width="2"/>'+cloak+'<ellipse cx="52" cy="53" rx="27" ry="30" fill="url(#skin)" stroke="#cf8c68" stroke-width="1"/>'+cap+'<path d="M26 52Q36 45 43 51M60 51Q68 45 77 52" stroke="#563527" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="39" cy="56" rx="5" ry="7" fill="#fff"/><ellipse cx="66" cy="56" rx="5" ry="7" fill="#fff"/><circle cx="40" cy="57" r="3.5" fill="#422c29"/><circle cx="65" cy="57" r="3.5" fill="#422c29"/><circle cx="41" cy="55" r="1.2" fill="#fff"/><circle cx="66" cy="55" r="1.2" fill="#fff"/><path d="M42 72Q52 81 64 71Q53 91 42 72Z" fill="#8b3744"/><path d="M45 73Q53 78 61 73" fill="none" stroke="#fff" stroke-width="2"/><circle cx="28" cy="66" r="5" fill="#ffad91" opacity=".55"/><circle cx="77" cy="66" r="5" fill="#ffad91" opacity=".55"/><path d="M40 95Q52 107 65 95" stroke="#e3b86b" stroke-width="3" fill="none"/><circle cx="52" cy="97" r="5" fill="#f7c75a" stroke="#fff" stroke-width="1"/></svg>';
}
function avatarNode(kind,size){
 const el=document.createElement('span');
 el.className='mej-comp-avatar-image';
 el.style.cssText='display:grid;place-items:center;width:'+size+'px;height:'+size+'px;max-width:100%;aspect-ratio:1;overflow:hidden;border-radius:50%;border:2px solid #d7f4ff;box-shadow:0 3px 12px #003e7d66;background:#1f90d0';
 el.innerHTML=avatarSVG(kind);
 el.firstElementChild.style.cssText='width:100%;height:100%;display:block';
 return el;
}
function attachAvatar(){
 const app=document.getElementById('app'),p=profile();
 if(!app||!valid(p))return;
 const old=app.querySelector('.j23-avatar');
 let button=app.querySelector('#mej-companion-avatar-button');
 if(!old&&!button)return;
 if(!button){
  button=document.createElement('button');
  button.type='button';button.id='mej-companion-avatar-button';
  button.setAttribute('aria-label','إعدادات رفيق الرحلة');
  button.title='تغيير رفيق الرحلة واسمه';
  button.style.cssText='border:0;background:transparent;display:grid;place-items:center;padding:0;cursor:pointer;flex:0 0 auto';
  button.onclick=()=>open(true);
  old.replaceWith(button);
 }
 const kind=p.companion?.kind==='girl'?'girl':'boy';
 const name=p.companion?.name||'اختر رفيقك';
 if(button.dataset.kind!==kind||button.dataset.name!==name){
  button.dataset.kind=kind;button.dataset.name=name;
  button.replaceChildren(avatarNode(kind,62));
  button.setAttribute('aria-label','إعدادات رفيق الرحلة: '+name);
 }
}

function attachSettings(){
 const m=document.getElementById('journeySettingsModal');
 if(!m||m.querySelector('#mej-companion-settings'))return;
 const target=m.querySelector('.journey-modal-inner');if(!target)return;
 const btn=document.createElement('button');btn.type='button';btn.id='mej-companion-settings';
 btn.className='btn light';btn.textContent='🎒 تغيير رفيق الرحلة واسمه';
 btn.onclick=()=>{document.getElementById('journeySettingsModal')?.remove();open(true)};
 target.append(btn);
}
function check(){
 attachSettings();
 attachAvatar();
 const p=profile();
 if(!valid(p)){if(showingId)close();return}
 if(showingId&&showingId!==p.id){close()}
 if(p.companion?.kind&&p.companion?.name){if(showingId&&!editing)close();return}
 if(document.getElementById('journeyModal'))return; // don't interrupt registration
 if(document.getElementById('mej-companion-setup'))return;
 // Do not interrupt a running question; show on entry/home or between sessions.
 if(typeof activeSession!=='undefined'&&activeSession)return;
 if(document.getElementById('app')?.children.length)open(false);
}
function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;check()})}
function boot(){
 const app=document.getElementById('app');if(!app)return;
 const observer=new MutationObserver(schedule);
 observer.observe(app,{childList:true,subtree:false});
 observer.observe(document.body,{childList:true,subtree:false});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.MEJCompanionSetup={open:()=>open(true),refresh:attachAvatar};
})();
