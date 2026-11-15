/* My English Journey — initial stage / badge 01 Hidden Objects visual pilot.
 * Ten picture-aligned, manually reviewed draft polygons for base_classroom.webp.
 * PRACTICE ONLY: no server-side scoring, mastery, student progress, or cash rewards.
 * Do not turn these candidate hotspots into approved curriculum content.
 */
(()=>{'use strict';
 const library=window.MEJPrecisionLibrary;
 if(!library||library.approvedForScoring===true||library.certification?.hotspotsVerified===true)return;
 const pixelRegions={
  clock:[[1441,25],[1536,21],[1574,57],[1575,153],[1528,188],[1449,178],[1411,114],[1419,53]],
  globe:[[673,30],[728,34],[758,72],[755,131],[705,155],[653,140],[629,86],[645,50]],
  map:[[1401,211],[1589,208],[1591,334],[1404,339]],
  book:[[132,703],[195,624],[358,602],[497,614],[708,674],[708,770],[468,765],[397,763],[145,762]],
  backpack:[[898,400],[947,400],[988,434],[1019,470],[1033,632],[831,638],[834,497],[860,439]],
  bottle:[[1358,465],[1398,462],[1417,486],[1424,706],[1360,712],[1342,499]],
  pen:[[723,795],[813,691],[834,685],[850,706],[760,809]],
  ruler:[[906,787],[1187,678],[1236,696],[1224,720],[946,840],[906,817]],
  scissors:[[1144,816],[1206,789],[1265,763],[1315,731],[1372,728],[1403,752],[1381,772],[1342,773],[1324,809],[1199,841],[1147,839]],
  ball:[[623,451],[670,451],[696,475],[695,528],[665,551],[618,549],[594,517],[597,478]]
 };
 const polygons=Object.fromEntries(Object.entries(pixelRegions).map(([word,points])=>[word,{
  points:points.map(([x,y])=>[+(x/1599*100).toFixed(3),+(y/900*100).toFixed(3)]),
  status:'practice-unverified',
  source:'MEJ_Hidden_Objects_Precision_Hotspots_Offline_FIXED_v3.html / visual pilot 2026-11-15'
 }]));
 library.hotspots=library.hotspots||{};
 // Never overwrite a later, teacher-reviewed map.
 if(!library.hotspots.base_classroom||Object.keys(library.hotspots.base_classroom).length===0)
  library.hotspots.base_classroom=polygons;
 window.MEJHiddenFirstBadgePractice=Object.freeze({
  stage:0,badge:1,assetId:'base_classroom',count:Object.keys(polygons).length,
  rewardEligible:false,contentApproved:false
 });
})();
