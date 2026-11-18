(()=>{
  const base='./assets/sea-map/';
  const phone=matchMedia('(orientation:portrait)');
  const phoneX=[[17,28],[44,55],[75,86],[15,25],[46,57],[78,89],[14,24],[46,56],[78,89],[14,23],[46,56],[78,88]];
  const phoneY=[67.5,65,64.8,52.4,52.2,51.8,39.3,39.1,38.9,25.4,25.4,25.4];
  const desktopX=[[31.5,37],[49,54],[66.6,71.8],[84,89.3]];
  let lastStop=0;
  function position(n,portrait){
    if(n===0)return portrait?[57,78]:[28,86];
    const i=Math.floor((n-1)/2), side=(n-1)%2;
    return portrait?[phoneX[i][side],phoneY[i]+2.5]:[desktopX[i%4][side],[82,58,35][Math.floor(i/4)]];
  }
  function boatPosition(n, portrait) {
    const [x, y] = position(n, portrait);
    return n ? [x, y + (portrait ? 1.8 : 2.8)] : [x, y];
  }

  function course(from, target, portrait) {
    const points = [boatPosition(from, portrait)];
    const direction = Math.sign(target - from);
    const rowSize = portrait ? 6 : 8;
    for (let n = from; n !== target; n += direction) {
      const lower = Math.min(n, n + direction);
      const next = n + direction;
      if (lower === 0 && portrait) {
        const harbourChannel = [[40, 75], [27, 73]];
        points.push(...(direction > 0 ? harbourChannel : harbourChannel.reverse()));
      } else if (lower && lower % rowSize === 0) {
        const [right, lowerY] = boatPosition(lower, portrait);
        const [left, upperY] = boatPosition(lower + 1, portrait);
        const lane = upperY + (portrait ? 2.1 : 3);
        const edge = portrait ? 93 : 95;
        const turn = [[Math.max(right, edge), lowerY], [edge, lane], [left, lane]];
        points.push(...(direction > 0 ? turn : turn.reverse()));
      }
      points.push(boatPosition(next, portrait));
    }
    return points;
  }

  function roundTurns(points) {
    const rounded = [points[0]];
    const mix = (a, b, f) => a.map((value, i) => value + (b[i] - value) * f);
    for (let i = 1; i < points.length - 1; i++) {
      const corner = points[i];
      const before = mix(corner, points[i - 1], .25);
      const after = mix(corner, points[i + 1], .25);
      rounded.push(before);
      for (let s = 1; s <= 5; s++) {
        const t = s / 5;
        rounded.push(mix(mix(before, corner, t), mix(corner, after, t), t));
      }
    }
    if (points.length > 1) rounded.push(points.at(-1));
    return rounded;
  }

  function button(scene,label,x,y,w,h,action,visible=false){
    const b=document.createElement('button');
    b.type='button'; b.className='sea-hit'+(visible?' sea-door':''); b.setAttribute('aria-label',label); b.title=label;
    if(visible){const span=document.createElement('span');span.textContent=label;b.append(span)}
    Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
    b.onclick=action;scene.append(b);return b;
  }
  function castle(g,part){
    const app=document.getElementById('app');
    app.innerHTML='<div class="sea-scene sea-castle"><img class="sea-art" src="'+base+'castle.webp" alt="قلعة عُمانية ببوابتين"><h1 class="sea-castle-title" dir="rtl"></h1><button type="button" class="sea-castle-home" aria-label="العودة إلى المحطات"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 1 11h3v10h6v-6h4v6h6V11h3z"/></svg></button></div>';
    const scene=app.querySelector('.sea-castle');
    scene.querySelector('h1').textContent=mejVoyagePlace(g)+' · '+mejVoyageLeg(part);
    scene.querySelector('.sea-castle-home').onclick=()=>route('levels');
    button(scene,'تعلّم',312/941*100,800/1672*100,265/941*100,380/1672*100,()=>learnLevel(g,part),true);
    button(scene,'العب',635/941*100,800/1672*100,270/941*100,380/1672*100,()=>beginStagePart(g,part),true);
  }
  window.levels=function(){
    const app=document.getElementById('app'),portrait=phone.matches;
    app.innerHTML='<div class="sea-scene sea-chart"><img class="sea-art" alt="خريطة التعلّم البحرية"><div class="sea-water" aria-hidden="true"></div><div class="sea-wildlife" aria-hidden="true"><i class="sea-turtle"></i><i class="sea-fish"></i></div><div class="sea-boat" aria-hidden="true"><img alt="" src="'+base+'boat.webp"></div></div>';
    const scene=app.querySelector('.sea-chart'),boat=scene.querySelector('.sea-boat');
    scene.querySelector('.sea-art').src=base+(portrait?'phone':'desktop')+'.webp';
    function place([x,y]){boat.style.left=x+'%';boat.style.top=y+'%'}
    place(boatPosition(lastStop,portrait));
    let sailing=false;
    function visit(g,part){
      if(sailing||!checkAccess(g))return;
      if(!mejPartUnlocked(g,part)){toast('أكمل الوصول أولًا لفتح المغادرة.');return}
      const target=g?(g-1)*2+part:0;
      const points = roundTurns(course(lastStop, target, portrait));
      sailing = true;
      const lengths = points.slice(1).map((p, i) => Math.hypot(
        (p[0] - points[i][0]) * scene.clientWidth / 100,
        (p[1] - points[i][1]) * scene.clientHeight / 100
      ));
      const total = lengths.reduce((sum, length) => sum + length, 0);
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion || !total ? 0 : Math.min(7800, Math.max(720, total * 4.5));
      if (duration) boat.classList.add('is-sailing');
      const start=performance.now();
      function advance(t){
        if(!scene.isConnected)return;
        if(!duration||t-start>=duration){lastStop=target;castle(g,part);return}
        let distance=total*Math.max(0,t-start)/duration,i=0;
        while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];
        const f = lengths[i] ? distance / lengths[i] : 0;
        const p = points[i], q = points[i + 1];
        if (Math.abs(q[0] - p[0]) > .12) boat.dataset.heading = q[0] > p[0] ? 'right' : 'left';
        place(p.map((v, k) => v + (q[k] - v) * f));
        requestAnimationFrame(advance);
      }
      requestAnimationFrame(advance);
    }
    button(scene,'العودة إلى رحلتي',portrait?94:96,portrait?3:7,8,8,()=>route('journey'));
    const start = portrait ? [[26, 88], [73, 88]] : [[11.5, 70.4], [11, 88]];
    start.forEach(([x, y], index) => {
      const entry = button(scene, index ? 'ابدأ' : 'تأسّس', x, y,
        portrait ? (index ? 22.5 : 20.5) : 9.5, portrait ? 5.8 : 13,
        () => !active().diagnosed && !permitted(1) ? route('diagnostic') : visit(0, index + 1));
      entry.classList.add('sea-entry');
      entry.textContent = index ? 'ابدأ' : 'تأسّس';
    });
    for(let n=1;n<=24;n++){
      const i=Math.floor((n-1)/2),part=(n-1)%2+1,[x,y]=position(n,portrait);
      const b=button(scene,mejVoyagePlace(i+1)+' · '+mejVoyageLeg(part),x,y-(portrait?2.5:3),portrait?9:5.2,portrait?4.7:7,()=>visit(i+1,part));
      if(permitted(i+1)&&mejPartUnlocked(i+1,part))b.classList.add('sea-open');
    }
  };
  const redraw=()=>{if(document.querySelector('#app .sea-chart'))levels()};
  if(phone.addEventListener)phone.addEventListener('change',redraw);else phone.addListener(redraw);
})();
