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
    app.innerHTML='<div class="sea-scene sea-chart"><img class="sea-art" alt="خريطة التعلّم البحرية"><img class="sea-boat" alt="" src="'+base+'boat.webp"></div>';
    const scene=app.querySelector('.sea-chart'),boat=scene.querySelector('.sea-boat');
    scene.querySelector('.sea-art').src=base+(portrait?'phone':'desktop')+'.webp';
    function place([x,y]){boat.style.left=x+'%';boat.style.top=y+'%'}
    place(position(lastStop,portrait));
    let sailing=false;
    function visit(g,part){
      if(sailing||!checkAccess(g))return;
      if(!mejPartUnlocked(g,part)){toast('أكمل الوصول أولًا لفتح المغادرة.');return}
      const target=g?(g-1)*2+part:0;
      const points=[position(lastStop,portrait)];
      const step=Math.sign(target-lastStop);
      for(let n=lastStop;n!==target;n+=step){
        const a=Math.min(n,n+step), from=position(n,portrait),to=position(n+step,portrait);
        const rowEnd=portrait?6:8;
        if(a>0&&a%rowEnd===0){
          const lo=position(a,portrait),hi=position(a+1,portrait),lane=hi[1]+(portrait?1.8:3);
          const turn=[[portrait?97:95,lo[1]],[portrait?97:95,lane],[hi[0],lane]];
          points.push(...(step>0?turn:turn.reverse()));
        }else if(!a&&portrait)points.push([40,74]);
        points.push(to);
      }
      sailing=true;
      const lengths=points.slice(1).map((p,i)=>Math.hypot((p[0]-points[i][0])*scene.clientWidth/100,(p[1]-points[i][1])*scene.clientHeight/100));
      const total=lengths.reduce((a,b)=>a+b,0),duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:Math.min(4500,total*2.8);
      const start=performance.now();
      function advance(t){
        if(!scene.isConnected)return;
        if(!duration||t-start>=duration){lastStop=target;castle(g,part);return}
        let distance=total*Math.max(0,t-start)/duration,i=0;
        while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];
        const f=distance/lengths[i],p=points[i],q=points[i+1];place(p.map((v,k)=>v+(q[k]-v)*f));requestAnimationFrame(advance);
      }
      requestAnimationFrame(advance);
    }
    button(scene,'العودة إلى رحلتي',portrait?94:96,portrait?3:7,8,8,()=>route('journey'));
    const start=portrait?[[26,88],[73,88]]:[[11.5,70],[11,88]];
    start.forEach(([x,y],i)=>button(scene,i?'انطلق':'ابدأ',x,y,portrait?23:10,8,()=>!active().diagnosed&&!permitted(1)?route('diagnostic'):visit(0,i+1)));
    for(let n=1;n<=24;n++){
      const i=Math.floor((n-1)/2),part=(n-1)%2+1,[x,y]=position(n,portrait);
      const b=button(scene,mejVoyagePlace(i+1)+' · '+mejVoyageLeg(part),x,y-(portrait?2.5:3),portrait?9:5.2,portrait?4.7:7,()=>visit(i+1,part));
      if(permitted(i+1)&&mejPartUnlocked(i+1,part))b.classList.add('sea-open');
    }
  };
  const redraw=()=>{if(document.querySelector('#app .sea-chart'))levels()};
  if(phone.addEventListener)phone.addEventListener('change',redraw);else phone.addListener(redraw);
})();
