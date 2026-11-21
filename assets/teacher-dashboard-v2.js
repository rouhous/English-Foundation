/* Separate nautical teacher dashboard. Google identity token kept only in same-tab sessionStorage. */
(function(){
'use strict';
const API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-progress';
const GOOGLE_CLIENT='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const SESSION='MEJ_STAFF_LOGIN_V2',TTL=45*60*1000;
const $=id=>document.getElementById(id);
const app={token:null,students:[],groups:[],scope:null,selected:null,ready:false,owner:false,ownerScopes:[],ownerScope:'private'};
const colors=['#074B8E','#D97706','#7C3AED','#0891B2','#BE185D','#15803D','#C2410C','#4338CA','#0F766E','#A21CAF','#A16207','#0369A1','#B91C1C'];
const safe=v=>v==null||v===''?'—':String(v);
const integer=v=>Number.isFinite(Number(v))?Math.max(0,Math.trunc(Number(v))):0;
function node(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=String(text);return e}
function clear(e){e.replaceChildren();return e}
function message(t){$('message').textContent=t;$('loading').hidden=false}
function percent(v){return Math.max(0,Math.min(100,Number(v)||0))}
function status(t){$('identity').textContent=t}
function cName(v){return String(v||'غير محدد').trim()||'غير محدد'}
function key(v){return cName(v).replace(/[\u200e\u200f]/g,'')}
function credential(token){
 if(typeof token!=='string'||token.length<100)return false;
 app.token=token;
 sessionStorage.setItem(SESSION,JSON.stringify({token,at:Date.now(),role:app.owner?'owner':'teacher'}));
 return true;
}
function loadCached(){
 try{const s=JSON.parse(sessionStorage.getItem(SESSION)||'null');if(s&&typeof s.token==='string'&&Date.now()-s.at<TTL){app.token=s.token;app.owner=s.role==='owner';return true}}catch(_){}
 sessionStorage.removeItem(SESSION);return false
}
async function post(token){
 const r=await fetch(API,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
 headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
 body:JSON.stringify({action:app.owner?'owner_rosters':'teacher_roster'}),signal:AbortSignal.timeout(16000)});
 const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'NO_DATA');return d
}
function auth(messageText){
 $('loading').hidden=true;$('overview').hidden=true;$('detail').hidden=true;$('authNotice').hidden=false;
 $('authMessage').textContent=messageText||'اختر حساب Google المسجل للمعلم.';
 let attempts=0;const timer=setInterval(()=>{
   if(window.google?.accounts?.id){
    clearInterval(timer);
    google.accounts.id.initialize({client_id:GOOGLE_CLIENT,auto_select:false,cancel_on_tap_outside:true,callback:async x=>{
      if(credential(x?.credential)){ $('authNotice').hidden=true;await refresh(); }
    }});
    google.accounts.id.renderButton($('loginRepair'),{type:'standard',theme:'outline',size:'large',shape:'pill',text:'signin_with',width:270});
   }else if(++attempts>55){clearInterval(timer);$('authMessage').textContent='تعذر تحميل Google. افتح البوابة الموحدة وسجل دخولك.'}
 },200);
}
function normalize(data){
 const live=(data.students||[]).map(x=>({
   id:'live:'+x.student_ref,kind:'live',name:String(x.student_name||'طالب'),className:key(x.class_name),
   grade:integer(x.grade),level:integer(x.highest_level),stars:integer(x.stars),attempts:integer(x.attempts),
   correct:integer(x.correct_answers),mastered:integer(x.mastered_items),weekly:integer(x.weekly_attempts),weeklyStars:integer(x.weekly_stars),weeklyStarsComplete:x.weekly_stars_complete===true,weeklyStarLevels:Array.isArray(x.weekly_star_levels)?x.weekly_star_levels:[],weekStart:x.weekly_window_start||'',weekEnd:x.weekly_window_end||'',weekApproximate:x.weekly_legacy_dates_approximate===true,
   score:integer(x.attempts)?Math.round(100*Number(x.correct_answers||0)/Number(x.attempts)):null,
   levelStats:Array.isArray(x.level_stats)?x.level_stats:[],updated:x.updated_at||'',diagnostic:x.diagnostic_done===true
 }));
 const imports=(data.importedTrialStudents||[]).map(x=>({
   id:'import:'+x.id,kind:'trial',name:String(x.student_name||'STAGING TEST'),className:key(x.class_name),
   grade:integer(x.grade),level:integer(x.highest_level),stars:integer(x.stars),attempts:0,correct:0,
   mastered:0,weekly:null,weeklyStars:null,weeklyStarsComplete:false,weeklyStarLevels:[],score:null,mastery:percent(x.mastery_percent),
   levelStats:[],updated:'',sourceTab:x.source_tab||'',diagnostic:false
 }));
 return [...live,...imports]
}
function groupClasses(students){
 const groups=new Map();
 for(const student of students){
  const name=student.className;
  if(!groups.has(name))groups.set(name,{name,students:[]});
  groups.get(name).students.push(student);
 }
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,'ar',{numeric:true}))
}
function metric(name,value){const e=node('div','metric');e.append(node('strong','',safe(value)),node('small','',name));return e}
function metrics(target,items){clear(target);items.forEach(([title,value])=>target.append(metric(title,value)))}
function studentLabel(s){return s.kind==='trial'?'تجريبي مستورد':'متزامن من التطبيق'}
function currentWeekLabel(s){return s.weekStart&&s.weekEnd?s.weekStart+' — '+s.weekEnd:'الأحد 00:01 — السبت 23:59 (توقيت عُمان)'}
function weeklyText(s){return s.weekly===null?'غير متاح':String(s.weekly)+' محاولة'}
function weeklyStarsText(s){
 if(s.kind!=='live'||s.weeklyStars===null)return 'غير متاح';
 return s.weeklyStarsComplete?String(s.weeklyStars)+' ⭐':'≥ '+s.weeklyStars+' ⭐ (سجل جزئي)';
}
function weeklyClassText(students){
 const live=students.filter(s=>s.kind==='live');
 if(!live.length)return '—';
 const sum=live.reduce((total,s)=>total+integer(s.weeklyStars),0);
 return live.every(s=>s.weeklyStarsComplete)?sum+' ⭐':'≥ '+sum+' ⭐ (جزئي)';
}
function weeklyLevelText(s,level){
 if(s.kind!=='live')return '—';
 const value=integer((s.weeklyStarLevels||[])[level]);
 return s.weeklyStarsComplete?String(value):'≥ '+value;
}
// The cloud snapshot stores per-stage mastery as "mastered" (out of 200).
// Never infer an individual stage from the overall stars; the total may
// include awards that have not been attributed to a particular stage.
function levelStars(s,level){
 if(s.kind!=='live'||!Array.isArray(s.levelStats)||!s.levelStats.length)return null;
 const item=s.levelStats.find(x=>Number(x?.level)===level);
 if(!item||!Number.isFinite(Number(item.mastered)))return null;
 return Math.min(200,integer(item.mastered))
}
function assignedStars(s){
 let sum=0;for(let i=0;i<=12;i++)sum+=levelStars(s,i)||0;
 return sum
}
function otherStars(s){
 if(s.kind!=='live'||!Array.isArray(s.levelStats)||!s.levelStats.length)return null;
 return s.stars-assignedStars(s)
}
function levelPills(s){
 const wrap=node('div','levelPills');
 if(s.kind!=='live'||!s.levelStats.length){wrap.append(node('span','noLevelBreakdown','تفصيل المستويات غير متوفر لهذا السجل'));return wrap}
 let count=0;
 for(let i=0;i<=12;i++){
  const value=levelStars(s,i);
  if(value>0){wrap.append(node('span','levelPill','L'+i+' · ⭐ '+value));count++}
 }
 if(!count)wrap.append(node('span','noLevelBreakdown','لا توجد نجوم مسجلة في المستويات بعد'));
 const difference=otherStars(s);
 if(difference>0)wrap.append(node('span','levelPill extraStars','غير موزعة · ⭐ '+difference));
 if(difference<0)wrap.append(node('span','levelPill extraStars','فرق مزامنة · '+difference));
 return wrap
}
function renderLevelComparison(students){
 const host=clear($('levelsComparison'));
 if(!students.length){host.append(node('p','notice','لا توجد نتائج للمقارنة.'));return}
 const table=node('table','levelsMatrix');
 table.setAttribute('aria-label','مقارنة نجوم الطلاب من المستوى صفر إلى المستوى الثاني عشر');
 const head=node('thead'),heading=node('tr');
 for(const label of ['الطالب','المجموع','نجوم الأسبوع',...Array.from({length:13},(_,i)=>'L'+i),'غير موزعة']){
  const th=node('th','',label);th.scope='col';heading.append(th)
 }
 head.append(heading);table.append(head);
 const tbody=node('tbody');
 for(const s of students){
  const tr=node('tr');
  const nameCell=node('td');
  const open=node('button','matrixStudentName',s.name);open.type='button';
  open.setAttribute('aria-label','عرض تفاصيل '+s.name);
  open.addEventListener('click',()=>studentDetails(s));
  nameCell.append(open);tr.append(nameCell);
  tr.append(node('td','matrixTotal','⭐ '+s.stars));
  tr.append(node('td','matrixEarned',weeklyStarsText(s)));
  for(let i=0;i<=12;i++){
   const v=levelStars(s,i);
   const td=node('td',v>0?'matrixEarned':(v===null?'matrixUnavailable':'matrixZero'),v===null?'—':v);
   td.title=v===null?'لا تتوفر بيانات المستوى '+i:'المستوى '+i+': '+v+' نجمة من 200';
   tr.append(td)
  }
  const extra=otherStars(s);
  tr.append(node('td',extra>0?'matrixExtra':'',extra===null?'—':extra===0?'0':extra>0?'+'+extra:String(extra)));
  tbody.append(tr)
 }
 table.append(tbody);host.append(table)
}
function getGroupMax(g){return Math.max(0,...g.students.map(s=>s.stars))}
function makeClassButton(g){
 const b=node('button','classCard');b.type='button';
 b.append(node('strong','', 'الصف '+g.name));
 b.append(node('div','mini','عدد الطلاب: '+g.students.length));
 b.append(node('div','mini','أعلى مستوى: '+Math.max(0,...g.students.map(s=>s.level))));
 b.append(node('div','mini','⭐ أعلى عدد نجوم: '+getGroupMax(g)));
 b.append(node('div','mini','⭐ نجوم الصف هذا الأسبوع: '+weeklyClassText(g.students)));
 b.append(node('span','chip','عرض قائمة الطلاب ←'));
 b.addEventListener('click',()=>openClass(g.name));return b
}
function section(title){const div=node('section','chart');div.append(node('h3','',title));return div}
function chartLevels(){
 const panel=section('عدد الطلاب في كل مستوى');
 panel.classList.add('stackedLevelPanel');
 for(const g of app.groups){
  const row=node('div','classCompareRow');
  const className=node('strong','compareClassName',g.name);
  className.title='الصف '+g.name;
  const chartWrap=node('div','compareChartScroll');
  const chart=node('div','compareChart');
  const counts=Array.from({length:13},()=>0);
  for(const student of g.students)counts[Math.min(12,integer(student.level))]++;
  const occupied=counts.map((count,level)=>({count,level})).filter(x=>x.count>0);
  if(!occupied.length){
   chartWrap.append(node('span','notice','لا توجد بيانات مستويات بعد'));
  }else{
   // One aligned column per represented level. Only occupied levels appear;
   // the chart scrolls horizontally on narrow screens without clipping a label.
   const total=occupied.reduce((sum,p)=>sum+p.count,0);
   chart.style.minWidth=Math.max(0,occupied.length*46)+'px';
   for(const part of occupied){
    const column=node('div','compareSegmentColumn');
    column.style.flexGrow=String(part.count);
    column.style.flexBasis='0';
    const count=node('strong','compareSegmentCount',part.count);
    count.style.background=colors[part.level];
    count.title=part.count+' '+(part.count===1?'طالب':'طلاب')+' في L'+part.level;
    count.setAttribute('aria-label',part.count+' طلاب في المستوى '+part.level);
    const level=node('span','compareSegmentLabel','L'+part.level);
    column.append(count,level);chart.append(column);
   }
   chartWrap.append(chart);
   chartWrap.setAttribute('aria-label','الصف '+g.name+'، إجمالي '+total+' طلاب');
  }
  row.append(className,chartWrap);
  panel.append(row);
 }
 return panel
}
function chartStars(){
 const panel=section('أعلى عدد نجوم في كل صف');
 const max=Math.max(1,...app.groups.map(getGroupMax));
 for(const g of app.groups){
  const row=node('div','chartRow');
  const value=getGroupMax(g);
  const bar=node('div','bar'),fill=node('i');fill.style.width=(value/max*100)+'%';bar.append(fill);
  row.append(node('span','',g.name),bar,node('strong','',value));panel.append(row)
 }
 return panel
}
function renderOwnerScope(){
 const scope=app.ownerScopes.find(x=>x.key===app.ownerScope);
 if(!scope)return;
 app.students=normalize({students:scope.students||[],importedTrialStudents:[]});
 app.groups=groupClasses(app.students);
 app.scope=scope;app.ready=true;
 $('ownerPrivate').setAttribute('aria-pressed',String(app.ownerScope==='private'));
 $('ownerSchool').setAttribute('aria-pressed',String(app.ownerScope==='school'));
 $('ownerLinkedStatus').textContent='الطلاب المرتبطون: '+Number(scope.linkedCount||0)+' · بيانات التقدم المتزامنة: '+app.students.length;
 $('dataScope').textContent='تقدم الطلاب — '+scope.label;
 status('متابعة طلابي · '+scope.label);
 metrics($('metrics'),[['عدد الصفوف',app.groups.length],['عدد الطلاب',app.students.length],['أعلى مستوى',Math.max(0,...app.students.map(s=>s.level))],['أعلى عدد نجوم',Math.max(0,...app.students.map(s=>s.stars))],['نجوم الأسبوع الحالي',weeklyClassText(app.students)]]);
 $('classCount').textContent=app.groups.length+' صفوف';
 clear($('classes'));app.groups.forEach(g=>$('classes').append(makeClassButton(g)));
 if(!app.groups.length)$('classes').append(node('p','notice',
  Number(scope.linkedCount||0)>0?'يوجد طلاب مرتبطون بهذا الرمز، لكن لم تصل بيانات تقدم قابلة للعرض حتى الآن.':'لم يُسجل طلاب مرتبطون بهذه الجهة في القاعدة الجديدة بعد.'));
 clear($('charts'));if(app.groups.length)$('charts').append(chartLevels(),chartStars());
 $('detail').hidden=true;$('overview').hidden=false;
}
function overall(data){
 $('authNotice').hidden=true;$('loading').hidden=true;$('detail').hidden=true;$('overview').hidden=false;
 if(app.owner){
   app.ownerScopes=Array.isArray(data.scopes)?data.scopes:[];
   const selected=app.ownerScopes.some(x=>x.key===app.ownerScope)?app.ownerScope:'private';
   app.ownerScope=selected;
   $('ownerScopes').hidden=false;
   $('issueCode').disabled=true;
   $('issueCode').title='رموز المالك الخاصة والمدرسة محفوظة بالفعل، ولن تُعاد تهيئتها من هذه الصفحة.';
   renderOwnerScope();
   return;
 }
 $('ownerScopes').hidden=true;
 app.students=normalize(data);app.groups=groupClasses(app.students);app.ready=true;app.scope=data;
 status('المعلم: '+safe(data.teacherName)+' · المدرسة: '+safe(data.schoolName));
 if(data.profileNotice==='OWNER_TEACHER_PROFILE_NOT_LINKED'){
  $('issueCode').disabled=true;
  $('issueCode').title='يجب ربط حساب المالك بسجل المعلم قبل إصدار رمز الطلاب';
 }else{
  $('issueCode').disabled=false;$('issueCode').title='';
 }
 const live=app.students.filter(s=>s.kind==='live').length,trial=app.students.length-live;
 $('dataScope').textContent='السجلات المستوردة للتجربة: '+trial+' · النتائج المباشرة: '+live+' (تُعرض منفصلة في تفاصيل الطلاب)';
 metrics($('metrics'),[['عدد الصفوف',app.groups.length],['عدد الطلاب',app.students.length],['أعلى مستوى',Math.max(0,...app.students.map(s=>s.level))],['أعلى عدد نجوم',Math.max(0,...app.students.map(s=>s.stars))],['نجوم الأسبوع الحالي',weeklyClassText(app.students)]]);
 $('classCount').textContent=app.groups.length+' صفوف';
 clear($('classes'));app.groups.forEach(g=>$('classes').append(makeClassButton(g)));
 if(!app.groups.length){
  const text=data.profileNotice==='OWNER_TEACHER_PROFILE_NOT_LINKED'
   ?'تم فتح لوحة المعلم لحساب المالك، لكن سجله كمعلم وارتباطات طلابه لم تُنقل إلى قاعدة البيانات الجديدة بعد. لن تُعرض سجلات معلم آخر تلقائيًا.'
   :'لا توجد سجلات مرتبطة بهذا الحساب بعد. تحقق من حساب المعلم والمزامنة.';
  $('classes').append(node('p','notice',text));
 }
 clear($('charts'));if(app.groups.length)$('charts').append(chartLevels(),chartStars());
}
function openClass(name){
 const g=app.groups.find(x=>x.name===name);if(!g)return;
 app.selected=name;
 $('overview').hidden=true;$('detail').hidden=false;$('studentDetail').hidden=true;
 $('detailTitle').textContent='طلاب الصف '+g.name;
 $('detailScope').textContent=g.students.filter(s=>s.kind==='trial').length+' سجلات تجريبية · '+g.students.filter(s=>s.kind==='live').length+' متزامنة';
 metrics($('detailMetrics'),[['الصف',g.name],['عدد الطلاب',g.students.length],['أعلى مستوى',Math.max(0,...g.students.map(s=>s.level))],['أعلى عدد نجوم',getGroupMax(g)],['نجوم هذا الأسبوع',weeklyClassText(g.students)]]);
 $('studentSearch').value='';$('sortStudents').value='stars';renderList(g.students);
 history.replaceState(null,'','#class='+encodeURIComponent(name));window.scrollTo({top:0,behavior:'smooth'})
}
function sortedStudents(students){
 const mode=$('sortStudents').value;
 if(mode==='weekly-stars')return [...students].sort((a,b)=>
  (b.weeklyStarsComplete?integer(b.weeklyStars):-1)-(a.weeklyStarsComplete?integer(a.weeklyStars):-1)||
  b.stars-a.stars||String(a.name||'').localeCompare(String(b.name||''),'ar'));
 const match=/^stars-level-(\d{1,2})$/.exec(mode);
 if(match&&Number(match[1])<=12){
  const level=Number(match[1]);
  return [...students].sort((a,b)=>
   (levelStars(b,level)??-1)-(levelStars(a,level)??-1)||
   b.stars-a.stars||b.level-a.level||
   String(a.name||'').localeCompare(String(b.name||''),'ar'))
 }
 const primary=mode==='level'?'level':'stars';
 const secondary=mode==='level'?'stars':'level';
 return [...students].sort((a,b)=>
   integer(b[primary])-integer(a[primary])||
   integer(b[secondary])-integer(a[secondary])||
   String(a.name||'').localeCompare(String(b.name||''),'ar')
 );
}
function renderList(students){
 const host=clear($('studentList'));
 const search=$('studentSearch').value.trim();
 const shown=sortedStudents(students.filter(x=>!search||x.name.includes(search)));
 for(const s of shown){
   const b=node('button','student');b.type='button';
   b.append(node('strong','',s.name),node('span','',studentLabel(s)));
   b.append(node('span','', 'المستوى '+s.level+' · ⭐ المجموع '+s.stars+' · ⭐ هذا الأسبوع '+weeklyStarsText(s)+' · النشاط '+weeklyText(s)));
   b.append(levelPills(s));
   const track=node('div','progress'),fill=node('i');fill.style.width=(s.kind==='trial'?s.mastery||0:Math.min(100,s.mastered/200*100))+'%';
   track.append(fill);b.append(track);
   b.onclick=()=>studentDetails(s);host.append(b)
 }
 if(!shown.length)host.append(node('p','notice','لا توجد نتائج مطابقة.'));
 renderLevelComparison(shown);
}
const examResultsAPI='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-exam-results';
function attachStudentExamTab(host, student){
 const tabs=node('div','subline');
 const progressTab=node('button','button alt','تقدم الرحلة');
 const examsTab=node('button','button alt','اختبارات الطالب');
 const progress=node('div');
 const exams=node('div');
 progress.append(...host.childNodes);
 tabs.append(progressTab,examsTab);
 host.append(tabs,progress,exams);
 progressTab.type=examsTab.type='button';
 let generation=0;
 function select(showExams){
  progress.hidden=showExams;
  exams.hidden=!showExams;
  progressTab.setAttribute('aria-pressed',String(!showExams));
  examsTab.setAttribute('aria-pressed',String(showExams));
 }
 progressTab.onclick=()=>{generation++;select(false)};
 examsTab.onclick=async()=>{
  const requestId=++generation;
  select(true);
  exams.replaceChildren(node('p','notice','جارٍ تحميل نتائج My Exams…'));
  try{
   const response=await fetch(examResultsAPI,{method:'POST',credentials:'omit',cache:'no-store',
    headers:{Authorization:'Bearer '+app.token,'Content-Type':'application/json'},
    body:JSON.stringify({action:'teacher_results',studentRef:student.id.slice(5)}),signal:AbortSignal.timeout(12000)});
   const result=await response.json();
   if(!exams.isConnected||generation!==requestId)return;
   if(!response.ok||!result.ok)throw Error(result.error);
   if(!result.results.length){
    exams.replaceChildren(node('p','notice','لا توجد محاولات مرسلة من My Exams لهذا الطالب بعد.'));
    return;
   }
   const modes={unit:'اختبار وحدة',skill:'نشاط مهارة',comprehensive:'اختبار شامل',random:'اختبار عشوائي'};
   const tracks={core:'أساسي',elective:'اختياري'};
   exams.replaceChildren(node('p','notice','درجات تدريبية آلية من My Exams. تظهر الكتابة بانتظار التصحيح عند تسليمها.'));
   const list=node('div');
   for(const resultRow of result.results){
    const card=node('div','sheet');
    const title=[modes[resultRow.mode],resultRow.paper,resultRow.skill].filter(Boolean).join(' · ');
    const grade=[resultRow.grade,tracks[resultRow.track]].filter(Boolean).join(' · ');
    const score=Number(resultRow.possible)>0?String(resultRow.earned)+' / '+String(resultRow.possible):'بانتظار التقييم';
    card.append(node('strong','',title),node('div','','الصف '+grade+' · '+new Date(resultRow.submitted_at).toLocaleString('ar-OM')),
     node('div','','الدرجة الآلية: '+score+(resultRow.writing_pending?' · الكتابة بانتظار التصحيح':'')));
    list.append(card);
   }
   exams.append(list);
  }catch(error){
   if(!exams.isConnected||generation!==requestId)return;
   exams.replaceChildren(node('p','warning',error.message==='FORBIDDEN'?'النتائج متاحة للمعلم المرتبط بهذا الطالب.':'تعذر تحميل النتائج. اضغط على تبويب اختبارات الطالب لإعادة المحاولة.'));
  }
 };
 select(false);
}
function attachStudentRecovery(host,s){
 const panel=node('div','sheet');
 const heading=node('strong','','🔑 رمز استرجاع الطالب');
 const info=node('p','notice','الرمز الأصلي مشفّر ولا يمكن عرضه. يمكن للمعلم المرتبط بالحساب إصدار رمز جديد من 6 أرقام للحساب نفسه. سيُلغى الرمز السابق دون تغيير النجوم أو المستوى.');
 const button=node('button','button alt','إصدار رمز استرجاع جديد');
 button.type='button';
 const output=node('p','notice','');
 panel.append(heading,info,button,output);host.append(panel);
 button.onclick=async()=>{
  if(!app.token){output.textContent='يرجى تسجيل الدخول مجددًا.';return;}
  if(!window.confirm('هل تريد إصدار رمز جديد للطالب '+s.name+'؟ الرمز السابق سيتوقف عن العمل. لن يتغير تقدم الطالب.'))return;
  button.disabled=true;output.textContent='جارٍ التحقق من صلاحية المعلم وإصدار الرمز…';
  try{
   const response=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-student-account',{
    method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
    headers:{Authorization:'Bearer '+app.token,'Content-Type':'application/json'},
    body:JSON.stringify({action:'teacher_reissue',studentRef:s.id.slice(5),confirm:true}),
    signal:AbortSignal.timeout(16000)
   });
   const result=await response.json();
   if(!response.ok||!result.ok||!/^[0-9]{6}$/.test(result.recoveryCode||''))throw Error(result.error||'SERVICE_UNAVAILABLE');
   output.replaceChildren(node('strong','','الرمز الجديد للطالب '+s.name+': '+result.recoveryCode));
   const copy=node('button','button alt','نسخ الرمز');copy.type='button';
   copy.onclick=async()=>{try{await navigator.clipboard.writeText(result.recoveryCode);copy.textContent='تم النسخ ✓'}catch(_){copy.textContent='تعذر النسخ؛ انسخ الرمز المعروض'}};
   output.append(document.createTextNode(' '),copy);
  }catch(err){output.textContent=err.message==='FORBIDDEN'?'لا تملك صلاحية تعديل رمز هذا الطالب.':err.message==='ACCOUNT_NOT_FOUND'?'لم يُفعّل الاسترجاع للحساب الأصلي.': 'تعذر إصدار الرمز: '+String(err.message||'SERVICE_UNAVAILABLE')}
  finally{button.disabled=false}
 };
}
function studentDetails(s){
 $('studentDetail').hidden=false;$('studentTitle').textContent=s.name;
 const host=clear($('studentDetails'));
 if(s.kind==='trial')host.append(node('div','warning','سجل STAGING قديم للمعاينة، وليس حساب طالب نشطًا. لا تتوفر تفاصيل الإجابات أو مزامنة جهاز الطالب في هذا السجل.'));
 const t=node('table','detailTable');
 const lines=[['القسم',s.className],['الصف الدراسي',s.grade],['المستوى الحالي',s.level],['مجموع النجوم',s.stars+' ⭐'],['نجوم الأسبوع الحالي',weeklyStarsText(s)],['نشاط الأسبوع الحالي (عدد المحاولات)',weeklyText(s)],['الفترة الأسبوعية',currentWeekLabel(s)]];
 if(s.kind==='trial')lines.push(['إتقان المستوى',s.mastery+'%'],['مصدر السجل',s.sourceTab]);
 else lines.push(['المحاولات',s.attempts],['الإجابات الصحيحة',s.correct],['دقة الإجابات',s.score===null?'—':s.score+'%'],['العناصر المتقنة',s.mastered],['أنجز التشخيص',s.diagnostic?'نعم':'لا'],['آخر مزامنة',s.updated?new Date(s.updated).toLocaleString('ar-OM'):'—']);
 for(const [a,b] of lines){const tr=node('tr');tr.append(node('td','',a),node('td','',safe(b)));t.append(tr)}host.append(t);
 if(s.kind==='live'&&s.levelStats.length){
  const total=section('توزيع نجوم الطالب');
  const assigned=assignedStars(s),difference=otherStars(s);
  total.append(node('p','notice','المجموع الكلي: '+s.stars+' ⭐ · نجوم المستويات: '+assigned+' ⭐'+(difference>0?' · غير موزعة: '+difference+' ⭐':difference<0?' · يوجد اختلاف بين السجل والمجموع':'')));
  const div=section('نجوم كل مستوى (من 200)');
  for(let level=0;level<=12;level++){
   const value=levelStars(s,level),r=node('div','chartRow');
   const bar=node('div','bar'),fill=node('i');
   fill.style.width=(value===null?0:value/200*100)+'%';bar.append(fill);
   r.append(node('span','','L'+level),bar,node('strong','',value===null?'—':value+' / 200'));div.append(r)
  }
  host.append(total,div);
  const weekly=section('النجوم المكتسبة في مستويات هذا الأسبوع');
  if(s.weeklyStarsComplete){
   const earned=(s.weeklyStarLevels||[]).map((value,level)=>({level,value:integer(value)})).filter(x=>x.value>0);
   if(earned.length){for(const item of earned)weekly.append(node('p','notice','المستوى L'+item.level+' · ⭐ '+item.value))}
   else weekly.append(node('p','notice','لم تُكتسب نجوم جديدة خلال هذا الأسبوع.'));
  }else weekly.append(node('p','notice','المحاولات القديمة غير مكتملة؛ المعروض من النجوم الأسبوعية حد أدنى فقط.'));
  host.append(weekly)
 }else host.append(node('p','notice','لا تتوفر بيانات النجوم بحسب المستوى لهذا السجل.'));
 if(s.kind==='live'){attachStudentRecovery(host,s);attachStudentExamTab(host,s);}
 $('studentDetail').scrollIntoView({behavior:'smooth',block:'start'})
}
async function refresh(){
 if(!app.token)return auth();
 message('جار تحميل الصفوف والسجلات من Supabase...');
 try{
  const data=await post(app.token);overall(data);
  const hash=location.hash.match(/^#class=(.+)$/);
  if(hash){try{openClass(decodeURIComponent(hash[1]))}catch(_){}}
 }catch(e){
  if(/NOT_VERIFIED_TEACHER|LICENSE_INACTIVE/.test(e.message)){sessionStorage.removeItem(SESSION);app.token=null;return auth('الحساب غير معتمد كمعلم في النظام الجديد. يرجى استخدام حساب المعلم التجريبي نفسه.')}
  if(/JWT|LOGIN|AUTH|403|401/.test(e.message)){sessionStorage.removeItem(SESSION);app.token=null;return auth('انتهت صلاحية تسجيل الدخول. اختر حساب Google مجددًا.')}
  message('تعذر تحميل البيانات: '+e.message+'. جرّب زر تحديث.');$('overview').hidden=true
 }
}
for(let level=0;level<=12;level++){
 const option=node('option','', 'نجوم المستوى '+level+' أولاً');
 option.value='stars-level-'+level;$('sortStudents').append(option)
}
$('back').addEventListener('click',()=>{history.replaceState(null,'',location.pathname);$('detail').hidden=true;$('overview').hidden=false;window.scrollTo(0,0)});
$('closeStudent').addEventListener('click',()=>{$('studentDetail').hidden=true});
$('studentSearch').addEventListener('input',()=>{const g=app.groups.find(x=>x.name===app.selected);if(g)renderList(g.students)});
$('sortStudents').addEventListener('change',()=>{const g=app.groups.find(x=>x.name===app.selected);if(g)renderList(g.students)});
$('issueCode').addEventListener('click',async()=>{
 if(!app.token){window.alert('سجل الدخول بحساب المعلم أولًا.');return}
 const confirmed=window.confirm(
  `هل تريد إصدار رمز جديد لربط الطلاب؟\n\nسيُلغى الرمز القديم للانضمامات الجديدة فقط.\nالطلاب المرتبطون مسبقًا سيبقون مرتبطين بك ولن تتغير بياناتهم أو نتائجهم.\n\nاضغط موافق لإصدار الرمز الجديد.`
 );
 if(!confirmed)return;
 const statusEl=$('codeStatus'),button=$('issueCode');
 const dialog=$('codeDialog');
 button.disabled=true;statusEl.textContent='جار إصدار رمز ربط الطلاب...';
 $('codeValue').textContent='';
 try{
  const r=await fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-staff-native',{
   method:'POST',cache:'no-store',credentials:'omit',
   headers:{Authorization:'Bearer '+app.token,'Content-Type':'application/json'},
   body:JSON.stringify({action:'teacher_issue_student_code'}),signal:AbortSignal.timeout(16000)
  });
  const d=await r.json();
  if(!r.ok||!d.ok||!/^[0-9]{6}$/.test(d.code))throw Error(d.error||'CODE_REJECTED');
  $('codeValue').textContent=d.code;
  statusEl.textContent='تم إصدار الرمز. القديم لم يعد يقبل انضمامات جديدة، والطلاب المرتبطون مسبقًا لم يتأثروا.';
 }catch(_){
  statusEl.textContent='تعذر تأكيد إصدار الرمز. لم تُعرض أي قيمة غير مؤكدة؛ تحقق من الاتصال قبل المحاولة مجددًا.';
 }finally{
  button.disabled=false;
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 }
});
$('closeCode').addEventListener('click',()=>{
 const dialog=$('codeDialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
});
$('copyCode').addEventListener('click',async()=>{
 const code=$('codeValue').textContent;
 if(!/^[0-9]{6}$/.test(code)){ $('codeStatus').textContent='لا يوجد رمز جديد لنسخه.';return}
 try{await navigator.clipboard.writeText(code);$('codeStatus').textContent='تم نسخ الرمز.'}
 catch(_){$('codeStatus').textContent='تعذّر النسخ التلقائي. يمكنك تحديد الرمز الظاهر ونسخه.'}
});
$('ownerPrivate').addEventListener('click',()=>{app.ownerScope='private';renderOwnerScope()});
$('ownerSchool').addEventListener('click',()=>{app.ownerScope='school';renderOwnerScope()});
$('refresh').addEventListener('click',refresh);
$('print').addEventListener('click',()=>window.print());
$('logout').addEventListener('click',()=>{sessionStorage.removeItem(SESSION);app.token=null;location.replace('./teacher-portal.html')});
if(loadCached())refresh();else auth();
})();
