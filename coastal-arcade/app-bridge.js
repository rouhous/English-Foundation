/* My English Journey — coastal badge integration v11.2 (student iframe, no mastery writes). */
(()=>{'use strict';
const places=[['خصب','Khasab'],['صحار','Sohar'],['ميناء صحار','Port of Sohar'],['مسقط','Muscat'],['ميناء مطرح','Muttrah Port'],['صور','Sur'],['الدقم','Duqm'],['جزيرة مصيرة','Masirah Island'],['جزر الديمانيات','Daymaniyat Islands'],['صلالة','Salalah']];
const badgeRoot=new URL('./coastal-arcade/badges/',document.baseURI).href;let activeProfile=null;
// MEJ_OWNER_PREVIEW_BADGES_V1 — authenticated owner review only; no reward writes.
function ownerPreview(){
 return window.__MEJ_ACCESS_ROLE==='owner' &&
        window.__MEJ_OWNER_VERIFIED_SESSION===true;
}
function count(stage){try{return Math.max(0,Math.min(200,Number(countMaster(stage,active()))||0))}catch(_){return 0}}
function safe(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function repaint(){
 const grid=document.querySelector('#app .j23-badge-grid');if(!grid)return;const role=ownerPreview()?'owner':'student';if(grid.dataset.coastalReady==='yes'&&grid.dataset.coastalAccess===role)return;
 if(typeof active!=='function'||typeof currentIsland!=='function')return;
 const stage=currentIsland(active());if(!Number.isInteger(stage)||stage<0||stage>12)return;
 const stars=count(stage),admin=ownerPreview(),opened=admin?10:Math.floor(stars/20);grid.dataset.coastalReady='yes';grid.dataset.coastalAccess=role;
 const intro=document.querySelector('#app .mej-hidden-intro');
 if(intro)intro.remove();
 const h=document.querySelector('#app .j23-badges h2');if(h)h.textContent=admin?'🏅 معاينة الشارات · 10/10':'🏅 شاراتي · '+opened+'/10';
 const note=document.querySelector('#app .j23-badges .j23-heading p');if(note)note.hidden=true;
 grid.innerHTML=places.map(([ar,en],i)=>{const n=i+1,yes=n<=opened;return '<button type="button" class="j23-medal mej-coastal-medal '+(yes?'unlocked':'locked')+'" '+(yes?'':'disabled')+' onclick="mejCoastalOpen('+stage+','+n+')" aria-label="'+(yes?'افتح ':'مقفلة ')+safe(ar)+'"><img alt="'+safe(ar)+'" loading="lazy" src="'+badgeRoot+'coast-'+String(n).padStart(2,'0')+'.webp"><strong>'+safe(ar)+'</strong><small lang="en">'+safe(en)+'</small><small>'+n*20+'/200 ⭐</small></button>'}).join('');
 compactJourney();
}

function mejFoldPanel(panel,label){
 if(!panel||panel.querySelector(':scope > details.mej-journey-fold'))return;
 const details=document.createElement('details');details.className='mej-journey-fold';
 const summary=document.createElement('summary');summary.textContent=label;
 details.append(summary);
 while(panel.firstChild)details.append(panel.firstChild);
 panel.append(details);
}
function compactJourney(){
 const root=document.querySelector('#app .journey-v23');if(!root||root.dataset.mejCompact==='yes')return;
 root.dataset.mejCompact='yes';root.classList.add('mej-compact-journey');
 const buttons=root.querySelector('.j23-file-buttons');
 if(buttons&&!buttons.closest('details')){
  const details=document.createElement('details');details.className='mej-journey-fold mej-progress-tools';
  const summary=document.createElement('summary');summary.textContent='⚙️ إدارة التقدم';
  buttons.parentElement.insertBefore(details,buttons);details.append(summary,buttons);
 }
 const recs=root.querySelector('.j23-recs')?.closest('.j23-panel');
 mejFoldPanel(recs,'🎯 تدريبات إضافية');
 mejFoldPanel(root.querySelector('.j23-history'),'🏝️ مراحلي السابقة');
}

/* Badge detail layout V2: DOM-only rearrangement, original art/theme and handlers intact. */
function focusSelectedCoastalBadge(frame,badge){
 let doc;try{doc=frame.contentDocument}catch(_){return}
 if(!doc||!doc.body)return;
 const names=['خصب','صحار','ميناء صحار','مسقط','ميناء مطرح','صور','الدقم','جزيرة مصيرة','جزر الديمانيات','صلالة'];
 const chosen=names[badge-1];if(!chosen)return;
 const style=doc.createElement('style');style.id='mej-coastal-badge-layout-v2';
 style.textContent=`
  .mej-compact-badge-intro{display:grid;grid-template-columns:minmax(84px,25%) minmax(0,1fr);gap:10px;align-items:start;direction:rtl;margin:4px 0 10px}
  .mej-badge-portrait{width:100%;height:auto;max-height:155px;object-fit:contain}
  .mej-badge-summary{display:flex;flex-direction:column;gap:7px;min-width:0}
  .mej-badge-summary>*{min-width:0;width:100%;margin:0!important;padding:8px!important}
  .mej-badge-summary p{font-size:clamp(12px,3.1vw,15px)!important;line-height:1.45!important;margin:4px 0!important}
  .mej-badge-summary h2,.mej-badge-summary h3,.mej-badge-summary h4{font-size:clamp(13px,3.5vw,17px)!important;line-height:1.3!important;margin:0 0 5px!important}
  .mej-badge-summary button{min-height:32px!important;padding:5px 9px!important;font-size:12px!important}
  .mej-compact-game-entry{margin:10px 0!important;padding:10px 12px!important;min-height:52px!important;width:100%!important}
  .mej-badge-detail-compact h1{font-size:clamp(19px,5vw,25px)!important;margin:0 0 7px!important;line-height:1.2!important}
  .mej-badge-detail-compact h2{font-size:clamp(16px,4vw,20px)!important;margin:4px 0 7px!important}
  .mej-badge-detail-compact>*,.mej-badge-detail-compact section{margin-block:8px!important}
  .mej-badge-extras{margin-top:10px!important}
  .mej-badge-extras>summary{cursor:pointer;padding:8px 0;font-weight:700}
  @media(max-width:370px){.mej-compact-badge-intro{grid-template-columns:78px minmax(0,1fr);gap:7px}.mej-badge-summary>*{padding:6px!important}}
 `;
 doc.head.append(style);
 let scheduled=false;
 const label=(e)=>String(e?.textContent||'').replace(/\\s+/g,' ').trim();
 const leaf=(pattern)=>[...doc.querySelectorAll('h1,h2,h3,h4,strong,b,span,div,p')].find(e=>e.children.length<3&&pattern.test(label(e))&&label(e).length<90);
 function panelFor(node,exclude){
  if(!node)return null;
  let best=node.parentElement;
  for(let n=node.parentElement;n&&n!==doc.body;n=n.parentElement){
   if(exclude&&n.contains(exclude))break;
   if(n.querySelector('button')&&label(n).length<700)best=n;
   if(n.matches('section,article,[class*="card"],[class*="panel"]')&&label(n).length<700){best=n;break}
  }
  return best;
 }
 function apply(){
  scheduled=false;if(!frame.isConnected)return;
  // Only change the destination introduction, never the badge grid or game screens.
  const ar=leaf(/^العربية(?:\\s|$)/),en=leaf(/^English(?:\\s|$)/);
  const startButton=[...doc.querySelectorAll('button,a')].find(e=>/ابدأ لعبة|ابدأ اللعب|Start (?:game|playing)/i.test(label(e))&&label(e).length<115);
  if(!ar||!en||!startButton||doc.querySelector('.mej-compact-badge-intro'))return;
  const arPanel=panelFor(ar,en),enPanel=panelFor(en,ar);
  if(!arPanel||!enPanel||arPanel===enPanel||arPanel.contains(enPanel)||enPanel.contains(arPanel))return;
  const ancestors=[];for(let n=arPanel;n;n=n.parentElement)ancestors.push(n);
  const holder=ancestors.find(n=>n.contains(enPanel)&&n.contains(startButton)&&n!==doc.body);
  if(!holder)return;
  const wrapper=doc.createElement('div');wrapper.className='mej-compact-badge-intro';
  const portrait=doc.createElement('img');portrait.className='mej-badge-portrait';
  portrait.alt=chosen;portrait.src=badgeRoot+'coast-'+String(badge).padStart(2,'0')+'.webp';
  const summary=doc.createElement('div');summary.className='mej-badge-summary';
  // Preserve listening controls by moving the existing bilingual panels, not copying text.
  arPanel.before(wrapper);wrapper.append(portrait,summary);summary.append(arPanel,enPanel);
  holder.classList.add('mej-badge-detail-compact');
  const title=leaf(/اكتشف هذه الوجهة/);if(title)title.style.fontSize='clamp(17px,4.5vw,23px)';
  const ctaPanel=panelFor(startButton);
  if(ctaPanel && ctaPanel!==holder && !ctaPanel.contains(wrapper) && !wrapper.contains(ctaPanel)){
   ctaPanel.classList.add('mej-compact-game-entry');
   wrapper.after(ctaPanel);
  }else{
   startButton.classList.add('mej-compact-game-entry');
   wrapper.after(startButton);
  }
  // Information beyond the two introductory paragraphs remains accessible but collapsed.
  const more=leaf(/أعرف أكثر عن المكان/),vocab=leaf(/مفردات من هذه المحطة/);
  const extras=[more,vocab].map(e=>e&&panelFor(e,wrapper)).filter(e=>e&&e!==holder&&!e.contains(wrapper)&&!e.contains(startButton));
  if(extras.length){
   const fold=doc.createElement('details');fold.className='mej-badge-extras';
   const caption=doc.createElement('summary');caption.textContent='📖 معلومات ومفردات إضافية';
   fold.append(caption);
   const target=doc.querySelector('.mej-compact-game-entry');target?.after(fold);
   for(const e of [...new Set(extras)])fold.append(e);
  }
  wrapper.scrollIntoView({block:'start',behavior:'instant'});
 }
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(apply)}});
 observer.observe(doc.body,{childList:true,subtree:true});
 apply();
 // The observer intentionally remains active because the frame first renders the badge list,
 // and the student chooses the destination afterwards.
 frame.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

/* MEJ_STUDENT_QUICKPLAY_20261116: live iframe layout only, no game/ledger changes. */
function installStudentQuickplay(frame,clicked){
 try{
  const doc=frame.contentDocument,win=frame.contentWindow;
  if(!doc||!win||doc.getElementById('mej-student-quickplay-v1'))return;
  const shell=doc.querySelector('main.shell'),games=doc.getElementById('games'),grid=doc.getElementById('gamesGrid');
  if(!shell||!games||!grid)return;
  const st=doc.createElement('style');st.id='mej-student-quickplay-v1';st.textContent=".topbar,.hero,.preview-tools,.summary-stats,.stations-section,.explainer,footer,#resetDemo{display:none!important}\n.shell{max-width:960px;padding:8px 10px 24px!important}\n.games-section{margin:10px 0 0!important;padding:12px!important}\n.games-section .section-head{margin-bottom:5px}.games-section .section-head .eyebrow{display:none}.games-section .section-head h2{font-size:19px}\n.games-toolbar{padding:5px 0 8px}.games-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:9px}\n.games-grid .game-card.locked{display:none!important}.games-grid .game-card{padding:10px;min-height:70px}.games-grid .game-record{font-size:10px}\n.mej-quick-portal{display:flex;align-items:center;gap:11px;background:linear-gradient(120deg,#10546a,#0b354b);border:1px solid #f2d083;border-radius:16px;padding:12px}\n.mej-quick-portal img{width:105px;height:105px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 8px 7px #0008)}\n.mej-quick-text{flex:1;min-width:0}.mej-quick-text h2{font-size:clamp(19px,5vw,25px);color:#ffdf9b;margin:3px 0}.mej-quick-text p{font-size:12px;color:#d7eae6;line-height:1.5;margin:3px 0 8px}\n.mej-quick-sub{font-size:12px;color:#f9d389;font-weight:800}.mej-quick-actions{display:flex;flex-wrap:wrap;gap:6px}\n.mej-quick-actions button{border:1px solid #efcf88;background:#f5d18b;color:#1a3b45;border-radius:9px;min-height:39px;padding:7px 11px;font-size:12px;font-weight:800}\n.mej-quick-actions button:last-child{background:#ffffff13;color:#e7e4d0;border-color:#7aa9a9}.mej-quick-actions button:disabled{opacity:.5}\n@media(max-width:510px){.games-grid{grid-template-columns:1fr}.mej-quick-portal{padding:9px;gap:8px}.mej-quick-portal img{width:88px;height:88px}.games-section{padding:10px!important}.game-card .game-emoji{font-size:23px;flex-basis:43px;padding:6px 2px}}";doc.head.append(st);
  const panel=doc.createElement('section');panel.className='mej-quick-portal';
  const img=doc.createElement('img');img.src=badgeRoot+'coast-'+String(clicked).padStart(2,'0')+'.webp';img.alt=places[clicked-1][0];
  const info=doc.createElement('div');info.className='mej-quick-text';
  const sub=doc.createElement('div');sub.className='mej-quick-sub';sub.textContent='🏅 شارتك الساحلية';
  const h=doc.createElement('h2');h.textContent=places[clicked-1][0];
  const p=doc.createElement('p');p.textContent='اكتشف شارتك وابدأ اللعب!';
  const actions=doc.createElement('div');actions.className='mej-quick-actions';
  const play=doc.createElement('button');play.type='button';play.textContent='🎮 العب الآن';
  const more=doc.createElement('button');more.type='button';more.textContent='📖 اعرف عن المكان';
  play.onclick=()=>{const api=win.MEJV11Review,s=api?.getState();if(api&&s?.unlocked>0)api.openGame(s.unlocked)};
  more.onclick=()=>win.MEJV11Review?.openBadge(clicked);
  actions.append(play,more);info.append(sub,h,p,actions);panel.append(img,info);
  shell.insertBefore(panel,shell.firstChild);shell.insertBefore(games,panel.nextSibling);
  let busy=false;
  function refresh(){
   const s=win.MEJV11Review?.getState();if(!s)return;
   const n=Math.max(0,Math.min(10,Number(s.unlocked)||0));
   sub.textContent=clicked<=n?'🏅 شارة مكتسبة':'🏅 وجهتك القادمة';
   p.textContent=n?'أحسنت! لديك '+n+' '+(n===1?'لعبة مفتوحة':'ألعاب مفتوحة')+'. اختر أي لعبة.':'اجمع 20 نجمة إتقان لفتح أول لعبة.';
   play.disabled=!n;play.textContent=n?'🎮 العب الآن':'🔒 لم تُفتح الألعاب';
   doc.getElementById('gamesTitle').textContent='🎮 الألعاب المفتوحة';
   [...grid.children].forEach((card,i)=>card.style.order=String(10-i));
  }
  new MutationObserver(()=>{if(busy)return;busy=true;win.requestAnimationFrame(()=>{busy=false;refresh()})}).observe(grid,{childList:true});
  win.addEventListener('message',e=>{if(e.source===win.parent&&e.origin===win.location.origin&&e.data?.type==='mej:coastal-init')win.setTimeout(refresh,90)});
  refresh();win.setTimeout(refresh,250);win.setTimeout(refresh,1100);
 }catch(err){console.warn('Student quickplay: ',err)}
}

function close(){const e=document.getElementById('mejCoastalOverlay');if(!e)return;e.remove();activeProfile=null;document.body.style.removeProperty('overflow')}
function open(stage,badge){
 if(typeof active!=='function'||typeof permitted!=='function')return;
 stage=Number(stage);badge=Number(badge);
 if(!Number.isInteger(stage)||stage<0||stage>12||!permitted(stage)||!Number.isInteger(badge)||badge<1||badge>10||(!ownerPreview()&&count(stage)<badge*20)){if(typeof toast==='function')toast('الشارة مقفلة حتى تحقق نجوم الإتقان المطلوبة.');return}
 close();const student=active();activeProfile=String(student.id||'');
 const dialog=document.createElement('div');dialog.id='mejCoastalOverlay';dialog.dataset.stage=String(stage);dialog.dataset.badge=String(badge);dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','رحلة الشارات الساحلية');
 const header=document.createElement('header');header.className='mej-coastal-top';
 const name=document.createElement('strong');name.textContent='🏅 رحلة شارات عُمان · المرحلة '+stage+' · '+count(stage)+'/200 ⭐'+(ownerPreview()?' · 🔓 Admin Preview':'');
 const back=document.createElement('button');back.type='button';back.textContent='↩ عودة';back.onclick=close;header.append(name,back);
 const frame=document.createElement('iframe');frame.id='mejCoastalFrame';frame.title='الألعاب التفاعلية والشارات';frame.allow='autoplay';frame.src='./coastal-arcade/index.html?mode=student&photoBank=20261115-v2&quickplay=20261116-v1';
 frame.addEventListener('load',()=>{
   focusSelectedCoastalBadge(frame,badge);
   installStudentQuickplay(frame,badge);
   // Add quality repairs inside the same-origin arcade without altering its scoring logic.
   try{
     const doc=frame.contentDocument;
     if(doc&&!doc.querySelector('script[data-mej-quality]')){
       const script=doc.createElement('script');
       script.dataset.mejQuality='yes';
       script.src=new URL('./coastal-arcade/quality-fixes.js',document.baseURI).href;
       doc.head.append(script);
     }
   }catch(_){}
 },{once:true});dialog.append(header,frame);document.body.append(dialog);document.body.style.overflow='hidden';back.focus()
}
window.addEventListener('mej-owner-verified',()=>{const grid=document.querySelector('#app .j23-badge-grid');if(grid)grid.removeAttribute('data-coastal-ready');repaint()});
window.mejCoastalOpen=open;window.mejCoastalClose=close;
window.addEventListener('message',event=>{
 const f=document.getElementById('mejCoastalFrame');if(!f||event.origin!==location.origin||event.source!==f.contentWindow||event.data?.type!=='mej:coastal-ready')return;
 const p=active(),box=document.getElementById('mejCoastalOverlay');if(!box||String(p.id)!==activeProfile){close();return}
 const stage=Number(box.dataset.stage),grade=stage===0?1:Math.max(1,Math.min(12,stage)),token=window.__MEJ_ACCESS_ROLE==='student'?localStorage.getItem('MEJ_STUDENT_ACCESS_V1')||'':'';
 const owner=ownerPreview();
 // The selected learning stage (0-12), not the student's registered school grade, sets game difficulty.
 f.contentWindow.postMessage({type:'mej:coastal-init',selectedBadge:Number(box.dataset.badge),stage,grade:Number.isInteger(grade)&&grade>=1&&grade<=12?grade:1,stageStars:owner?200:count(stage),accessToken:!owner&&/^[a-f0-9]{64}$/.test(token)?token:'',ownerPreview:owner},location.origin)
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('mejCoastalOverlay')){e.preventDefault();close()}});
function init(){
 const style=document.createElement('style');style.textContent='.mej-coastal-medal{display:flex!important;align-items:center;justify-content:center;flex-direction:column;gap:5px;min-height:145px;padding:9px 5px}.mej-coastal-medal img{width:min(90px,90%);height:auto;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 4px 6px #03284155)}.mej-coastal-medal.locked img{filter:grayscale(1);opacity:.35}.mej-coastal-medal strong{font-size:14px}.mej-coastal-medal small{font-size:11px}#mejCoastalOverlay{position:fixed;inset:0;z-index:2147483000;background:#05324c;display:flex;flex-direction:column;color:#fff}.mej-coastal-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;min-height:54px;padding:8px 13px;background:#075675;font:700 14px system-ui,Tahoma,sans-serif}.mej-coastal-top button{border:0;border-radius:10px;background:#ffe3a3;color:#16405c;padding:9px 13px;font-weight:800;cursor:pointer}#mejCoastalFrame{flex:1;min-height:0;width:100%;border:0;background:#072e44}';
 style.textContent+=`
/* Journey screen V36: student-first compact badges, no duplicate counters or permanent help paragraphs. */
#app .journey-v23.mej-compact-journey{gap:7px!important;max-width:1100px}
#app .mej-compact-journey .mej-hidden-intro{display:none!important}
#app .mej-compact-journey .j23-panel{padding:9px 10px!important;border-radius:17px!important;box-shadow:0 3px 10px #002b6b55!important}
#app .mej-compact-journey .j26-head{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"brand home" "status status";gap:5px 8px!important;padding:9px 12px!important;border-radius:18px!important;min-width:0}
#app .mej-compact-journey .j26-brand{grid-area:brand;display:flex!important;flex-direction:row!important;min-width:0!important;gap:8px!important;padding:0!important;border:0!important;align-items:center!important}
#app .mej-compact-journey .j26-brand .j23-avatar{font-size:21px!important;padding:3px!important;line-height:1!important;width:41px!important;height:41px!important;display:grid!important;place-items:center!important}
#app .mej-compact-journey .j26-brand-title strong{font-size:clamp(14px,3.8vw,19px)!important;line-height:1.15!important}
#app .mej-compact-journey .j26-brand-title small{display:none!important}
#app .mej-compact-journey .j34-card-toolbar{grid-area:home!important;margin:0!important;padding:0!important;align-self:center;justify-content:flex-end!important;min-width:0}
#app .mej-compact-journey .journey-home-mini{min-height:34px!important;padding:5px 8px!important;font-size:12px!important;white-space:nowrap;border-radius:10px!important}
#app .mej-compact-journey .j26-status{grid-area:status!important;min-width:0!important;text-align:start!important;width:100%}
#app .mej-compact-journey .j26-status>strong,#app .mej-compact-journey .j34-progress-note{display:none!important}
#app .mej-compact-journey .j26-detail{display:flex!important;flex-wrap:wrap;justify-content:flex-start!important;gap:5px!important;margin:0!important;padding:0!important}
#app .mej-compact-journey .j26-detail .j26-name{display:none!important}
#app .mej-compact-journey .j26-detail>span:not(.j26-name){max-width:100%;font-size:11px!important;text-align:start!important;padding:3px 7px!important;margin:0!important;border-radius:9px!important}
#app .mej-compact-journey .j26-status .j23-meter{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:2px 7px!important;margin:4px 0 0!important;align-items:center!important}
#app .mej-compact-journey .j26-status .j23-meter .j26-count{grid-column:1!important;grid-row:1!important;font-size:12px!important}
#app .mej-compact-journey .j26-status .j23-meter .j26-stars{grid-column:2!important;grid-row:1!important;font-size:12px!important}
#app .mej-compact-journey .j26-status .j23-meter .j23-progress{grid-column:1/-1!important;grid-row:2!important;width:100%!important;height:7px!important;min-height:7px!important;margin:2px 0!important}
#app .mej-compact-journey .j23-badges .j23-heading{margin:0 0 6px!important;padding:0!important}
#app .mej-compact-journey .j23-badges .j23-heading h2{font-size:clamp(16px,4.2vw,21px)!important;line-height:1.25!important}
#app .mej-compact-journey .j23-badges .j23-heading p,#app .mej-compact-journey .j23-badges .j23-heading>b{display:none!important}
#app .mej-compact-journey .j23-badge-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important}
#app .mej-compact-journey .j23-medal.mej-coastal-medal{min-height:0!important;padding:3px 0!important;gap:3px!important;box-shadow:none!important;background:transparent!important}
#app .mej-compact-journey .mej-coastal-medal img{width:min(70px,98%)!important;max-width:100%!important;aspect-ratio:1!important;object-fit:contain!important}
#app .mej-compact-journey .mej-coastal-medal strong{font-size:clamp(9px,2.7vw,12px)!important;line-height:1.2!important;overflow-wrap:normal!important;word-break:normal!important;text-align:center!important}
#app .mej-compact-journey .mej-coastal-medal small{display:none!important}
#app .mej-compact-journey .j23-panel:has(.j23-links)>.j23-heading{display:none!important}
#app .mej-compact-journey .j23-links{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important}
#app .mej-compact-journey .j23-link{min-width:0!important;min-height:41px!important;padding:5px 3px!important;font-size:clamp(10px,2.7vw,13px)!important;line-height:1.2!important;border-radius:10px!important}
#app .mej-compact-journey .j23-link span{font-size:15px!important;display:inline!important;margin-inline-end:2px}
#app .mej-compact-journey .mej-journey-fold{margin:0!important}
#app .mej-compact-journey .mej-journey-fold>summary{cursor:pointer;list-style:none;font-size:13px;font-weight:800;padding:5px 3px;color:#fff}
#app .mej-compact-journey .mej-journey-fold>summary::-webkit-details-marker{display:none}
#app .mej-compact-journey .mej-journey-fold>summary:after{content:" ▾";font-size:12px}
#app .mej-compact-journey .mej-journey-fold[open]>summary:after{content:" ▴"}
#app .mej-compact-journey .mej-progress-tools{margin-top:4px!important}
#app .mej-compact-journey .mej-progress-tools .j23-file-buttons{margin-top:6px!important;gap:5px!important;flex-wrap:wrap}
#app .mej-compact-journey .mej-progress-tools .j23-file-buttons button{padding:7px 4px!important;font-size:11px!important;min-height:34px!important}
#app .mej-compact-journey .j23-panel:has(> .mej-journey-fold){padding:7px 10px!important}
#app .mej-compact-journey .mej-journey-fold:not([open])>.j23-heading,#app .mej-compact-journey .mej-journey-fold:not([open])>h2{display:none!important}
#app .mej-compact-journey .j23-recs{margin-top:6px!important}
@media(max-width:380px){#app .mej-compact-journey .j23-links{grid-template-columns:repeat(2,minmax(0,1fr))!important}#app .mej-compact-journey .j26-brand-title strong{font-size:14px!important}}
`;
 document.head.append(style);const app=document.getElementById('app');if(!app)return;repaint();new MutationObserver(()=>queueMicrotask(repaint)).observe(app,{childList:true,subtree:false})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();