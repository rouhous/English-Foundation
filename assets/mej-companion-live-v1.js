/* MEJ COMPANION LIVE 2026-11-09 — lightweight illustration-based, WebGL-free.
 * Keep student registration, diagnostic and stars unchanged. No animation during diagnostic.
 * Depends on mej-companion-art-v1.js; all artwork is offline bundled.
 */
(function(){
 'use strict';
 if(window.MEJCompanionLive)return;
 const ART=window.MEJCompanionArt;
 if(!ART||!ART.boy||!ART.girl)return;
 const $=id=>document.getElementById(id);
 const profile=()=>{try{return typeof active==='function'?active():null}catch(_){return null}};
 const inDiagnostic=()=>{try{return typeof activeSession!=='undefined'&&activeSession?.kind==='diagnostic'}catch(_){return false}};
 const inSession=()=>{try{return typeof activeSession!=='undefined'&&!!activeSession}catch(_){return false}};
 const enabled=()=>{try{return window.localStorage.getItem('MEJ_COMPANION_HIDE')!=='1'}catch(_){return true}};
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
 let modal=null,frameTimer=0,hideTimer=0,observer=null,lastUserId='',tickQueued=false,animationNo=0;
 let motion=true,sound=false;
 try{const saved=JSON.parse(localStorage.getItem('MEJ_COMPANION_SETTINGS_V1')||'{}');motion=saved.motion!==false;sound=saved.sound===true}catch(_){}
 const style=document.createElement('style');style.textContent=`
 #mej-companion-choice{position:fixed;inset:0;z-index:100000;background:#001e4dca;display:grid;place-items:center;padding:12px;direction:rtl;box-sizing:border-box}
 #mej-companion-choice .mej-c-sheet{box-sizing:border-box;width:min(100%,480px);max-height:calc(100dvh - 24px);overflow:auto;border-radius:23px;padding:16px;background:linear-gradient(145deg,#fff,#d9f1ff);color:#143f69;border:2px solid #a1dbf6;box-shadow:0 16px 35px #00194766}
 #mej-companion-choice h2{text-align:center;margin:5px 0 3px;font-size:clamp(20px,4.8vw,26px)}
 #mej-companion-choice p{text-align:center;font-size:14px;margin:6px 0 10px;line-height:1.4}
 #mej-companion-choice .mej-c-picks{display:grid;grid-template-columns:1fr 1fr;gap:9px}
 #mej-companion-choice .mej-c-pick{border:2px solid #7ebde1;border-radius:16px;min-width:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;min-height:128px;color:#164a72;gap:3px;cursor:pointer;font:800 16px system-ui}
 #mej-companion-choice .mej-c-pick[aria-pressed=true]{border-color:#eab336;background:#fff4cd}
 #mej-companion-choice .mej-c-pick img{display:block;width:95px;height:95px;object-fit:contain;max-width:100%}
 #mej-companion-choice label{display:block;font-weight:800;margin:12px 0 4px}
 #mej-companion-choice input{width:100%;min-height:47px;box-sizing:border-box;border:2px solid #9bcde8;border-radius:13px;text-align:center;font:700 17px system-ui;background:#fff;color:#174269}
 #mej-companion-choice .mej-c-save{border:0;border-radius:14px;background:#ffce3c;color:#163c63;font:900 18px system-ui;width:100%;min-height:47px;margin-top:11px;cursor:pointer}
 #mej-companion-choice .mej-c-cancel{background:none;border:0;color:#245b80;width:100%;min-height:38px;margin-top:6px}
 #mej-companion-choice .mej-c-error{min-height:18px;color:#b92231;text-align:center;font-size:13px;margin-top:4px}
 #mej-companion-avatar-button{padding:0!important;border:0!important;background:transparent!important;display:inline-grid;place-items:center;cursor:pointer;flex:0 0 auto}
 #mej-companion-avatar-button img{display:block;width:66px;height:66px;border-radius:50%;object-fit:contain;background:radial-gradient(circle,#eaffff,#74c8f1);border:2px solid #d5f7ff;box-shadow:0 3px 9px #001b4770}
 #mej-companion-actor{position:fixed;z-index:9300;right:8px;top:max(80px,calc(env(safe-area-inset-top) + 75px));width:112px;pointer-events:none;display:none;contain:layout style;}
 #mej-companion-actor[hidden]{display:none!important}
 #mej-companion-actor .mej-c-sprite{width:108px;height:142px;background-repeat:no-repeat;background-size:400% 200%;will-change:transform;filter:drop-shadow(0 3px 4px #012f5666)}
 #mej-companion-actor .mej-c-bubble{display:inline-block;position:absolute;top:0;right:93px;min-width:95px;max-width:185px;padding:6px 8px;border-radius:14px;background:#fff;border:2px solid #edc456;color:#1a4a71;font:800 13px/1.25 system-ui;text-align:center;box-shadow:0 2px 8px #001f4450}
 #mej-companion-actor.mej-c-bounce .mej-c-sprite{animation:mej-companion-pop .65s ease-in-out 2}
 @keyframes mej-companion-pop{0%,100%{transform:translateY(0)}46%{transform:translateY(-14px)}}
 @media(max-width:600px){#mej-companion-actor{width:78px;top:85px;right:3px}#mej-companion-actor .mej-c-sprite{width:77px;height:103px}#mej-companion-actor .mej-c-bubble{right:70px;font-size:11px;max-width:125px;min-width:80px}}
 @media(prefers-reduced-motion:reduce){#mej-companion-actor .mej-c-sprite{animation:none!important}}
 `;document.head.append(style);
 function avatar(g,size=66){const img=document.createElement('img');img.src=ART[g==='girl'?'girl':'boy'].avatar;img.alt=g==='girl'?'رفيقة عمانية':'رفيق عماني';img.width=size;img.height=size;img.decoding='async';return img}
 function close(){modal?.remove();modal=null}
 function open(force=false){
  if(inDiagnostic()||inSession())return;
  const p=profile();if(!p||p.id==null)return;
  if(p.companion?.kind&&p.companion?.name&&!force)return;
  if(modal)return;
  const userId=String(p.id);
  let chosen=['girl','boy'].includes(p.companion?.kind)?p.companion.kind:'';
  const root=document.createElement('div');root.id='mej-companion-choice';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','اختيار رفيق الرحلة');
  const box=document.createElement('div');box.className='mej-c-sheet';
  const title=document.createElement('h2');title.textContent='اختر رفيق رحلتك';
  const info=document.createElement('p');info.textContent='اختر الولد أو البنت وأعطه اسمًا من اختيارك.';
  const picks=document.createElement('div');picks.className='mej-c-picks';const opts={};
  for(const [k,t] of [['boy','ولد • Boy'],['girl','بنت • Girl']]){
   const b=document.createElement('button');b.type='button';b.className='mej-c-pick';b.setAttribute('aria-pressed',String(chosen===k));b.append(avatar(k,95));const label=document.createElement('span');label.textContent=t;b.append(label);b.onclick=()=>{chosen=k;for(const [key,x] of Object.entries(opts))x.setAttribute('aria-pressed',String(key===k))};opts[k]=b;picks.append(b);
  }
  const label=document.createElement('label');label.textContent='ما اسم رفيقك؟';
  const input=document.createElement('input');input.type='text';input.maxLength=24;input.autocomplete='off';input.placeholder='اكتب اسم رفيقك';input.value=p.companion?.name||'';
  const error=document.createElement('div');error.className='mej-c-error';error.setAttribute('role','status');
  const save=document.createElement('button');save.type='button';save.className='mej-c-save';save.textContent='متابعة الرحلة';
  save.onclick=()=>{
   const current=profile();if(!current||String(current.id)!==userId){close();return}
   if(!chosen){error.textContent='اختر الولد أو البنت.';return}
   const name=input.value.trim();if(!name){error.textContent='اكتب اسم الرفيق.';input.focus();return}
   current.companion={kind:chosen,name,configuredAt:new Date().toISOString()};
   try{if(typeof persist==='function')persist(false)}catch(e){console.warn('Companion profile save failed',e);error.textContent='تعذر حفظ الاختيار الآن. حاول مجددًا.';return}
   close();updateAvatar();window.dispatchEvent(new CustomEvent('mej-companion-change',{detail:{id:userId,kind:chosen,name}}));
  };
  box.append(title,info,picks,label,input,error,save);
  if(force){const cancel=document.createElement('button');cancel.className='mej-c-cancel';cancel.textContent='إلغاء';cancel.onclick=close;box.append(cancel)}
  root.append(box);document.body.append(root);modal=root;
 }
 function updateAvatar(){
  const app=$('app'),p=profile();if(!app||!p||p.id==null)return;
  const original=app.querySelector('.j23-avatar');let b=app.querySelector('#mej-companion-avatar-button');
  if(!original&&!b)return;
  if(!b){b=document.createElement('button');b.type='button';b.id='mej-companion-avatar-button';b.onclick=()=>open(true);original.replaceWith(b)}
  const g=p.companion?.kind==='girl'?'girl':'boy',name=p.companion?.name||'اختر رفيقك';
  if(b.dataset.id!==String(p.id)||b.dataset.kind!==g||b.dataset.name!==name){b.dataset.id=String(p.id);b.dataset.kind=g;b.dataset.name=name;b.replaceChildren(avatar(g));b.title='تغيير رفيق الرحلة: '+name;b.setAttribute('aria-label',b.title)}
 }
 function settings(){const m=$('journeySettingsModal');if(!m||m.querySelector('#mej-companion-settings'))return;const dest=m.querySelector('.journey-modal-inner');if(!dest)return;const b=document.createElement('button');b.id='mej-companion-settings';b.type='button';b.className='btn light';b.textContent='🎒 تغيير الرفيق واسمه';b.onclick=()=>{m.remove();open(true)};dest.append(b)}
 function homeCheck(){
  if(inSession())return;
  const p=profile();if(!p||p.id==null){close();return}
  if(lastUserId!==String(p.id)){close();lastUserId=String(p.id)}
  if(!p.companion?.name||!['boy','girl'].includes(p.companion?.kind)){
    const app=$('app');if(app?.querySelector('.j23-avatar')||app?.querySelector('#mej-companion-avatar-button'))open(false);
  }
 }
 function stop(){clearInterval(frameTimer);frameTimer=0;clearTimeout(hideTimer);hideTimer=0;const el=$('mej-companion-actor');if(el)el.hidden=true}
 function frame(el,idx){el.style.backgroundPosition=(idx%4)*100/3+'% '+(idx<4?'0%':'100%')}
 function speak(message){if(!sound||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message);u.lang='en-GB';u.rate=.94;speechSynthesis.speak(u)}catch(_){}}
 const POSES={idle:0,walk:1,run:2,excited:3,sorry:4,pointing:5,thinking:6,football:7};
 function play(name,duration=1900){
  if(!(name in POSES)||inDiagnostic()||!enabled()||document.hidden)return false;
  const p=profile(),g=p?.companion?.kind;if(g!=='boy'&&g!=='girl')return false;
  let host=$('mej-companion-actor');if(!host){host=document.createElement('div');host.id='mej-companion-actor';host.setAttribute('aria-hidden','true');host.innerHTML='<div class="mej-c-sprite"></div><div class="mej-c-bubble"></div>';document.body.append(host)}
  stop();host.hidden=false;host.style.display='block';const sp=host.querySelector('.mej-c-sprite');sp.style.backgroundImage='url("'+ART[g].sheet+'")';frame(sp,POSES[name]);
  host.classList.toggle('mej-c-bounce',name==='excited');const captions={idle:'Ready!',walk:'Let’s go!',run:'Here we go!',excited:'Awesome!',sorry:'Try again!',pointing:'Look here!',thinking:'Think carefully!',football:'Let’s play!'};
  host.querySelector('.mej-c-bubble').textContent=captions[name];const token=++animationNo;
  hideTimer=setTimeout(()=>{if(token===animationNo)stop()},Math.min(3000,Math.max(500,duration)));
  return true;
 }
 const positives=['Awesome!','Excellent!','Amazing!','Let’s go!','Unbelievable!'];
 const retries=['Try again!','Don’t give up!','You can do it!','One more chance!'];
 function react(ok){
  // SAFETY: never interfere with the diagnostic screen or active answer controls.
  if(inDiagnostic()||!enabled()||document.hidden)return;
  const p=profile(),g=p?.companion?.kind;
  if(g!=='boy'&&g!=='girl')return;
  const word=(ok?positives:retries)[Math.floor(Math.random()*(ok?positives:retries).length)];
  let host=$('mej-companion-actor');if(!host){host=document.createElement('div');host.id='mej-companion-actor';host.setAttribute('aria-hidden','true');host.innerHTML='<div class="mej-c-sprite"></div><div class="mej-c-bubble"></div>';document.body.append(host)}
  stop();host.hidden=false;host.style.display='block';const sprite=host.querySelector('.mej-c-sprite');sprite.style.backgroundImage='url("'+ART[g].sheet+'")';host.querySelector('.mej-c-bubble').textContent=word;
  const base=ok?3:4;frame(sprite,base);
  const token=++animationNo;
  if(motion&&!reduced()){
   host.classList.toggle('mej-c-bounce',!!ok);
   // Alternate separate approved illustrations, not WebGL or a GPU loop.
   let count=0;frameTimer=setInterval(()=>{if(token!==animationNo){clearInterval(frameTimer);return}frame(sprite,ok?(count++%2?3:0):(count++%2?4:0))},430);
  }
  speak(word);
  hideTimer=setTimeout(()=>{if(token===animationNo)stop()},2200);
 }
 function check(){updateAvatar();homeCheck();}
 function queue(){if(tickQueued)return;tickQueued=true;queueMicrotask(()=>{tickQueued=false;try{check()}catch(e){console.warn('Companion UI skipped',e)}})}
 function boot(){
  const app=$('app');if(!app)return;
  observer=new MutationObserver(queue);observer.observe(app,{childList:true,subtree:false});
  // Settings modal is attached to body, but only inspect it on a user click.
  document.addEventListener('click',e=>{if(e.target?.closest?.('button'))setTimeout(settings,0)},false);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  window.addEventListener('pagehide',stop);
  window.addEventListener('mej-companion-change',queue);
  queue();
 }
 window.MEJCompanion={react};
 window.MEJCompanionLive={open:()=>open(true),refresh:queue,react,play,stop,availableActions:Object.keys(POSES)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();