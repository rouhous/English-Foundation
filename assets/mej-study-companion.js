/* MY ENGLISH JOURNEY — offline Omani study companion (2026-11-07).
   Local visuals + Web Audio, no external media, storage only for user preferences. */
(function(){
'use strict';
if(window.MEJCompanion)return;
const KEY='MEJ_COMPANION_SETTINGS_V1';
const compliments=['Awesome!','Excellent!','You are amazing!','Let’s go!','Unbelievable!','Fantastic!','Great job!','Brilliant!'];
const encouragements=['Try again!','Don’t give up!','You can do it!','It’s okay!','One more chance!','Keep going!','You’re learning!'];
let settings={sound:true,motion:true};
try{settings={...settings,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){}
const reduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let root,bubble,mascot,stage,buttons,sequence=0,audioCtx=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(settings))}catch(_){}};
const speech=(message)=>{
 if(!settings.sound||!('speechSynthesis' in window))return;
 try{
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(message);
  utterance.lang='en-GB';utterance.rate=.94;utterance.pitch=1.13;utterance.volume=.85;
  speechSynthesis.speak(utterance);
 }catch(_){}
};
function soundFX(success){
 if(!settings.sound)return;
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  if(!audioCtx)audioCtx=new AudioContext();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  const now=audioCtx.currentTime;
  if(success){
   // Three-note celebratory bell, with a short noise-like clap flourish.
   [523.25,659.25,783.99,1046.5].forEach((freq,i)=>{
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+i*.09;
    osc.type='sine';osc.frequency.value=freq;
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.075,t+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.32);
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.34);
   });
   for(let i=0;i<3;i++){
    const len=Math.floor(audioCtx.sampleRate*.075),buffer=audioCtx.createBuffer(1,len,audioCtx.sampleRate);
    const wave=buffer.getChannelData(0);for(let j=0;j<len;j++)wave[j]=(Math.random()*2-1)*Math.pow(1-j/len,1.6);
    const noise=audioCtx.createBufferSource(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
    noise.buffer=buffer;filter.type='bandpass';filter.frequency.value=1800;
    gain.gain.value=.035;noise.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);
    noise.start(now+.07+i*.09);
   }
  }else{
   const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(420,now);osc.frequency.linearRampToValueAtTime(350,now+.18);
   gain.gain.setValueAtTime(.045,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.2);
   osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.21);
  }
 }catch(_){}
}
function confetti(){
 if(!settings.motion||reduced()||!root)return;
 const colors=['#ffcc33','#11bfa0','#4078f5','#ff6682','#a76cf3'];
 for(let i=0;i<18;i++){
  const el=document.createElement('i');el.className='mej-confetti';
  el.style.setProperty('--dx',(Math.random()*170-85).toFixed(0)+'px');
  el.style.setProperty('--dy',(-100-Math.random()*140).toFixed(0)+'px');
  el.style.setProperty('--twist',(Math.random()*720-360).toFixed(0)+'deg');
  el.style.background=colors[i%colors.length];
  el.style.left=(26+Math.random()*46)+'px';
  stage.appendChild(el);
  el.addEventListener('animationend',()=>el.remove(),{once:true});
 }
}
function applyPreferences(){
 if(!root)return;
 root.classList.toggle('mej-no-motion',!settings.motion||reduced());
 root.querySelector('[data-mej-opt="sound"]').setAttribute('aria-pressed',String(settings.sound));
 root.querySelector('[data-mej-opt="sound"]').textContent=settings.sound?'🔊':'🔇';
 root.querySelector('[data-mej-opt="motion"]').setAttribute('aria-pressed',String(settings.motion));
 root.querySelector('[data-mej-opt="motion"]').textContent=settings.motion?'✨':'⏸';
}
function mount(){
 if(root||!document.body)return;
 root=document.createElement('aside');root.id='mej-study-companion';root.setAttribute('aria-label','المرافق العماني المشجع');
 root.innerHTML=`<div class="mej-mascot-tools" dir="ltr">
 <button type="button" data-mej-opt="sound" title="تشغيل/إيقاف التشجيع الصوتي" aria-label="تشغيل أو إيقاف الصوت">🔊</button>
 <button type="button" data-mej-opt="motion" title="تشغيل/إيقاف الحركة" aria-label="تشغيل أو إيقاف الحركة">✨</button></div>
 <div class="mej-companion-bubble" role="status" aria-live="polite" lang="en"></div>
 <div class="mej-mascot-stage" aria-hidden="true"><div class="mej-mascot">
 <svg viewBox="0 0 120 158" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="طالب عماني مبتسم">
 <ellipse cx="60" cy="150" rx="39" ry="5" fill="#093965" opacity=".12"/>
 <g class="mej-mascot-legs"><path d="M43 116v28M78 116v28" stroke="#f6f7fc" stroke-width="17" stroke-linecap="round"/>
 <path d="M32 146h23M67 146h24" stroke="#344b75" stroke-width="9" stroke-linecap="round"/></g>
 <path d="M43 72Q60 65 78 72L90 129H30Z" fill="#fff" stroke="#b8d2e9" stroke-width="2.3"/>
 <path d="M59 76v51" stroke="#cddae9" stroke-width="2"/><circle cx="62" cy="87" r="2" fill="#6486a8"/><circle cx="62" cy="98" r="2" fill="#6486a8"/>
 <g class="mej-mascot-arm-left"><path d="M39 80L20 111" stroke="#fff" stroke-width="15" stroke-linecap="round"/><circle cx="19" cy="114" r="8" fill="#eab284"/></g>
 <g class="mej-mascot-arm-right"><path d="M81 80L99 106" stroke="#fff" stroke-width="15" stroke-linecap="round"/><circle cx="101" cy="110" r="8" fill="#eab284"/></g>
 <ellipse cx="60" cy="50" rx="35" ry="36" fill="#f5c49c" stroke="#d99777" stroke-width="1.4"/>
 <path d="M27 39Q26 14 60 13Q95 15 93 38L88 37Q60 27 33 39Z" fill="#f8fafc" stroke="#795c96" stroke-width="2"/>
 <path d="M35 29l7-8 7 8 7-8 7 8 7-8 7 8 7-8" fill="none" stroke="#9877aa" stroke-width="3"/>
 <ellipse cx="48" cy="52" rx="4" ry="6" fill="#1c3248"/><ellipse cx="73" cy="52" rx="4" ry="6" fill="#1c3248"/>
 <circle cx="49" cy="50" r="1.7" fill="#fff"/><circle cx="74" cy="50" r="1.7" fill="#fff"/>
 <path d="M50 66Q60 77 72 65" fill="none" stroke="#8e4a37" stroke-width="3.3" stroke-linecap="round"/>
 <ellipse cx="32" cy="61" rx="4" ry="7" fill="#efb68b"/><ellipse cx="88" cy="61" rx="4" ry="7" fill="#efb68b"/>
 </svg></div></div>`;
 document.body.appendChild(root);
 bubble=root.querySelector('.mej-companion-bubble');
 mascot=root.querySelector('.mej-mascot');
 stage=root.querySelector('.mej-mascot-stage');
 buttons=root.querySelectorAll('.mej-mascot-tools button');
 buttons.forEach(btn=>btn.addEventListener('click',(event)=>{
  event.stopPropagation();
  const key=btn.dataset.mejOpt;
  settings[key]=!settings[key];save();applyPreferences();
  if(key==='sound'&&!settings.sound&&'speechSynthesis' in window)speechSynthesis.cancel();
 }));
 root.querySelector('.mej-mascot-stage').addEventListener('click',()=>react(true,true));
 applyPreferences();
}
function react(success,preview=false){
 if(!root)mount();
 if(!root)return;
 // Do not surface the companion on login or teacher administration pages.
 if(!preview&&!document.querySelector('#feedback'))return;
 root.hidden=false;
 const phrase=(success?compliments:encouragements)[Math.floor(Math.random()*(success?compliments:encouragements).length)];
 const serial=++sequence;
 bubble.textContent=phrase;bubble.classList.add('mej-show');
 root.classList.remove('mej-success','mej-encourage');
 if(settings.motion&&!reduced()){
  void mascot.offsetWidth;
  root.classList.add(success?'mej-success':'mej-encourage');
 }
 if(success)confetti();
 soundFX(success);speech(phrase);
 window.setTimeout(()=>{if(serial!==sequence)return;bubble.classList.remove('mej-show');root.classList.remove('mej-success','mej-encourage')},2800);
}
window.MEJCompanion={react,mount,preferences:()=>({...settings})};
function setQuizVisibility(){
 if(!root)return;
 // Only appear on the student's active quiz view; never on login, settings or dashboards.
 const feedback=document.getElementById('feedback');
 const inQuiz=!!feedback&&!!feedback.closest('#app');
 root.hidden=!inQuiz;
}
function boot(){
 mount();
 setQuizVisibility();
 const app=document.getElementById('app');
 if(app){
  const observer=new MutationObserver(setQuizVisibility);
  observer.observe(app,{childList:true,subtree:false});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
