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
assert(explicitJs.includes('function chartLevels()'),'level chart exists');
assert(explicitJs.includes('const occupied=counts.map'),'only occupied levels plotted');
assert(explicitJs.includes("node('strong','compareSegmentCount',part.count)"),'number inside colored segment');
assert(explicitJs.includes("'L'+part.level"),'compact L label under each segment');
assert(explicitJs.includes("chart.style.minWidth=Math.max(0,occupied.length*46)"),'small screen overflow');
assert(explicitHtml.includes('.compareChartScroll'),'scroll layout');
assert(explicitHtml.includes('20261107-4'),'new script cache version');
assert(explicitHtml.includes('id="sortStudents"'),'ranking selector remains present');
