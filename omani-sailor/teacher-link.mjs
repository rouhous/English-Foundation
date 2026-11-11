// The host app supplies the authenticated student/phase and an owner-scoped storage adapter.
// Upsert by (studentId, source), accepting only newer revisions; never add snapshot totals on retry.
// Teacher reads and verification must go through the authenticated teacher's own class.
export function connectSailor(frame, student, saveSnapshot) {
  const id = 'student:' + student.id;
  let pending = null, busy = false, retry, closed = false;
  const link = () => frame.contentWindow.postMessage({ type: 'mej:sailor-link', studentId: student.id, phase: student.phase, stageId: student.stageId, stageStars: student.stageStars }, location.origin);
  async function flush() {
    if (closed || busy || !pending) return;
    const update = pending;
    busy = true;
    try {
      await saveSnapshot(student.id, update);
      if (pending === update) pending = null;
    } catch {
      clearTimeout(retry);
      retry = setTimeout(() => { retry = null; flush(); }, 5000);
    } finally {
      busy = false;
      if (pending && !retry && !closed) queueMicrotask(flush);
    }
  }
  function receive(event) {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (data?.type === 'mej:sailor-ready') return link();
    if (data?.type !== 'mej:sailor-progress' || data.studentId !== id) return;
    const p = data.progress;
    if (!p || !Number.isSafeInteger(p.gems) || p.gems < 0 || !Number.isSafeInteger(p.revision) || !Array.isArray(p.treasures)) return;
    pending = p; flush();
  }
  window.addEventListener('message', receive);
  frame.addEventListener('load', link);
  if (frame.contentWindow) link();
  return () => { closed = true; clearTimeout(retry); frame.removeEventListener('load',link); window.removeEventListener('message',receive); };
}
export function classRanking(classStudents) {
  // Caller supplies a single school, teacher group and class. Equal stars and gems share rank.
  const rows = [...classStudents].sort((a,b)=>b.stars-a.stars || (b.gems||0)-(a.gems||0));
  let rank = 0;
  return rows.map((row,i)=>{
    const previous = rows[i-1];
    if (!previous || previous.stars!==row.stars || (previous.gems||0)!==(row.gems||0)) rank=i+1;
    return {...row,rank};
  });
}
// Teacher view: read-only reward cards. No secret code or teacher permission is
// required to open a chest; only authenticated teacher may settle real balances.
export function renderTreasureCard(container, reward) {
  const card=document.createElement('div'), title=document.createElement('strong'), detail=document.createElement('p');
  title.textContent='صندوق كنز · '+Number(reward.baisa||0)+' بيسة';
  detail.textContent='مكافأة إضافية في المرحلة '+String(reward.stageId||'غير محددة');
  card.append(title,detail);container.append(card);
  return card;
}
