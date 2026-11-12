/* MEJ Hidden Objects scene eligibility v1 — never invent mastered words. */
(function(root){'use strict';
 const normalize=x=>String(x||'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
 function chooseScene({stage,badge,masteredWords,levelWords,scenes,usedSceneIds=[]}){
  if(!Number.isInteger(stage)||stage<0||stage>12||!Number.isInteger(badge)||badge<1||badge>10)return null;
  const mastered=new Set((masteredWords||[]).map(normalize));
  const curriculum=new Set((levelWords||[]).map(normalize));
  const used=new Set(usedSceneIds||[]);
  const eligible=[];
  for(const scene of scenes||[]){
   if(!scene||scene.approved!==true||scene.stage!==stage||!Array.isArray(scene.targets)||scene.targets.length!==10)continue;
   const words=scene.targets.map(o=>normalize(o.word));
   if(words.some(x=>!x)||new Set(words).size!==10)continue;
   const known=words.filter(x=>mastered.has(x));
   const newWords=words.filter(x=>!mastered.has(x)&&curriculum.has(x));
   if(known.length!==9||newWords.length!==1)continue;
   if(!scene.targets.every(t=>Array.isArray(t.regions)&&t.regions.length))continue;
   eligible.push({scene,challenge:newWords[0],used:used.has(scene.id)});
  }
  eligible.sort((a,b)=>Number(a.used)-Number(b.used)||String(a.scene.id).localeCompare(String(b.scene.id)));
  return eligible[0]||null;
 }
 root.MEJHiddenSceneEligibility={chooseScene};
})(typeof window!=='undefined'?window:globalThis);
