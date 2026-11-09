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
/* MEJ_GRAMMAR_CORRECTION_V1 — short Arabic rule after a wrong grammar answer.
   Observes the existing answer-feedback panel; does not alter scoring or navigation. */
(function installGrammarCorrection(){
 const rules=[
  [/\b(present perfect|have been|has been|have .*ed|has .*ed|since|for \d+ years)\b/i,'المضارع التام: نستخدم have/has + التصريف الثالث للربط بين الماضي والحاضر. نستخدم since لبداية المدة وfor لطولها.','She has lived here for two years.'],
  [/\b(past continuous|was .*ing|were .*ing|while)\b/i,'الماضي المستمر: نستخدم was/were + الفعل مع ing لوصف حدث كان مستمرًا في الماضي.','I was reading when he called.'],
  [/\b(present continuous|am .*ing|is .*ing|are .*ing|now|at the moment)\b/i,'المضارع المستمر: نستخدم am/is/are + الفعل مع ing لحدث يقع الآن.','She is studying now.'],
  [/\b(past simple|yesterday|last (night|week|year|month)|ago|did not|didn't)\b/i,'الماضي البسيط: نستخدم التصريف الماضي للحدث المنتهي؛ وبعد did أو didn’t نستخدم الفعل في صورته الأساسية.','He visited Muscat yesterday.'],
  [/\b(will|going to|future|tomorrow|next week)\b/i,'المستقبل: نستخدم will + الفعل الأساسي، أو am/is/are going to + الفعل الأساسي للخطط والنوايا.','They are going to travel tomorrow.'],
  [/\b(comparative|superlative|than|the most|better|best|worse|worst)\b/i,'المقارنة: نستخدم الصفة + er أو more مع than للمقارنة، وthe + est أو the most للتفضيل.','Ali is taller than Sami.'],
  [/\b(passive|was built|were built|is made|are made|by whom)\b/i,'المبني للمجهول: نستخدم be بالزمن المناسب + التصريف الثالث عندما يكون التركيز على الفعل أو المفعول.','The bridge was built in 2010.'],
  [/\b(if clause|conditional|unless|if I were|would have|would)\b/i,'الجملة الشرطية: راقب نوع الشرط؛ الشرط الأول If + present ثم will + verb، والشرط الثاني If + past ثم would + verb.','If it rains, we will stay home.'],
  [/\b(must|should|could|might|may|can|have to|modal)\b/i,'الأفعال الناقصة: يأتي الفعل في صورته الأساسية بعد can, should, must, may وغيرها، دون to أو s.','You should drink water.'],
  [/\b(a or an|an apple|a book|article|the article|determiner)\b/i,'أدوات التعريف: نستخدم a قبل الصوت الساكن وan قبل الصوت المتحرك، وthe عند الحديث عن شيء محدد.','She has an umbrella.'],
  [/\b(he|she|it|every day|usually|always|often|doesn't|does not|present simple)\b/i,'المضارع البسيط: نضيف s أو es للفعل مع he/she/it في الإثبات، وبعد does أو doesn’t يعود الفعل إلى صورته الأساسية.','She plays tennis every day.'],
  [/\b(preposition|in\/on\/at|in or on|on or at|at or in)\b/i,'حروف الجر: غالبًا نستخدم at مع الساعة، on مع الأيام والتواريخ، وin مع الشهور والسنوات والفترات.','We meet on Monday at 8 o’clock.'],
  [/\b(there is|there are|singular|plural|much|many|some|any)\b/i,'المفرد والجمع: نستخدم is وthere is للمفرد، وare وthere are للجمع. وتأتي many مع المعدود وmuch مع غير المعدود.','There are many books.'],
  [/\b(question tag|question word|do you|does she|did he|wh-question)\b/i,'صياغة السؤال: نستخدم فعلًا مساعدًا مناسبًا قبل الفاعل، مثل do/does في المضارع وdid في الماضي، ثم الفعل الأساسي.','Where does she live?'],
  [/\b(relative clause|who|which|whose|where)\b/i,'ضمائر الوصل: who للأشخاص، which للأشياء، where للأماكن، وwhose للملكية.','This is the boy who helped me.']
 ];
 const tidy=x=>String(x||'').replace(/\s+/g,' ').trim();
 function explain(context){
  for(const [re,ar,en] of rules){if(re.test(context))return {ar,en};}
  return {ar:'راجع تركيب الجملة: حدّد الفاعل والزمن أولًا، ثم لاحظ شكل الفعل وترتيب الكلمات في الإجابة الصحيحة.',en:''};
 }
 let scheduled=false;
 function refresh(){
  scheduled=false;
  const feedback=document.querySelector('#app #feedback');
  if(!feedback)return;
  const bad=feedback.classList.contains('incorrect')||!!feedback.querySelector('.incorrect')||
    /(?:❌|✖|إجابة خاطئة|غير صحيحة|حاول مجدداً|try again|incorrect|wrong answer)/i.test(tidy(feedback.textContent));
  if(!bad){feedback.querySelector('#mej-grammar-correction')?.remove();return;}
  const app=document.getElementById('app');
  const scope=feedback.closest('section.card')||feedback.closest('.card')||app;
  const body=tidy(scope?.textContent).slice(0,1500);
  const isGrammar=/(?:\bgrammar\b|قواعد|قاعدة نحوية|صحح الجملة|اختر الصيغة الصحيحة)/i.test(body);
  if(!isGrammar){feedback.querySelector('#mej-grammar-correction')?.remove();return;}
  const context=body.replace(tidy(feedback.textContent),'');
  const {ar,en}=explain(context);
  const existing=feedback.querySelector('#mej-grammar-correction');
  if(existing&&existing.dataset.rule===ar)return;
  existing?.remove();
  const card=document.createElement('div');card.id='mej-grammar-correction';
  card.dataset.rule=ar;card.dir='rtl';card.setAttribute('role','note');
  card.style.cssText='margin-top:12px;padding:12px 14px;background:#f1f8ff;color:#153b67;border:1px solid #98c8f1;border-radius:12px;font-size:clamp(14px,1.8vw,17px);line-height:1.7;text-align:right';
  const head=document.createElement('strong');head.textContent='📘 تذكّر القاعدة';
  const line=document.createElement('div');line.textContent=ar;
  card.append(head,line);
  if(en){const ex=document.createElement('div');ex.dir='ltr';ex.style.cssText='margin-top:6px;color:#176b52;font-weight:700;text-align:left';ex.textContent='Example: '+en;card.append(ex);}
  feedback.appendChild(card);
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
 function start(){
  const app=document.getElementById('app');if(!app)return;
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
/* MEJ_READING_QUESTION_LAYOUT_V1 — separate passage from question without changing answers. */
(function installQuestionLayout(){
 const style=document.createElement('style');
 style.id='mej-question-layout-style';
 style.textContent=[
  '#app .mej-question-passage{display:block;white-space:pre-line;line-height:1.9;font-family:Georgia,"Times New Roman",serif;font-size:clamp(16px,2vw,21px);color:#18365b;margin:0 0 14px;padding:12px 15px;background:#f6faff;border-inline-start:4px solid #75b6ec;border-radius:10px;direction:ltr;text-align:left}',
  '#app .mej-question-prompt{display:block;clear:both;margin:13px 0 12px;padding:9px 12px;font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;font-size:clamp(17px,2.25vw,23px);font-weight:800;line-height:1.65;color:#13578a;border-inline-start:4px solid #18a4be;background:#edfaff;border-radius:9px}',
  '#app .mej-question-prompt:lang(en){direction:ltr;text-align:left}',
  '#app .mej-question-prompt:lang(ar){direction:rtl;text-align:right}',
  '#app .passage{display:block;white-space:pre-line;line-height:1.9;font-family:Georgia,"Times New Roman",serif;font-size:clamp(16px,2vw,21px);color:#18365b;margin-block:8px 14px}',
  '@media(max-width:600px){#app .mej-question-passage{padding:10px 11px;margin-bottom:11px}#app .mej-question-prompt{padding:9px 10px;margin-top:11px}}'
 ].join('\n');
 function start(){
  if(!document.getElementById(style.id))document.head.appendChild(style);
  const app=document.getElementById('app');
  if(!app)return;
  let pending=false;
  function refresh(){
   pending=false;
   if(!app.querySelector('#feedback'))return;
   // Only examine compact text prompts. Never touch the student's answer, choices or passage markup.
   const nodes=app.querySelectorAll('h2,h3,h4,p,.question,.question-text,.question-prompt,.prompt');
   nodes.forEach(el=>{
    if(el.closest('#feedback,button,label,.mej-question-prompt,.mej-question-passage,.options,.answers,.learning'))return;
    if(el.dataset.mejQuestionLayout==='done')return;
    if(el.children.length!==0)return;
    const raw=el.textContent.trim();
    if(raw.length<20||raw.length>1050)return;
    // A question and preceding short text in one element.
    const match=raw.match(/^([\s\S]+[.!؟])\s+([^.!؟\n]*[?؟])$/);
    if(match&&match[1].length>18&&match[2].trim().length>4){
     const first=document.createElement('span');first.className='mej-question-passage';first.textContent=match[1];
     const question=document.createElement('span');question.className='mej-question-prompt';
     question.lang=/[\u0600-\u06FF]/.test(match[2])?'ar':'en';question.textContent=match[2].trim();
     el.replaceChildren(first,question);
     el.dataset.mejQuestionLayout='done';return;
    }
    // When the question is already separate, make it visually distinct from nearby passage.
    if(/[?؟]\s*$/.test(raw)&&raw.length<260){
     const passage=el.previousElementSibling;
     if(passage&&(passage.matches('.passage,.reading-passage,blockquote,p')||passage.textContent.trim().length>65)){
      el.classList.add('mej-question-prompt');
      el.lang=/[\u0600-\u06FF]/.test(raw)?'ar':'en';
      el.dataset.mejQuestionLayout='done';
     }
    }
   });
  }
  function schedule(){if(pending)return;pending=true;queueMicrotask(refresh);}
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
/* MEJ_QUESTION_CLARITY_V2 — explicit activity type, visibly distinct prompts,
   and safe alternative instructions for repeated vocabulary questions.
   No answer, scoring, passage, or saved progress is changed. */
(function(){
 'use strict';
 const styles=`
 #app .mej-v2-question{font-family:"Trebuchet MS",Verdana,Arial,sans-serif!important;font-size:clamp(19px,2.6vw,27px)!important;font-weight:800!important;line-height:1.65!important;letter-spacing:.15px;color:#075a80!important;background:#e9f8ff!important;border:2px solid #63c4df!important;border-radius:13px!important;padding:12px 15px!important;margin:13px 0!important;display:block!important;white-space:normal!important}
 #app .mej-v2-question[lang="ar"]{font-family:Tahoma,"Segoe UI",sans-serif!important;direction:rtl;text-align:right}
 #app .mej-v2-skill{display:block;width:max-content;max-width:100%;font-family:Tahoma,"Segoe UI",sans-serif;font-size:14px;font-weight:800;line-height:1.5;padding:5px 11px;margin:6px 0 7px;border-radius:7px;color:#fff;background:#146b80;direction:rtl}
 #app .mej-v2-passage{font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(17px,2.15vw,22px)!important;line-height:1.9!important;white-space:pre-line}
 @media(max-width:600px){#app .mej-v2-question{font-size:20px!important;padding:10px 12px!important}}
 `;
 const css=document.createElement('style');css.id='mej-question-clarity-v2';css.textContent=styles;
 const labels={Reading:'📖 قراءة وفهم',Listening:'🎧 استماع',Grammar:'📘 قواعد',Vocabulary:'🔤 مفردات',Writing:'✍️ كتابة'};
 const alternatives=[
  [/^اختر معنى الكلمة الإنجليزية:\s*(.+)$/u,['ما معنى الكلمة الإنجليزية: $1؟','اختر الترجمة الصحيحة للكلمة: $1','أي معنى يناسب الكلمة: $1؟']],
  [/^اكتب الكلمة الإنجليزية بمعنى:\s*(.+)$/u,['ما الكلمة الإنجليزية التي تعني: $1؟','اكتب بالإنجليزية كلمة معناها: $1','أكمل بالكلمة الإنجليزية المناسبة لمعنى: $1']],
  [/^Listen carefully and select the word\.?$/i,['Listen and choose the correct word.','Which word can you hear? Listen carefully.','Listen first, then select the matching word.']]
 ];
 let previous='',step=0,busy=false;
 function ownText(node){return (node.textContent||'').replace(/\s+/g,' ').trim()}
 function typeFromText(scope){
  const labelsText=Array.from(scope.querySelectorAll('span,small,strong,h2,h3,h4')).slice(0,45).map(e=>ownText(e)).filter(t=>t.length<55).join(' | ');
  const m=labelsText.match(/\b(Reading|Listening|Grammar|Vocabulary|Writing)\b/i);
  if(m)return m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
  if(/قراءة|فهم المقروء/.test(labelsText))return 'Reading';
  if(/استماع|إنصات/.test(labelsText))return 'Listening';
  if(/قواعد/.test(labelsText))return 'Grammar';
  if(/مفردات/.test(labelsText))return 'Vocabulary';
  if(/كتابة/.test(labelsText))return 'Writing';
  return '';
 }
 function isQuestion(t){return /[?؟]\s*$/.test(t)||/^(اختر معنى الكلمة الإنجليزية:|اكتب الكلمة الإنجليزية بمعنى:|Listen carefully and select the word|Choose |Select |Write |Read and |What |Where |When |Who |Which |How |Why |Is |Are |Do |Does |Did )/i.test(t)}
 function variant(text){
  for(const [re,templates] of alternatives){
   const m=text.match(re);if(!m)continue;
   const choice=templates[step%templates.length];return choice.replace('$1',m[1]||'');
  }
  return text;
 }
 function refresh(){
  busy=false;
  const app=document.getElementById('app');if(!app||!app.querySelector('#feedback'))return;
  const root=app.querySelector('#feedback')?.closest('section.card,.card,section')||app;
  const nodes=[...root.querySelectorAll('h1,h2,h3,h4,p,.question,.question-text,.question-prompt,.prompt,.mej-question-prompt')];
  const candidates=nodes.filter(el=>{
   if(el.closest('#feedback,button,label,.options,.answers,.mej-v2-skill,.mej-question-passage'))return false;
   if(el.children.length && !el.classList.contains('mej-question-prompt'))return false;
   const t=ownText(el);return t.length>=5&&t.length<=290&&isQuestion(t);
  });
  const prompt=candidates.find(el=>el.classList.contains('mej-question-prompt'))||candidates[candidates.length-1];
  if(!prompt)return;
  const original=prompt.dataset.mejV2Original||ownText(prompt);
  // Treat a new question as a new event, but never reshuffle on feedback changes.
  const fingerprint=original+'|'+(root.querySelector('.passage,.reading-passage,.mej-question-passage')?.textContent||'').slice(0,90);
  if(previous!==fingerprint){previous=fingerprint;step++;}
  if(!prompt.dataset.mejV2Original)prompt.dataset.mejV2Original=original;
  const changed=variant(original);
  if(ownText(prompt)!==changed)prompt.textContent=changed;
  prompt.classList.add('mej-v2-question');
  prompt.lang=/[\u0600-\u06FF]/.test(changed)?'ar':'en';
  const skill=typeFromText(root)||(/Listen/i.test(original)?'Listening':/معنى الكلمة|الكلمة الإنجليزية/.test(original)?'Vocabulary':root.querySelector('.passage,.reading-passage,.mej-question-passage')?'Reading':'');
  if(skill){
   let marker=prompt.previousElementSibling;
   if(!marker?.classList.contains('mej-v2-skill')){
    marker=document.createElement('div');marker.className='mej-v2-skill';prompt.before(marker);
   }
   if(marker.textContent!=='نوع السؤال: '+labels[skill])marker.textContent='نوع السؤال: '+labels[skill];
  }
  root.querySelectorAll('.passage,.reading-passage,.mej-question-passage').forEach(e=>e.classList.add('mej-v2-passage'));
 }
 function schedule(){if(busy)return;busy=true;queueMicrotask(refresh)}
 function boot(){
  if(!document.getElementById(css.id))document.head.appendChild(css);
  const app=document.getElementById('app');if(!app)return;
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* Diagnostic return navigation: return to voyage (second screen), not the home screen. */
(function(){
 'use strict';
 const returnLabel='↩ العودة إلى رحلتي';
 function onDiagnostic(){
  const app=document.getElementById('app');
  if(!app)return false;
  const text=(app.textContent||'').slice(0,1800);
  return /(?:Placement|تحديد المستوى)/i.test(text)&&/(?:Quiz|اختبار تشخيصي)/i.test(text);
 }
 function update(){
  if(!onDiagnostic())return;
  const app=document.getElementById('app');if(!app)return;
  for(const el of app.querySelectorAll('button,a,[role="button"]')){
   // Keep fixing the actual button even after app re-renders it.
   const label=(el.textContent||'').replace(/\s+/g,' ').trim();
   const click=el.getAttribute('onclick')||'';
   const homeAction=/\b(?:route|goTo|navigate)\s*\(\s*['"]home['"]\s*\)/i.test(click);
   const homeLabel=/العودة\s*(?:إلى|لل)?\s*(?:الصفحة\s*)?الرئيسية|back\s+to\s+home/i.test(label);
   if(!(homeLabel||homeAction&&/عودة|رجوع|back/i.test(label)))continue;
   el.dataset.mejReturnVoyage='1';
   if(el.textContent!==returnLabel)el.textContent=returnLabel;
  }
 }
 function click(event){
  const el=event.target?.closest?.('[data-mej-return-voyage="1"]');
  if(!el||!onDiagnostic())return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  if(typeof window.route==='function')window.route('journey');
  else if(typeof window.journey==='function')window.journey();
 }
 function boot(){
  const app=document.getElementById('app');if(!app)return;
  let pending=false;
  const schedule=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;update()})};
  new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  document.addEventListener('click',click,true);
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* Diagnostic label correction: '24' is the number of questions, not the grade. */
(function(){
 'use strict';
 function correct(){
  const app=document.getElementById('app');if(!app)return;
  for(const el of app.querySelectorAll('p,div,span,small')){
   if(el.children.length||el.closest('button,#feedback'))continue;
   const value=el.textContent||'';
   if(!/Registered grade:\s*\d+/i.test(value)||value.length>250)continue;
   const full=value.match(/Registered grade:\s*(\d+)\s*[•|·]\s*(?:الصف\s*(\d+)|(\d+)\s*الصف)\s*questions,?\s*up to Level\s*(\d+)/i);
   let fixed;
   if(full){
    const count=full[1], grade=full[2]||full[3], max=full[4];
    fixed='Grade '+grade+' Placement Test • '+count+' Questions • Levels 0–'+max;
   }else{
    fixed=value.replace(/Registered grade:\s*(\d+)/i,(_,count)=>'Diagnostic questions: '+count);
   }
   if(fixed!==value)el.textContent=fixed;
  }
 }
 function start(){
  const app=document.getElementById('app');if(!app)return;
  let scheduled=false;
  const queue=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;correct()})};
  new MutationObserver(queue).observe(app,{childList:true,subtree:true,characterData:true});
  queue();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


/* 2026-11-09: Quiz return goes to its parent skills screen, not the home/levels exit.
 * Delegated listener survives question rerenders; no answers/progress are modified. */
(function installQuizReturnToSkills(){
 'use strict';
 const root=()=>document.getElementById('app');
 const labelOf=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
 const isQuiz=()=>{const app=root();return !!(app&&app.querySelector('#feedback')&&
   /(?:السؤال\s*\d+|Question\s*\d+|Level\s*\d+\s*[•·]\s*(?:Reading|Listening|Grammar|Vocabulary|Writing))/i.test(app.textContent||''));};
 function refresh(){
  if(!isQuiz())return;
  const app=root();
  for(const btn of app.querySelectorAll('button,[role="button"],a')){
   const label=labelOf(btn);
   if(!/^(?:خروج|Exit|Quit)$/i.test(label))continue;
   btn.dataset.mejQuizReturn='1';
   if(label!=='↩ عودة')btn.textContent='↩ عودة';
  }
 }
 document.addEventListener('click',function(event){
  const button=event.target?.closest?.('[data-mej-quiz-return="1"]');
  if(!button||!isQuiz())return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  if(typeof window.route==='function')window.route('skills');
  else if(typeof window.history?.back==='function')window.history.back();
 },true);
 function boot(){
  const app=root();if(!app)return;
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh()})};
  new MutationObserver(schedule).observe(app,{subtree:true,childList:true});
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* Writing lab v1: explicit return, curriculum-aligned practice topics, user-initiated
 * LanguageTool proofing. Drafts stay in the existing app; no automatic remote upload. */
(function installMEJWritingLab(){
 'use strict';
 const TOPICS={
  12:{
   1:[
    ['Retail Therapy','Malls and traditional markets in Oman: which offers a better shopping experience?','shopping markets malls prices products customers'],
    ['Retail Therapy','Should teenagers spend less money on famous brands?','brands money teenagers spending shopping'],
    ['Retail Therapy','How do advertisements influence young people?','advertisements products customers influence brands'],
    ['Retail Therapy','The advantages and disadvantages of online shopping','online shopping delivery advantages disadvantages'],
    ['Starting University','How can students prepare for life at university?','university students study preparation skills'],
    ['Starting University','The benefits and challenges of studying abroad','study abroad country language university challenges'],
    ['Starting University','Write a letter thanking a teacher for their help','teacher school thank help learning'],
    ['Starting University','How to manage time during the first year at university','university time study schedule management'],
    ['Tourism and Hospitality','How can Oman attract more tourists?','oman tourism visitors hotels attractions'],
    ['Tourism and Hospitality','Describe a memorable holiday in Oman','holiday oman trip visit experience'],
    ['Tourism and Hospitality','Why is good customer service important in hotels?','service hotels guests tourists staff'],
    ['Tourism and Hospitality','The benefits of tourism for local communities','tourism local jobs economy community'],
    ['Travel and Transport','Public transport or private cars: which is better?','transport cars buses environment traffic'],
    ['Travel and Transport','How can we reduce traffic congestion?','traffic roads cars congestion solutions'],
    ['Travel and Transport','Ways to improve road safety in Oman','roads safety drivers accidents rules'],
    ['Travel and Transport','The future of air and rail travel','travel aircraft trains transport future']
   ],
   2:[
    ['News and the Media','The advantages and dangers of social media news','news media online information sources'],
    ['News and the Media','What makes a reliable news report?','news reporter reliable facts information'],
    ['News and the Media','Write a short news story about a school event','school event news report students'],
    ['News and the Media','The role of interviews in journalism','interviews journalists questions information'],
    ['Work and Careers','What is your dream job and why?','career job work skills future'],
    ['Work and Careers','How can students prepare for a job interview?','job interview questions skills preparation'],
    ['Work and Careers','Write a formal email applying for a summer job','job application email skills experience'],
    ['Work and Careers','Why is teamwork important in the workplace?','team work colleagues cooperation success'],
    ['Health and Safety','How can teenagers maintain a healthy lifestyle?','health diet exercise sleep lifestyle'],
    ['Health and Safety','The importance of safety rules at home','home safety accidents rules prevention'],
    ['Health and Safety','Why should young people practise sports?','sports exercise health fitness people'],
    ['Health and Safety','How should families prepare for emergencies?','emergency safety families first aid preparedness'],
    ['Citizenship','What makes a responsible citizen?','citizen responsibility community rights duties'],
    ['Citizenship','How can young people volunteer in Oman?','volunteer oman community help organisations'],
    ['Citizenship','The importance of protecting public places','public places environment citizens clean'],
    ['Citizenship','How can Omani citizens contribute to the world?','oman citizens global community cooperation']
   ]
  },
  11:{
   1:[
    ['Communication','The advantages and disadvantages of mobile phones','mobile phones communication advantages disadvantages'],
    ['Communication','Why is body language important?','body language gestures communication people'],
    ['Communication','Write an email inviting a friend to Oman','email friend oman invitation visit'],
    ['Communication','How can teenagers use the internet safely?','internet teenagers safety privacy online'],
    ['Those Teenage Things','The qualities of a good friend','friendship friends trust honest support'],
    ['Those Teenage Things','Challenges teenagers face today','teenagers school challenges family stress'],
    ['Those Teenage Things','How can parents and teenagers understand each other?','parents teenagers family communication respect'],
    ['Those Teenage Things','Positive and negative influences on teenagers','teenagers influences habits behaviour choices'],
    ['Travellers and Tourists','Describe a tourist destination in Oman','tourism destination oman attractions travel'],
    ['Travellers and Tourists','Why do people enjoy travelling?','travel tourists culture experiences places'],
    ['Travellers and Tourists','Design a two-day tour for visitors to Oman','tour oman itinerary visit attractions'],
    ['Travellers and Tourists','The benefits of domestic tourism','oman tourism local economy travel'],
    ['Innovation','How can smart homes improve our lives?','smart homes technology devices convenience'],
    ['Innovation','Advantages and disadvantages of virtual reality','virtual reality technology advantages disadvantages'],
    ['Innovation','Is online shopping better than shopping in stores?','shopping online stores products delivery'],
    ['Innovation','An invention that changed the world','invention technology change life']
   ],
   2:[
    ['The Brightest and Best','Why are the Olympic Games important?','olympic sports athletes countries games'],
    ['The Brightest and Best','Describe an inspiring athlete or achiever','athlete success training inspiration'],
    ['The Brightest and Best','What can we learn from record breakers?','record achievement effort determination success'],
    ['The Brightest and Best','Describe a famous natural wonder','nature mountain natural wonder world'],
    ['Sources of Inspiration','A person who inspires you','inspiration person achievements qualities'],
    ['Sources of Inspiration','How can music inspire young people?','music inspiration teenagers feelings'],
    ['Sources of Inspiration','Write about a story that taught you a lesson','story characters lesson experience'],
    ['Sources of Inspiration','Why is reading important for teenagers?','reading books knowledge imagination'],
    ['Connections','The benefits and risks of social networking','social networks friends online benefits risks'],
    ['Connections','Why is volunteering important?','volunteer community people help'],
    ['Connections','How can we build strong relationships?','relationships friends family communication trust'],
    ['Connections','The value of remembering family traditions','memory family traditions culture'],
    ['Beginnings and Endings','Describe an important change in your life','life change experience feelings'],
    ['Beginnings and Endings','How do people celebrate the New Year?','new year celebration traditions families'],
    ['Beginnings and Endings','Describe a festival in Oman','festival oman celebration traditions'],
    ['Beginnings and Endings','How can students prepare for life after school?','school future plans study career']
   ]
  }
 };
 const ID='mej-writing-lab-v1';
 const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
 const wordset=s=>new Set((s.toLowerCase().match(/[a-z]{3,}/g)||[]).filter(w=>!/^(the|and|for|this|that|with|from|have|there|they|are|was|were|but|about|your|into|their|which)$/.test(w)));
 function locate(){
  const textareas=[...document.querySelectorAll('textarea')].filter(e=>e.offsetWidth>0&&e.offsetHeight>0);
  const area=textareas.find(e=>/Introduction|Body|Conclusion/i.test(e.placeholder||''))||textareas.find(e=>e.closest('#app'))||null;
  if(!area)return null;
  const section=area.closest('section.card,section,.card,main,article')||area.parentElement?.parentElement;
  if(!section)return null;
  const body=normalize(section.textContent).slice(0,2400);
  if(!/كتابة|writing|مهمة الكتابة|المسودة|مراجعة بنيوية/i.test(body))return null;
  const selects=[...section.querySelectorAll('select')];
  const gradeSelect=selects.find(s=>[...s.options].some(o=>/^(?:11|12)$/.test(o.value||o.textContent.trim())));
  const topicSelect=selects.find(s=>s!==gradeSelect&&s.options.length>1);
  return {area,section,gradeSelect,topicSelect};
 }
 function addTopics(w){
  if(!w.gradeSelect||!w.topicSelect)return;
  const grade=parseInt(w.gradeSelect.value,10);
  const selections=TOPICS[grade];if(!selections)return;
  if(w.topicSelect.dataset.mejWritingTopicsGrade===String(grade))return;
  w.topicSelect.querySelectorAll('optgroup[data-mej-writing-topics]').forEach(e=>e.remove());
  for(const sem of [1,2]){
   const group=document.createElement('optgroup');
   group.label='الفصل '+(sem===1?'الأول':'الثاني')+' — موضوعات تدريبية إضافية';
   group.dataset.mejWritingTopics='1';
   selections[sem].forEach(([theme,title,keywords])=>{
    if([...w.topicSelect.options].some(o=>normalize(o.textContent).toLowerCase()===title.toLowerCase()))return;
    const opt=document.createElement('option');
    opt.value=title;
    opt.textContent=theme+' • '+title;
    opt.dataset.mejKeywords=keywords;group.append(opt);
   });
   if(group.children.length)w.topicSelect.append(group);
  }
  w.topicSelect.dataset.mejWritingTopicsGrade=String(grade);
 }
 function relevance(w){
  const chosen=w.topicSelect?.selectedOptions?.[0];
  const keywords=chosen?.dataset.mejKeywords;
  if(!keywords)return 'مطابقة الموضوع: لا تتوفر كلمات مفتاحية لهذا العنوان، وتحتاج الأفكار إلى مراجعة المعلم.';
  const words=wordset(w.area.value);
  const targets=[...wordset(keywords)];
  const hits=targets.filter(t=>words.has(t)||[...words].some(x=>x.startsWith(t.slice(0,Math.min(5,t.length)))));
  return 'مؤشر ارتباط الكلمات بالموضوع: '+hits.length+'/'+targets.length+
   ' — مؤشر تقريبي لا يستطيع الحكم على صحة الأفكار أو تنظيم الحجج.';
 }
 function show(w){
  let panel=document.getElementById(ID);
  if(panel&&panel.dataset.target===String(w.area.dataset.mejWritingArea||''))return panel;
  if(panel)panel.remove();
  panel=document.createElement('div');panel.id=ID;panel.dir='rtl';
  if(!w.area.dataset.mejWritingArea)w.area.dataset.mejWritingArea='active';
  panel.dataset.target=w.area.dataset.mejWritingArea;
  panel.style.cssText='margin:12px 0;padding:12px;border:2px solid #a9d7ef;border-radius:16px;background:#eaf8ff;color:#173d5c;font:600 15px/1.65 Tahoma,Arial,sans-serif';
  const header=document.createElement('div');header.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px';
  const back=document.createElement('button');back.type='button';back.textContent='↩ عودة إلى المهارات';
  const check=document.createElement('button');check.type='button';check.textContent='🔎 تدقيق الإملاء والقواعد (بالإنترنت)';
  for(const b of [back,check])b.style.cssText='flex:1 1 180px;border:0;border-radius:11px;padding:10px;background:#157fba;color:white;font:700 15px Tahoma;cursor:pointer';
  header.append(back,check);
  const note=document.createElement('div');note.textContent='الفحص اللغوي عبر LanguageTool مجاني ويُرسل النص للخدمة فقط عند الضغط على زر التدقيق. لا تستخدم أسماء أو بيانات شخصية. المراجعة لا تغني عن تقييم المعلم.';
  note.style.cssText='font-size:12px;font-weight:400;margin:6px 0';
  const status=document.createElement('div');status.setAttribute('aria-live','polite');
  status.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px';
  const credit=document.createElement('a');credit.href='https://languagetool.org/';credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='LanguageTool — خدمة التدقيق اللغوي';credit.style.cssText='display:block;font-size:12px;margin-top:6px';
  panel.append(header,note,status,credit);
  const anchor=w.area.closest('div')||w.area;
  anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  back.addEventListener('click',()=>{
   // Writing is a skill: do not route back to grade levels or the home screen.
   if(typeof window.route==='function')window.route('skills');
   else if(typeof window.history?.back==='function')window.history.back();
  });
  check.addEventListener('click',async()=>{
   const current=locate();if(!current)return;
   const text=current.area.value.trim();
   if(!text){status.textContent='اكتب نصًا أولًا.';return;}
   if(text.length>19000){status.textContent='النص طويل جدًا للفحص المجاني.';return;}
   status.textContent='جاري التدقيق اللغوي...';
   check.disabled=true;
   try{
    const payload=new URLSearchParams({text,language:'en-US',enabledOnly:'false'});
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),18000);
    let response;
    try{response=await fetch('https://api.languagetool.org/v2/check',{method:'POST',body:payload,signal:controller.signal});}
    finally{clearTimeout(timer);}
    if(!response.ok)throw new Error('HTTP '+response.status);
    const result=await response.json();
    const matches=(result.matches||[]).slice(0,30);
    status.replaceChildren();
    const title=document.createElement('strong');
    title.textContent=matches.length?'ملاحظات لغوية محتملة ('+matches.length+')':'لم تُكتشف أخطاء بالقواعد المتاحة. هذا لا يعني أن النص خالٍ تمامًا من الأخطاء.';
    status.append(title,document.createElement('hr'));
    matches.forEach((m,i)=>{
     const p=document.createElement('p');p.style.cssText='margin:7px 0;padding:8px;background:white;border-radius:8px;font-weight:400';
     const quoted=text.slice(Math.max(0,m.offset||0),Math.min(text.length,(m.offset||0)+(m.length||0)));
     const suggestions=(m.replacements||[]).slice(0,3).map(r=>r.value).join(' / ');
     p.textContent=(i+1)+'. «'+quoted+'» — '+(m.message||'تحقق من هذه العبارة')+(suggestions?' | اقتراح: '+suggestions:'');
     status.append(p);
    });
    const relevanceNote=document.createElement('p');relevanceNote.textContent=relevance(current);status.append(relevanceNote);
   }catch(e){
    status.textContent='تعذر الاتصال بخدمة التدقيق حاليًا. بقيت المسودة محفوظة في الصفحة ويمكن مواصلة المراجعة البنيوية دون إنترنت. ('+String(e.message||'تعذر الاتصال')+')';
   }finally{check.disabled=false;}
  });
  return panel;
 }
 let running=false;
 function scan(){
  if(running)return;running=true;
  try{const w=locate();if(w){show(w);}else document.getElementById(ID)?.remove();}
  finally{running=false;}
 }
 let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;scan()},120);}
 function boot(){
  scan();
  document.addEventListener('change',event=>{if(event.target?.tagName==='SELECT')schedule()},true);
  new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{subtree:true,childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* AI writing feedback V1: explicit opt-in, securely proxied through Supabase.
 * Never expose provider secrets, never send text automatically. */
(function installMEJAIWritingFeedback(){
 'use strict';
 const ENDPOINT='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-writing-ai';
 const ID='mej-writing-ai-feedback';
 function writing(){
  const area=[...document.querySelectorAll('textarea')].find(e=>e.offsetWidth>0&&e.offsetHeight>0&&/Introduction|Body|Conclusion/i.test(e.placeholder||''));
  if(!area)return null;
  const section=area.closest('section.card,section,.card,main,article')||area.parentElement?.parentElement;
  if(!section||!/writing|كتابة|المسودة/i.test(section.textContent||''))return null;
  const selects=[...section.querySelectorAll('select')];
  const grade=selects.find(s=>[...s.options].some(o=>/^(11|12)$/.test(o.value||o.textContent.trim())));
  const topic=selects.find(s=>s!==grade&&!s.dataset.mejGenreSelector&&s.options.length>1);
  return {area,section,grade,topic,genre:document.getElementById('mej-writing-genre')};
 }
 function element(tag,txt,parent,style){
  const node=document.createElement(tag);node.textContent=txt;
  if(style)node.style.cssText=style;
  if(parent)parent.append(node);
  return node;
 }
 function feedbackView(root,obj){
  root.replaceChildren();
  element('h3','مراجعة الكتابة بالذكاء الاصطناعي',root,'margin:6px 0;color:#075f83');
  const sections=[
   ['ملخص',obj.summary],
   ['نقاط القوة',obj.strengths],
   ['الأفكار ومدى مطابقتها للموضوع',[obj.ideas?.assessment,obj.ideas?.relevance,...(obj.ideas?.missing_ideas||[])]],
   ['ترتيب الأفكار والفقرات',[obj.organization?.assessment,...(obj.organization?.paragraph_notes||[]),...(obj.organization?.suggested_order||[])]],
   ['تراكيب الجمل',[obj.sentences?.assessment,...(obj.sentences?.issues||[]).map(i=>'«'+i.original+'» ← '+i.suggestion+' | '+i.why)]],
   ['القواعد والإملاء والترقيم',[obj.language?.assessment,...(obj.language?.issues||[]).map(i=>'«'+i.original+'» ← '+i.suggestion+' | '+i.why)]],
   ['خصائص نوع الكتابة',[obj.genre?.assessment,...(obj.genre?.conventions_to_improve||[])]],
   ['خطوات التحسين التالية',obj.next_steps],
   ['مثال قصير للتحسين',obj.model_example]
  ];
  sections.forEach(([heading,items])=>{
   const details=document.createElement('details');details.open=true;
   details.style.cssText='padding:9px 10px;border:1px solid #a7d9eb;border-radius:11px;background:#fff;margin:9px 0';
   const summary=element('summary',heading,details,'font-weight:800;cursor:pointer;color:#0a6389');
   summary.setAttribute('role','heading');
   for(const v of (Array.isArray(items)?items:[items])){
    if(typeof v!=='string'||!v.trim())continue;
    element('p',v,details,'margin:6px 0;font-weight:400;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere');
   }
   root.append(details);
  });
  element('small','هذه ملاحظات تعليمية آلية، وليست درجة رسمية. راجع مقترحات التصحيح قبل اعتمادها.',root,'display:block;margin:8px 0;color:#416376');
 }
 let busy=false;
 function mount(){
  const w=writing();if(!w)return;
  if(document.getElementById(ID))return;
  const outer=document.createElement('div');outer.id=ID;outer.dir='rtl';
  outer.style.cssText='margin:13px 0;padding:13px;border:2px solid #65b9d5;border-radius:16px;background:#eaf8ff;color:#173b56;font:600 15px/1.7 Tahoma,Arial,sans-serif';
  element('h3','🤖 مراجعة متكاملة بالذكاء الاصطناعي',outer,'margin:0 0 6px');
  element('p','تفحص ملاءمة الأفكار، ترابطها، ترتيب الفقرات، الجمل، الإملاء والقواعد، مع اقتراحات تحسين تناسب نوع الكتابة.',outer,'font-weight:400;margin:0 0 8px');
  const consent=document.createElement('label');consent.style.cssText='display:flex;align-items:flex-start;gap:7px;font-size:13px;font-weight:400';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.style.cssText='width:18px;height:18px;flex:none;margin-top:4px';
  consent.append(checkbox,document.createTextNode(' أوافق على إرسال نص الكتابة فقط إلى خدمة الذكاء الاصطناعي للتحليل. لن يُرسل الاسم أو حساب الطالب، ولا يُرسل النص تلقائيًا.'));
  outer.append(consent);
  const button=element('button','✨ حلّل كتابتي بالذكاء الاصطناعي',outer,'display:block;width:100%;margin:12px 0;border:0;border-radius:12px;padding:12px;background:#087fa9;color:white;font:800 16px Tahoma,Arial;cursor:pointer');
  button.type='button';
  const status=element('div','',outer,'font-size:13px;white-space:pre-wrap');
  status.setAttribute('aria-live','polite');
  const results=document.createElement('div');outer.append(results);
  button.addEventListener('click',async()=>{
   if(busy)return;
   if(!checkbox.checked){status.textContent='يرجى الموافقة على إرسال النص للتحليل أولًا.';return;}
   if(!navigator.onLine){status.textContent='مراجعة AI تحتاج اتصالًا بالإنترنت. يمكنك استخدام المراجعة البنيوية المحلية.';return;}
   const cur=writing();if(!cur)return;
   const text=cur.area.value.trim();
   if(text.length<50||text.length>7000){status.textContent='اكتب بين 50 و7000 حرف قبل طلب التحليل.';return;}
   const topic=cur.topic?.selectedOptions?.[0]?.textContent||'';
   const grade=Number(cur.grade?.value||0);
   const genre=cur.genre?.value||'opinion';
   if(!topic||![11,12].includes(grade)){status.textContent='اختر الصف والموضوع أولًا.';return;}
   busy=true;button.disabled=true;button.style.opacity='.55';results.replaceChildren();
   status.textContent='يتم تحليل الأفكار وترتيب الفقرات والتراكيب اللغوية...';
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),27000);
   try{
    const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,topic,grade,genre}),signal:controller.signal});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok)throw new Error(data.message||'خدمة AI غير متاحة حاليًا ('+res.status+').');
    status.textContent='اكتملت المراجعة. طبّق الملاحظات ثم أعد كتابة النص بنفسك.';
    feedbackView(results,data.feedback||{});
   }catch(error){
    status.textContent='تعذرت مراجعة AI: '+(error.name==='AbortError'?'انتهت مهلة الاتصال.':error.message||'خطأ في الخدمة')+' المسودة لم تتغير.';
   }finally{clearTimeout(timeout);busy=false;button.disabled=false;button.style.opacity='1';}
  });
  const anchor=document.getElementById('mej-writing-genre-panel')||document.getElementById('mej-writing-lab-v1')||w.area;
  anchor.parentElement.insertBefore(outer,anchor.nextSibling);
 }
 let pending=false;
 function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;if(!writing())document.getElementById(ID)?.remove();else mount()},180);}
 function boot(){
  schedule();new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* Load genre-first writing practice after the existing writing tools. */
(function(){
 const path='./assets/mej-writing-curriculum-v3.js';
 if(document.querySelector('script[data-mej-writing-v3]'))return;
 const script=document.createElement('script');script.dataset.mejWritingV3='1';script.src=path;
 script.defer=true;document.head.appendChild(script);
})();
