'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const path='index.html';let s=fs.readFileSync(path,'utf8');
const marker='MEJ_OMAN_CURRENT_WEEK_ACTIVITY_20261117';
if(s.includes(marker)){console.log('Already applied');process.exit(0)}
function swap(old,next,label){assert.equal(s.split(old).length-1,1,'Expected exactly one '+label);s=s.replace(old,next)}
const helpers="/* MEJ_OMAN_CURRENT_WEEK_ACTIVITY_20261117\n * Oman fixed UTC+04; Sunday 00:01 to Saturday 23:59:59.999 inclusive.\n * Day-only historical entries are approximate at the boundary.\n */\nfunction mejOmanDayNow(){return new Date(Date.now()+4*60*60*1000).toISOString().slice(0,10)}\nfunction mejOmanWeekWindow(at=Date.now()){\n const oman=new Date(at+4*60*60*1000),day=oman.getUTCDay();\n const start=Date.UTC(oman.getUTCFullYear(),oman.getUTCMonth(),oman.getUTCDate()-day,0,1)-4*60*60*1000;\n const end=start+7*24*60*60*1000-60*1000;\n return {start,end,\n  first:new Date(start+4*60*60*1000).toISOString().slice(0,10),\n  last:new Date(start+4*60*60*1000+6*24*60*60*1000).toISOString().slice(0,10)};\n}\nfunction mejIsCurrentWeekEvent(x,window=mejOmanWeekWindow()){\n if(!x||typeof x!=='object')return false;\n if(typeof x.at==='string'){\n  const stamp=Date.parse(x.at);\n  return Number.isFinite(stamp)&&stamp>=window.start&&stamp<window.end;\n }\n return typeof x.day==='string'&&/^\\d{4}-\\d{2}-\\d{2}$/.test(x.day)&&x.day>=window.first&&x.day<=window.last;\n}\nfunction mejCurrentWeekAttempts(items){\n const win=mejOmanWeekWindow();\n return (Array.isArray(items)?items:[]).filter(x=>mejIsCurrentWeekEvent(x,win)).length;\n}";

swap('function reports(){',helpers+'\nfunction reports(){','add Oman week helpers');
swap("p.activity.push({day:new Date().toISOString().slice(0,10),id:q.id,ok});",
"p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok});",'answered activity timestamp');
swap("p.activity.push({day:new Date().toISOString().slice(0,10),id:q.id,ok:false,skipped:true});",
"p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok:false,skipped:true});",'skipped activity timestamp');
swap("let weekStart=new Date();weekStart.setDate(weekStart.getDate()-((weekStart.getDay()+1)%7));weekStart.setHours(0,0,0,0);\n const weekly=(p.activity||[]).filter(x=>new Date(x.day)>=weekStart),wright=weekly.filter(x=>x.ok).length;",
"const weekWindow=mejOmanWeekWindow();const weekly=(p.activity||[]).filter(x=>mejIsCurrentWeekEvent(x,weekWindow)),wright=weekly.filter(x=>x.ok).length;",
"student report week");
swap("const currentWeek=new Date();currentWeek.setDate(currentWeek.getDate()-((currentWeek.getDay()+1)%7));currentWeek.setHours(0,0,0,0);\n const weekly=(p.activity||[]).filter(x=>new Date(x.day)>=currentWeek);",
"const weekWindow=mejOmanWeekWindow();const weekly=(p.activity||[]).filter(x=>mejIsCurrentWeekEvent(x,weekWindow));",
"legacy report week");
swap("const week=new Date();week.setDate(week.getDate()-((week.getDay()+1)%7));week.setHours(0,0,0,0);",
"const weekWindow=mejOmanWeekWindow();",
"cloud snapshot week init");
swap("weeklyAttempts:(profile.activity||[]).filter(x=>new Date(x.day)>=week).length,",
"weeklyAttempts:(profile.activity||[]).filter(x=>mejIsCurrentWeekEvent(x,weekWindow)).length,",
"cloud snapshot weekly count");
assert(s.includes(marker));assert(!s.includes("((week.getDay()+1)%7)"));
fs.writeFileSync(path,s);
console.log('OK Oman week implementation and precise attempt timestamps; bytes='+s.length);
