/* MEJ_SPELLING_SKILL_20261114: approved curriculum, level gated, practice only */
(function(){
'use strict';
if(window.MEJSpellingSkill)return;
const BANK='./reviews/admin-levels-catalog.json';
let overlay=null,pool=[],index=0,item=null,bankPromise=null,mode='listen';
const E=(t,s,cl)=>{const n=document.createElement(t);if(s!=null)n.textContent=s;if(cl)n.className=cl;return n};
const mix=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const css=E('style');css.id='mej-spelling-style';css.textContent=
'#mej-spelling{position:fixed;inset:0;z-index:100005;overflow:auto;direction:rtl;background:#075295ed;padding:12px 8px max(14px,env(safe-area-inset-bottom));font:600 16px/1.6 Tahoma,Arial;color:#164567;box-sizing:border-box}'+
'#mej-spelling *{box-sizing:border-box}#mej-spelling .panel{max-width:650px;margin:4px auto;padding:clamp(12px,3vw,22px);border:2px solid #8dd4e8;border-radius:22px;background:linear-gradient(135deg,#f6fcff,#dff4ff);box-shadow:0 12px 30px #013b6780}'+
'#mej-spelling .head{display:flex;justify-content:space-between;align-items:center;gap:8px}#mej-spelling h2{font-size:clamp(18px,4vw,24px);margin:4px 0}#mej-spelling button,#mej-spelling select{border:1px solid #91bbd2;border-radius:12px;padding:10px;font:700 15px Tahoma,Arial;min-height:44px;cursor:pointer}'+
'#mej-spelling button{background:#0782ac;color:#fff}#mej-spelling button:disabled,#mej-spelling option:disabled{opacity:.5}#mej-spelling select{background:white;color:#164567;width:100%;min-width:0}#mej-spelling .controls{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin:8px 0}'+
'#mej-spelling label{font-size:12px}#mej-spelling .modes,#mej-spelling .actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}#mej-spelling .modes button,#mej-spelling .actions button{flex:1 1 120px}#mej-spelling .modes button{background:#e9f8ff;color:#145279}#mej-spelling .modes [aria-pressed=true]{background:#0584ae;color:white}'+
'#mej-spelling .instruction{text-align:center;font-size:clamp(17px,4vw,21px);margin:10px 0}#mej-spelling .hint{background:#f3fcff;border:1px solid #9ccedf;border-radius:14px;padding:12px;text-align:center;min-height:58px;margin:8px 0;font-size:clamp(18px,4vw,25px)}#mej-spelling .hint img{width:auto;max-width:100%;max-height:135px;display:block;margin:auto}'+
'#mej-spelling .slots{direction:ltr;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px;padding:12px 1px;min-height:60px}#mej-spelling .slot{display:inline-flex;justify-content:center;align-items:center;min-width:clamp(23px,6vw,38px);height:46px;font:800 clamp(20px,5vw,29px) Arial;border-bottom:3px solid #27779e}#mej-spelling .space{width:15px}'+
'#mej-spelling .letters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;direction:ltr}#mej-spelling .letters.short{grid-template-columns:1fr}#mej-spelling .letters.medium{grid-template-columns:repeat(2,minmax(0,1fr))}'+
'#mej-spelling .letters button{min-width:0;min-height:clamp(52px,9vh,83px);background:linear-gradient(#ffe68b,#ffca42);color:#174666;border:2px solid #ffe9a8;box-shadow:0 4px 0 #be8d13;font:800 clamp(25px,6vw,37px) Arial}#mej-spelling .feedback{text-align:center;min-height:28px;font-weight:800}#mej-spelling .note,#mej-spelling .count{font-size:12px;text-align:center;color:#516f82}';
function canGrade(g){
 if(typeof window.permitted==='function'){try{return Boolean(window.permitted(g))}catch(_){return false}}
 if(typeof window.maxAllowed==='function'){try{return Number(window.maxAllowed())>=g}catch(_){return false}}
 return g===1;
}
function canPart(g,p){
 if(!canGrade(g))return false;
 if(p===1)return true;
 if(typeof window.mejPartUnlocked!=='function')return false;
 try{return Boolean(window.mejPartUnlocked(g,p))}catch(_){return false}
}
function defaultGrade(){
 let current=1;try{current=Number(window.active?.()?.grade||window.MEJ_ACTIVE_GRADE||1)}catch(_){}
 return canGrade(current)?current:1;
}
function hintOf(q){
 const s=String(q.prompt||'');
 const h=s.match(/[«“]([^»”]+)[»”]/)||s.match(/[:：]\s*(.+)$/)||s.match(/(?:لكلمة|for)\s+(.+)$/i);
 const value=String(h?.[1]||'').replace(/[\u200b-\u200f\u2060\ufe0f]/g,'').replace(/[.،؟"'«»“”]/g,'').trim();
 return /[\u0600-\u06ff]/.test(value)?value:'';
}
function target(q){
 const w=String(q.answer||q.word||'').toLowerCase().trim().replace(/\s+/g,' ');
 const length=w.replace(/[^a-z]/g,'').length;
 return length>=2&&length<=23&&/^[a-z][a-z '\-]*$/.test(w)?w:'';
}
function words(data,g,p){
 const part=data.levels?.find(l=>Number(l.grade)===g)?.parts?.find(l=>Number(l.part)===p);
 const unique=new Set();
 return (part?.questions||[]).filter(q=>q.type==='Spelling').map(q=>{
  const word=target(q);if(!word||unique.has(word))return null;unique.add(word);return {word,hint:hintOf(q)};
 }).filter(Boolean);
}
function loadBank(){
 if(!bankPromise)bankPromise=fetch(BANK).then(r=>{if(!r.ok)throw Error('BANK_UNAVAILABLE');return r.json()}).then(data=>{if(!Array.isArray(data.levels))throw Error('BANK_INVALID');return data}).catch(e=>{bankPromise=null;throw e});
 return bankPromise;
}
function picture(word){
 const b=window.MEJ_APPROVED_IMAGES||{},a=b[word]||[],list=Array.isArray(a)?a:[a];
 return list.find(x=>x?.status==='approved'&&typeof x.src==='string'&&Math.min(Number(x.w||x.width||0),Number(x.h||x.height||0))>=316)?.src||'';
}
function feedback(message,correct){
 const el=overlay?.querySelector('.feedback');if(!el)return;
 el.textContent=message;el.style.color=correct===true?'#0a7c4b':correct===false?'#a44926':'#154f76';
}
function speak(){
 if(!item)return;
 if(!window.speechSynthesis){feedback('الصوت غير متاح. استخدم نمط الصورة والمعنى.',false);return}
 try{
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(item.word),voices=speechSynthesis.getVoices?.()||[];
  u.voice=voices.find(v=>/^en-GB/.test(v.lang))||voices.find(v=>/^en/.test(v.lang))||null;
  u.lang=u.voice?.lang||'en-GB';u.rate=.83;speechSynthesis.speak(u);
 }catch(_){feedback('تعذر تشغيل النطق على الجهاز.',false)}
}
function emit(ok){try{window.dispatchEvent(new CustomEvent('mej-answer-evaluated',{detail:{correct:ok,source:'spelling-skill'}}))}catch(_){}}
function redraw(){
 const slots=overlay?.querySelector('.slots');if(!slots||!item)return;
 slots.replaceChildren();let idx=0;
 for(const ch of item.word){
  if(!/[a-z]/.test(ch)){slots.append(E('span',ch===' '?'':ch,'space'));continue}
  slots.append(E('span',item.picked[idx++]?.ch||'·','slot'));
 }
}
function reset(){
 if(!item)return;item.picked=[];item.done=false;
 for(const b of item.buttons)b.disabled=false;
 feedback('');redraw();
}
function check(){
 if(!item||item.done)return;
 const got=item.picked.map(x=>x.ch).join(''),expected=item.word.replace(/[^a-z]/g,'');
 if(got===expected){item.done=true;feedback('✅ ممتاز! '+item.word,true);emit(true)}
 else{feedback('حاول مجددًا. يمكنك التراجع أو إعادة ترتيب الحروف.',false);emit(false)}
}
function render(){
 const target=overlay.querySelector('.exercise');target.replaceChildren();
 target.append(E('p',mode==='listen'?'🇬🇧 استمع للكلمة ثم رتّب الحروف المبعثرة.':'🇴🇲 شاهد الصورة أو المعنى ثم رتّب الحروف.','instruction'));
 const hint=E('div',null,'hint');
 if(mode==='look'){
  const img=picture(item.word);
  if(img){const el=E('img');el.src=img;el.alt='صورة تعليمية';hint.append(el)}
  if(item.hint)hint.append(E('div',item.hint));
  if(!img&&!item.hint){const a=E('button','🔊 استمع للكلمة');a.onclick=speak;hint.append(a)}
 }else{const audio=E('button','🔊 استمع للكلمة');audio.onclick=speak;hint.append(audio)}
 const slots=E('div',null,'slots');
 const chars=item.word.split('').filter(c=>/[a-z]/.test(c));
 let randomized=mix(chars.map((ch,i)=>({ch,i})));
 if(randomized.every((x,i)=>x.i===i)&&randomized.length>1)randomized.reverse();
 const letters=E('div',null,'letters');
 if(chars.length<=3)letters.classList.add('short');else if(chars.length<=6)letters.classList.add('medium');
 item.picked=[];item.buttons=[];
 for(const c of randomized){
  const b=E('button',c.ch);b.type='button';b.onclick=()=>{
   if(b.disabled||item.done)return;
   b.disabled=true;item.picked.push({ch:c.ch,b});redraw();
   if(item.picked.length===chars.length)check();
  };
  item.buttons.push(b);letters.append(b);
 }
 const result=E('div',null,'feedback');result.setAttribute('aria-live','polite');
 const actions=E('div',null,'actions');
 const undo=E('button','↶ تراجع');undo.onclick=()=>{if(item.done)return;const x=item.picked.pop();if(x){x.b.disabled=false;feedback('');redraw()}};
 const again=E('button','إعادة الحروف');again.onclick=reset;
 const repeat=E('button','🔊 استمع ثانية');repeat.onclick=speak;
 const next=E('button','كلمة جديدة');next.onclick=nextWord;
 actions.append(undo,again,repeat,next);
 const count=E('div','كلمة '+index+' من '+pool.length+' في هذا المستوى','count');
 target.append(hint,slots,letters,result,actions,count);redraw();
 if(mode==='listen')speak();
}
function nextWord(){
 if(!overlay||!pool.length)return;
 if(index>=pool.length){index=0;pool=mix(pool)}
 item={...pool[index++],picked:[],done:false,buttons:[]};render();
}
async function start(){
 if(!overlay)return;
 const g=Number(overlay.querySelector('.grade').value),p=Number(overlay.querySelector('.part').value),exercise=overlay.querySelector('.exercise');
 if(!canPart(g,p)){exercise.textContent='هذا المستوى لم يُفتح بعد.';return}
 exercise.textContent='جارٍ تحميل مفردات المستوى…';
 try{
  const data=await loadBank();
  if(!overlay||!canPart(g,p))return;
  pool=mix(words(data,g,p));index=0;
  if(!pool.length){exercise.textContent='لا توجد كلمات Spelling في هذا المستوى حاليًا.';return}
  nextWord();
 }catch(e){console.warn('Spelling bank:',e);if(overlay)exercise.textContent='تعذر تحميل الكلمات. افتح التطبيق بالإنترنت ثم أعد المحاولة.'}
}
function updatePart(){
 if(!overlay)return;
 const g=Number(overlay.querySelector('.grade').value),part=overlay.querySelector('.part');
 part.options[0].disabled=!canPart(g,1);part.options[1].disabled=!canPart(g,2);
 if(part.selectedOptions[0]?.disabled)part.value='1';
}
function close(){
 try{window.speechSynthesis?.cancel()}catch(_){}
 overlay?.remove();overlay=null;item=null;
}
function open(){
 close();mode='listen';overlay=E('div');overlay.id='mej-spelling';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 const sheet=E('section',null,'panel'),header=E('div',null,'head');
 header.append(E('h2','🔤 Spelling — التهجئة'));
 const back=E('button','↩ المهارات');back.onclick=close;header.append(back);sheet.append(header);
 const controls=E('div',null,'controls');
 const gradeBox=E('label','الصف / المرحلة'),grade=E('select',null,'grade');
 for(let g=0;g<=12;g++){const opt=E('option',g===0?'مرحلة التأسيس':'الصف '+g);opt.value=String(g);opt.disabled=!canGrade(g);grade.append(opt)}
 grade.value=String(defaultGrade());
 if(grade.selectedOptions[0]?.disabled){const first=[...grade.options].find(o=>!o.disabled);if(first)grade.value=first.value}
 grade.onchange=updatePart;gradeBox.append(grade);
 const partBox=E('label','المستوى'),part=E('select',null,'part');
 for(let p=1;p<=2;p++){const opt=E('option','L'+p);opt.value=String(p);part.append(opt)}
 partBox.append(part);controls.append(gradeBox,partBox);sheet.append(controls);
 const modes=E('div',null,'modes'),listen=E('button','🔊 Listen & Spell'),look=E('button','🖼️ Look & Spell');
 for(const [button,k] of [[listen,'listen'],[look,'look']]){
  button.setAttribute('aria-pressed',String(k===mode));
  button.onclick=()=>{mode=k;listen.setAttribute('aria-pressed',String(mode==='listen'));look.setAttribute('aria-pressed',String(mode==='look'));if(item)render()};
  modes.append(button);
 }
 sheet.append(modes);
 const begin=E('button','▶ ابدأ التهجئة');begin.onclick=start;
 sheet.append(begin,E('div',null,'exercise'),E('p','تدريب للمراجعة، لا يضيف نجومًا ولا يفتح مستويات.','note'));
 overlay.append(sheet);document.body.append(overlay);updatePart();start();
}
function addCard(){
 const cards=document.getElementById('app')?.querySelector('.skill-cards');
 if(!cards||cards.querySelector('[data-mej-spelling]'))return;
 const similar=[...cards.children].find(card=>/^(spelling|word builder|letter ordering|التهجئة|الإملاء|ترتيب الحروف)$/i.test((card.querySelector('h3')?.textContent||'').trim()));
 if(similar){
  similar.dataset.mejSpelling='merged';
  const action=similar.querySelector('button');
  if(action){action.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open()},true);action.textContent='تدرّب على الحروف'}
  const desc=similar.querySelector('p');if(desc)desc.textContent='الاستماع أو مشاهدة المعنى ثم ترتيب الحروف حسب المستوى';
  return;
 }
 const card=E('div',null,'info skill-item');card.dataset.mejSpelling='new';
 const bubble=E('div','🔤','bubble'),title=E('h3','Spelling'),desc=E('p','استمع أو شاهد المعنى ثم رتّب الحروف.','muted'),btn=E('button','تدرّب','btn small');
 btn.onclick=open;card.append(bubble,title,desc,btn);cards.append(card);
}
function boot(){
 if(!document.getElementById(css.id))document.head.append(css);
 const app=document.getElementById('app');
 if(app){let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;addCard()})}).observe(app,{childList:true,subtree:false})}
 addCard();
}
window.MEJSpellingSkill={open,close};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();