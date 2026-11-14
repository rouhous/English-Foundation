/* My English Journey — interactive arcade, standalone supplementary practice.
 * No mastery stars, treasure baisa, or school rewards are written from this page.
 * The app host must verify progress and awards separately after release.
 */
(()=>{'use strict';
 const el=id=>document.getElementById(id);
 const bank=window.MEJArcadeBank;
 if(!bank||window.MEJArcadeRelease!==true)return;
 document.body.dataset.state='open';
 const state={grade:1,mode:null,index:0,score:0,deck:[],responded:false,firstAttempt:true,selected:[],tokens:[],shuffledTokens:[],choices:[],audioEnabled:true};
 let audioContext=null,frame=null,hostUnlockStars=0;
 const shuffle=items=>{
  const a=[...items];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
 };
 const set=(id,value)=>{el(id).textContent=String(value)};
 const show=(id,visible)=>{el(id).hidden=!visible};
 const shortMode={words:'🖼️ Word Explorer',sentences:'🧩 Sentence Builder',grammar:'🏰 Grammar Gate',hidden:'🔎 Hidden Objects',sailor:'⛵ Omani Sailor'};
 function tone(ok){
  if(!state.audioEnabled)return;
  try{
   const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
   if(!audioContext)audioContext=new C();
   if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
   const now=audioContext.currentTime;
   const notes=ok?[523.25,659.25,783.99]:[233.08,196];
   notes.forEach((f,i)=>{
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type=ok?'sine':'triangle';osc.frequency.value=f;
    gain.gain.setValueAtTime(.0001,now+i*.09);
    gain.gain.exponentialRampToValueAtTime(.075,now+i*.09+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.18);
    osc.connect(gain);gain.connect(audioContext.destination);
    osc.start(now+i*.09);osc.stop(now+i*.09+.19);
   });
  }catch(_){}
 }
 function feedback(text,good){
  const e=el('feedback');e.textContent=text;e.className='feedback '+(good?'good':'bad');
 }
 function clearFeedback(){const e=el('feedback');e.textContent='';e.className='feedback';}
 function gradeText(){
  state.grade=Number(el('grade').value)||1;
  const x=bank[state.grade];
  set('topic',x.topic);set('gradeTag','الصف '+state.grade);
 }
 for(let g=1;g<=12;g++){
  const opt=document.createElement('option');opt.value=g;opt.textContent='الصف '+g;el('grade').append(opt);
 }
 const params=new URLSearchParams(location.search),qGrade=Number(params.get('grade'));
 if(Number.isInteger(qGrade)&&qGrade>=1&&qGrade<=12)el('grade').value=String(qGrade);
 el('grade').addEventListener('change',gradeText);
 gradeText();
 el('sound').onclick=()=>{
  state.audioEnabled=!state.audioEnabled;
  el('sound').setAttribute('aria-pressed',String(state.audioEnabled));
  el('sound').textContent=state.audioEnabled?'🔊 الصوت':'🔇 بدون صوت';
 };
 function applyBadgeLocks(){
  const required={hidden:20,sailor:40};
  Object.entries(required).forEach(([game,min])=>{
   const b=el('gameGrid').querySelector('[data-game="'+game+'"]');
   if(!b)return;
   b.disabled=hostUnlockStars<min;
   b.textContent=b.disabled?'🔒 تفتح عند '+min+' نجمة':game==='hidden'?'🔎 ابدأ البحث':'⛵ انطلق في البحر';
   b.title=b.disabled?'تحتاج إلى '+min+' نجمة أساسية في جزيرتك الحالية':'';
  });
 }
 applyBadgeLocks();
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  if(event.data?.type!=='mej:arcade-init')return;
  const n=Number(event.data.stageStars);
  hostUnlockStars=Number.isFinite(n)?Math.max(0,Math.min(200,Math.floor(n))):0;
  applyBadgeLocks();
 });
 if(window.parent!==window)window.parent.postMessage({type:'mej:arcade-ready'},location.origin);
 function displayHome(){
  state.mode=null;state.deck=[];state.selected=[];state.tokens=[];state.shuffledTokens=[];
  if(frame){frame.remove();frame=null;}
  el('frameWrap').replaceChildren();
  show('hero',true);show('selector',true);show('gameGrid',true);show('gameStage',false);
  applyBadgeLocks();
  window.scrollTo({top:0,behavior:'smooth'});
 }
 el('exit').addEventListener('click',displayHome);
 el('backTop').addEventListener('click',()=>{if(state.mode)displayHome();else location.href='../';});
 el('gameGrid').addEventListener('click',ev=>{
  const btn=ev.target.closest('[data-game]');
  if(btn)start(btn.dataset.game);
 });
 function start(mode){
  if(!shortMode[mode])return;
  if((mode==='sailor'&&hostUnlockStars<40)||(mode==='hidden'&&hostUnlockStars<20))return;
  state.mode=mode;state.index=0;state.score=0;state.responded=false;
  const x=bank[state.grade];
  state.deck=shuffle(mode==='words'?x.words:mode==='sentences'?x.sentences:mode==='grammar'?x.grammar:[]).slice(0,mode==='words'?8:mode==='sentences'?4:3);
  show('hero',false);show('selector',false);show('gameGrid',false);show('gameStage',true);
  show('practiceView',false);show('frameView',false);show('resultView',false);
  set('gameTitle',shortMode[mode]);
  if(mode==='hidden'||mode==='sailor')startFrame(mode);
  else{
   show('practiceView',true);
   renderQuestion();
  }
  el('gameStage').scrollIntoView({behavior:'smooth',block:'start'});
 }
 function renderQuestion(){
  state.responded=false;state.firstAttempt=true;state.selected=[];
  const current=state.deck[state.index];
  const all=state.deck.length;
  set('round','الجولة '+(state.index+1)+' / '+all);
  set('score','🏆 '+state.score+' / '+all);
  el('progress').style.width=Math.round(100*state.index/all)+'%';
  el('progress').setAttribute('aria-valuenow',String(state.index));
  el('progress').setAttribute('aria-valuemax',String(all));
  show('resultView',false);show('practiceView',true);
  show('answers',false);show('sentenceZone',false);show('wordBank',false);
  show('check',false);show('reset',false);show('skip',false);show('next',false);
  clearFeedback();
  const title=el('prompt');
  if(state.mode==='words'){
   set('promptKicker',state.grade<=4?'اختر الصورة الصحيحة':'اختر المعنى الصحيح');
   set('promptIcon','🧭');
   title.textContent=current.en;
   title.dir='ltr';
   const others=shuffle(bank[state.grade].words.filter(w=>w.en!==current.en)).slice(0,3);
   state.choices=shuffle([current,...others]);
   const area=el('answers');area.replaceChildren();show('answers',true);
   state.choices.forEach(word=>{
    const b=document.createElement('button');b.type='button';b.className='answer';
    b.setAttribute('aria-label',word.ar);
    const pic=document.createElement('span');pic.className='illustration';pic.textContent=word.icon;
    const label=document.createElement('span');
    label.textContent=state.grade<=4?'':word.ar;
    b.append(pic,label);
    if(state.grade<=4){b.title=word.ar;}
    b.onclick=()=>answerChoice(b,word.en===current.en,current.ar);
    area.append(b);
   });
  } else if(state.mode==='grammar'){
   set('promptKicker','Grammar Challenge · اختر الإجابة');
   set('promptIcon','📘');
   title.textContent=current.q;title.dir='ltr';
   const area=el('answers');area.replaceChildren();show('answers',true);
   const randomized=shuffle(current.options.map((text,i)=>({text,i})));
   randomized.forEach(opt=>{
    const b=document.createElement('button');b.type='button';b.className='answer';b.dir='ltr';b.textContent=opt.text;
    b.onclick=()=>answerChoice(b,opt.i===current.answer,current.why);
    area.append(b);
   });
  } else if(state.mode==='sentences'){
   set('promptKicker','Sentence Puzzle · رتب الكلمات');
   set('promptIcon','🧩');
   title.textContent='Arrange the words to make a sentence.';
   title.dir='ltr';
   const tokens=current.text.split(' ').map((word,id)=>({word,id}));
   state.tokens=tokens;state.shuffledTokens=shuffle(tokens);
   // Avoid showing an already correctly ordered sentence on rare random shuffles.
   if(tokens.length>2&&state.shuffledTokens.every((x,i)=>x.id===i))state.shuffledTokens.reverse();
   show('sentenceZone',true);show('wordBank',true);
   show('check',true);show('reset',true);show('skip',true);
   renderTokens();
  }
 }
 function answerChoice(btn,correct,explanation){
  if(state.responded)return;
  state.responded=true;
  const boxes=el('answers').querySelectorAll('button');
  boxes.forEach(b=>b.disabled=true);
  btn.classList.add(correct?'correct':'incorrect');
  if(correct){state.score++;feedback('Excellent! إجابة صحيحة 🎉',true);}
  else{
    boxes.forEach(b=>{
      if(state.mode==='grammar'){
       const current=state.deck[state.index];
       if(b.textContent===current.options[current.answer])b.classList.add('correct');
      }else{
       const current=state.deck[state.index];
       if(b.getAttribute('aria-label')===current.ar)b.classList.add('correct');
      }
    });
    feedback('Try again next time. '+explanation,false);
  }
  tone(correct);show('next',true);set('score','🏆 '+state.score+' / '+state.deck.length);
 }
 function renderTokens(){
  const chosen=el('sentenceZone'),available=el('wordBank');chosen.replaceChildren();available.replaceChildren();
  state.selected.forEach((id,i)=>{
   const tok=state.tokens[id];
   const btn=document.createElement('button');btn.type='button';btn.className='word-token selected';btn.textContent=tok.word;
   btn.setAttribute('aria-label','إزالة '+tok.word);
   btn.onclick=()=>{if(state.responded)return;state.selected.splice(i,1);renderTokens();};
   chosen.append(btn);
  });
  state.shuffledTokens.forEach(tok=>{
   const b=document.createElement('button');b.type='button';b.className='word-token'+(state.selected.includes(tok.id)?' used':'');
   b.textContent=tok.word;b.disabled=state.selected.includes(tok.id)||state.responded;
   b.onclick=()=>{if(state.responded)return;state.selected.push(tok.id);renderTokens();};
   available.append(b);
  });
 }
 el('reset').onclick=()=>{if(state.responded)return;state.selected=[];renderTokens();clearFeedback();};
 el('skip').onclick=()=>{if(state.responded)return;state.responded=true;feedback('يمكنك المتابعة والتدرّب مرة أخرى لاحقًا.',false);show('next',true);show('check',false);show('reset',false);show('skip',false);renderTokens();};
 el('check').onclick=()=>{
  if(state.responded)return;
  if(state.selected.length!==state.tokens.length){feedback('اختر جميع الكلمات أولًا.',false);tone(false);return;}
  const current=state.deck[state.index],attempt=state.selected.map(id=>state.tokens[id].word).join(' ');
  const exact=attempt===current.text;
  if(exact){
   if(state.firstAttempt)state.score++;
   state.responded=true;feedback('Amazing! '+current.text+' ✅',true);tone(true);
   show('check',false);show('reset',false);show('skip',false);show('next',true);renderTokens();
   set('score','🏆 '+state.score+' / '+state.deck.length);
  }else{
   state.firstAttempt=false;
   feedback('ليس هذا الترتيب الصحيح. حاول مجددًا أو تخطَّ السؤال.',false);
   tone(false);
  }
 };
 el('next').onclick=()=>{if(!state.responded)return;state.index++;
  if(state.index>=state.deck.length)summary();else renderQuestion();
 };
 function summary(){
  show('practiceView',false);show('resultView',true);
  el('progress').style.width='100%';set('round','اكتمل التدريب');
  set('score','🏆 '+state.score+' / '+state.deck.length);
  set('resultScore',state.score+' / '+state.deck.length);
  const ratio=state.score/state.deck.length;
  set('resultText',ratio===1?'ممتاز! أكملت جميع التحديات بنجاح.':ratio>=.6?'عمل رائع! استمر لتطوير مستواك.':'محاولة جيدة! جرّب مجددًا لتتحسّن.');
 }
 el('again').onclick=()=>start(state.mode);
 el('home').onclick=displayHome;
 function startFrame(mode){
  show('frameView',true);set('round','تدريب حر');set('score','لا توجد مكافآت مالية');
  el('progress').style.width='0%';
  el('frameWrap').replaceChildren();
  const status=el('frameCaption');
  status.textContent=mode==='hidden'
   ?'ابحث عن الأغراض في المشهد. التدريب هنا لا يضيف نجومًا لحساب الطالب.'
   :'اللعبة الأصلية ثلاثية الأبعاد. النقاط والكنوز المعروضة فيها تجريبية وليست رصيدًا ماليًا.';
  frame=document.createElement('iframe');
  frame.title=mode==='hidden'?'Hidden Objects practice':'Omani Sailor practice';
  frame.loading='eager';frame.referrerPolicy='same-origin';
  frame.setAttribute('allow','fullscreen');
  frame.src=mode==='hidden'?'../hidden-objects/index.html':'../omani-sailor/index.html?practice=1';
  el('frameWrap').append(frame);
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!frame||event.source!==frame.contentWindow)return;
  if(state.mode!=='hidden')return;
  const d=event.data;
  if(d?.type==='mej:hidden-ready'){
   const grade=state.grade;
   frame.contentWindow.postMessage({
    type:'mej:hidden-init',stage:grade,badge:1,scene:grade%4,
    masteredWords:[],levelWords:[],saved:null
   },location.origin);
  }else if(d?.type==='mej:hidden-close'){
   displayHome();
  }else if(d?.type==='mej:hidden-progress'&&d.ended===true){
   set('frameCaption','اكتملت جولة البحث. هذا تدريب فقط؛ لا تُضاف نجوم أو بيسات إلى حساب الطالب.');
  }
 });
 window.addEventListener('pagehide',()=>{if(audioContext)audioContext.close().catch(()=>{});});
})();