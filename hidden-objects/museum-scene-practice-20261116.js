/* My English Journey — new Oman heritage museum scene.
 * Single new picture reused across three museum-themed stages.
 * All polygons are PRACTICE CANDIDATES; do not award stars.
 * The original canonical 130-slot manifest remains unchanged.
 */
(()=>{'use strict';
const library=window.MEJPrecisionLibrary;
if(!library||library.approvedForScoring===true)return;
const image='assets/stage04-badge03_museum.webp', assetId='stage04-badge03_museum';
const targetRects=[
['carved door',11,31,18,58],
['lantern',31,17,10,27],
['fort painting',52,16,24,27],
['historical photo',72,24,15,19],
['dhow model',54,48,18,20],
['khanjar',90,30,16,32],
['clay pot',91,72,15,24],
['woven basket',66,70,17,20],
['map',42,86,27,19],
['ticket',77,88,13,9]
];
const pct=n=>Math.max(.05,Math.min(99.95,+n.toFixed(3)));
const regions={};
for(const [word,x,y,w,h] of targetRects){
 const x0=pct(x-w/2),x1=pct(x+w/2),y0=pct(y-h/2),y1=pct(y+h/2);
 regions[word]={points:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],
  status:'practice-unverified',source:'new Omani museum illustration 2026-11-16',assetId};
}
library.hotspots=library.hotspots||{};
const existing=library.hotspots[assetId];
if(!existing||Object.values(existing).every(v=>['practice-unverified','unverified-estimate'].includes(v?.status)))
 library.hotspots[assetId]=regions;
const positions=[[4,3],[5,6],[8,3]];
const linked=[];
for(const [stage,badge] of positions){
 const slot=library.sceneSlots?.find(s=>s.stage===stage&&s.badge===badge);
 if(!slot||slot.image||slot.assetId)continue;
 slot.image=image;slot.assetId=assetId;slot.status='new-art-practice-only';
 linked.push({stage,badge,sceneId:slot.sceneId||('stage'+stage+'-badge'+badge)});
}
window.MEJMuseumScenePractice=Object.freeze({version:'2026-11-16',
 assetId,image,targetCount:Object.keys(regions).length,slots:Object.freeze(linked),
 scoringApproved:false,teacherReviewRequired:true});
})();
