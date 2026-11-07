const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('reviews/school-dashboard.html','utf8');
const js=fs.readFileSync('assets/school-dashboard-v1.js','utf8');
new vm.Script(js,{filename:'school-dashboard-v1.js'});
const required=['teacherSelect','allClasses','chartScope','chartClass','chartTitle','classes','charts','studentList','studentDetails','studentSearch','overview','detail','authNotice','metrics','codeStatus','refresh','print','logout','loading','message','back','closeStudent','printCharts'];
for(const id of required)assert(html.includes('id="'+id+'"'),'Missing UI node '+id);
for(const event of ["$('teacherSelect').addEventListener('change'","$('chartScope').addEventListener('change'","$('chartClass').addEventListener('change'","$('allClasses').addEventListener('click'","$('studentSearch').addEventListener('input'"])assert(js.includes(event),'Missing interaction '+event);
assert(js.includes("action:'school_summary'"),'School API action');
assert(js.includes("teacherId:x.teacher_id||''"),'Teacher ownership relation');
assert(js.includes("app.allStudents.filter(s=>s.teacherId===app.teacherId)"),'Teacher filter');
assert(js.includes("app.chartScope==='compare'"),'Chart comparison mode');
assert(js.includes("teacher.classes||''"),'Display assigned teacher classes even when empty');
assert(js.includes("g.students.length?Math.round"),'Handle empty classes without division by zero');
assert(js.includes("const counts=Array.from({length:13}"),'Thirteen levels');
assert(!html.includes('src="../assets/teacher-dashboard-v2.js'),'wrong dashboard');
const portal=fs.readFileSync('reviews/teacher-portal.html','utf8');
assert(portal.includes("location.replace('./school-dashboard.html')"),'School redirect');
assert(portal.includes("get('manage')==='1'"),'Admin tools retained');
assert(html.includes('teacher-portal.html?manage=1'),'Manager approval path');
assert(html.includes('teacherSelect'),'Teacher chooser');
console.log('SCHOOL_DASHBOARD_NAUTICAL_DRILLDOWN_AND_COMPARISON_OK');

// Trigger CI validation of the school dashboard.

const explicitJs=fs.readFileSync('assets/school-dashboard-v1.js','utf8');
const explicitHtml=fs.readFileSync('reviews/school-dashboard.html','utf8');
assert(explicitJs.includes("function chartLevels()"),'level visualization exists');
assert(explicitJs.includes("const occupied=counts.map"),'only nonempty levels shown');
assert(explicitJs.includes("part.count+' '+(part.count===1?'طالب':'طلاب')"),'explicit student counts');
assert(explicitHtml.includes('.levelClassHeader'),'per-class header styles');
assert(explicitHtml.includes('.levelCount'),'visible count styles');
assert(!explicitHtml.includes('الثيم الأزرق البحري'),'no theme label');

const rankSource=fs.readFileSync('assets/school-dashboard-v1.js','utf8');
const rankHtml=fs.readFileSync('reviews/school-dashboard.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
assert(rankHtml.includes('id="sortStudents"'),'ranking selector');
assert(rankSource.includes("function sortedStudents(students)"),'ranking comparator');
assert(rankSource.includes("integer(b[primary])-integer(a[primary])"),'descending order');
assert(rankSource.includes("$('sortStudents').addEventListener('change'"),'ranking interaction');
assert(rankHtml.includes('20261107-3'),'dashboard cache-bust');
assert(sw.includes('isStaffPage||isStaffScript'),'staff network-first');
assert(sw.includes("cache:'no-store'"),'force fresh staff pages');
