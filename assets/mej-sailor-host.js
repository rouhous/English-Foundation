/* MEJ HIDDEN OBJECTS BONUS v1 — replaces sailor gameplay. Offline-first.
 * 10 badge slots per stage. Each completed/failed attempt settles once.
 * Mastery stars alone unlock badges; earned bonus never unlocks a badge.
 * Bonus ledger is locally recorded and client-reported until server verification is deployed.
 */
(()=>{'use strict';
 let opening=false;
 const maximum=5;
 const key=(g,b)=>String(g)+'-'+String(b);
 const validIndex=b=>Number.isInteger(b)&&b>=1&&b<=10;
 const ledger=p=>p?.hiddenObjectsLedger&&typeof p.hiddenObjectsLedger==='object'&&!Array.isArray(p.hiddenObjectsLedger)?p.hiddenObjectsLedger:{};
 const allIDs=Array.from({length:16},(_,i)=>i).filter(i=>i!==6);
 const shuffle=(src,seed)=>{let t=seed>>>0;let arr=[...src];for(let i=arr.length-1;i>0;i--){t=(Math.imul(t,1664525)+1013904223)>>>0;let j=Math.floor(t/4294967296*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
 // Match the game's LCG, which shuffles from a freshly initialised seed.
 function targets(stage,badge){
   let t=(stage*7919+badge*1013)>>>0;
   const arr=[...allIDs];
   for(let i=arr.length-1;i>0;i--){t=(Math.imul(t,1664525)+1013904223)>>>0;const j=Math.floor(t/4294967296*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
   return arr.slice(0,10);
 }
 function sanitized(e,stage,badge){
   if(!e||typeof e!=='object')return null;
   const correct=new Set(targets(stage,badge));
   const found=[...new Set(Array.isArray(e.found)?e.found.filter(n=>Number.isInteger(n)&&correct.has(n)):[])].slice(0,10);
   const misses=Math.max(0,Math.min(3,Number.isInteger(e.misses)?e.misses:0));
   const remaining=e.remaining==null?null:Math.max(0,Math.min(600,Math.floor(Number(e.remaining)||0)));
   const finished=e.status==='finished'&&(found.length===10||misses===3||remaining===0);
   return {status:finished?'finished':'pending',found,misses,remaining,award:finished?Math.floor(found.length/2):0};
 }
 function gradeItems(stage,badge){
   const pool=[],seen=new Set();
   try{
     const qs=typeof byGrade!=='undefined'?(byGrade[stage]||[]):[];
     for(const q of qs){
       if(!['Vocabulary','Spelling','Match','Describe'].includes(q.type))continue;
       const raw=String(q.prompt||'');
       const quoted=raw.match(/[“'«"]([A-Za-z][A-Za-z '-]{1,40})[”'»"]/);
       const word=String(q.word||quoted?.[1]||'').trim().toLowerCase();
       if(!/^[a-z][a-z '-]{1,35}$/.test(word)||seen.has(word))continue;
       let src='';
       try{src=typeof mejApprovedPhoto==='function'?mejApprovedPhoto(word):''}catch(_){}
       if(!src)try{src=typeof realPhoto==='function'?realPhoto(word):''}catch(_){}
       if(typeof src!=='string'||!(/^(data:image\/(?:webp|png|jpeg);base64,|\.\.?\/assets\/)/i.test(src)))continue;
       if(src.length>180000)continue; // avoid freezing iOS with oversized base64 sprites
       seen.add(word);pool.push({word,src});
     }
   }catch(_){}
   const selected=shuffle(pool,stage*197+badge*173).slice(0,15);
   const items=Array.from({length:16},()=>null);
   allIDs.forEach((id,i)=>{if(selected[i])items[id]=selected[i]});
   return items;
 }
 window.mejHiddenStageBonus=function(g,p){
   g=Number(g);if(!Number.isInteger(g)||g<0||g>12)return 0;
   let sum=0;
   for(let b=1;b<=10;b++){const e=sanitized(ledger(p)[key(g,b)],g,b);sum+=e?.status==='finished'?e.award:0}
   return Math.min(50,sum);
 };
 window.mejHiddenBonusTotal=function(p){
   let sum=0;for(let g=0;g<=12;g++)sum+=window.mejHiddenStageBonus(g,p);
   return sum;
 };
 window.mejHiddenRoundStatus=function(stage,badge,p){
   const g=Number(stage),b=Number(badge);
   if(!Number.isInteger(g)||g<0||g>12||!validIndex(b))return {status:'locked',award:0};
   const person=p||active();
   if(!person||countMaster(g,person)<b*20)return {status:'locked',award:0};
   const item=sanitized(ledger(person)[key(g,b)],g,b);
   return {status:item?.status==='finished'?'finished':item?.status==='pending'?'pending':'available',award:item?.award||0};
 };
 window.mejSailorStage=p=>currentIsland(p); // Backward-compatible alias for saved journey markup.
 window.openMejSailor=()=>window.openMejHiddenObjects(currentIsland(active()),1); // Legacy link fallback.
 window.openMejHiddenObjects=function(stage,badge){
   if(opening||document.getElementById('mejHiddenWindow'))return;
   const p=active();stage=Number(stage);badge=Number(badge);
   if(!p||!p.id||!Number.isInteger(stage)||stage<0||stage>12||!validIndex(badge))return;
   if(!permitted(stage)){toast('هذه الجزيرة لم تُفتح بعد.');return}
   const mastered=countMaster(stage,p);
   if(mastered<20*badge){toast('تفتح اللعبة بعد الحصول على '+(20*badge)+' نجمة أساسية في هذه الجزيرة.');return}
   const k=key(stage,badge),existing=sanitized(ledger(p)[k],stage,badge);
   if(existing?.status==='finished'){toast('أكملت هذه الجولة وحصلت على '+existing.award+' نجوم إضافية. افتح الشارة التالية للمزيد.');return}
   opening=true;
   const owner=p.id;
   try{
     const dialog=document.createElement('dialog'),frame=document.createElement('iframe'),back=document.createElement('button');
     dialog.id='mejHiddenWindow';
     dialog.style.cssText='padding:0;border:0;background:#07374c;width:100vw;height:100dvh;max-width:100vw;max-height:100dvh;overscroll-behavior:contain';
     frame.title='Hidden Objects · العثور على الأغراض';
     frame.style.cssText='display:block;width:100%;height:calc(100% - 42px);border:0';
     back.type='button';back.textContent='↩ العودة إلى رحلتي';
     back.style.cssText='height:42px;width:100%;font:bold 16px system-ui;background:#064859;color:white;border:none';
     const send=()=>{if(dialog.open&&frame.contentWindow&&active()?.id===owner)frame.contentWindow.postMessage({
       type:'mej:hidden-init',stage,badge,scene:(stage*10+badge)%4,items:gradeItems(stage,badge),saved:existing?.status==='pending'?existing:null
     },location.origin)};
     const receive=e=>{
       if(e.origin!==location.origin||e.source!==frame.contentWindow||active()?.id!==owner)return;
       if(e.data?.type==='mej:hidden-ready'){send();return}
       if(e.data?.type==='mej:hidden-close'){dialog.close();return}
       if(e.data?.type!=='mej:hidden-progress'||e.data.stage!==stage||e.data.badge!==badge)return;
       // The host computes points; the iframe never tells us how many bonus stars to award.
       const current=ledger(active())[k];
       if(current?.status==='finished')return;
       const update=sanitized({found:e.data.found,misses:e.data.misses,remaining:e.data.remaining},stage,badge);
       if(!update)return;
       const old=sanitized(current,stage,badge);
       if(old){
         // Progress cannot lose successfully located objects or reduce its error counter.
         if(old.found.some(id=>!update.found.includes(id))||update.misses<old.misses)return;
       }
       const done=e.data.ended===true&&(update.found.length===10||update.misses===3||update.remaining===0);
       update.status=done?'finished':'pending';update.award=done?Math.floor(update.found.length/2):0;
       const person=active();
       if(!person.hiddenObjectsLedger||typeof person.hiddenObjectsLedger!=='object')person.hiddenObjectsLedger={};
       person.hiddenObjectsLedger[k]=update;
       persist(false); // Save locally immediately, cloud sync follows configured app transport.
       if(done){persist(true);toast('🏆 مكافأة Hidden Objects: +'+update.award+' ⭐')}
     };
     window.addEventListener('message',receive);
     function close(){window.removeEventListener('message',receive);frame.src='about:blank';dialog.remove();if(active()?.id===owner)route('journey')}
     dialog.addEventListener('close',close,{once:true});
     back.onclick=()=>dialog.close();
     dialog.append(back,frame);document.body.append(dialog);
     dialog.showModal();frame.addEventListener('load',send);
     frame.src='./hidden-objects/index.html';
   }catch(err){console.warn('Hidden Objects failed to open',err);toast('تعذر فتح اللعبة. حاول مجددًا.')}
   finally{opening=false}
 };
})();
