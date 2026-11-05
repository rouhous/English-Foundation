/* My English Journey Stage 4: disconnected verified-score outbox.
 * This library is NOT attached to the live legacy report transport.
 * Call it only after secure student login and authenticated HTTPS RPC exist.
 */
(function(root){
 'use strict';
 const MAX_PENDING=300, KEY_PREFIX='MEJ_V2_OUTBOX_';
 const idFormat=/^mejv2-[a-z0-9]{32}$/;
 const qidFormat=/^L(?:[0-9]|1[0-2])-[0-9]{3}$/;
 function key(studentId){
  if(!idFormat.test(String(studentId||'')))throw Error('INVALID_STUDENT');
  return KEY_PREFIX+studentId;
 }
 function storage(){
  if(!root.localStorage)throw Error('STORAGE_UNAVAILABLE');
  return root.localStorage;
 }
 function validateEntry(item){
  if(!item||typeof item!=='object'||!qidFormat.test(String(item.questionId||''))||
     !/^[a-zA-Z0-9_-]{16,96}$/.test(String(item.eventId||''))||
     typeof item.answer!=='string'||!item.answer.trim()||item.answer.length>300)
    throw Error('INVALID_PENDING_ANSWER');
  return {eventId:item.eventId,questionId:item.questionId,answer:item.answer};
 }
 function load(studentId){
  const data=storage().getItem(key(studentId));
  if(!data)return [];
  let value;
  try{value=JSON.parse(data)}catch(_){throw Error('CORRUPT_OUTBOX')}
  if(!Array.isArray(value)||value.length>MAX_PENDING)throw Error('CORRUPT_OUTBOX');
  const ids=new Set();
  return value.map(item=>{
   const entry=validateEntry(item);
   if(ids.has(entry.eventId))throw Error('CORRUPT_OUTBOX');
   ids.add(entry.eventId);return entry;
  });
 }
 function save(studentId,entries){
  storage().setItem(key(studentId),JSON.stringify(entries));
 }
 function enqueue(studentId,entry){
  const current=load(studentId),next=validateEntry(entry);
  const previous=current.find(x=>x.eventId===next.eventId);
  if(previous){
   if(previous.questionId!==next.questionId||previous.answer!==next.answer)throw Error('EVENT_ID_CONFLICT');
   return current.length;
  }
  if(current.length>=MAX_PENDING)throw Error('OUTBOX_FULL');
  current.push(next);
  save(studentId,current);return current.length;
 }
 function makeEventId(){
  if(!root.crypto||typeof root.crypto.getRandomValues!=='function')throw Error('CRYPTO_UNAVAILABLE');
  const bytes=new Uint8Array(16);
  root.crypto.getRandomValues(bytes);
  return 'mej_'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 }
 let flushing=false;
 async function flush(studentId,send){
  if(typeof send!=='function')throw Error('VERIFIED_TRANSPORT_REQUIRED');
  if(flushing)return {sent:0,remaining:load(studentId).length,busy:true};
  flushing=true;let sent=0;
  try{
   // Sequentially preserve response order, do not lose unsent answers.
   for(const entry of load(studentId)){
    let response;
    try{response=await send({...entry})}catch(_){break}
    if(!response||response.ok!==true||response.scoreVerification!=='SERVER_CHECKED_PILOT')break;
    const pending=load(studentId);
    // An identical event ID may have been acknowledged by another device.
    const index=pending.findIndex(x=>x.eventId===entry.eventId);
    if(index>=0){pending.splice(index,1);save(studentId,pending)}
    sent++;
   }
   return {sent,remaining:load(studentId).length,busy:false};
  }finally{flushing=false}
 }
 function count(studentId){return load(studentId).length}
 root.MEJVerifiedOutbox={enqueue,flush,count,makeEventId};
})(window);
