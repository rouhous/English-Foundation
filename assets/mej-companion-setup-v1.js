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
  const pic=document.createElement('span');pic.className='mej-comp-figure';pic.textContent=figure;
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
  close();
 };
 sheet.append(title,intro,picks,label,input,alert,save);
 if(force){const cancel=document.createElement('button');cancel.type='button';cancel.textContent='إلغاء';cancel.style.cssText='margin-top:10px;width:100%;padding:8px;border:0;background:transparent;color:#13559a';cancel.onclick=close;sheet.append(cancel)}
 root.append(sheet);document.body.append(root);
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
window.MEJCompanionSetup={open:()=>open(true)};
})();
