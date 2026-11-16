/* Coastal learning question quality overlay.
   Changes visible prompts, distractor labels and approved illustration only.
   Keeps the original question objects, event handlers, correctness and scoring. */
(()=>{
'use strict';
const d=document, w=window;
if(w.__MEJ_COASTAL_QUALITY_V1)return;
w.__MEJ_COASTAL_QUALITY_V1=true;
const bad=/^(?:q{3,}|x(?:yz|{2,})|z{3,}|abc|asdf|test\d*)$/i;
const common=[
['معلم','teacher'],['معلمة','teacher'],['أب','father'],['أم','mother'],
['شمس','sun'],['قطة','cat'],['كلب','dog'],['كتاب','book'],['قلم','pen'],
['تفاحة','apple'],['سمكة','fish'],['كرة','ball'],['شجرة','tree'],['سيارة','car'],
['بيت','house'],['مدرسة','school'],['طائر','bird'],['باب','door'],['نافذة','window'],
['حليب','milk'],['موز','banana'],['بحر','sea'],['جبل','mountain'],['حصن','fort']
];
const lookup=new Map(common);
try {
 for(let grade=1;grade<=12;grade++){
  const entries=w.MEJGradeBanks?.forGrade(grade)?.vocab||[];
  for(const entry of entries)if(entry[1]&&entry[0])lookup.set(String(entry[1]).trim(),String(entry[0]).trim());
 }
}catch(_){}
function text(e){return (e?.textContent||'').trim()}
function questionRegion(){
 const roots=[...d.querySelectorAll('main,section,article,[class*="question"],[class*="quiz"],[class*="game"]')];
 return roots.find(e=>/السؤال\s*\d|Phonics\s*[•·]|Vocabulary\s*[•·]/.test(text(e).slice(0,400)))||d.body;
}
function options(root){
 return [...root.querySelectorAll('button')].filter(e=>{
  const t=text(e);return t.length>0&&t.length<55&&!/عودة|تخط|استمع|listen|play|التالي|محاولة/i.test(t);
 });
}
function repairOptions(root){
 const buttons=options(root);
 const invalid=buttons.filter(b=>bad.test(text(b)));
 if(!invalid.length)return;
 const message=text(root).slice(0,900);
 const phonics=/Phonics|الصوت\s*\/[a-z]+\//i.test(message);
 const sound=(message.match(/الصوت\s*\/([a-z])\//i)||[])[1]?.toLowerCase()||'';
 const existing=new Set(buttons.map(b=>text(b).toLowerCase()));
 const pool=phonics?['sun','bag','cat','fish','pen','dog','map','red','hat','book','ship','tree']:
 ['teacher','father','mother','student','school','book','pen','doctor','driver','friend'];
 for(const button of invalid){
   const replacement=pool.find(v=>!existing.has(v)&&(!sound||v[0]!==sound));
   if(!replacement)continue;
   existing.add(replacement);
   button.textContent=replacement;
   button.dataset.mejQualityOption='yes';
 }
}
function updatePhonics(root){
 const els=[...root.querySelectorAll('h1,h2,h3,h4,p,div')].filter(e=>e.children.length<3);
 for(const el of els){
  if(el.dataset.mejQualityPrompt)return;
  const original=text(el);
  const m=original.match(/Choose the sound you hear at the highlighted part of\s*['‘“]([a-z-]+)['’”]\.*/i);
  if(!m||original.length>165)continue;
  const word=m[1];
  el.dataset.mejQualityPrompt='yes';
  // Retain the original question text in the page's accessibility metadata.
  el.setAttribute('aria-label',original);
  el.textContent='Choose the highlighted letter sound:';
  const separate=d.createElement('div');separate.className='mej-quality-word';
  const first=word.charAt(0),rest=word.slice(1);
  separate.innerHTML='<mark>'+first+'</mark>'+rest;
  el.insertAdjacentElement('afterend',separate);
  break;
 }
}
function approvedSrc(word){
 const registry=w.MEJ_APPROVED_IMAGES||w.parent?.MEJ_APPROVED_IMAGES;
 if(!registry)return '';
 const key=word.toLowerCase().trim();
 const row=registry[key]||registry[word]||(registry instanceof Map?registry.get(key):null);
 const candidate=Array.isArray(row)?row.find(x=>x?.src):row;
 const src=candidate?.src||candidate?.url||'';
 if(!src||/^(?:data:|javascript:)/i.test(src))return '';
 try{const u=new URL(src,w.location.href);if(u.origin!==w.location.origin)return '';return u.href;}catch(_){return ''}
}
function vocabularyIllustration(root){
 if(root.querySelector('.mej-quality-vocab-image'))return;
 const nodes=[...root.querySelectorAll('h1,h2,h3,h4,div,p,blockquote')].filter(e=>e.children.length<3);
 const prompt=nodes.find(e=>/ما مرادف هذه الكلمة باللغة الإنجليزية|ما مرادف هذه الكلمة باللغة الانجليزية/.test(text(e))&&text(e).length<130);
 if(!prompt)return;
 const arabic=nodes.find(e=>{
  const t=text(e).replace(/[“”"'«»]/g,'').trim();
  return lookup.has(t)&&e!==prompt;
 });
 if(!arabic)return;
 const word=lookup.get(text(arabic).replace(/[“”"'«»]/g,'').trim());
 if(!word)return;
 const src=approvedSrc(word);
 if(!src)return; // Never substitute unapproved emojis or mismatched imagery.
 const img=d.createElement('img');
 img.className='mej-quality-vocab-image';img.alt=word;img.src=src;img.loading='eager';
 img.onerror=()=>img.remove();
 arabic.insertAdjacentElement('afterend',img);
}
const st=d.createElement('style');st.textContent=`
 .mej-quality-word{font-weight:900;text-align:center;direction:ltr;font-size:clamp(29px,7vw,43px);padding:8px;margin:6px auto 10px}
 .mej-quality-word mark{background:#ffe28a;color:#053650;border-radius:7px;padding:0 3px}
 .mej-quality-vocab-image{display:block;width:min(190px,48%);max-height:190px;aspect-ratio:1;object-fit:contain;margin:8px auto;border-radius:14px}
`;d.head.append(st);
let scheduled=false;
function run(){
 scheduled=false;
 try{const root=questionRegion();repairOptions(root);updatePhonics(root);vocabularyIllustration(root)}catch(_){}
}
new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(run)}}).observe(d.body,{subtree:true,childList:true});
run();
})();