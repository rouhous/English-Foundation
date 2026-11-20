'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const progress=fs.readFileSync('admin-backend/supabase/functions/mej-progress/index.ts','utf8');
const report=fs.readFileSync('admin-backend/supabase/functions/mej-learning-reports/index.ts','utf8');
const dash=fs.readFileSync('assets/teacher-dashboard-v2.js','utf8');
const dashHtml=fs.readFileSync('reviews/teacher-dashboard.html','utf8');
const reportHtml=fs.readFileSync('reviews/teacher-reports.html','utf8');
const app=fs.readFileSync('index.html','utf8');
assert.ok(app.includes('MEJ_WEEKLY_EARNED_STARS_20261120'),'Student earned star event instrument missing');
assert.ok(app.includes('p.stars++;earnedStars=1;'),'Mastery must be the only star event');
assert.ok(app.includes('ok,earnedStars}'),'Answer log must contain earned star');
assert.ok(progress.includes('weekly_stars:earning.count'),'Teacher roster API must return weekly earned stars');
assert.ok(report.includes('weeklyStars:earning.count'),'Teacher diagnostic API must return weekly earned stars');
assert.ok(dash.includes('نجوم الأسبوع الحالي'),'Teacher must show weekly earned stars');
assert.ok(dashHtml.includes('weekly-stars'),'Weekly star sort option missing');
assert.ok(reportHtml.includes('نجوم الأسبوع الحالي'),'Teacher reports must show earned stars');
new Function(dash);
new Function(reportHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1]||'');

function actualBackendFunction(source){
 const a=source.indexOf('function countWeeklyMasteryStars(');
 const b=source.indexOf('function computedWeekly(',a);
 assert.ok(a!==-1&&b>a,'Cannot isolate backend weekly calculation');
 let code=source.slice(a,b);
 code=code.replace('function countWeeklyMasteryStars(events:unknown[], attempts:unknown,\n week:{start:number,end:number,first:string,last:string},\n isInWeek:(event:unknown,window:{start:number,end:number,first:string,last:string})=>boolean){','function countWeeklyMasteryStars(events,attempts,week,isInWeek){');
 code=code.replace('const seen=new Map<string,number>();','const seen=new Map();');
 code=code.replace('const data=event as Record<string,unknown>;','const data=event;');
 return new Function(code+';return countWeeklyMasteryStars')();
}
const calc=actualBackendFunction(progress);
const week={start:Date.parse('2026-11-14T20:01:00Z'),end:Date.parse('2026-11-21T20:00:00Z'),first:'2026-11-15',last:'2026-11-21'};
const isWeek=(x,w)=>{const t=Date.parse(x.at);return t>=w.start&&t<w.end};
const events=[
 {id:'L0-001',ok:true,at:'2026-11-14T19:59:59Z'},
 {id:'L0-001',ok:true,at:'2026-11-14T20:01:00Z'},
 {id:'L1-002',ok:true,at:'2026-11-15T13:20:00Z'},
 {id:'L1-002',ok:false,at:'2026-11-15T13:20:10Z'},
 {id:'L1-002',ok:true,at:'2026-11-15T13:20:20Z'},
 {id:'L1-002',ok:true,at:'2026-11-16T13:20:30Z'},
 {id:'L2-003',ok:true,at:'2026-11-21T19:59:59.999Z'},
 {id:'L2-003',ok:true,at:'2026-11-21T20:00:00Z'}
];
const full=calc(events,events.length,week,isWeek);
assert.equal(full.complete,true);
assert.equal(full.count,2,'One award per mastered question and week boundary');
assert.equal(full.levels[0],1);assert.equal(full.levels[1],1);assert.equal(full.levels[2],0);
const incomplete=calc([{id:'L1-002',ok:true,at:'2026-11-19T12:00:00Z',earnedStars:1}],9,week,isWeek);
assert.equal(incomplete.count,1);assert.equal(incomplete.complete,false);
const incompleteUnverified=calc([{id:'L1-002',ok:true,at:'2026-11-19T12:00:00Z'}],9,week,isWeek);
assert.equal(incompleteUnverified.count,0);assert.equal(incompleteUnverified.complete,false);
const nextWeek=calc([{id:'L0-003',ok:true,at:'2026-11-21T19:59:59.999Z'},{id:'L0-003',ok:true,at:'2026-11-21T20:00:00Z'}],2,week,isWeek);
assert.equal(nextWeek.count,0,'Sunday midnight next week must not count');
console.log('PASS: weekly earned stars full-history reconstruction, incomplete explicit records, no repeat awards, Sunday/Saturday boundary, frontend syntax.');
