// Run with: node --test boat-game/rewards.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code = await readFile(new URL('./rewards.js', import.meta.url), 'utf8');
const {unlockedCap,stageStatus,calculateTreasure,nextMilestone} = await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('stage thresholds and total ceiling',()=>{
  for(const [stars,cap] of [[0,0],[39,0],[40,50],[99,50],[100,100],[139,100],[140,200],[199,200],[200,300],[999,300]])
    assert.equal(unlockedCap(stars),cap);
});
test('claim never crosses current unlocked amount',()=>{
  assert.deepEqual(calculateTreasure({stars:40,awarded:45,proposed:20}).award,5);
  assert.deepEqual(calculateTreasure({stars:40,awarded:50,proposed:20}).award,0);
  assert.deepEqual(calculateTreasure({stars:100,awarded:50,proposed:20}).award,20);
  assert.deepEqual(calculateTreasure({stars:200,awarded:295,proposed:20}).award,5);
  assert.equal(stageStatus({stars:200,awarded:300}).remaining,0);
});
test('increments rounded to 5 baisa, bad amounts rejected',()=>{
  assert.equal(calculateTreasure({stars:40,awarded:0,proposed:17}).award,15);
  assert.equal(calculateTreasure({stars:40,awarded:0,proposed:-5}).award,0);
  assert.equal(calculateTreasure({stars:40,awarded:0,proposed:NaN}).award,0);
  assert.equal(nextMilestone(40),100);
  assert.equal(nextMilestone(200),null);
});