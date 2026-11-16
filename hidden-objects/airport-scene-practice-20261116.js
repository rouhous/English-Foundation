/* New 3D Oman airport scene: practice-only for two airport-related slots.
 * Never modifies student bonuses or the official source manifest.
 */
(()=>{'use strict';
 const lib=window.MEJPrecisionLibrary;if(!lib||lib.approvedForScoring===true)return;
 const assetId='stage08-badge05_airport',image='assets/stage08-badge05_airport.webp';
 const rects=[
 ['airplane',40,39,19,12],
 ['control tower',19,28,8,23],
 ['boarding pass',22,85,14,9],
 ['passport',30,92,17,12],
 ['suitcase',54,68,11,34],
 ['luggage trolley',78,74,18,29],
 ['security scanner',91,52,17,30],
 ['departure board',84,14,24,22],
 ['check-in desk',81,39,20,23],
 ['backpack',45,55,6,14]
 ];
 const clip=v=>Math.max(.05,Math.min(99.95,+v.toFixed(3)));const map={};
 for(const [word,x,y,w,h] of rects){
  const x0=clip(x-w/2),x1=clip(x+w/2),y0=clip(y-h/2),y1=clip(y+h/2);
  map[word]={points:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],
    status:'practice-unverified',source:'Oman airport image 2026-11-16',assetId};
 }
 lib.hotspots=lib.hotspots||{};
 const current=lib.hotspots[assetId];
 if(!current||Object.values(current).every(v=>['practice-unverified','unverified-estimate'].includes(v?.status)))lib.hotspots[assetId]=map;
 const assigned=[];
 for(const [stage,badge] of [[8,5],[9,7]]){
   const scene=lib.sceneSlots?.find(s=>s.stage===stage&&s.badge===badge);
   if(!scene||scene.image||scene.assetId)continue;
   scene.image=image;scene.assetId=assetId;scene.status='airport-art-practice-only';assigned.push({stage,badge});
 }
 window.MEJAirportScenePractice=Object.freeze({assetId,image,slots:Object.freeze(assigned),targets:10,awardsEnabled:false,teacherApprovalRequired:true});
})();
