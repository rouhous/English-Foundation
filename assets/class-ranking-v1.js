/* My English Journey — stage 3 protected class ranking display.
 * Data must come from the student's authenticated, school-scoped verified API.
 * This component does not fetch scores, infer levels or use local star totals.
 */
(function(root){
  'use strict';
  function element(tag,cls,text){
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=String(text);
    return node;
  }
  function unavailable(host,message){
    if(!host)return;
    host.replaceChildren();
    const card=element('section','mej-rank-unavailable');
    card.appendChild(element('h2','', '🏅 ترتيب طلاب صفي'));
    card.appendChild(element('p','',message||'ترتيب الصف غير متاح بعد. سيُفتح بعد تفعيل حسابات الطلاب والنجوم الموثقة.'));
    host.appendChild(card);
  }
  function render(host,payload){
    if(!host)return false;
    if(!payload||payload.ok!==true||payload.scope!=='OWN_VERIFIED_CLASS'||
       !['SERVER_CHECKED_PILOT','CLIENT_REPORTED_UNVERIFIED'].includes(payload.scoreVerification)||
       !Array.isArray(payload.entries)||payload.entries.length>100||
       !payload.entries.some(item=>item.isMe===true)||
       payload.entries.some(item=>!Number.isInteger(item.rank)||item.rank<1||
         !Number.isInteger(item.stars)||item.stars<0||
         typeof item.name!=='string'||item.name.length>80)){
      unavailable(host);
      return false;
    }
    host.replaceChildren();
    const card=element('section','mej-class-ranking');
    card.appendChild(element('h2','mej-ranking-title','🏆 ترتيب طلاب صفي'));
    card.appendChild(element('p','mej-ranking-subtitle',
      'الفصل '+String(payload.className||'')+' • الترتيب حسب عدد النجوم'));
    const list=element('ol','mej-ranking-list');
    payload.entries.forEach(item=>{
      const li=element('li','mej-ranking-student'+(item.isMe?' mej-ranking-self':''));
      li.appendChild(element('span','mej-ranking-rank',String(item.rank)));
      li.appendChild(element('span','mej-ranking-name',item.name+(item.isMe?' • أنت':'')));
      li.appendChild(element('strong','mej-ranking-stars',String(item.stars)+' ⭐'));
      list.appendChild(li);
    });
    card.appendChild(list);
    card.appendChild(element('p','mej-ranking-footnote',
      payload.scoreVerification==='CLIENT_REPORTED_UNVERIFIED'?'ترتيب تجريبي حسب النجوم المحفوظة؛ لم تُراجع النجوم خادميًا بعد. لا تُعرض مستويات الطلاب.':'يعتمد الترتيب على نجوم الأسئلة المتقنة فقط. لا تُعرض مستويات الطلاب.'));
    host.appendChild(card);
    return true;
  }
  root.MEJClassRanking={render,unavailable};
})(window);
