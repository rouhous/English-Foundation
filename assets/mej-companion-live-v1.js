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
 let roamTimer=0,drag=null,actorX=null,actorY=null,roamStep=0,lastIdentity='',dropRAF=0,bubbleTimer=0;
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
 #mej-companion-actor{position:fixed;z-index:9300;left:8px;top:80px;width:112px;pointer-events:none;display:none;contain:layout style;transition:left 1.1s ease-in-out;}
 #mej-companion-actor.mej-c-dragging,#mej-companion-actor.mej-c-parachuting{transition:none!important}
 #mej-companion-actor .mej-c-canopy{position:absolute;left:-18px;top:-150px;width:142px;height:230px;display:none;pointer-events:none;z-index:3;filter:drop-shadow(0 3px 3px #06335b55);transform-origin:58px 212px}
 #mej-companion-actor .mej-c-canopy svg{width:100%;height:100%;display:block}
 #mej-companion-actor.mej-c-parachuting .mej-c-canopy{display:block;animation:mej-open-canopy .42s ease-out both}
 #mej-companion-actor .mej-c-bag-flap{display:none;position:absolute;left:30%;top:41%;width:27px;height:16px;border-radius:60% 10% 45% 35%;background:#3365b5;border:2px solid #eabf65;transform:rotate(-45deg);transform-origin:6px 14px;pointer-events:none;z-index:4}
 #mej-companion-actor[data-kind="girl"] .mej-c-bag-flap{background:#ee71af;border-color:#f7c5dc}
 #mej-companion-actor .mej-c-sprite{position:relative;z-index:1}
 #mej-companion-actor.mej-c-parachuting .mej-c-bag-flap{display:block;animation:mej-open-backpack .38s ease-out both}
 #mej-companion-actor.mej-c-climbing:not(.mej-c-dragging) .mej-c-sprite{animation:mej-companion-climb .95s ease-in-out 1}
 @keyframes mej-companion-climb{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-21px) rotate(-7deg)}55%{transform:translateY(-30px) rotate(6deg)}80%{transform:translateY(-7px)}}
 @keyframes mej-open-canopy{0%{opacity:0;transform:scale(.08)}50%{opacity:1;transform:scale(.75)}100%{opacity:1;transform:scale(1)}}
 @keyframes mej-open-backpack{0%{transform:rotate(0)}100%{transform:rotate(-65deg)}}
 #mej-companion-actor .mej-c-sprite{pointer-events:auto;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
 #mej-companion-actor.mej-c-dragging .mej-c-sprite{cursor:grabbing}
 #mej-companion-actor .mej-c-bubble[hidden]{display:none!important}
 #mej-companion-actor[hidden]{display:none!important}
 #mej-companion-actor .mej-c-sprite{width:108px;height:142px;background-repeat:no-repeat;background-size:400% 200%;filter:drop-shadow(0 3px 4px #012f5666)}
 #mej-companion-actor .mej-c-bubble{display:inline-block;pointer-events:none;position:absolute;top:0;right:93px;min-width:95px;max-width:185px;padding:6px 8px;border-radius:14px;background:#fff;border:2px solid #edc456;color:#1a4a71;font:800 13px/1.25 system-ui;text-align:center;box-shadow:0 2px 8px #001f4450}
 #mej-companion-actor.mej-c-bounce .mej-c-sprite{animation:mej-companion-pop .65s ease-in-out 2}
 @keyframes mej-companion-pop{0%,100%{transform:translateY(0)}46%{transform:translateY(-14px)}}
 @media(max-width:600px){#mej-companion-actor{width:78px;top:85px}#mej-companion-actor .mej-c-sprite{width:77px;height:103px}#mej-companion-actor .mej-c-bubble{right:70px;font-size:11px;max-width:125px;min-width:80px}}
 @media(max-width:600px){#mej-companion-actor .mej-c-canopy{width:105px;height:170px;top:-113px;left:-14px;transform-origin:43px 158px}#mej-companion-actor .mej-c-bag-flap{width:21px;height:12px;left:29%;top:41%}}
 @media(prefers-reduced-motion:reduce){#mej-companion-actor .mej-c-sprite,#mej-companion-actor .mej-c-canopy{animation:none!important}}
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

 // Lightweight persistent companion: a low-frequency frame swap plus occasional horizontal movement.
 // Drag operates only on the mascot itself, not over the question controls.
 const actorKey=()=>{const p=profile();return 'MEJ_COMPANION_POSITION_V1_'+String(p?.id||'guest')};
 function limits(host){
   const r=host.getBoundingClientRect(),w=r.width||80,h=r.height||120;
   return {minX:3,maxX:Math.max(3,innerWidth-w-3),minY:60,maxY:Math.max(60,innerHeight-h-12)};
 }
 function roamingFloor(host){
   const l=limits(host);return {minY:Math.min(l.maxY,Math.max(l.minY,innerHeight*.63)),maxY:l.maxY};
 }
 function place(host,x,y,save=false){
   const lim=limits(host);
   actorX=Math.max(lim.minX,Math.min(lim.maxX,Number(x)||0));
   actorY=Math.max(lim.minY,Math.min(lim.maxY,Number(y)||0));
   host.style.left=Math.round(actorX)+'px';host.style.top=Math.round(actorY)+'px';
   if(save)try{localStorage.setItem(actorKey(),JSON.stringify({x:actorX/Math.max(1,lim.maxX),y:actorY/Math.max(1,lim.maxY)}))}catch(_){}
 }
 function restore(host){
   const p=profile(),who=String(p?.id||'');
   if(lastIdentity===who&&actorX!==null){place(host,actorX,actorY);return}
   lastIdentity=who;actorX=null;actorY=null;
   let position=null;try{position=JSON.parse(localStorage.getItem(actorKey())||'null')}catch(_){}
   const l=limits(host);
   const band=roamingFloor(host);
   place(host,position?position.x*l.maxX:l.maxX*.79,position?Math.max(band.minY,position.y*l.maxY):band.maxY-12);
 }
 function showPhrase(host,text){
   const b=host.querySelector('.mej-c-bubble');if(!b)return;
   clearTimeout(bubbleTimer);b.textContent=text;b.hidden=false;
   bubbleTimer=setTimeout(()=>{b.hidden=true},2300);
 }
 function canShow(){
   const p=profile();
   if(!p||!['boy','girl'].includes(p.companion?.kind)||!p.companion?.name||!enabled()||document.hidden||inDiagnostic())return false;
   if($('mej-companion-choice')||$('journeyModal'))return false;
   return !!$('app')?.children.length;
 }
 function actor(){
   let host=$('mej-companion-actor');
   if(!host){
     host=document.createElement('div');host.id='mej-companion-actor';
     host.setAttribute('aria-label','اسحب الرفيق لتغيير موقعه ثم أفلته');
     host.innerHTML='<div class="mej-c-canopy" aria-hidden="true"><svg viewBox="0 0 142 230" xmlns="http://www.w3.org/2000/svg"><path d="M7 51Q17 6 71 4Q125 6 135 51Q112 41 92 51Q71 39 49 51Q28 42 7 51Z" fill="#ffcb46" stroke="#a96b24" stroke-width="3"/><path d="M71 4Q43 22 49 51M71 4Q99 22 92 51" stroke="#fff3bb" stroke-width="4" fill="none"/><path d="M7 51L56 212M49 51L56 212M92 51L56 212M135 51L56 212" stroke="#7d654e" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="M49 205L56 216L63 205" stroke="#315a8b" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="56" cy="212" r="4.5" fill="#ffdd80" stroke="#7d654e" stroke-width="1.5"/></svg></div><div class="mej-c-bag-flap" aria-hidden="true"></div><div class="mej-c-sprite" role="img" aria-label="رفيق الرحلة المتحرك"></div><div class="mej-c-bubble" hidden></div>';
     document.body.append(host);wireDrag(host);
   }
   return host;
 }
 function wireDrag(host){
   const sprite=host.querySelector('.mej-c-sprite');
   sprite.addEventListener('pointerdown',e=>{
     if(!canShow()||e.button!==0)return;
     drag={id:e.pointerId,dx:e.clientX-(actorX||0),dy:e.clientY-(actorY||0)};
     host.classList.add('mej-c-dragging');host.classList.remove('mej-c-parachuting','mej-c-climbing');
     if(dropRAF)cancelAnimationFrame(dropRAF);dropRAF=0;
     try{sprite.setPointerCapture(e.pointerId)}catch(_){}
     e.preventDefault();
   });
   sprite.addEventListener('pointermove',e=>{
     if(!drag||drag.id!==e.pointerId)return;
     place(host,e.clientX-drag.dx,e.clientY-drag.dy);
     e.preventDefault();
   });
   const release=e=>{
     if(!drag||drag.id!==e.pointerId)return;
     const y=actorY;
     drag=null;host.classList.remove('mej-c-dragging');
     try{sprite.releasePointerCapture(e.pointerId)}catch(_){}
     const band=roamingFloor(host),target=Math.max(band.minY,band.maxY-10);
     if(!motion||reduced()||document.hidden){place(host,actorX,target,true);return}
     // Open the backpack and parachute on every release. Slow descent with bounded duration.
     const from=Math.max(limits(host).minY,Math.min(y,target-36)),to=target,startX=actorX;
     const token=++animationNo;
     host.classList.add('mej-c-parachuting');
     host.classList.remove('mej-c-climbing');
     frame(sprite,0);
     let first=0,previous=0;
     function descend(t){
       if(token!==animationNo||!canShow()){dropRAF=0;host.classList.remove('mej-c-parachuting');return}
       if(!first)first=t;
       if(t-previous<30){dropRAF=requestAnimationFrame(descend);return}
       previous=t;
       const k=Math.min(1,(t-first)/2300);
       // Ease-out horizontal drift; no full-screen physics loop after landing.
       const sway=Math.sin(k*Math.PI*4)*8*(1-k);
       place(host,startX+sway,from+(to-from)*(k*k*(3-2*k)));
       if(k<1){dropRAF=requestAnimationFrame(descend)}
       else{dropRAF=0;host.classList.remove('mej-c-parachuting');place(host,startX,to,true)}
     }
     dropRAF=requestAnimationFrame(descend);
   };
   sprite.addEventListener('pointerup',release);
   sprite.addEventListener('pointercancel',release);
 }
 function stop(hide=true){
   clearInterval(frameTimer);frameTimer=0;clearTimeout(hideTimer);hideTimer=0;
   if(hide){const el=$('mej-companion-actor');if(el)el.hidden=true}
 }
 function frame(el,idx){el.style.backgroundPosition=(idx%4)*100/3+'% '+(idx<4?'0%':'100%')}
 function speak(message){if(!sound||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message);u.lang='en-GB';u.rate=.94;speechSynthesis.speak(u)}catch(_){}}
 const POSES={idle:0,walk:1,run:2,excited:3,sorry:4,pointing:5,thinking:6,football:7};
 function refreshActor(){
   const host=$('mej-companion-actor');
   if(!canShow()){
     clearInterval(roamTimer);roamTimer=0;
     if(dropRAF)cancelAnimationFrame(dropRAF);dropRAF=0;
     if(host){host.hidden=true;host.classList.remove('mej-c-parachuting','mej-c-climbing')}
     return;
   }
   const h=actor(),p=profile(),kind=p.companion.kind,sp=h.querySelector('.mej-c-sprite');
   if(h.dataset.kind!==kind){h.dataset.kind=kind;sp.style.backgroundImage='url("'+ART[kind].sheet+'")'}
   h.hidden=false;h.style.display='block';
   restore(h);
   if(!roamTimer){
     frame(sp,1);
     roamTimer=setInterval(()=>{
       if(!canShow()){refreshActor();return}
       if(drag||dropRAF||!motion||reduced())return;
       if(h.dataset.reacting==='1')return;
       const step=++roamStep;
       frame(sp,step%6===0?2:step%2===0?1:2);
       if(step%5===0){
         const band=roamingFloor(h),delta=(step%10===0?-1:1)*Math.min(45,innerWidth*.09);
         place(h,actorX+delta,Math.max(band.minY,Math.min(band.maxY,actorY)));
       }
       // Occasionally jump towards a nearby button visually, without triggering any click.
       if(step%11===0&&!inSession()){
         const rect=h.getBoundingClientRect();
         const candidates=[...$('app').querySelectorAll('button')].filter(b=>{
           const r=b.getBoundingClientRect();
           return r.width>30&&r.height>24&&r.bottom>0&&r.top<innerHeight&&Math.abs(r.left-rect.left)<150;
         });
         if(candidates.length){
           h.classList.remove('mej-c-climbing');void h.offsetWidth;h.classList.add('mej-c-climbing');
           setTimeout(()=>h.classList.remove('mej-c-climbing'),1050);
         }
       }
     },850);
   }
 }
 function play(name,duration=1900){
   if(!(name in POSES)||!canShow())return false;
   refreshActor();const h=actor(),sp=h.querySelector('.mej-c-sprite');
   frame(sp,POSES[name]);h.dataset.reacting='1';
   h.classList.toggle('mej-c-bounce',name==='excited');
   const captions={idle:'Ready!',walk:'Let’s go!',run:'Here we go!',excited:'Awesome!',sorry:'Try again!',pointing:'Look here!',thinking:'Think carefully!',football:'Let’s play!'};
   showPhrase(h,captions[name]);const token=++animationNo;
   clearTimeout(hideTimer);
   hideTimer=setTimeout(()=>{if(token===animationNo){h.dataset.reacting='0';h.classList.remove('mej-c-bounce')}},Math.min(3000,Math.max(500,duration)));
   return true;
 }
 const positives=['Awesome!','Excellent!','Amazing!','Let’s go!','Unbelievable!'];
 const retries=['Try again!','Don’t give up!','You can do it!','One more chance!'];
 function react(ok){
   // The diagnostic remains entirely animation-free for iPad stability.
   if(inDiagnostic()||!canShow())return;
   const choices=ok?positives:retries,word=choices[Math.floor(Math.random()*choices.length)];
   const h=actor();refreshActor();const sprite=h.querySelector('.mej-c-sprite');
   frame(sprite,ok?3:4);h.dataset.reacting='1';
   h.classList.toggle('mej-c-bounce',!!ok);
   showPhrase(h,word);speak(word);
   clearTimeout(hideTimer);const token=++animationNo;
   hideTimer=setTimeout(()=>{if(token===animationNo){h.dataset.reacting='0';h.classList.remove('mej-c-bounce')}},2100);
 }
 function check(){updateAvatar();homeCheck();refreshActor();}
 function queue(){if(tickQueued)return;tickQueued=true;queueMicrotask(()=>{tickQueued=false;try{check()}catch(e){console.warn('Companion UI skipped',e)}})}
 function boot(){
  const app=$('app');if(!app)return;
  observer=new MutationObserver(queue);observer.observe(app,{childList:true,subtree:false});
  // Settings modal is attached to body, but only inspect it on a user click.
  document.addEventListener('click',e=>{if(e.target?.closest?.('button'))setTimeout(settings,0)},false);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(roamTimer);roamTimer=0;stop()}else queue()});
  window.addEventListener('resize',()=>{const h=$('mej-companion-actor');if(h&&actorX!==null)place(h,actorX,actorY)});
  window.addEventListener('pagehide',()=>{clearInterval(roamTimer);roamTimer=0;stop()});
  window.addEventListener('mej-companion-change',queue);
  queue();
 }
 window.MEJCompanion={react};
 window.MEJCompanionLive={open:()=>open(true),refresh:queue,react,play,stop,availableActions:Object.keys(POSES),moveTo:(x,y)=>{const h=actor();place(h,x,y,true)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();