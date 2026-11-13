/* MEJ FREE OFFLINE TUTOR v1 — no account, API key, quota, network calls or telemetry.
 * Independent overlay. The existing illustrated companion remains the only avatar.
 * Integration: window.MEJOfflineTutor.open() from companion tap; optional
 * window.mejTutorContext() => {inQuestion, currentQuestion, targetWords, targetGrammar, assessment}
 * When context is uncertain in a live question the tutor FAILS CLOSED.
 */
(function(){
'use strict';
if(window.MEJOfflineTutor)return;
const dictionary={
 apple:['تفاحة','I eat an apple.'],book:['كتاب','This is my book.'],
 pen:['قلم','I have a blue pen.'],pencil:['قلم رصاص','This is a pencil.'],
 school:['مدرسة','I go to school.'],teacher:['معلم','My teacher is kind.'],
 student:['طالب','The student is reading.'],beautiful:['جميل','The garden is beautiful.'],
 usually:['عادةً','I usually wake up early.'],always:['دائمًا','I always brush my teeth.'],
 never:['أبدًا','I never smoke.'],sometimes:['أحيانًا','I sometimes play football.'],
 because:['لأن','I stayed home because I was ill.'],
 before:['قبل','Wash your hands before eating.'],after:['بعد','We play after school.'],
 between:['بين','The book is between two pens.'],
 happy:['سعيد','I am happy today.'],sad:['حزين','She is sad.'],
 brave:['شجاع','The brave boy helped his friend.'],environment:['البيئة','We protect the environment.'],
 climate:['المناخ','The climate is changing.'],pollution:['التلوث','Pollution harms animals.'],
 recycle:['يعيد التدوير','We recycle paper.'],identity:['الهوية','Our identity is important.'],
 journey:['رحلة','Our journey starts today.'],water:['ماء','Drink clean water.'],
 friend:['صديق','She is my friend.'],family:['عائلة','My family is happy.'],
 breakfast:['فطور','I eat breakfast at seven.'],lunch:['غداء','We eat lunch at school.'],
 dinner:['عشاء','Dinner is ready.'],yesterday:['أمس','I played yesterday.'],
 tomorrow:['غدًا','Tomorrow is Friday.'],today:['اليوم','Today is a good day.']
};
const rules=[
 {keys:['past simple','simple past','الماضي البسيط'],label:'Past Simple',ar:'نستخدم الماضي البسيط لحدث انتهى في الماضي. الفعل المنتظم غالبًا نضيف له ed، وغير المنتظم نحفظ صيغته.',en:'We use the past simple for completed events in the past.',example:'I visited my aunt yesterday.'},
 {keys:['present simple','المضارع البسيط'],label:'Present Simple',ar:'نستخدم المضارع البسيط للعادات والحقائق. نضيف s أو es غالبًا مع he / she / it.',en:'Use the present simple for habits and facts.',example:'She plays football every Friday.'},
 {keys:['present continuous','المضارع المستمر'],label:'Present Continuous',ar:'نستخدم am / is / are ثم الفعل مع ing للحدث الجاري.',en:'Use am/is/are + verb-ing for actions happening now.',example:'They are studying now.'},
 {keys:['future','will','المستقبل'],label:'Future with will',ar:'للتحدث عن المستقبل يمكن استخدام will مع الفعل المجرد.',en:'Use will + base verb for future statements.',example:'We will visit Muscat tomorrow.'},
 {keys:['comparative','المقارنة'],label:'Comparatives',ar:'نقارن بين شيئين بـ er أو more حسب الصفة، وغالبًا نستخدم than.',en:'Use a comparative to compare two things.',example:'This bag is lighter than that one.'},
 {keys:['superlative','التفضيل'],label:'Superlatives',ar:'نستخدم the مع est أو most لوصف الأعلى أو الأفضل ضمن مجموعة.',en:'Use a superlative for the highest degree within a group.',example:'This is the tallest building.'},
 {keys:['articles','a an the','أدوات التعريف','a و an'],label:'Articles',ar:'نستخدم a قبل صوت ساكن و an قبل صوت متحرك؛ وthe للإشارة إلى شيء محدد.',en:'Use a/an with nonspecific singular nouns and the for specific ones.',example:'I saw an elephant.'},
 {keys:['preposition','حروف الجر'],label:'Prepositions',ar:'توضح حروف الجر علاقات المكان والزمان مثل in و on و at.',en:'Prepositions show relationships of place or time.',example:'The bag is on the table.'}
];
const normal=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f]/g,'').trim();
const words=s=>normal(s).split(/[^a-z\u0600-\u06ff]+/).filter(x=>x.length>2);
const clean=s=>String(s||'').slice(0,240);
const safeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let node=null,recognition=null;
function context(){
 let supplied={};
 try{if(typeof window.mejTutorContext==='function')supplied=window.mejTutorContext()||{}}catch(_){}
 let session=null;
 try{if(typeof activeSession!=='undefined')session=activeSession}catch(_){}
 const live=Boolean(supplied.inQuestion||supplied.assessment||session);
 const diagnostic=Boolean(supplied.diagnostic||session?.kind==='diagnostic');
 const targets=[...(Array.isArray(supplied.targetWords)?supplied.targetWords:[]),supplied.targetGrammar||''];
 let question=String(supplied.currentQuestion||'');
 // We do not inspect answer strings or expose them to the tutor.
 if(!question&&session?.question?.prompt)question=String(session.question.prompt);
 return {live,diagnostic,question,targets:targets.map(normal).filter(Boolean),
 // Only the host can positively mark an unrelated question as safe.
 trusted:Boolean(typeof window.mejTutorContext==='function'&&supplied.inQuestion===true&&supplied.targetsComplete===true)};
}
function guard(text,ctx){
 if(ctx.diagnostic)return 'أكمل اختبار التشخيص أولًا. يمكنني مساعدتك بعد الانتهاء.';
 if(!ctx.live)return '';
 if(!ctx.trusted)return 'أكمل السؤال الحالي أولًا، ثم اسألني عن القاعدة أو الكلمة. يمكنني مساعدتك أثناء التعلم.';
 const tokens=words(text),related=ctx.targets.some(t=>normal(text).includes(t)||words(t).some(w=>tokens.includes(w)));
 // Do not allow rule explanations during active assessments even when targets are supplied,
 // because paraphrases and indirect questions can disclose answers.
 if(related||rules.some(r=>r.keys.some(k=>normal(text).includes(k))))
  return 'هذا مرتبط بالتحدي الحالي. جرّب الإجابة بنفسك، وبعدها سأشرح لك الفكرة بأمثلة جديدة.';
 if(!ctx.question)return 'أكمل السؤال أولًا، ثم أساعدك في شرح الدرس.';
 const qwords=new Set(words(ctx.question));
 if(tokens.some(t=>qwords.has(t)))return 'هذه الكلمة مرتبطة بالسؤال الحالي. سأشرحها لك بعد الإجابة.';
 return '';
}
function answer(input){
 const text=clean(input),n=normal(text),ctx=context(),blocked=guard(n,ctx);
 if(blocked)return blocked;
 if(!n)return 'اكتب سؤالك أولًا أو استخدم الميكروفون.';
 if(/(كرر|repeat|again|مرة أخرى)/.test(n))return lastAnswer||'اسألني عن كلمة أو قاعدة وسأشرحها.';
 const requested=n.match(/(?:meaning of|mean\s+|معنى|ترجمة|translate|what is)\s+["“']?([a-z][a-z -]{1,35})/i);
 const key=(requested?.[1]||n).trim().replace(/[?!.،؟]$/,'');
 let match=Object.keys(dictionary).find(w=>w===key||n===w||n.includes(' '+w+' ')||n.endsWith(' '+w));
 if(match){const [ar,example]=dictionary[match];return match+' = '+ar+'\nExample: '+example+'\nCan you make another sentence?'}
 const rule=rules.find(r=>r.keys.some(k=>n.includes(k)));
 if(rule)return rule.label+'\n'+rule.ar+'\n'+rule.en+'\nExample: '+rule.example;
 if(/(hello|hi|مرحبا|السلام)/.test(n))return 'Hello! Ask me about English vocabulary or grammar. مرحبًا! اسألني عن معنى كلمة أو قاعدة.';
 return 'لا أملك شرحًا موثوقًا لهذا السؤال في المكتبة المحلية حاليًا. يمكنك اختيار كلمة أو قاعدة أخرى، أو الرجوع إلى صفحة التعلم. لن أخمّن الإجابة.';
}
let lastAnswer='';
function speak(message){
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return;
 try{speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(message.slice(0,350));utter.lang=/[\u0600-\u06ff]/.test(message)?'ar-OM':'en-US';utter.rate=.9;utter.volume=1;speechSynthesis.speak(utter)}catch(_){}
}
function close(){
 try{recognition?.abort()}catch(_){}
 recognition=null;try{speechSynthesis?.cancel()}catch(_){}
 node?.remove();node=null;
}
function open(){
 if(node){node.querySelector('textarea')?.focus();return}
 const ctx=context();
 if(ctx.diagnostic)return;
 node=document.createElement('div');node.id='mej-offline-tutor';node.dir='rtl';
 node.innerHTML='<section role="dialog" aria-modal="true" aria-label="My Smart Companion" class="mej-tutor-panel">'+
 '<header><strong>🌟 My Smart Companion</strong><button class="mej-tutor-close" aria-label="إغلاق">✕</button></header>'+
 '<p>How can I help you? كيف أساعدك؟</p>'+
 '<div class="mej-tutor-response" role="status" aria-live="polite">اسألني عن معنى كلمة أو شرح قاعدة بالإنجليزية.</div>'+
 '<form><textarea rows="2" maxlength="240" placeholder="What does usually mean?"></textarea>'+
 '<div class="mej-tutor-buttons"><button type="button" class="mej-tutor-mic">🎙️ تحدث</button><button type="submit">إرسال السؤال</button></div></form>'+
 '<small>مساعد مجاني دون خدمات مدفوعة. دعم الصوت يعتمد على الجهاز؛ لا تُرسل الأسئلة إلى خادم.</small>'+
 '</section>';
 const style=document.createElement('style');style.textContent=`
 #mej-offline-tutor{position:fixed;inset:0;z-index:100010;background:#001c3670;display:grid;place-items:end center;padding:12px;box-sizing:border-box}
 #mej-offline-tutor .mej-tutor-panel{background:#fff;color:#143e60;width:min(100%,480px);max-height:85dvh;overflow:auto;border-radius:20px;box-shadow:0 10px 45px #0014;padding:16px;font:16px/1.65 system-ui;box-sizing:border-box}
 #mej-offline-tutor header{display:flex;justify-content:space-between;align-items:center;gap:12px}
 #mej-offline-tutor button{cursor:pointer;border:0;border-radius:12px;padding:10px 14px;background:#ffce3c;color:#143e60;font-weight:bold;font-size:15px}
 #mej-offline-tutor .mej-tutor-close{background:#e8f1f7}
 #mej-offline-tutor .mej-tutor-response{white-space:pre-wrap;overflow-wrap:anywhere;min-height:70px;background:#eaf6ff;padding:12px;border-radius:13px;margin:12px 0}
 #mej-offline-tutor textarea{width:100%;box-sizing:border-box;border:2px solid #b0cfdf;border-radius:12px;padding:10px;font:16px system-ui;resize:vertical}
 #mej-offline-tutor .mej-tutor-buttons{display:flex;justify-content:space-between;gap:8px;margin-top:8px}
 #mej-offline-tutor small{display:block;color:#536878;margin-top:12px;font-size:12px}
 `;node.append(style);document.body.append(node);
 node.querySelector('.mej-tutor-close').addEventListener('click',close);
 node.addEventListener('click',e=>{if(e.target===node)close()});
 const field=node.querySelector('textarea'),output=node.querySelector('.mej-tutor-response');
 node.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const response=answer(field.value);lastAnswer=response;output.textContent=response;speak(response)});
 node.querySelector('.mej-tutor-mic').addEventListener('click',()=>{
   const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!SpeechRecognition){output.textContent='التعرف على الصوت غير متاح في هذا المتصفح. استخدم الكتابة؛ بعض المتصفحات ترسل التسجيلات لخوادم خارجية.';return}
   // Browser recognition may send audio to a third party; do not silently turn it on.
   if(!window.confirm('قد تتطلب ميزة التعرف على الصوت إرسال التسجيل إلى خدمة المتصفح. هل تريد المتابعة؟'))return;
   try{recognition?.abort();recognition=new SpeechRecognition();recognition.lang=/[\u0600-\u06ff]/.test(field.value)?'ar-OM':'en-US';recognition.interimResults=false;
   recognition.onresult=e=>{field.value=e.results[0][0].transcript;output.textContent='تم التعرف على السؤال. اضغط إرسال.'};
   recognition.onerror=()=>{output.textContent='تعذر التعرف على الصوت؛ يمكنك كتابة السؤال.'};recognition.start()
   }catch(_){output.textContent='تعذر تشغيل الميكروفون؛ اكتب سؤالك.'}
 });
 field.focus();
}
window.MEJOfflineTutor={open,close,answer};
})();
