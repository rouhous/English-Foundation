// Run: node --test boat-game/rewards.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('./rewards.js',import.meta.url),'utf8');
const {earnedBadgeBaisa,stageStatus,calculateTreasure,chooseTreasure,studentWallet,validateSettlement,nextMilestone}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
test('one badge each 20 stars exactly; ten badges per stage',()=>{
  for(const [stars,expected] of [[0,0],[19,0],[20,10],[39,10],[40,20],[99,40],[100,50],[199,90],[200,100],[230,100]])
    assert.equal(earnedBadgeBaisa(stars),expected);
  assert.equal(nextMilestone(20),40);
  assert.equal(nextMilestone(200),null);
});
test('treasures limited to 50 baisa regardless of badges',()=>{
  assert.equal(calculateTreasure({treasureEarned:0,proposed:20}).award,20);
  assert.equal(calculateTreasure({treasureEarned:45,proposed:20}).award,5);
  assert.equal(calculateTreasure({treasureEarned:50,proposed:20}).award,0);
  assert.equal(calculateTreasure({treasureEarned:0,proposed:17}).award,0);
  assert.deepEqual([0,.25,.5,.75].map(chooseTreasure),[5,10,15,20]);
  assert.equal(stageStatus({stars:200,treasureEarned:50}).earned,150);
});
test('wallet includes every stage; settlements lower due not earned',()=>{
 const stages=[{stars:200,treasureEarned:50},{stars:40,treasureEarned:15}];
 let wallet=studentWallet({stages,settlements:[]});
 assert.deepEqual([wallet.badgeEarned,wallet.treasureEarned,wallet.lifetimeEarned,wallet.outstanding],[120,65,185,185]);
 assert.equal(validateSettlement(100,wallet),100);
 wallet=studentWallet({stages,settlements:[{amount:100}]});
 assert.equal(wallet.outstanding,85);
 assert.equal(studentWallet({stages,settlements:[{amount:185}]}).outstanding,0);
 assert.throws(()=>validateSettlement(86,wallet));
 assert.throws(()=>validateSettlement(-1,wallet));
});