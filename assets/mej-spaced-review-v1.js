/* MEJ_SPACED_REVIEW_V1 — four-step review queue from each learner's own attempt history. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.MEJ_SPACED_REVIEW_V1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MINUTE=60*1000,DAY=24*60*60*1000;
 const intervals=[10*MINUTE,DAY,3*DAY,7*DAY];
 function buildQueue(profile,questionById,now=Date.now()){
  const history=Array.isArray(profile?.activity)?profile.activity:[];
  const eventsById=new Map();
  for(let i=0;i<history.length;i++){
   const event=history[i];
   if(!event||typeof event.id!=='string'||!questionById?.[event.id])continue;
   if(!eventsById.has(event.id))eventsById.set(event.id,[]);
   const at=typeof event.at==='string'?Date.parse(event.at):NaN;
   eventsById.get(event.id).push({at,ok:event.ok===true,seq:i});
  }
  const ids=new Set([...Object.keys(profile?.wrong||{}),...eventsById.keys()]);
  const due=[];
  for(const id of ids){
   const question=questionById?.[id];
   if(!question)continue;
   const wrongCount=Math.max(0,Number(profile?.wrong?.[id])||0);
   const events=(eventsById.get(id)||[]).slice().sort((a,b)=>{
    if(Number.isFinite(a.at)&&Number.isFinite(b.at))return a.at-b.at||a.seq-b.seq;
    if(Number.isFinite(a.at))return -1;
    if(Number.isFinite(b.at))return 1;
    return a.seq-b.seq;
   });
   if(!wrongCount&&!events.some(x=>!x.ok))continue;
   let started=false,step=0,dueAt=now,completed=false,lastAt=NaN;
   for(const event of events){
    if(!Number.isFinite(event.at)){if(!event.ok){started=true;step=0;dueAt=now;lastAt=NaN;completed=false;}continue;}
    if(!event.ok){
     started=true;step=0;dueAt=event.at+intervals[0];lastAt=event.at;completed=false;
    }else if(started&&!completed&&event.at>=dueAt){
     step++;
     lastAt=event.at;
     if(step>=intervals.length){completed=true;dueAt=Infinity;}
     else dueAt=event.at+intervals[step];
    }
   }
   // Old profiles can retain an error count after the detailed event was trimmed.
   // Keep such items visible rather than silently dropping them from review.
   if(!started&&wrongCount>0){started=true;step=0;dueAt=now;lastAt=NaN;completed=false;}
   if(started&&!completed&&dueAt<=now){
    due.push({id,dueAt:Number.isFinite(dueAt)?dueAt:now,grade:question.g});
   }
  }
  return due.sort((a,b)=>a.dueAt-b.dueAt||a.id.localeCompare(b.id));
 }
 return {buildQueue,intervals:{afterWrong:intervals[0],afterFirstRecall:intervals[1],afterSecondRecall:intervals[2],afterThirdRecall:intervals[3]}};
});
