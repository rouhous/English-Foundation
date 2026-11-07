/* My English Journey: internal staff progress, no Sheets. No tokens stored. */
(function(root){
'use strict';
const URL='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-progress';
function elem(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;}
function box(root,title){const section=elem('section',undefined,'mej-report');section.style.cssText='margin-top:16px;padding:14px;background:#fff;border:1px solid #c3dfda;border-radius:16px;text-align:right';section.append(elem('h2',title));root.append(section);return section;}
function label(n){return n===undefined||n===null||n===''?'—':String(n)}
const panels={};
const state={};
async function post(action,token){
 const r=await fetch(URL,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action}),signal:AbortSignal.timeout(16000)});
 const d=await r.json();if(!r.ok||d.ok!==true)throw Error(d.error||'LOAD_FAILED');return d;
}
function table(head,rows){
 const wrapper=elem('div');wrapper.style.cssText='overflow-x:auto;-webkit-overflow-scrolling:touch';
 const t=elem('table');t.style.cssText='border-collapse:collapse;width:100%;font-size:14px;min-width:650px';
 const tr=elem('tr');
 head.forEach(h=>{const c=elem('th',h);c.style.cssText='padding:10px 8px;border:1px solid #d5e7e4;background:#eaf6f3;white-space:nowrap';tr.append(c);});
 const thead=elem('thead');thead.append(tr);t.append(thead);
 const tbody=elem('tbody');rows.forEach((cells,i)=>{const row=elem('tr');if(i%2)row.style.background='#f6fbfa';cells.forEach(v=>{const c=elem('td',label(v));c.style.cssText='padding:9px 7px;border:1px solid #d5e7e4';row.append(c)});tbody.append(row)});t.append(tbody);wrapper.append(t);return wrapper;
}
function pct(a,b){return b>0?Math.round(100*a/b)+'%':'—'}
function teacherDisplay(panel,data){
 const list=Array.isArray(data.students)?data.students:[];
 const imported=Array.isArray(data.importedTrialStudents)?data.importedTrialStudents:[];
 const info=elem('p','المدرسة: '+label(data.schoolName)+' · عدد الطلاب ذوي التقدم المتزامن: '+list.length,'notice');panel.append(info);
 const advisory=elem('p','النجوم والدرجات المعروضة من تقارير أجهزة الطلاب، ولم يُتحقق بعد من كل إجابة على الخادم.','notice');advisory.style.color='#916b17';panel.append(advisory);
 const classes=[...new Set(list.map(x=>x.class_name||'غير محدد'))].sort((a,b)=>a.localeCompare(b,'ar'));
 if(list.length===0){panel.append(elem('p','لا توجد سجلات تقدم مباشرة حتى الآن. ستظهر هنا عند أول مزامنة من جهاز طالب مرتبط.','notice'));}
 if(imported.length){
   const section=elem('div');section.style.cssText='margin-top:20px;border-top:1px solid #d2e6e0;padding-top:15px';
   section.append(elem('h3','السجلات التجريبية المستوردة من STAGING'));
   const note=elem('p','هذه سجلات اختبارية قديمة للمعاينة، وليست حسابات طلاب مفعّلة أو تقدمًا سحابيًا مباشرًا.','notice');
   note.style.color='#8e651b';section.append(note);
   const classPick=elem('select');classPick.style.cssText='margin:8px 0;padding:8px;width:100%;border:1px solid #a9d3cc;border-radius:9px';
   classPick.append(new Option('جميع الأقسام المستوردة',''));
   [...new Set(imported.map(x=>x.class_name||'غير محدد'))].sort((a,b)=>a.localeCompare(b,'ar')).forEach(c=>classPick.append(new Option(c,c)));
   section.append(classPick);
   const host=elem('div');section.append(host);
   function paint(){
    host.replaceChildren();
    const visible=imported.filter(x=>!classPick.value||(x.class_name||'غير محدد')===classPick.value);
    host.append(table(['الطالب التجريبي','القسم','الصف','المستوى','الإتقان','النجوم','أنشطة الأسبوع'],visible.map(x=>[
     x.student_name,x.class_name,x.grade,x.highest_level,
     String(x.mastery_percent??0)+'%',x.stars,x.weekly_attempts
    ])));
   }
   classPick.onchange=paint;paint();panel.append(section);
 }

 if(list.length===0)return;
 const bar=elem('div');bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:12px 0';
 const select=elem('select');select.style.cssText='padding:9px;border:1px solid #a1c9c3;border-radius:10px;flex:1';
 select.append(new Option('كل الأقسام',''));classes.forEach(c=>select.append(new Option(c,c)));
 const search=elem('input');search.type='search';search.placeholder='بحث عن الطالب';search.style.cssText='padding:9px;border:1px solid #a1c9c3;border-radius:10px;flex:2;min-width:140px';
 const print=elem('button','طباعة التقرير');print.type='button';print.style.cssText='padding:9px;background:#087b83;color:white;border:0;border-radius:10px;cursor:pointer';print.onclick=()=>window.print();
 bar.append(select,search,print);panel.append(bar);
 const results=elem('div');panel.append(results);
 const update=()=>{
   results.replaceChildren();
   const filtered=list.filter(x=>(!select.value||(x.class_name||'غير محدد')===select.value)&&(!search.value||(x.student_name||'').includes(search.value.trim())));
   const rows=filtered.map(x=>[x.student_name||'طالب',x.class_name||'—',x.grade, x.diagnostic_done?'نعم':'لا', x.highest_level,x.stars,x.attempts,pct(x.correct_answers,x.attempts),x.mastered_items,(x.updated_at||'').slice(0,10)]);
   results.append(table(['الطالب','القسم','الصف','تشخيص','المستوى','النجوم','المحاولات','الدقة','المتقن','آخر مزامنة'],rows));
   if(!rows.length)results.append(elem('p','لا توجد نتائج مطابقة','notice'));
 };
 select.onchange=update;search.oninput=update;update();
}
function schoolDisplay(panel,data){
 const rows=(data.teachers||[]).map(x=>[x.name,x.classes,x.studentCount]);
 panel.append(elem('p','المدرسة: '+label(data.schoolName)+' · عدد المعلمين: '+rows.length,'notice'));
 panel.append(table(['المعلم','الأقسام','طلاب لديهم تقدم متزامن'],rows));
 if(!rows.length)panel.append(elem('p','لا توجد حسابات معلمين معتمدة بعد.','notice'));
}
async function load(token,role){
 const id=role==='teacher'?'teacherPanel':role==='school_manager'?'schoolManagerPanel':null;
 if(!id||typeof token!=='string')return;
 const host=document.getElementById(id);if(!host)return;
 let panel=panels[id];if(!panel){panel=box(host,role==='teacher'?'تقدم طلابي':'ملخص تقدم المدرسة');panels[id]=panel}
 panel.replaceChildren(elem('h2',role==='teacher'?'تقدم طلابي':'ملخص تقدم المدرسة'),elem('p','جار تحميل المعلومات السحابية...','notice'));
 try{
  const result=await post(role==='teacher'?'teacher_roster':'school_summary',token);
  panel.replaceChildren(elem('h2',role==='teacher'?'تقدم طلابي':'ملخص تقدم المدرسة'));
  if(role==='teacher')teacherDisplay(panel,result);else schoolDisplay(panel,result);
 }catch(_){panel.replaceChildren(elem('h2','التقارير الداخلية'),elem('p','تعذر تحميل التقارير أو لم تكتمل صلاحية الحساب. حاول تسجيل الدخول مجددًا.','notice'))}
}
root.MEJTeacherProgress={load};
})(window);