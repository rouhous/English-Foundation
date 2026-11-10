#!/usr/bin/env python3
"""Safe UI hotfix: bounded skills renderer and voyage back button on levels."""
from pathlib import Path
import re, subprocess, tempfile
p=Path("index.html")
s=p.read_text("utf-8")
a=s.find("function skills(){")
b=s.find("function selectSkill(type){",a)
if a<0 or b<0 or b-a>7000:raise RuntimeError("Unexpected skills function boundaries")
new_skills=r'''function skills(){
 const host=document.getElementById('app');if(!host)return;
 try{
   const p=active(),all=byGrade;
   const base=Math.max(0,Math.min(12,Number(p.assigned)||0));
   let cap=p.diagnosed?base:0;
   while(p.diagnosed&&cap<12&&Array.isArray(all[cap])&&all[cap].length===200&&all[cap].every(q=>(p.correct||{})[q.id]>=2))cap++;
   const limit=window.__MEJ_ACCESS_ROLE==='owner'||window.__MEJ_ACCESS_ROLE==='student'?12:3;
   const last=p.diagnosed?Math.min(cap,limit):0;
   const counts=Object.create(null);
   for(let g=0;g<=last;g++){
     const questions=all[g]||[];
     for(const q of questions)counts[q.type]=(counts[q.type]||0)+1;
   }
   const types=['Phonics','Blend','Vocabulary','Spelling','Listening','Grammar','Reading','Writing','Writing Builder','Order','Match','Describe'];
   const symbols={Phonics:'🔤',Blend:'🧩',Vocabulary:'📚',Spelling:'✏️',Listening:'🎧',Grammar:'🧠',Reading:'📖',Writing:'📝'};
   const cards=types.filter(t=>counts[t]>0).map(t=>'<div class="info skill-item"><div class="bubble">'+(symbols[t]||'🎮')+'</div><h3>'+esc(t)+'</h3><p class="muted">'+counts[t]+' عنصر</p><button class="btn small" onclick="selectSkill('+jsStr(t)+')">تدرّب</button></div>').join('');
   host.innerHTML='<section class="card skill-center"><h1 class="section-title">🎯 مركز المهارات</h1><p class="skill-center-intro">اختر مهارة للتدريب من مستواك المفتوح.</p><div class="grid skill-cards">'+cards+'</div></section>'+
   '<div class="grid2"><section class="card"><h2 class="section-title">🎙️ نطق الكلمات • Speaking</h2><p>استمع إلى الكلمة وكررها في الميكروفون.</p><button class="btn mint" onclick="speakingStudio()">🎤 افتح تمارين النطق</button></section>'+
   '<section class="card"><h2 class="section-title">✍️ مهارة الكتابة • Writing</h2><p>تدريبات الفقرات والقصص والإيميلات.</p><button class="btn" onclick="writingStudio()" '+(last<8?'disabled':'')+'>✍️ افتح استوديو الكتابة (8+)</button></section></div>';
 }catch(err){
   console.error('Skills rendering failed',err);
   host.innerHTML='<section class="card"><h2>تعذر فتح المهارات</h2><p>يمكنك العودة إلى رحلتك دون فقدان التقدم.</p><button class="btn mint" onclick="route(&quot;journey&quot;)">⛵ العودة إلى رحلتي</button></section>';
 }
}
'''
s=s[:a]+new_skills+s[b:]
needle='<h1 class=\"section-title\">🗺️ خريطة رحلة التعلم</h1>'
if s.count(needle)!=1:raise RuntimeError("levels heading anchor count not 1")
s=s.replace(needle,needle+'<div class=\"actions\" style=\"margin:8px 0 14px\"><button type=\"button\" class=\"btn light\" onclick=\"route(\\'journey\\')\">⛵ العودة إلى رحلتي</button></div>',1)
assert s.count('⛵ العودة إلى رحلتي')>=2
with tempfile.TemporaryDirectory() as d:
 for i,b in enumerate(re.findall(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>',s,re.I)):
  if not b.strip() or 'type="application/json"' in b[:80]:continue
  f=Path(d)/f'inline{i}.js';f.write_text(b,encoding='utf8')
  r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError("Script "+str(i)+": "+r.stderr[:1000])
p.write_text(s,encoding='utf8')
print('PASS — safe skills and journey navigation repair confirmed')
