/* My English Journey — Hidden Objects illustrated scene coverage, November 2026.
 * These are visual PRACTICE candidates, never student bonus/mastery approval.
 * Source: owner's 47 scene WebPs, re-used across 130 badge scene slots.
 * Does NOT change the official manifest, student progress, or reward system.
 */
(()=>{'use strict';
 const library=window.MEJPrecisionLibrary;
 const raw=window.MEJHiddenRegionCandidates||{};
 if(!library||library.approvedForScoring===true)return;
 const kept=new Set(['base_classroom','variant_classroom','variant_souq_harbour']);
 const bound=(n)=>Math.max(0.05,Math.min(99.95,+n.toFixed(3)));
 const convert=(items,assetId)=>{
   if(!Array.isArray(items)||items.length!==10)return null;
   const names=new Set();
   const mapped={};
   for(const item of items){
     if(!Array.isArray(item)||item.length!==5)return null;
     const [word,x,y,w,h]=item;
     if(typeof word!=='string'||!word.trim()||names.has(word)||![x,y,w,h].every(Number.isFinite)||x<0||y<0||x>100||y>100||w<=0||h<=0)return null;
     names.add(word);
     const x0=bound(x-w/2),x1=bound(x+w/2),y0=bound(y-h/2),y1=bound(y+h/2);
     if(x1<=x0||y1<=y0)return null;
     mapped[word]={points:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],status:'practice-unverified',source:'original scene visual review 2026-11-15',assetId};
   }
   return mapped;
 };
 library.hotspots=library.hotspots||{};
 const added=[],skipped=[];
 for(const [assetId,items] of Object.entries(raw)){
   if(kept.has(assetId)){skipped.push(assetId);continue}
   const current=library.hotspots[assetId];
   // Safeguard: never overwrite a teacher-approved region, no matter its format.
   if(current&&Object.values(current).some(v=>!v||!['practice-unverified','unverified-estimate'].includes(v.status))){skipped.push(assetId);continue}
   const mapped=convert(items,assetId);
   if(mapped){library.hotspots[assetId]=mapped;added.push(assetId)}
   else skipped.push(assetId);
 }
 const slots=Array.isArray(library.sceneSlots)?library.sceneSlots:[];
 const playable=slots.filter(s=>s.image&&Object.keys(library.hotspots[s.assetId]||{}).length===10);
 window.MEJHiddenPracticeCoverage=Object.freeze({
   version:'2026-11-15-47-scene-library',
   mappedAssets:Object.freeze(added),
   keptPilotAssets:Object.freeze([...kept]),
   skippedAssets:Object.freeze(skipped),
   playableSceneSlots:playable.length,
   photoSceneSlots:slots.filter(s=>!!s.image).length,
   missingImageSlots:slots.filter(s=>!s.image).length,
   playableSlotIds:Object.freeze(playable.map(s=>s.sceneId||('stage'+s.stage+'-badge'+s.badge))),
   practiceOnly:true,
   awardsEnabled:false
 });
})();
