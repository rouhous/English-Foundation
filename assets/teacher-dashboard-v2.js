/* Separate nautical teacher dashboard. Google identity token kept only in same-tab sessionStorage. */
(function(){
'use strict';
const API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-progress';
const GOOGLE_CLIENT='825380653679-o9dn1pl3m19olr8de2edjl0hcnngm961.apps.googleusercontent.com';
const SESSION='MEJ_STAFF_LOGIN_V2',TTL=45*60*1000;
const $=id=>document.getElementById(id);
const app={token:null,students:[],groups:[],scope:null,selected:null,ready:false};
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
 sessionStorage.setItem(SESSION,JSON.stringify({token,at:Date.now()}));
 return true;
}
function loadCached(){
 try{const s=JSON.parse(sessionStorage.getItem(SESSION)||'null');if(s&&typeof s.token==='string'&&Date.now()-s.at<TTL){app.token=s.token;return true}}catch(_){}
 sessionStorage.removeItem(SESSION);return false
}
async function post(token){
 const r=await fetch(API,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
 headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
 body:JSON.stringify({action:'teacher_roster'}),signal:AbortSignal.timeout(16000)});
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
   correct:integer(x.correct_answers),mastered:integer(x.mastered_items),weekly:integer(x.weekly_attempts),
   score:integer(x.attempts)?Math.round(100*Number(x.correct_answers||0)/Number(x.attempts)):null,
   levelStats:Array.isArray(x.level_stats)?x.level_stats:[],updated:x.updated_at||'',diagnostic:x.diagnostic_done===true
 }));
 const imports=(data.importedTrialStudents||[]).map(x=>({
   id:'import:'+x.id,kind:'trial',name:String(x.student_name||'STAGING TEST'),className:key(x.class_name),
   grade:integer(x.grade),level:integer(x.highest_level),stars:integer(x.stars),attempts:0,correct:0,
   mastered:0,weekly:integer(x.weekly_attempts),score:null,mastery:percent(x.mastery_percent),
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
function getGroupMax(g){return Math.max(0,...g.students.map(s=>s.stars))}
function makeClassButton(g){
 const b=node('button','classCard');b.type='button';
 b.append(node('strong','', 'الصف '+g.name));
 b.append(node('div','mini','عدد الطلاب: '+g.students.length));
 b.append(node('div','mini','أعلى مستوى: '+Math.max(0,...g.students.map(s=>s.level))));
 b.append(node('div','mini','⭐ أعلى عدد نجوم: '+getGroupMax(g)));
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
function overall(data){
 $('authNotice').hidden=true;$('loading').hidden=true;$('detail').hidden=true;$('overview').hidden=false;
 app.students=normalize(data);app.groups=groupClasses(app.students);app.ready=true;app.scope=data;
 status('المعلم: '+safe(data.teacherName)+' · المدرسة: '+safe(data.schoolName));
 const live=app.students.filter(s=>s.kind==='live').length,trial=app.students.length-live;
 $('dataScope').textContent='السجلات المستوردة للتجربة: '+trial+' · النتائج المباشرة: '+live+' (تُعرض منفصلة في تفاصيل الطلاب)';
 metrics($('metrics'),[['عدد الصفوف',app.groups.length],['عدد الطلاب',app.students.length],['أعلى مستوى',Math.max(0,...app.students.map(s=>s.level))],['أعلى عدد نجوم',Math.max(0,...app.students.map(s=>s.stars))]]);
 $('classCount').textContent=app.groups.length+' صفوف';
 clear($('classes'));app.groups.forEach(g=>$('classes').append(makeClassButton(g)));
 if(!app.groups.length)$('classes').append(node('p','notice','لا توجد سجلات مرتبطة بهذا الحساب بعد. تحقق من حساب المعلم والمزامنة.'));
 clear($('charts'));if(app.groups.length)$('charts').append(chartLevels(),chartStars());
}
function openClass(name){
 const g=app.groups.find(x=>x.name===name);if(!g)return;
 app.selected=name;
 $('overview').hidden=true;$('detail').hidden=false;$('studentDetail').hidden=true;
 $('detailTitle').textContent='طلاب الصف '+g.name;
 $('detailScope').textContent=g.students.filter(s=>s.kind==='trial').length+' سجلات تجريبية · '+g.students.filter(s=>s.kind==='live').length+' متزامنة';
 metrics($('detailMetrics'),[['الصف',g.name],['عدد الطلاب',g.students.length],['أعلى مستوى',Math.max(0,...g.students.map(s=>s.level))],['أعلى عدد نجوم',getGroupMax(g)]]);
 $('studentSearch').value='';$('sortStudents').value='stars';renderList(g.students);
 history.replaceState(null,'','#class='+encodeURIComponent(name));window.scrollTo({top:0,behavior:'smooth'})
}
function sortedStudents(students){
 const mode=$('sortStudents').value==='level'?'level':'stars';
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
   b.append(node('span','', 'المستوى '+s.level+' · ⭐ '+s.stars+' · نشاط الأسبوع '+s.weekly));
   const track=node('div','progress'),fill=node('i');fill.style.width=(s.kind==='trial'?s.mastery||0:Math.min(100,s.mastered/200*100))+'%';
   track.append(fill);b.append(track);
   b.onclick=()=>studentDetails(s);host.append(b)
 }
 if(!shown.length)host.append(node('p','notice','لا توجد نتائج مطابقة.'));
}
function studentDetails(s){
 $('studentDetail').hidden=false;$('studentTitle').textContent=s.name;
 const host=clear($('studentDetails'));
 if(s.kind==='trial')host.append(node('div','warning','سجل STAGING قديم للمعاينة، وليس حساب طالب نشطًا. لا تتوفر تفاصيل الإجابات أو مزامنة جهاز الطالب في هذا السجل.'));
 const t=node('table','detailTable');
 const lines=[['القسم',s.className],['الصف الدراسي',s.grade],['المستوى الحالي',s.level],['النجوم',s.stars],['أنشطة هذا الأسبوع',s.weekly]];
 if(s.kind==='trial')lines.push(['إتقان المستوى',s.mastery+'%'],['مصدر السجل',s.sourceTab]);
 else lines.push(['المحاولات',s.attempts],['الإجابات الصحيحة',s.correct],['دقة الإجابات',s.score===null?'—':s.score+'%'],['العناصر المتقنة',s.mastered],['أنجز التشخيص',s.diagnostic?'نعم':'لا'],['آخر مزامنة',s.updated?new Date(s.updated).toLocaleString('ar-OM'):'—']);
 for(const [a,b] of lines){const tr=node('tr');tr.append(node('td','',a),node('td','',safe(b)));t.append(tr)}host.append(t);
 if(s.levelStats.length){
  const div=section('الإتقان بحسب المستوى');
  for(const v of s.levelStats){
   const r=node('div','chartRow'),bar=node('div','bar'),fill=node('i');
   const n=percent(v.masteryPercent??(Number(v.mastered||0)/200*100));
   fill.style.width=n+'%';bar.append(fill);
   r.append(node('span','','L'+v.level),bar,node('span','',Math.round(n)+'%'));div.append(r)
  }host.append(div)
 }
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
$('refresh').addEventListener('click',refresh);
$('print').addEventListener('click',()=>window.print());
$('logout').addEventListener('click',()=>{sessionStorage.removeItem(SESSION);app.token=null;location.replace('./teacher-portal.html')});
if(loadCached())refresh();else auth();
})();
