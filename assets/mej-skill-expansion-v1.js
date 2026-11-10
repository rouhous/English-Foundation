/* Curated in-app skill expansions. No progress/star writes until assessed. */
(function(){
'use strict';
const CLOZE={"5":[["A school team plans a science ___ about clean ___. They search for reliable ___ before writing.","project","energy","information"],["Before a long ___, we should ___ carefully and follow safety ___.","journey","prepare","advice"]],"6":[["For an online school task, use a strong ___ and never share it in a public ___. The ___ can help you find information.","password","message","internet"],["At the sports ___, an ___ joined a swimming ___.","stadium","athlete","competition"]],"7":[["At the music ___, the ___ enjoyed the singer's ___.","concert","audience","performance"],["We checked the ___ before going to the ___. We packed our ___ carefully.","timetable","airport","luggage"]],"8":[["To protect the ___, we should ___ waste and ___ suitable materials.","environment","reduce","reuse"],["During the ___, safety ___ was essential for the outdoor ___.","adventure","equipment","challenge"]],"9":[["An online ___ can show someone's ___. We should protect our ___ when using websites.","profile","interests","privacy"],["Good ___ helps us ___ ideas and understand their ___.","communication","explain","meaning"]],"10":[["A news ___ should use a ___ to check whether a ___ is accurate.","reporter","source","headline"],["Using ___ can reduce carbon ___. This has a positive ___ on the environment.","renewable energy","emissions","impact"]],"11":[["During a discussion, a ___ may communicate through a ___ without words. Positive ___ can prevent confusion.","teenager","gesture","feedback"],["A ___ can plan an ___ and recommend suitable ___ for visitors.","tourist","itinerary","accommodation"]],"12":[["A ___ can request a ___ if a product is faulty or its description was ___.","consumer","refund","misleading"],["When applying for a university ___, check the ___ and complete the ___ carefully.","scholarship","deadline","application"]]};
const CATALOG='./reviews/admin-levels-catalog.json';
let catalog=null,session=null,root=null;
const css=document.createElement('style');css.textContent=`
#mej-skills-overlay{position:fixed;inset:0;z-index:99999;overflow:auto;background:#043c78e8;padding:18px;direction:rtl}
#mej-skills-overlay .sheet{max-width:780px;margin:20px auto;background:#f3fbff;border-radius:20px;padding:20px;color:#163655;box-shadow:0 12px 45px #082e58}
#mej-skills-overlay .head{display:flex;align-items:center;justify-content:space-between;gap:10px}
#mej-skills-overlay button,#mej-skills-overlay select{font:inherit;border-radius:10px;padding:10px;border:1px solid #8dbdcc}
#mej-skills-overlay button{background:#006b99;color:white;cursor:pointer}
#mej-skills-overlay button:disabled{opacity:.55}
#mej-skills-overlay .images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;direction:ltr}
#mej-skills-overlay .image-item{background:white;padding:7px;border:3px solid #d7e7ed;border-radius:12px;color:#174b6b}
#mej-skills-overlay .image-item.selected{border-color:#e3a91e;background:#fff8d7}
#mej-skills-overlay img{width:100%;height:130px;object-fit:contain}
#mej-skills-overlay .words{display:flex;flex-wrap:wrap;gap:9px;direction:ltr;padding:12px 0}
#mej-skills-overlay .words button{background:#fff;color:#165477}
#mej-skills-overlay .words button.selected{background:#fbd76c}
#mej-skills-overlay .passage{font:500 clamp(18px,3vw,23px)/2 Georgia,serif;direction:ltr;text-align:left;background:white;padding:17px;border-radius:12px;margin:15px 0}
#mej-skills-overlay .blank{display:inline-block;border:2px dashed #6ab4d1;border-radius:7px;padding:0 11px;min-width:80px;color:#086089;background:#e9f9ff}
#mej-skills-overlay .feedback{margin-top:12px;font-weight:700}
#mej-skills-overlay .chip{background:#d7edf4;border-radius:20px;padding:5px 10px;margin:4px;display:inline-block}
#mej-open-skill-mix{display:block;margin:12px auto;padding:12px 16px;border-radius:13px;background:#e1f7fb;color:#005979;border:2px solid #7ac3d2;font:800 16px Tahoma,sans-serif}
`;
css.textContent += "\n/* MEJ_COMPACT_ACTIVITY_MODAL_V2 */\n#mej-skills-overlay{padding:max(8px,env(safe-area-inset-top,0px)) 8px max(8px,env(safe-area-inset-bottom,0px))!important;background:#0758a5d9!important;box-sizing:border-box!important}\n#mej-skills-overlay .sheet{box-sizing:border-box!important;width:min(100%,640px)!important;margin:4px auto!important;padding:12px!important;border:2px solid #8bd7fa!important;border-radius:20px!important;background:linear-gradient(145deg,#f7fdff,#dff5ff)!important;box-shadow:0 8px 28px #003b7980!important}\n#mej-skills-overlay .head{gap:8px!important;margin:0 0 9px!important;min-height:0!important}\n#mej-skills-overlay .head h2{font-size:clamp(18px,4.7vw,24px)!important;line-height:1.3!important;margin:0!important;color:#0d3e79!important}\n#mej-skills-overlay .head button{padding:7px 11px!important;min-height:36px!important;max-width:100px!important;font-size:14px!important;flex-shrink:0!important}\n#mej-skills-overlay button{font-weight:700!important;line-height:1.25!important}\n#mej-skills-overlay .sheet>div:not(.head){min-width:0}\n#mej-skills-overlay select,#mej-skills-overlay .sheet>div>button{min-height:38px!important;padding:7px 10px!important;font-size:15px!important}\n#mej-skills-overlay #mej-skill-content{margin-top:10px!important}\n#mej-skills-overlay #mej-skill-content>p{font-size:14px!important;margin:6px 0!important;line-height:1.5!important}\n#mej-skills-overlay .passage{font:500 clamp(16px,4vw,20px)/1.75 Georgia,serif!important;padding:12px!important;margin:8px 0 12px!important;box-shadow:0 4px 0 #aac8f4!important}\n#mej-skills-overlay .blank{min-width:58px!important;padding:1px 6px!important;max-width:100%!important}\n#mej-skills-overlay .images{gap:8px!important}\n#mej-skills-overlay .image-item{padding:5px!important;border-width:2px!important;min-width:0!important}\n#mej-skills-overlay img{height:clamp(92px,24vh,132px)!important}\n#mej-skills-overlay .words{gap:7px!important;padding:8px 0!important}\n#mej-skills-overlay .words button{padding:8px 10px!important;min-height:38px!important}\n#mej-skills-overlay .feedback{font-size:14px!important;margin-top:8px!important}\n@media(max-width:420px){#mej-skills-overlay .sheet{padding:10px!important}#mej-skills-overlay .head h2{font-size:18px!important}#mej-skills-overlay .passage{padding:10px!important}}\n";
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
// MEJ_MATCH_G1_G4_CATALOG_IMAGE_FIX_V1
const normalizeWord=value=>String(value||'').toLowerCase().trim().replace(/\s+/g,' ');
async function ensureCatalog(){
 if(catalog?.levels?.length)return catalog;
 const response=await fetch(CATALOG,{cache:'no-store'});
 if(!response.ok)throw new Error('CATALOG_UNAVAILABLE');
 const json=await response.json();
 if(!Array.isArray(json.levels))throw new Error('CATALOG_INVALID');
 catalog=json;
 return catalog;
}
function imgFor(word){
 const bank=window.MEJ_APPROVED_IMAGES||{};
 const key=normalizeWord(word);
 const options=bank[key]||bank[word]||[];
 const entries=Array.isArray(options)?options:[options];
 return entries.find(item=>item && item.status==='approved' && typeof item.src==='string' &&
  (Number(item.w)||Number(item.width)||0)>=316 &&
  (Number(item.h)||Number(item.height)||0)>=316)?.src||null;
}
function vocabulary(grade){
 const level=catalog?.levels?.find(l=>Number(l.grade)===grade);
 const qs=level?.parts?.flatMap(part=>part.questions||[])||[];
 // The reviewed curriculum stores bilingual Vocabulary questions:
 // Arabic answers must not be shown as English matching labels.
 return [...new Set(qs.filter(q=>q.type==='Vocabulary')
  .map(q=>{
   const direct=normalizeWord(q.word||q.pictureWord);
   if(/^[a-z][a-z\s'-]*$/.test(direct))return direct;
   const answer=normalizeWord(q.answer);
   return /^[a-z][a-z\s'-]*$/.test(answer)?answer:'';
  }).filter(Boolean))];
}
const imageShardLoaded=new Set();
async function loadImageShard(index){
 if(imageShardLoaded.has(index))return;
 const url='./assets/approved-images-'+String(index).padStart(2,'0')+'.js';
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=url;
  script.onload=()=>{imageShardLoaded.add(index);resolve()};
  script.onerror=()=>reject(new Error('IMAGE_SHARD_'+index));
  document.head.append(script);
 });
}
async function ensureMatchingImages(grade){
 await ensureCatalog();
 let matched=vocabulary(grade).filter(word=>imgFor(word)).length;
 if(matched>=4)return;
 // Respect the approved banks only; never replace a missing picture with
 // generated or mismatched imagery. Retry omitted shards as needed.
 for(let i=1;i<=18 && matched<4;i+=3){
  const group=[i,i+1,i+2].filter(n=>n<=18);
  await Promise.allSettled(group.map(loadImageShard));
  matched=vocabulary(grade).filter(word=>imgFor(word)).length;
 }
}
// Explicit answer event: never scan or observe the exercise DOM.
function reinforce(correct){
 try{window.dispatchEvent(new CustomEvent('mej-answer-evaluated',{detail:{correct:!!correct,source:'skill-expansion'}}));}
 catch(error){console.warn('Optional companion feedback unavailable',error)}
}
function renderMatch(){
 const target=root.querySelector('#mej-skill-content');target.replaceChildren();
 const cards=session.words;
 const hint=node('p','', 'اختر صورة ثم اختر الكلمة الإنجليزية المطابقة لها. جميع الصور من بنك الصور المعتمد.');target.append(hint);
 const images=node('div','images');const words=node('div','words');let chosen=-1;const matched=new Set();
 const feedback=node('div','feedback');
 const shuffled=shuffle(cards.map((x,i)=>({...x,i})));
 shuffled.forEach((item,k)=>{
  const b=node('button','image-item');const img=node('img');img.src=item.img;img.alt='صورة تعليمية رقم '+(k+1);img.loading='lazy';
  b.append(img,node('div','',String(k+1)));b.onclick=()=>{if(matched.has(item.i))return;chosen=item.i;images.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};images.append(b);
 });
 shuffle(cards.map(x=>x.word)).forEach(word=>{const b=node('button','',word);b.onclick=()=>{
  if(chosen<0||b.disabled)return;
  const item=cards[chosen];if(item.word!==word){feedback.textContent='حاول مجددًا: اختر الكلمة التي تصف الصورة المحددة.';reinforce(false);return}
  matched.add(chosen);b.disabled=true;images.querySelectorAll('button').forEach(button=>{if(button.querySelector('img')?.src.endsWith(item.img))button.disabled=true});
  chosen=-1;feedback.textContent='إجابة صحيحة! '+matched.size+' / '+cards.length;reinforce(true);
  if(matched.size===cards.length){const next=node('button','','مجموعة جديدة');next.onclick=()=>makeMatch(session.grade);target.append(next)}
 };words.append(b)});
 target.append(images,words,feedback);
}
async function makeMatch(grade){
 const target=root.querySelector('#mej-skill-content');
 target.textContent='جارٍ تحميل المفردات والصور المعتمدة…';
 try{await ensureMatchingImages(grade)}
 catch(error){console.warn('Matching resource loading:',error)}
 const possible=shuffle(vocabulary(grade).map(word=>({word,img:imgFor(word)})).filter(x=>x.img));
 if(possible.length<4){
  target.textContent='لا تتوفر أربع صور معتمدة ومطابقة لهذا الصف حاليًا. تحقق من اتصال الإنترنت ثم أعد المحاولة.';
  return;
 }
 session={grade,words:possible.slice(0,4)};renderMatch();
}
function makeCloze(grade){
 const target=root.querySelector('#mej-skill-content');target.replaceChildren();
 const options=CLOZE[grade]||[];if(!options.length)return;
 const sample=options[Math.floor(Math.random()*options.length)];
 const [sentence,...answers]=sample;
 const prompt=node('p','','اختر الكلمات المناسبة لإكمال الفقرة.');
 const para=node('div','passage');let idx=0;const slots=[];
 sentence.split('___').forEach((str,i)=>{para.append(document.createTextNode(str));if(i<answers.length){const slot=node('span','blank','______');slot.dataset.answer=answers[i];slots.push(slot);para.append(slot)}});
 const choices=node('div','words');let position=0,done=false;
 shuffle(answers.slice()).forEach(word=>{const btn=node('button','',word);btn.onclick=()=>{if(done)return;if(position>=slots.length)return;slots[position].textContent=word;slots[position].dataset.choice=word;position++;btn.disabled=true};choices.append(btn)});
 const feedback=node('div','feedback');
 const check=node('button','','تحقق من الإجابات');check.onclick=()=>{if(position!==slots.length)return;done=true;const good=slots.filter((s,i)=>s.dataset.choice===answers[i]).length;feedback.textContent=good===slots.length?'✅ ممتاز! جميع الكلمات في مواضعها الصحيحة.':'الإجابات الصحيحة: '+answers.join(' • ');reinforce(good===slots.length);const next=node('button','','فقرة أخرى');next.onclick=()=>makeCloze(grade);target.append(next)};
 target.append(prompt,para,choices,check,feedback);
}
async function open(requestedGrade){
 document.getElementById('mej-skills-overlay')?.remove();
 root=node('div');root.id='mej-skills-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
 const sheet=node('div','sheet');const header=node('div','head');header.append(node('h2','','أنشطة المفردات والمهارات'));
 const close=node('button','','✕ رجوع');close.onclick=()=>{root.remove();if(typeof route==='function')route('skills')};header.append(close);
 // No extra disclaimer; the activity uses the standard learner interface.
 const controls=node('div');const select=node('select');for(let g=1;g<=12;g++){const opt=node('option','', 'الصف '+g);opt.value=String(g);select.append(opt)}
 const grade=Math.min(12,Math.max(1,Number(requestedGrade)||Number(window.MEJ_ACTIVE_GRADE)||Number(localStorage.getItem('MEJ_ACTIVITY_GRADE'))||1));select.value=String(grade);
 const start=node('button','','بدء النشاط');start.onclick=()=>{const g=Number(select.value);if(g<=4)makeMatch(g).catch(err=>{console.error(err);root.querySelector('#mej-skill-content').textContent='تعذر تحميل النشاط. أعد المحاولة عند توفر الاتصال.'});else makeCloze(g)};
 controls.append(select,start);
 const content=node('div');content.id='mej-skill-content';
 sheet.append(header,controls,content);root.append(sheet);document.body.append(root);start.click();
}

// Replace legacy Match entries with the real vocabulary-image matching / cloze
// activities. Legacy counts reflect only questions tagged "Match", not the
// available vocabulary or approved images; they are misleading.
function legacyMatchMenu(){
 const app=document.getElementById('app');
 if(!app)return false;
 const heading=Array.from(app.querySelectorAll('h1,h2,h3,h4')).some(e=>/\bMatch\b/i.test(e.textContent||'') && /اختر المستوى/.test(e.textContent||''));
 return heading;
}
function refreshLegacyMenu(){
 if(!legacyMatchMenu())return;
 const app=document.getElementById('app');
 for(const el of app.querySelectorAll('button')){
  const raw=(el.textContent||'').trim();
  const match=raw.match(/المستوى\s*(\d+)\s*[—–-]\s*\d+\s*عنصر/);
  if(!match)continue;
  const grade=Number(match[1]);if(grade<1||grade>12)continue;
  el.dataset.mejExpandedGrade=String(grade);
  const label=grade<=4?'توصيل كلمات بالصور':'إكمال فقرات بالمفردات';
  const newText='المستوى '+grade+' — '+label;
  if(el.textContent!==newText)el.textContent=newText;
 }
}
function interceptLegacy(event){
 const btn=event.target?.closest?.('button[data-mej-expanded-grade]');
 if(!btn||!legacyMatchMenu())return;
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 const grade=Number(btn.dataset.mejExpandedGrade);
 open(grade).catch(()=>window.alert('تعذر تحميل الأنشطة. تحقق من اتصال الإنترنت وإتاحة بنك المفردات.'));
}
document.addEventListener('click',interceptLegacy,true);
window.MEJOpenSkillExpansion=open;

// MEJ_HOME_EXTRA_ACTIVITY_BUTTON_REMOVED_V1
// Keep skill activities available in their existing learning menus;
// never add the standalone shortcut beneath the home footer.
function boot(){
 document.head.append(css);
 const app=document.getElementById('app');
 if(!app)return;
 const refresh=()=>{
  document.getElementById('mej-open-skill-mix')?.remove();
  refreshLegacyMenu();
 };
 let pending=false;
 new MutationObserver(()=>{
  if(pending)return;
  pending=true;
  queueMicrotask(()=>{pending=false;refresh()});
 }).observe(app,{childList:true,subtree:false});
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();