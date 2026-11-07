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
