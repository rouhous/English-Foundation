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
 const gradeOneRegions={
  clock:[[1160,60],[1176,40],[1235,30],[1291,55],[1297,110],[1270,155],[1228,177],[1185,160],[1154,117]],
  globe:[[1150,217],[1208,220],[1255,259],[1254,341],[1202,356],[1153,344],[1117,302]],
  map:[[409,140],[619,137],[623,295],[411,295]],
  'teddy bear':[[1491,257],[1541,256],[1579,289],[1576,342],[1494,352],[1475,310]],
  cup:[[967,344],[1005,346],[1019,366],[1013,396],[972,396]],
  laptop:[[654,307],[747,300],[776,385],[831,388],[842,396],[677,395]],
  apple:[[573,505],[610,520],[630,562],[603,607],[560,598],[537,560]],
  ruler:[[500,612],[715,617],[713,638],[500,636]],
  backpack:[[340,540],[406,565],[459,630],[492,855],[455,889],[246,891],[236,760],[263,616]],
  ball:[[1342,670],[1396,677],[1432,726],[1430,776],[1370,801],[1317,786],[1302,738]]
 };
 const toPolygons=(regions)=>Object.fromEntries(Object.entries(regions).map(([word,points])=>[word,{
  points:points.map(([x,y])=>[+(x/1599*100).toFixed(3),+(y/900*100).toFixed(3)]),
  status:'practice-unverified',source:'manual visual pilot 2026-11-15; not curriculum approved'
 }]));
 const candidates={base_classroom:toPolygons(pixelRegions),variant_classroom:toPolygons(gradeOneRegions)};
 library.hotspots=library.hotspots||{};
 // Never overwrite a later, teacher-reviewed map.
 for(const [assetId,regions] of Object.entries(candidates))
  if(!library.hotspots[assetId]||Object.keys(library.hotspots[assetId]).length===0)
   library.hotspots[assetId]=regions;
 window.MEJHiddenFirstBadgePractice=Object.freeze({
  scenes:Object.freeze([{stage:0,badge:1,assetId:'base_classroom'},{stage:1,badge:1,assetId:'variant_classroom'}]),
  targetCountPerScene:10,rewardEligible:false,contentApproved:false
 });
})();
