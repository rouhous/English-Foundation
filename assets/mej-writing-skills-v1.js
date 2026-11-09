(function mejWritingSkills(){
'use strict';
if(window.MEJWritingSkillV1)return;
const S={
1:["I am happy.","This is my bag.","I like apples.","The cat is small.","She is my mum.","We play at school.","It is a red pen.","My dad is kind."],
2:["I go to school every day.","My sister likes reading books.","There are three birds.","We are playing football.","The dog is under the table.","I have got a blue bike.","She eats breakfast at seven.","We visit our grandparents on Friday."],
3:["My favourite subject is English.","We usually play outside after school.","The teacher is writing on the board.","I visited my cousin yesterday.","There is a library near our school.","We should drink water every day.","My brother can swim very well.","The weather was sunny last weekend."],
4:["Last Friday, we went to the beach.","My family enjoyed a picnic in the park.","I was reading when my friend called.","We must protect animals and their homes.","The students cleaned their classroom yesterday.","My sister is taller than my brother.","I am going to visit the museum tomorrow.","The boys were playing when it started raining."],
5:["I usually play basketball after school.","Our class visited the science museum yesterday.","My friend sent an email to the teacher.","We should eat healthy food every day.","I stayed at home because it was raining.","The children are planting trees in the garden.","We will travel to Salalah next holiday.","My sister likes reading adventure stories."],
6:["First, I switch on my computer.","We should never share our online passwords.","My friends and I visited an old fort.","The students were preparing a science project.","After school, I practise swimming at the sports centre.","We can use the internet to find information.","My mother made a delicious meal yesterday.","I always check information before I use it."],
7:["The audience enjoyed the music concert.","We packed our bags before going to the airport.","I had finished my homework before dinner.","The students travelled to Nizwa by bus.","We should protect endangered animals in Oman.","After the performance, everyone clapped loudly.","Our team practised carefully before the competition.","We stayed inside because the weather was stormy."]
};
const P={
5:[
["First, I wake up at six o'clock.","Next, I eat breakfast.","Then, I go to school by bus.","Finally, I do my homework in the afternoon."],
["On Friday morning, we went to the park.","First, we played football together.","After that, we ate our lunch under a tree.","Finally, we went home in the evening."],
["First, we wash our hands carefully.","Next, we prepare the ingredients.","Then, we make a healthy sandwich.","Finally, we enjoy our food."],
["Yesterday, our class visited a farm.","First, we saw some sheep and goats.","Later, the farmer showed us the vegetables.","Finally, we thanked him and returned to school."]
],
6:[
["First, I choose a topic for my project.","Next, I look for information in books.","After that, I check the facts with my teacher.","Finally, I write my report."],
["Last Saturday, we visited Nizwa Fort.","First, our guide told us about its history.","Later, we explored the old rooms.","Finally, we took photos before leaving."],
["First, I put on my swimming clothes.","Then, I listen to the coach's instructions.","After that, I practise in the pool.","Finally, I dry myself and get dressed."],
["In the morning, I received an email.","First, I read the message carefully.","Then, I wrote a polite reply.","Finally, I checked my spelling and sent it."]
],
7:[
["Before the journey, we checked the flight time.","First, we packed our passports and luggage.","After that, we travelled to the airport.","Finally, we boarded the plane."],
["At the beginning of the day, the team warmed up.","Next, the players listened to their coach.","Then, they played an exciting match.","In the end, they celebrated their victory."],
["First, the students chose a song for the concert.","Next, they practised every afternoon.","On the concert day, they performed on stage.","Finally, the audience applauded."],
["Yesterday, we learnt about endangered animals.","First, we collected facts from reliable books.","After that, we designed posters for our school.","Finally, we shared our ideas with other classes."]
]};
const CH={
8:[
{title:"After-school activities — survey of 40 students",values:[["Sports",16],["Reading",10],["Video games",8],["Art",6]],minimum:80,help:"Write a survey report: introduce the survey, compare the most and least popular activities and conclude."},
{title:"How 50 students travel to school",values:[["Bus",25],["Car",15],["Walking",8],["Bicycle",2]],minimum:80,help:"Write a survey report: compare the most popular and least popular ways to travel to school."}
],
10:[
{title:"Renewable electricity — fictional practice data",values:[["2021",8],["2022",12],["2023",18],["2024",25]],minimum:100,help:"Write a data summary: describe the overall trend, compare highest and lowest percentages, and finish with a short overview. Figures are invented for training."},
{title:"Science fair visitors — fictional practice data",values:[["Monday",120],["Tuesday",150],["Wednesday",200],["Thursday",180]],minimum:100,help:"Write a data summary: identify the highest and lowest figures, compare the days and describe the change. Figures are invented for training."}
]};
const css='#mej-writing-practice{max-width:760px;margin:8px auto;padding:12px;border:2px solid #95d5ed;border-radius:16px;background:#ebf8ff;color:#164264;direction:rtl}#mej-writing-practice *{box-sizing:border-box}#mej-writing-practice h2{font-size:clamp(18px,4.5vw,24px)}#mej-writing-practice button{padding:10px;font:700 clamp(13px,3.4vw,16px) Tahoma,Arial;border-radius:9px;border:1px solid #82b4d0;background:#087ba9;color:#fff;cursor:pointer}#mej-writing-practice button:disabled{opacity:.35}#mej-writing-practice .grids{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:7px}#mej-writing-practice .controls{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}#mej-writing-practice .chips{display:flex;flex-wrap:wrap;gap:7px;direction:ltr}#mej-writing-practice .chips button{background:#fff;color:#174766;line-height:1.5}#mej-writing-practice .answer{background:white;border:2px dashed #a2c9db;border-radius:10px;padding:12px;min-height:65px;direction:ltr;text-align:left;font-size:clamp(16px,3.8vw,20px);line-height:1.7;white-space:pre-wrap;margin:9px 0}#mej-writing-practice textarea{width:100%;min-height:180px;font:500 16px/1.7 Arial;padding:12px;border:1px solid #9ec6df;border-radius:10px;direction:ltr}#mej-writing-practice .chart{background:white;border:1px solid #9dd2ec;border-radius:12px;padding:10px}#mej-writing-practice p{line-height:1.65}';
const app=()=>document.getElementById('app');
const E=(tag,t)=>{const node=document.createElement(tag);if(t!=null)node.textContent=t;return node};
const shuffle=a=>{const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const goBack=()=>{if(typeof window.route==='function')window.route('skills')};
function permittedGrade(g){
 if(typeof window.permitted!=='function')return true;
 try{return Boolean(window.permitted(2*g-1)||window.permitted(2*g));}catch(_){return false}
}
function surface(title){
 const root=app();if(!root)return null;root.replaceChildren();const box=E('section');box.id='mej-writing-practice';box.append(E('h2',title));const back=E('button','↩ عودة إلى المهارات');back.onclick=goBack;box.append(back);root.append(box);return box;
}
let nativeSelect=null,previous={},grade=1,mode='words';
function choose(){
 const box=surface('✍️ Writing — أنشطة الكتابة');if(!box)return;
 box.append(E('p','الصفوف 1–4: ترتيب كلمات. الصفوف 5–7: ترتيب كلمات وجمل. هذه تدريبات غير محتسبة في النجوم.'));
 const panel=E('div');panel.className='grids';
 for(let g=1;g<=7;g++){const b=E('button','الصف '+g);b.disabled=!permittedGrade(g);b.title=b.disabled?'المستوى غير مفتوح بعد':'';b.onclick=()=>practice(g);panel.append(b)}
 box.append(panel,E('h3','كتابة الصفوف 8–12'));
 const advanced=E('div');advanced.className='grids';
 const old=E('button','Writing 8–12');old.onclick=()=>{
  if(nativeSelect){nativeSelect('Writing');const panel=app();for(const b of panel.querySelectorAll('button')){const match=(b.textContent||'').match(/الصف\s*(\d+)/);if(match&&+match[1]<8)b.remove()}}
 };
 const g8=E('button','📊 رسم بياني — 8A');g8.onclick=()=>chart(8,0);
 const g10=E('button','📊 رسم بياني — 10A');g10.onclick=()=>chart(10,0);
 advanced.append(old,g8,g10);box.append(advanced);
}
function practice(g){
 if(!permittedGrade(g))return;
 grade=g;mode='words';const box=surface('✍️ Writing — الصف '+g);if(!box)return;
 box.append(E('p',g<=4?'اضغط الكلمات لترتيبها في جملة سليمة.':'كوّن جملة بترتيب كلماتها أو رتّب الجمل لتكوين فقرة مترابطة.'));
 const bar=E('div');bar.className='controls';
 const wordTab=E('button','ترتيب الكلمات');wordTab.onclick=()=>{mode='words';exercise(box,g,mode,true)};bar.append(wordTab);
 if(g>=5){const paraTab=E('button','ترتيب الجمل');paraTab.onclick=()=>{mode='paragraph';exercise(box,g,mode,true)};bar.append(paraTab)}
 box.append(bar);const area=E('div');area.id='mej-writing-exercise';box.append(area);exercise(box,g,mode,true);
}
function exercise(box,g,kind,next){
 const area=box.querySelector('#mej-writing-exercise');if(!area)return;area.replaceChildren();
 const pool=kind==='words'?S[g]:P[g];if(!pool||!pool.length)return;
 const key=g+'-'+kind;const i=next?(previous[key]??-1)+1:(previous[key]??0);previous[key]=i%pool.length;
 const original=pool[previous[key]];
 const values=(kind==='words'?original.replace(/[.!?]$/,'').split(' '):original.slice());
 let tokens=shuffle(values.map((value,i)=>({value,i,used:false})));
 if(tokens.every((x,i)=>x.i===i))tokens.reverse();
 const chosen=[],answer=E('div');answer.className='answer';
 const tray=E('div');tray.className='chips';
 const message=E('p');message.setAttribute('aria-live','polite');
 function refresh(){
  answer.textContent=chosen.map((x,i)=>kind==='words'?x.value:(i+1)+'. '+x.value).join(kind==='words'?' ':'\n');
  if(kind==='words'&&chosen.length===values.length)answer.textContent+=original.slice(-1);
  tray.replaceChildren();
  tokens.forEach(item=>{const b=E('button',item.value);b.disabled=item.used;b.onclick=()=>{item.used=true;chosen.push(item);message.textContent='';refresh()};tray.append(b)});
 }
 const instructions=E('p',kind==='words'?'اضغط الكلمات بالترتيب الصحيح.':'رتّب الجمل حسب تسلسل الأحداث: First, Then, After that, Later, Finally.');
 const actions=E('div');actions.className='controls';
 const undo=E('button','↶ تراجع');undo.onclick=()=>{const item=chosen.pop();if(item)item.used=false;message.textContent='';refresh()};
 const clear=E('button','إعادة');clear.onclick=()=>{chosen.splice(0).forEach(x=>x.used=false);message.textContent='';refresh()};
 const check=E('button','✓ تحقق');check.onclick=()=>{
  if(chosen.length!==values.length){message.textContent='أكمل ترتيب كل الكلمات أو الجمل أولًا.';return}
  if(chosen.every((x,i)=>x.i===i)){message.textContent='✅ ممتاز! الترتيب صحيح.';message.style.color='#087852'}
  else{message.textContent='حاول مجددًا. الترتيب الصحيح: '+(kind==='words'?original:original.join(' '));message.style.color='#a04417'}
 };
 const more=E('button','التالي');more.onclick=()=>exercise(box,g,kind,true);
 actions.append(undo,clear,check,more);area.append(instructions,answer,tray,actions,message);refresh();
}
function chart(g,index){
 if(!permittedGrade(g))return;
 const task=CH[g]?.[index],box=surface('📊 Writing — '+g+'A — سؤال '+(index+1)+' من 2');if(!box||!task)return;
 box.append(E('p',g===8?'Survey Report: كتابة تقرير استطلاع لا يقل عن 80 كلمة.':'Data Summary: تلخيص بيانات لا يقل عن 100 كلمة.'));
 const graph=E('div');graph.className='chart';graph.append(E('h3',task.title));
 const max=Math.max(...task.values.map(x=>x[1]));
 for(const [label,n] of task.values){
  const row=E('div');row.style.cssText='display:grid;grid-template-columns:110px 1fr 38px;gap:7px;align-items:center;direction:ltr;margin:7px 0;font:500 13px Arial';
  const track=E('div');track.style.cssText='height:18px;background:#e7f1f6;border-radius:5px';
  const bar=E('div');bar.style.cssText='height:100%;width:'+(n/max*100)+'%;background:#087ca8;border-radius:5px';track.append(bar);
  row.append(E('span',label),track,E('span',String(n)));graph.append(row);
 }box.append(graph,E('p',task.help));
 const area=E('textarea');area.placeholder='Introduction...\nMain data and comparisons...\nConclusion...';box.append(area);
 const count=E('p','0 / '+task.minimum+' words');area.oninput=()=>count.textContent=(area.value.trim()?area.value.trim().split(/\s+/).length:0)+' / '+task.minimum+' words';box.append(count);
 const buttons=E('div');buttons.className='controls';const feedback=E('p');feedback.setAttribute('aria-live','polite');
 const help=E('button','إرشادات');help.onclick=()=>feedback.textContent='اذكر موضوع الرسم، ثم أعلى وأقل قيمة، وقارن البيانات بالأرقام. لا تضف أسبابًا أو حقائق غير موجودة في الرسم.';
 const review=E('button','مراجعة ذاتية');review.onclick=()=>feedback.textContent=(area.value.trim().split(/\s+/).filter(Boolean).length<task.minimum?'عدد الكلمات أقل من المطلوب. ':'عدد الكلمات مناسب. ')+'تحقق من المقارنة والأرقام وتسلسل الأفكار. هذا فحص بنيوي وليس تصحيحًا دلاليًا.';
 const other=E('button','النشاط '+(index===0?'الثاني':'الأول'));other.onclick=()=>chart(g,1-index);
 buttons.append(help,review,other);box.append(buttons,feedback);
}
function tidy(){
 const root=app();const cards=root?.querySelector('.skill-cards');if(!cards)return;
 for(const item of [...cards.children]){
  const title=(item.querySelector('h3')?.textContent||'').trim().toLowerCase();
  if(['writing','writing builder','writing building','uncharted writing'].includes(title))item.remove();
 }
 if(cards.querySelector('[data-mej-writing-card]'))return;
 const card=E('div');card.className='info skill-item';card.dataset.mejWritingCard='1';
 const bubble=E('div','✍️');bubble.className='bubble';
 const title=E('h3','Writing'),info=E('p','1–7: ترتيب كلمات وجمل · 8–12: كتابة');info.className='muted';
 const action=E('button','تدرّب');action.className='btn small';action.onclick=choose;
 card.append(bubble,title,info,action);cards.append(card);
}
function boot(){
 if(!document.getElementById('mej-writing-skills-css')){const st=E('style',css);st.id='mej-writing-skills-css';document.head.append(st)}
 if(typeof window.selectSkill==='function')nativeSelect=window.selectSkill;
 const native=window.skills;
 if(typeof native==='function'&&!native.__mejWritingWrapped){
  const patched=function(...args){const v=native.apply(this,args);queueMicrotask(tidy);return v};patched.__mejWritingWrapped=true;window.skills=patched;
 }
 const root=app();if(root){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;tidy()})}).observe(root,{childList:true,subtree:true})}
 tidy();
}
window.MEJWritingSkillV1={choose,practice,chart};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
