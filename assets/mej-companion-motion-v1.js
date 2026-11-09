/* MEJ_OMANI_COMPANION_MOTION_V1
   Lightweight, fully offline SVG motion rig for the chosen boy or girl.
   Leaves the original quiz feedback/score system untouched. */
(function(){
'use strict';
const avatar=()=>{try{return typeof active==='function'?active()?.companion:null}catch(_){return null}};
const student=()=>{try{return typeof active==='function'?active():null}catch(_){return null}};
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
let previousSession=false,previousProfile='',lastType='',sequence=0;
const CSS=String.raw\`
#mej-study-companion .mej-mascot .mej-leg-left{transform-origin:47px 112px}
#mej-study-companion .mej-mascot .mej-leg-right{transform-origin:75px 112px}
#mej-study-companion:not(.mej-no-motion) .mej-mascot .mej-leg-left{animation:mej-omani-step-left 1.05s ease-in-out infinite}
#mej-study-companion:not(.mej-no-motion) .mej-mascot .mej-leg-right{animation:mej-omani-step-right 1.05s ease-in-out infinite}
#mej-study-companion.mej-sprint:not(.mej-no-motion) .mej-mascot{animation:mej-omani-run .55s ease-in-out 3!important}
#mej-study-companion.mej-sprint:not(.mej-no-motion) .mej-leg-left{animation-duration:.28s!important}
#mej-study-companion.mej-sprint:not(.mej-no-motion) .mej-leg-right{animation-duration:.28s!important}
#mej-study-companion.mej-sprint:not(.mej-no-motion) .mej-mascot-arm-right{animation:mej-mascot-wave .35s ease-in-out 3!important}
#mej-study-companion.mej-success:not(.mej-no-motion) .mej-mascot{animation:mej-omani-leap .62s cubic-bezier(.19,.8,.24,1) 2!important}
#mej-study-companion.mej-encourage:not(.mej-no-motion) .mej-mascot{animation:mej-companion-nod .65s ease-in-out 2!important}
#mej-study-companion .mej-mascot svg{filter:drop-shadow(0 3px 5px #17406955)}
@keyframes mej-omani-step-left{0%,100%{transform:rotate(13deg)}50%{transform:rotate(-16deg)}}
@keyframes mej-omani-step-right{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(13deg)}}
@keyframes mej-omani-run{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-20px,-5px) rotate(-7deg)}50%{transform:translate(-35px,-2px) rotate(4deg)}75%{transform:translate(-16px,-9px) rotate(-4deg)}}
@keyframes mej-omani-leap{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-32px) scale(1.07)}70%{transform:translateY(-6px) scale(.96)}}
@media (prefers-reduced-motion:reduce){#mej-study-companion .mej-mascot .mej-leg-left,#mej-study-companion .mej-mascot .mej-leg-right{animation:none!important}}
\`;
function fullMascot(kind){
 const girl=kind==='girl';
 const dress=girl?'url(#purpleRobe)':'url(#whiteRobe)';
 const hair=girl?
 '<path d="M28 64Q24 16 60 15Q99 15 92 71L96 113L78 124L77 56L43 56L39 121L22 116Z" fill="url(#scarf)" stroke="#6b3475" stroke-width="2"/><path d="M30 47Q35 24 60 24Q82 24 88 45Q74 31 57 33Q41 32 30 47" fill="#f8f2ff" stroke="#b57cc9" stroke-width="2"/>':
 '<path d="M24 46Q25 12 60 12Q97 13 96 47L86 49Q60 39 34 50Z" fill="url(#cap)" stroke="#7b73a2" stroke-width="2"/><path d="M32 34L42 24L51 34L60 24L69 34L78 24L87 34" fill="none" stroke="#94649a" stroke-width="3"/><path d="M34 40Q60 29 85 40" fill="none" stroke="#5279a8" stroke-width="2" stroke-dasharray="4 4"/>';
 const trim=girl?'<path d="M33 123Q61 132 86 122" fill="none" stroke="#e7c158" stroke-width="3"/><path d="M37 88L42 127" fill="none" stroke="#e7c158" stroke-width="2"/>':'<path d="M60 83V129" stroke="#b2c6d8" stroke-width="2"/><circle cx="60" cy="91" r="2" fill="#8caac2"/><circle cx="60" cy="104" r="2" fill="#8caac2"/>';
 return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 158" aria-label="\${girl?'رفيقة عمانية':'رفيق عماني'}" role="img">
 <defs>
 <linearGradient id="whiteRobe" x1="0" x2="1" y1="0" y2=".4"><stop stop-color="#ffffff"/><stop offset=".65" stop-color="#e5efff"/><stop offset="1" stop-color="#b5d0e9"/></linearGradient>
 <linearGradient id="purpleRobe" x1="0" x2="1" y1="0" y2=".4"><stop stop-color="#af61a4"/><stop offset=".5" stop-color="#823379"/><stop offset="1" stop-color="#492568"/></linearGradient>
 <linearGradient id="skin" x1="0" x2="1" y1="0" y2=".8"><stop stop-color="#ffdfb7"/><stop offset=".52" stop-color="#f5be93"/><stop offset="1" stop-color="#c78368"/></linearGradient>
 <linearGradient id="cap" x1="0" x2="1"><stop stop-color="#e8e7fa"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#aeb6d4"/></linearGradient>
 <linearGradient id="scarf" x1="0" x2="1"><stop stop-color="#b374b1"/><stop offset=".5" stop-color="#e0b8d9"/><stop offset="1" stop-color="#66346f"/></linearGradient>
 </defs>
 <ellipse cx="60" cy="152" rx="32" ry="4" fill="#052b62" opacity=".15"/>
 <g class="mej-leg-left"><path d="M47 115L42 143" stroke="\${girl?'#73366c':'#e6eef9'}" stroke-width="13" stroke-linecap="round"/><path d="M32 147L49 147" stroke="#514057" stroke-width="8" stroke-linecap="round"/></g>
 <g class="mej-leg-right"><path d="M75 115L80 143" stroke="\${girl?'#73366c':'#e6eef9'}" stroke-width="13" stroke-linecap="round"/><path d="M70 147L90 147" stroke="#514057" stroke-width="8" stroke-linecap="round"/></g>
 <path d="M42 73Q62 66 80 74L93 129Q60 137 27 128Z" fill="\${dress}" stroke="\${girl?'#5f2c67':'#a9c4dd'}" stroke-width="2"/>
 \${trim}
 <path d="M37 78Q26 87 22 109" fill="none" stroke="\${girl?'#9a4a8b':'#f3f8ff'}" stroke-width="13" stroke-linecap="round"/>
 <ellipse cx="21" cy="112" rx="8" ry="9" fill="url(#skin)"/>
 <g class="mej-mascot-arm-right"><path d="M84 78Q99 92 101 110" fill="none" stroke="\${girl?'#8f3d86':'#f5f9ff'}" stroke-width="13" stroke-linecap="round"/><ellipse cx="101" cy="113" rx="8" ry="9" fill="url(#skin)"/></g>
 <ellipse cx="60" cy="51" rx="32" ry="34" fill="url(#skin)" stroke="#c58b68" stroke-width="1"/>
 \${hair}
 <path d="M35 51Q44 45 51 51M69 51Q77 45 85 51" fill="none" stroke="#604235" stroke-width="3" stroke-linecap="round"/>
 <ellipse cx="46" cy="57" rx="6" ry="8" fill="white"/><ellipse cx="75" cy="57" rx="6" ry="8" fill="white"/>
 <ellipse cx="47" cy="58" rx="4" ry="6" fill="#2e3045"/><ellipse cx="74" cy="58" rx="4" ry="6" fill="#2e3045"/>
 <circle cx="48" cy="55" r="1.8" fill="white"/><circle cx="75" cy="55" r="1.8" fill="white"/>
 <path d="M48 70Q59 81 73 69Q62 87 48 70" fill="#873e4c" stroke="#874a44" stroke-width="1"/>
 <path d="M51 71Q59 76 69 71" fill="none" stroke="white" stroke-width="2"/>
 <ellipse cx="33" cy="67" rx="6" ry="4" fill="#fc9d8b" opacity=".3"/><ellipse cx="86" cy="67" rx="6" ry="4" fill="#fc9d8b" opacity=".3"/>
 <path d="M47 83Q60 92 74 82" stroke="#d5a64b" stroke-width="2" fill="none"/>
 <circle cx="61" cy="92" r="6" fill="#f8cd63" stroke="#fff5d0" stroke-width="1"/><path d="M58 93L62 87L64 96Z" fill="#2377b2"/>
 </svg>\`;
}
function refresh(){
 const root=document.getElementById('mej-study-companion');
 const place=root?.querySelector('.mej-mascot');
 const p=student(),selected=p?.companion;
 if(!place||!selected?.kind||!selected?.name){if(root)root.hidden=true;return}
 const kind=selected.kind==='girl'?'girl':'boy';
 if(place.dataset.kind!==kind||place.dataset.profile!==p.id){
  place.dataset.kind=kind;place.dataset.profile=p.id;
  place.innerHTML=fullMascot(kind);
  root.setAttribute('aria-label','رفيق الرحلة: '+selected.name);
 }
 const inQuiz=!!document.getElementById('feedback')?.closest('#app');
 // No mascot over the question choices while idle; show only on feedback.
 if(!inQuiz){previousSession=false;return}
 if(!previousSession&&!reduced()&&!root.classList.contains('mej-no-motion')){
  const id=++sequence;
  root.classList.add('mej-sprint');
  window.setTimeout(()=>{if(sequence===id)root.classList.remove('mej-sprint')},1700);
 }
 previousSession=true;
}
function boot(){
 const style=document.createElement('style');style.textContent=CSS;document.head.append(style);
 const app=document.getElementById('app');
 if(app){
  const observer=new MutationObserver(refresh);
  observer.observe(app,{childList:true,subtree:false});
 }
 window.addEventListener('mej-companion-change',refresh);
 // Study companion module mounts at DOM ready. Run after that module's boot.
 queueMicrotask(refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.MEJOmaniMascot={refresh};
})();
