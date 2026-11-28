'use strict';
const assert=require('node:assert/strict');
const {buildQueue,intervals}=require('../assets/mej-spaced-review-v1.js');
const DAY=24*60*60*1000;
const t=Date.parse('2026-11-28T08:00:00Z');
const questions={'L1-1':{id:'L1-1',g:1},'L1-2':{id:'L1-2',g:1},'L1-3':{id:'L1-3',g:1}};
const event=(id,minutes,ok)=>({id,at:new Date(t+minutes*60000).toISOString(),ok});
const profile=(activity,wrong)=>({activity,wrong});
assert.equal(intervals.afterWrong,10*60*1000);
assert.equal(intervals.afterFirstRecall,24*60*60*1000);
assert.equal(intervals.afterSecondRecall,3*24*60*60*1000);
assert.equal(intervals.afterThirdRecall,7*24*60*60*1000);
// An incorrect-only item enters the queue after ten minutes, even without a correct count.
assert.equal(buildQueue(profile([event('L1-1',0,false)],{'L1-1':1}),questions,t+9*60000).length,0);
assert.deepEqual(buildQueue(profile([event('L1-1',0,false)],{'L1-1':1}),questions,t+10*60000).map(x=>x.id),['L1-1']);
// Correct answers before the first due time do not skip the ten-minute review.
assert.deepEqual(buildQueue(profile([event('L1-1',0,false),event('L1-1',1,true)],{'L1-1':1}),questions,t+10*60000).map(x=>x.id),['L1-1']);
// Each successful due recall advances to 1 day, 3 days, then 7 days.
const one=[event('L1-1',0,false),event('L1-1',11,true)];
assert.equal(buildQueue(profile(one,{'L1-1':1}),questions,t+11*60000+DAY-1).length,0);
assert.equal(buildQueue(profile(one,{'L1-1':1}),questions,t+11*60000+DAY).length,1);
const two=[...one,event('L1-1',11+24*60+1,true)];
const twoDue=t+(11+24*60+1)*60000+3*DAY;
assert.equal(buildQueue(profile(two,{'L1-1':1}),questions,twoDue-1).length,0);
assert.equal(buildQueue(profile(two,{'L1-1':1}),questions,twoDue).length,1);
const three=[...two,event('L1-1',11+24*60+1+3*24*60+1,true)];
const threeDue=t+(11+24*60+1+3*24*60+1)*60000+7*DAY;
assert.equal(buildQueue(profile(three,{'L1-1':1}),questions,threeDue-1).length,0);
assert.equal(buildQueue(profile(three,{'L1-1':1}),questions,threeDue).length,1);
const four=[...three,event('L1-1',11+24*60+1+3*24*60+1+7*24*60+1,true)];
assert.equal(buildQueue(profile(four,{'L1-1':1}),questions,t+100*DAY).length,0);
// A new mistake resets the sequence to ten minutes.
const reset=[...one,event('L1-1',20*24*60,false)];
assert.equal(buildQueue(profile(reset,{'L1-1':2}),questions,t+20*24*60*60000+9*60000).length,0);
assert.equal(buildQueue(profile(reset,{'L1-1':2}),questions,t+20*24*60*60000+10*60000).length,1);
// Legacy wrong counts with trimmed attempt history remain reviewable.
assert.equal(buildQueue(profile([] ,{'L1-2':3}),questions,t).some(x=>x.id==='L1-2'),true);
// Correct-only questions are not added.
assert.equal(buildQueue(profile([event('L1-3',0,true)],{}),questions,t+100*DAY).some(x=>x.id==='L1-3'),false);
// Unknown question IDs are ignored.
assert.equal(buildQueue(profile([{id:'unknown',at:new Date(t).toISOString(),ok:false}],{},{'unknown':1}),questions,t+DAY).length,0);
console.log('Spaced review schedule OK: 10 minutes / 1 day / 3 days / 7 days; wrong-only items included.');
