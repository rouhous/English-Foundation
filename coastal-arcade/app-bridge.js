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
 if(intro)intro.innerHTML=admin?'<h2>🔓 معاينة المالك · شارات عُمان</h2><p>جميع الشارات والألعاب مفتوحة للمراجعة فقط.</p><div class="mej-hidden-rewards"><b>⭐ '+stars+'/200 إتقان فعلي</b><b>🏅 10/10 شارات</b></div><small>دون منح نجوم أو تغيير تقدم الطلاب.</small>':'<h2>🏅 رحلة الشارات الساحلية</h2><p>كل 20 نجمة تعليمية تفتح شارة عُمانية ولعبة جديدة.</p><div class="mej-hidden-rewards"><b>⭐ '+stars+'/200 إتقان</b><b>🏅 '+opened+'/10 شارات</b></div><small>نجوم الألعاب محفوظة منفصلة عن الإتقان والترتيب. المزامنة لازمة لاحتساب المكافآت.</small>';
 const h=document.querySelector('#app .j23-badges h2');if(h)h.textContent='🏅 الشارات الساحلية · Coastal Badges';
 const note=document.querySelector('#app .j23-badges .j23-heading p');if(note)note.textContent='شارات معتمدة بالصور الأصلية · '+opened+'/10 مفتوحة';
 grid.innerHTML=places.map(([ar,en],i)=>{const n=i+1,yes=n<=opened;return '<button type="button" class="j23-medal mej-coastal-medal '+(yes?'unlocked':'locked')+'" '+(yes?'':'disabled')+' onclick="mejCoastalOpen('+stage+','+n+')" aria-label="'+(yes?'افتح ':'مقفلة ')+safe(ar)+'"><img alt="'+safe(ar)+'" loading="lazy" src="'+badgeRoot+'coast-'+String(n).padStart(2,'0')+'.webp"><strong>'+safe(ar)+'</strong><small lang="en">'+safe(en)+'</small><small>'+n*20+'/200 ⭐</small></button>'}).join('');
}
function close(){const e=document.getElementById('mejCoastalOverlay');if(!e)return;e.remove();activeProfile=null;document.body.style.removeProperty('overflow')}
function open(stage,badge){
 if(typeof active!=='function'||typeof permitted!=='function')return;
 stage=Number(stage);badge=Number(badge);
 if(!Number.isInteger(stage)||stage<0||stage>12||!permitted(stage)||!Number.isInteger(badge)||badge<1||badge>10||(!ownerPreview()&&count(stage)<badge*20)){if(typeof toast==='function')toast('الشارة مقفلة حتى تحقق نجوم الإتقان المطلوبة.');return}
 close();const student=active();activeProfile=String(student.id||'');
 const dialog=document.createElement('div');dialog.id='mejCoastalOverlay';dialog.dataset.stage=String(stage);dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','رحلة الشارات الساحلية');
 const header=document.createElement('header');header.className='mej-coastal-top';
 const name=document.createElement('strong');name.textContent='🏅 رحلة شارات عُمان · المرحلة '+stage+' · '+count(stage)+'/200 ⭐'+(ownerPreview()?' · 🔓 Admin Preview':'');
 const back=document.createElement('button');back.type='button';back.textContent='↩ العودة إلى رحلتي';back.onclick=close;header.append(name,back);
 const frame=document.createElement('iframe');frame.id='mejCoastalFrame';frame.title='الألعاب التفاعلية والشارات';frame.allow='autoplay';frame.src='./coastal-arcade/index.html?mode=student';
 dialog.append(header,frame);document.body.append(dialog);document.body.style.overflow='hidden';back.focus()
}
window.addEventListener('mej-owner-verified',()=>{const grid=document.querySelector('#app .j23-badge-grid');if(grid)grid.removeAttribute('data-coastal-ready');repaint()});
window.mejCoastalOpen=open;window.mejCoastalClose=close;
window.addEventListener('message',event=>{
 const f=document.getElementById('mejCoastalFrame');if(!f||event.origin!==location.origin||event.source!==f.contentWindow||event.data?.type!=='mej:coastal-ready')return;
 const p=active(),box=document.getElementById('mejCoastalOverlay');if(!box||String(p.id)!==activeProfile){close();return}
 const stage=Number(box.dataset.stage),grade=stage===0?1:Math.max(1,Math.min(12,stage)),token=window.__MEJ_ACCESS_ROLE==='student'?localStorage.getItem('MEJ_STUDENT_ACCESS_V1')||'':'';
 const owner=ownerPreview();
 // The selected learning stage (0-12), not the student's registered school grade, sets game difficulty.
 f.contentWindow.postMessage({type:'mej:coastal-init',stage,grade:Number.isInteger(grade)&&grade>=1&&grade<=12?grade:1,stageStars:owner?200:count(stage),accessToken:!owner&&/^[a-f0-9]{64}$/.test(token)?token:'',ownerPreview:owner},location.origin)
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('mejCoastalOverlay')){e.preventDefault();close()}});
function init(){
 const style=document.createElement('style');style.textContent='.mej-coastal-medal{display:flex!important;align-items:center;justify-content:center;flex-direction:column;gap:5px;min-height:145px;padding:9px 5px}.mej-coastal-medal img{width:min(90px,90%);height:auto;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 4px 6px #03284155)}.mej-coastal-medal.locked img{filter:grayscale(1);opacity:.35}.mej-coastal-medal strong{font-size:14px}.mej-coastal-medal small{font-size:11px}#mejCoastalOverlay{position:fixed;inset:0;z-index:2147483000;background:#05324c;display:flex;flex-direction:column;color:#fff}.mej-coastal-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;min-height:54px;padding:8px 13px;background:#075675;font:700 14px system-ui,Tahoma,sans-serif}.mej-coastal-top button{border:0;border-radius:10px;background:#ffe3a3;color:#16405c;padding:9px 13px;font-weight:800;cursor:pointer}#mejCoastalFrame{flex:1;min-height:0;width:100%;border:0;background:#072e44}';
 document.head.append(style);const app=document.getElementById('app');if(!app)return;repaint();new MutationObserver(()=>queueMicrotask(repaint)).observe(app,{childList:true,subtree:false})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();