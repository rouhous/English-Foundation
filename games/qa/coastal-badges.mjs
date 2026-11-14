import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('games/coastal-badges.js','utf8'),sandbox,{timeout:1000});
const {badges,gradeBands,gradeBandGames,policy}=sandbox.window.MEJCoastalBadgeReference;
const expected=["خصب","صحار","ميناء صحار","مسقط","ميناء مطرح","صور","جزر الديمانيات","جزيرة مصيرة","الدقم","صلالة"];
assert.equal(badges.length,10);
assert.deepEqual(Array.from(badges,b=>b.ar),expected);
for(let i=0;i<10;i++){
 assert.equal(badges[i].number,i+1);
 assert.equal(badges[i].requiredMasteryStars,(i+1)*20);
 assert.equal(badges[i].gameSlot,i+1);
 assert.ok(badges[i].en);
}
assert.deepEqual(Array.from(gradeBands,x=>[x.from,x.to]),[[1,4],[5,9],[10,12]]);
assert.ok(gradeBands.every(x=>x.targetGames===10));
assert.equal(policy.masteryStarsPerPhase,200);
assert.deepEqual(Array.from(gradeBandGames.junior),["moving","match","memory","word","hidden","falling","sentence","safari","maze","story"]);
assert.deepEqual(Array.from(gradeBandGames.middle),["flip","match","word","memory","hidden","falling","vocab","sentence","grammar","mission"]);
assert.deepEqual(Array.from(gradeBandGames.upper),["flip","grammar","vocab","sentence","falling","evidence","detective","mission","argument","escape"]);
assert.ok(Object.values(gradeBandGames).every(g=>g.length===10 && new Set(g).size===10));
assert.equal(policy.maximumBonusStarsPerGame,10);
assert.equal(policy.scoringAttempts,2);
assert.equal(policy.bonusStarsUnlockBadges,false);
assert.equal(policy.cashRewards,false);
assert.equal(policy.boatAndGemGameIncluded,false);
console.log('Coastal Oman badge metadata and stars-only policy: PASS');
