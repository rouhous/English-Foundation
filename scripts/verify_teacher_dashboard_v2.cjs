const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
for(const file of ['assets/teacher-dashboard-v2.js','assets/teacher-progress-v1.js']){
 new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
}
const html=fs.readFileSync('reviews/teacher-dashboard.html','utf8');
for(const id of ['overview','classes','charts','studentList','studentDetails','detail','issueCode','codeStatus','metrics','refresh','loginRepair','authNotice'])assert(html.includes('id="'+id+'"'),id);
const portal=fs.readFileSync('reviews/teacher-portal.html','utf8');
assert(portal.includes("location.replace('./teacher-dashboard.html')"));
assert(portal.includes("sessionStorage.setItem('MEJ_STAFF_LOGIN_V2'"));
assert(html.includes('teacher-dashboard-v2.js?v='));
console.log('STAFF_DASHBOARD_STRUCTURE_AND_JAVASCRIPT_OK');

// Run final class navigation and nautical dashboard validation.

const explicitJs=fs.readFileSync('assets/teacher-dashboard-v2.js','utf8');
const explicitHtml=fs.readFileSync('reviews/teacher-dashboard.html','utf8');
assert(explicitJs.includes('function chartLevels()'),'level chart exists');
assert(explicitJs.includes('const occupied=counts.map'),'only occupied levels plotted');
assert(explicitJs.includes("node('strong','compareSegmentCount',part.count)"),'number inside colored segment');
assert(explicitJs.includes("'L'+part.level"),'compact L label under each segment');
assert(explicitJs.includes("chart.style.minWidth=Math.max(0,occupied.length*46)"),'small screen overflow');
assert(explicitHtml.includes('.compareChartScroll'),'scroll layout');
assert(explicitHtml.includes('20261107-7'),'new script cache version');
assert(explicitHtml.includes('id="sortStudents"'),'ranking selector remains present');

// Latest overview/class indicators and teacher code safety regression.
const summaryJs=fs.readFileSync('assets/teacher-dashboard-v2.js','utf8');
assert(summaryJs.includes("['عدد الصفوف',app.groups.length]"),'overview class count');
assert(summaryJs.includes("['عدد الطلاب',app.students.length]"),'overview student count');
assert(summaryJs.includes("['أعلى مستوى',Math.max(0,...app.students.map(s=>s.level))]"),'overview highest level');
assert(summaryJs.includes("['أعلى عدد نجوم',Math.max(0,...app.students.map(s=>s.stars))]"),'overview maximum stars');
assert(summaryJs.includes("['الصف',g.name]"),'individual class name');
assert(summaryJs.includes("['عدد الطلاب',g.students.length]"),'individual class student count');
assert(summaryJs.includes("['أعلى عدد نجوم',getGroupMax(g)]"),'individual class maximum stars');
assert(html.includes('id="codeDialog"'),'code dialog');
assert(html.includes('<button id="issueCode"'),'top code button');
assert(!html.includes('<h2>رمز ربط الطلاب</h2>'),'old code card removed');
assert(summaryJs.includes('window.confirm('),'approval before code creation');
assert(summaryJs.indexOf('window.confirm(')<summaryJs.indexOf("action:'teacher_issue_student_code'"),'confirm before API request');
assert(html.includes('id="copyCode"'),'copy code button');


const entry=fs.readFileSync('reviews/teacher-portal.html','utf8');
assert(entry.includes('id="chooseSchool"'),'school registration visible');
assert(entry.includes('id="chooseTeacher"'),'teacher registration visible');
assert(entry.includes('id="googleSignIn"'),'Google login present');
assert(entry.includes('إذا كنت مسجلًا، قم بالدخول بحساب Google'),'short login prompt');
assert(entry.includes('id="installHelp"'),'install help present');
assert(!entry.includes('لا تحتاج إلى فتح تطبيق الطالب'),'no distracting student app mention');
const inline=entry.match(/<script>([\s\S]*?)<\/script>/);
assert(inline,'inline staff code');
new vm.Script(inline[1],{filename:'teacher-portal-inline.js'});
assert(!inline[1].includes("getElementById('identityTitle')"),'no reference to removed heading');
console.log('SIMPLIFIED_STAFF_ENTRY_VALIDATED');

assert(entry.includes('id="ownerChoice"'),'owner choice visible');
assert(entry.includes('id="ownerTeacherGo"'),'owner teacher route');
assert(entry.includes('id="ownerAdminGo"'),'owner admin route');
assert(entry.includes('id="ownerBack"'),'owner may return to choice');
assert(entry.includes("document.getElementById('ownerChoice').hidden=false"),'owner sees choice after login');
assert(entry.includes("location.assign('./teacher-dashboard.html')"),'owner teacher dashboard route');
assert(entry.includes("document.getElementById('ownerAdminGo').addEventListener('click',openOwnerManagement)"),'owner management route');
assert(summaryJs.includes("data.profileNotice==='OWNER_TEACHER_PROFILE_NOT_LINKED'"),'accurate owner teacher no-link state');

assert(entry.includes("role:'owner'"),'owner role stored alongside login token');
assert(html.includes('id="ownerScopes"'),'owner private/school selection exists');
assert(html.includes('id="ownerPrivate"'),'owner personal group');
assert(html.includes('id="ownerSchool"'),'Wadi group');
assert(summaryJs.includes("app.owner?'owner_rosters':'teacher_roster'"),'owner-specific server authorization');
assert(summaryJs.includes("app.ownerScope='private'"),'private group handler');
assert(summaryJs.includes("app.ownerScope='school'"),'school group handler');
assert(summaryJs.includes("scope.linkedCount"),'linked students counted separately from synced progress');
