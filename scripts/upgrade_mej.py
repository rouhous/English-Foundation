#!/usr/bin/env python3
"""Upgrade the existing complete, self-contained My English Journey HTML in place."""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8")
if "function mejStageQuestions(" in s:
    print("Already upgraded");raise SystemExit(0)
start=s.find("function levels(){")
end=s.find("// The school grade limits",start)
if start<0 or end<0: raise RuntimeError("Cannot identify stage renderer")
upgrade=r"""function mejStageQuestions(g,part){const all=byGrade[g]||[];const half=Math.ceil(all.length/2);return part===1?all.slice(0,half):all.slice(half)}
function mejStageMastered(g,part,p=active()){return mejStageQuestions(g,part).filter(q=>(p.correct||{})[q.id]>=2).length}
function beginStagePart(g,part){if(!checkAccess(g))return;const p=active();const pool=mejStageQuestions(g,part);if(!pool.length){toast('لا توجد أسئلة لهذه المجموعة بعد.');return}const pending=pool.filter(q=>(p.correct[q.id]||0)<2);const ids=shuffle(pending.length?pending:pool).slice(0,Math.min(12,pool.length)).map(q=>q.id);activeSession={kind:'practice',grade:g,stagePart:part,ids,index:0,score:0,mistakes:[],responses:[]};displayQuestion()}
function levels(){const p=active();document.getElementById('app').innerHTML=`<section class="card"><h1 class="section-title">🗺️ خريطة رحلة التعلم</h1><p class="caption">لكل مرحلة مستويان للتعلم والتدريب. يُحسب إتقان السؤال بعد إجابتين صحيحتين.</p>${!p.diagnosed?'<div class="notice">🔒 ابدأ اختبار تحديد المستوى لفتح المراحل المناسبة لك.</div>':''}<div class="actions"><button class="btn light" onclick="route('diagnostic')">🧭 التشخيص</button></div></section><div class="levels">${Array.from({length:13},(_,g)=>g).filter(g=>permitted(g)).flatMap(g=>[1,2].map(part=>{const pool=mejStageQuestions(g,part),m=mejStageMastered(g,part,p),total=pool.length;return `<div class="level"><span class="level-index">${g===0?'🔤 مرحلة التأسيس':'🏝️ المرحلة '+g} • المستوى ${part} / 2</span><h3>${esc(LV[g][0])}</h3><p>${esc(LV[g][1])}</p><div class="meter"><i style="width:${pct(m,total)}%"></i></div><div class="ministats" style="margin-top:8px"><b>${m}/${total}</b> • ${pct(m,total)}%</div><div class="actions"><button class="btn small mint" onclick="beginStagePart(${g},${part})">▶ لعب</button><button class="btn small light" onclick="learnLevel(${g},${part})">📘 تعلّم</button></div></div>` })).join('')}</div>`}
"""
# raw string above uses escaped JS backtick/dollar for Python source convenience
upgrade=upgrade.replace(r"\`","`").replace(r"\${","${")
s=s[:start]+upgrade+s[end:]
old="function learnLevel(g){if(!checkAccess(g))return;let items=byGrade[g].filter(q=>q.word&&q.type==='Vocabulary');"
if old not in s:raise RuntimeError("Learning entry not found")
s=s.replace(old,"function learnLevel(g,part=null){if(!checkAccess(g))return;let items=(part?mejStageQuestions(g,part):byGrade[g]).filter(q=>q.word&&q.type==='Vocabulary');",1)
s=s.replace("if(g===0){items=byGrade[0].filter(q=>q.type==='Blend').slice(0,60)}","if(g===0){items=(part?mejStageQuestions(0,part):byGrade[0]).filter(q=>q.type==='Blend').slice(0,60)}",1)
boat=re.search(r'class="actual-boat" src="(data:image/[^"]+)"',s)
art=re.search(r'<div class="m31-art" aria-hidden="true"><img src="(data:image/[^"]+)" alt="" /></div>',s)
if not boat or not art:raise RuntimeError("Existing home art not found")
s=s[:art.start()]+'<div class="m31-art" aria-hidden="true"><img class="m31-sea" src="'+art.group(1)+'" alt="" /><img class="m31-boat-restored" src="'+boat.group(1)+'" alt="" /></div>'+s[art.end():]
style="""<style id="mej-stage-scenery-fix">
@media(max-width:900px){#app .m31-art img.m31-sea{height:100%!important;object-fit:cover!important}#app .m31-art img.m31-boat-restored{position:absolute!important;top:31%!important;left:2%!important;width:96%!important;height:auto!important;min-height:0!important;max-height:49%!important;object-fit:contain!important;object-position:center center!important;filter:drop-shadow(0 12px 9px #06457445)!important}}
</style>"""
if "</head>" not in s:raise RuntimeError("No document head")
s=s.replace("</head>",style+"</head>",1)
assert s.count("function mejStageQuestions(")==1
assert "m31-boat-restored" in s and "beginStagePart(" in s
p.write_text(s,encoding="utf-8")
print("Upgraded two sublevels and restored embedded boat scenery")
