/* My English Journey — verified staging sync adapter (Stage 7)
 * OFF by default: only create a session with an approved HTTPS endpoint and
 * verified-student credentials. Never use no-cors or trust opaque responses.
 * Offline study stays local and never waits for this adapter.
 *
 * CAUTION: Apps Script ContentService's cross-origin redirect may not expose
 * response JSON to a third-party static origin. An accessible, authenticated,
 * CORS-compliant transport must be established and tested before integration.
 */
(function(root){
 'use strict';
 const VERIFIED='SERVER_CHECKED_PILOT';
 const ID=/^mejv2-[a-z0-9]{32}$/;
 const SECRET=/^[a-f0-9]{64}$/;
 const QUESTION=/^L(?:[0-9]|1[0-2])-[0-9]{3}$/;
 function assert(condition,code){if(!condition)throw new Error(code)}
 function create(opts){
  opts=opts||{};
  assert(typeof opts.endpoint==='string'&&/^https:\/\//.test(opts.endpoint),'HTTPS_ENDPOINT_REQUIRED');
  assert(!/[#?]/.test(opts.endpoint),'UNEXPECTED_ENDPOINT_QUERY');
  assert(ID.test(String(opts.studentId||'')),'INVALID_STUDENT_ID');
  assert(SECRET.test(String(opts.deviceToken||'')),'INVALID_DEVICE_CREDENTIAL');
  const fetcher=opts.fetchImpl||(typeof root.fetch==='function'?root.fetch.bind(root):null);
  assert(typeof fetcher==='function','FETCH_UNAVAILABLE');
  const online=typeof opts.isOnline==='function'?opts.isOnline:()=>root.navigator?.onLine!==false;
  const outbox=opts.outbox||root.MEJVerifiedOutbox;
  assert(outbox&&typeof outbox.enqueue==='function'&&typeof outbox.flush==='function','VERIFIED_OUTBOX_REQUIRED');
  const studentId=opts.studentId,token=opts.deviceToken;
  let state='idle',lastError='',lastVerifiedStars=null,flushing=null;
  let disposed=false;
  const api={
   getStatus(){
    return {state,online:Boolean(online()),pending:outbox.count(studentId),
      verifiedStars:lastVerifiedStars,error:lastError};
   },
   queueAnswer(questionId,answer){
    assert(!disposed,'SESSION_DISPOSED');
    assert(QUESTION.test(String(questionId||'')),'INVALID_QUESTION_ID');
    assert(typeof answer==='string'&&answer.trim()&&answer.length<=300,'INVALID_ANSWER');
    const eventId=outbox.makeEventId();
    const pending=outbox.enqueue(studentId,{eventId,questionId,answer});
    state='pending';return {eventId,pending};
   },
   async request(action,extra){
    assert(!disposed,'SESSION_DISPOSED');
    assert(online(),'OFFLINE');
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const payload={schema:'mej-verified-v2',action,studentId,deviceToken:token,...extra};
    // No URL query parameters or cross-origin credential cookies.
    const resp=await fetcher(opts.endpoint,{method:'POST',mode:'cors',
      credentials:'omit',cache:'no-store',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload),...(controller?{signal:controller.signal}:{})});
    assert(resp&&resp.ok===true,'SERVER_HTTP_ERROR');
    assert(typeof resp.json==='function','UNREADABLE_RESPONSE');
    const result=await resp.json();
    assert(result&&result.ok===true&&result.scoreVerification===VERIFIED,'UNVERIFIED_SERVER_RESPONSE');
    if(result.studentId!==undefined)assert(result.studentId===studentId,'STUDENT_ID_MISMATCH');
    return result;
   },
   async sync(){
    assert(!disposed,'SESSION_DISPOSED');
    if(flushing)return flushing;
    if(!online()){state='offline';return api.getStatus()}
    state='syncing';lastError='';
    flushing=(async()=>{
     try{
      const done=await outbox.flush(studentId,async event=>{
       const result=await api.request('answer',event);
       assert(typeof result.correct==='boolean','INCOMPLETE_ANSWER_ACK');
       assert(Number.isInteger(result.stars)&&result.stars>=0&&result.stars<=2600,'INVALID_SERVER_STARS');
       lastVerifiedStars=result.stars;
       return result;
      });
      state=done.remaining?'pending':'synced';
     }catch(error){state='pending';lastError=String(error.message||error).slice(0,90)}
     finally{flushing=null}
     return api.getStatus();
    })();
    return flushing;
   },
   async restore(){
    assert(!disposed,'SESSION_DISPOSED');
    const result=await api.request('progress',{});
    assert(result.scope==='OWN_STUDENT_PROGRESS','INVALID_PROGRESS_SCOPE');
    assert(Array.isArray(result.mastered)&&result.mastered.length<=2600,'INVALID_PROGRESS_SNAPSHOT');
    assert(Number.isInteger(result.stars)&&result.stars>=0,'INVALID_SERVER_STARS');
    const ids=new Set();
    const mastery={};
    for(const item of result.mastered){
     assert(item&&QUESTION.test(item.questionId)&&Number.isInteger(item.correctCount)&&
       item.correctCount>=0&&item.correctCount<=2&&!ids.has(item.questionId),'INVALID_MASTERY_ITEM');
     ids.add(item.questionId);mastery[item.questionId]=item.correctCount;
    }
    const stars=Object.values(mastery).filter(n=>n===2).length;
    assert(stars===result.stars,'SERVER_STARS_MASTERY_MISMATCH');
    lastVerifiedStars=stars;
    // Return safe data only. The live app must explicitly reconcile drafts
    // and locally pending unsent events before any write to its local profile.
    return {studentId,stars,correct:mastery,pending:outbox.count(studentId)};
   },
   startAutoSync(){
    assert(!disposed,'SESSION_DISPOSED');
    if(root.addEventListener){
     root.addEventListener('online',onOnline);
     root.addEventListener('pageshow',onOnline);
    }
    if(online())api.sync().catch(()=>{});
   },
   stopAutoSync(){
    if(root.removeEventListener){
     root.removeEventListener('online',onOnline);
     root.removeEventListener('pageshow',onOnline);
    }
   },
   dispose(){api.stopAutoSync();disposed=true}
  };
  function onOnline(){if(!disposed&&online())api.sync().catch(()=>{})}
  return api;
 }
 root.MEJVerifiedSync={create};
})(window);
