/* My English Journey — approved coastal badge reference, November 2026.
 * Reference data only: loading this file does not unlock games or award stars.
 * Mastery stars for badges MUST come from the verified learning progress ledger.
 */
(()=>{'use strict';
 const places=[["خصب","Khasab"],["صحار","Sohar"],["ميناء صحار","Port of Sohar"],["مسقط","Muscat"],["ميناء مطرح","Muttrah Port"],["صور","Sur"],["الدقم","Duqm"],["جزيرة مصيرة","Masirah Island"],["جزر الديمانيات","Daymaniyat Islands"],["صلالة","Salalah"]];
 const badges=Object.freeze(places.map(([ar,en],i)=>Object.freeze({
   number:i+1,ar,en,requiredMasteryStars:(i+1)*5,gameSlot:i+1
 })));
 const gradeBands=Object.freeze([
   Object.freeze({name:'junior',from:1,to:4,targetGames:10}),
   Object.freeze({name:'middle',from:5,to:9,targetGames:10}),
   Object.freeze({name:'upper',from:10,to:12,targetGames:10})
 ]);

 // Exact game inventory recovered from the owner's MEJ_Coastal_Badges_Arcade_v11_1_FIXED.zip.
 // Metadata for design review only: this file must not grant unlocks or awards.
 const gradeBandGames=Object.freeze({
   junior:Object.freeze(["hidden","moving","match","memory","word","falling","sentence","safari","maze","story"]),
   middle:Object.freeze(["hidden","flip","match","word","memory","falling","vocab","sentence","grammar","mission"]),
   upper:Object.freeze(["hidden","flip","grammar","vocab","sentence","falling","evidence","detective","argument","escape"])
 });
 const policy=Object.freeze({
   masteryStarsPerBadge:5,
   masteryStarsPerPhase:50,
   gamesPerGradeBand:10,
   tasksPerGame:10,
   maximumBonusStarsPerGame:10,
   scoringAttempts:2,
   bonusStarsUnlockBadges:false,
   cashRewards:false,
   boatAndGemGameIncluded:false
 });
 function availableGamesForBadge(rawBadge,rawGrade){
   const badge=Math.max(0,Math.min(10,Math.floor(Number(rawBadge)||0)));
   const grade=Math.max(1,Math.min(12,Math.floor(Number(rawGrade)||1)));
   const band=grade<=4?'junior':grade<=9?'middle':'upper';
   // Every newly reached badge adds one game; previously unlocked games stay accessible.
   return Object.freeze(gradeBandGames[band].slice(0,badge));
 }
 window.MEJCoastalBadgeReference=Object.freeze({version:'2026-11-16-cumulative-games',badges,gradeBands,gradeBandGames,availableGamesForBadge,policy});
})();
