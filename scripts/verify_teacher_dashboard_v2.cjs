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
assert(explicitJs.includes("function chartLevels()"),'level visualization exists');
assert(explicitJs.includes("const occupied=counts.map"),'only nonempty levels shown');
assert(explicitJs.includes("part.count+' '+(part.count===1?'طالب':'طلاب')"),'explicit student counts');
assert(explicitHtml.includes('.levelClassHeader'),'per-class header styles');
assert(explicitHtml.includes('.levelCount'),'visible count styles');
assert(!explicitHtml.includes('الثيم الأزرق البحري'),'no theme label');
