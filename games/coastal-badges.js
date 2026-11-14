/* My English Journey — approved coastal badge reference, November 2026.
 * Reference data only: loading this file does not unlock games or award stars.
 * Mastery stars for badges MUST come from the verified learning progress ledger.
 */
(()=>{'use strict';
 const places=[["خصب","Khasab"],["صحار","Sohar"],["ميناء صحار","Port of Sohar"],["مسقط","Muscat"],["ميناء مطرح","Muttrah Port"],["صور","Sur"],["جزر الديمانيات","Daymaniyat Islands"],["جزيرة مصيرة","Masirah Island"],["الدقم","Duqm"],["صلالة","Salalah"]];
 const badges=Object.freeze(places.map(([ar,en],i)=>Object.freeze({
   number:i+1,ar,en,requiredMasteryStars:(i+1)*20,gameSlot:i+1
 })));
 const gradeBands=Object.freeze([
   Object.freeze({name:'junior',from:1,to:4,targetGames:10}),
   Object.freeze({name:'middle',from:5,to:9,targetGames:10}),
   Object.freeze({name:'upper',from:10,to:12,targetGames:10})
 ]);
 const policy=Object.freeze({
   masteryStarsPerBadge:20,
   masteryStarsPerPhase:200,
   gamesPerGradeBand:10,
   tasksPerGame:10,
   maximumBonusStarsPerGame:10,
   scoringAttempts:2,
   bonusStarsUnlockBadges:false,
   cashRewards:false,
   boatAndGemGameIncluded:false
 });
 window.MEJCoastalBadgeReference=Object.freeze({version:'2026-11-14',badges,gradeBands,policy});
})();
