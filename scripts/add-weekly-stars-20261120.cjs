'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const filename='index.html',source=fs.readFileSync(filename,'utf8');
if(source.includes('MEJ_WEEKLY_EARNED_STARS_20261120')){console.log('Already applied');process.exit(0)}
const swaps=[
 ["p.attempts++;if(ok){p.right++;const priorCorrect=p.correct[q.id]||0;", "p.attempts++;let earnedStars=0;if(ok){p.right++;const priorCorrect=p.correct[q.id]||0;", 'award flag declaration'],
 ["if(priorCorrect<2 && p.correct[q.id]===2){p.stars++;", "if(priorCorrect<2 && p.correct[q.id]===2){p.stars++;earnedStars=1;", 'first mastery star award'],
 ["p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok});", "p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok,earnedStars}); /* MEJ_WEEKLY_EARNED_STARS_20261120 */",'record earned star in activity'],
 ["p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok:false,skipped:true});", "p.activity.push({day:mejOmanDayNow(),at:new Date().toISOString(),id:q.id,ok:false,skipped:true,earnedStars:0});",'record skipped attempt zero stars']
];
let output=source;
for(const [from,to,label] of swaps){assert.equal(output.split(from).length-1,1,'Expected unique '+label);output=output.replace(from,to)}
assert(output.includes('MEJ_WEEKLY_EARNED_STARS_20261120'));
fs.writeFileSync(filename,output);
console.log('Earned-star event bookkeeping added; unchanged learning and scoring rules.');
