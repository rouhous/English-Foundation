#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rename visible journey stages only. Internal grade/part IDs and storage do not change."""
from pathlib import Path
import re

path=Path("index.html")
doc=path.read_text(encoding="utf-8")
MARK="MEJ_PORT_12_ISLANDS_ARRIVAL_DEPARTURE_20261115"

if MARK in doc:
    print("ALREADY_APPLIED",MARK)
    raise SystemExit(0)

def change(old,new,expected=None):
    global doc
    n=doc.count(old)
    if expected is not None and n!=expected:
        raise RuntimeError(f"Unexpected match count {n}, wanted {expected} for {old[:120]!r}")
    if n:
        doc=doc.replace(old,new)
        print("REPLACED",n,repr(old[:65]))
    return n

helper="""// MEJ_PORT_12_ISLANDS_ARRIVAL_DEPARTURE_20261115
// These are display labels ONLY. The underlying g=0..12 and part=1..2 remain stable.
function mejVoyagePlace(g){
 const n=Number(g);
 if(!Number.isInteger(n)||n<0||n>12)return '⚓ الميناء';
 return n===0?'⚓ الميناء':'🏝️ الجزيرة '+n;
}
function mejVoyageLeg(part){return Number(part)===2?'مغادرة':'وصول'}
"""
change("function mejStageQuestions(g,part){",helper+"function mejStageQuestions(g,part){",1)

# Every card: g=0 is the port, g=1-12 are islands. The two halves of each
# existing question bank stay mapped to part 1 and part 2 respectively.
change("g===0?'🔤 مرحلة التأسيس':'🏝️ المرحلة '+g} • المستوى ${part} / 2",
       "mejVoyagePlace(g)} • ${mejVoyageLeg(part)}",1)

# Current Journey shows the place, rather than the legacy numeric level.
change("المستوى ${g} · ${esc(LV[g][0])}","${mejVoyagePlace(g)} · ${esc(LV[g][0])}",1)

# Clarify the journey architecture in the levels introduction.
change("لكل مرحلة مستويان للتعلم والتدريب.",
       "لكل محطة جزآن: وصول ثم مغادرة، للتعلم والتدريب.")
change("لفتح المراحل المناسبة لك.","لفتح محطات الرحلة المناسبة لك.")
change("أكمل المستوى الأول أولًا لفتح المستوى الثاني.",
       "أكمل الوصول أولًا لفتح المغادرة.")
change("المستوى مقفل. أكمل التشخيص وأتقن جميع أنشطة الجزيرة السابقة.",
       "هذه المحطة مقفلة. أكمل التشخيص وأتقن أنشطة المحطات السابقة.")
change("🎯 عنصر من 200 في المستوى","🎯 عنصر من 200 في المحطة")
change("المستوى صفر مفتوح للجميع","الميناء مفتوح للجميع")
change("المستوى صفر يبقى مفتوحًا للجميع.","الميناء يبقى مفتوحًا للجميع.")
change("ابدأ المستوى صفر أولًا","ابدأ من الميناء أولًا")
change("p.grade==='other'?'مرحلة التأسيس'","p.grade==='other'?'الميناء'")
change("المستوى التأسيسي متاح دائمًا، والمراحل الأعلى تُفتح بحسب التقدم.",
       "الميناء متاح دائمًا، والجزر التالية تُفتح بحسب التقدم.")
change("في كل مستوى مطلوب.","في كل محطة مطلوبة.")

# Numeric diagnostic level is still stored exactly as before, but its UI
# recommends a place in the voyage.
change("المستوى المقترح ${p.assigned}",
       "المحطة المقترحة ${mejVoyagePlace(p.assigned)}")
change("المستوى المقترح: <b>${s.placed}</b>",
       "المحطة المقترحة: <b>${mejVoyagePlace(s.placed)}</b>")
change("المستوى ${s.grade}: أتقنت",
       "${mejVoyagePlace(s.grade)}: أتقنت")
change("أسئلة من المستوى 0 حتى المستوى '+cap+' فقط.",
       "أسئلة من الميناء حتى '+mejVoyagePlace(cap)+' فقط.")

# In-game label is the island/port rather than an English numbered level.
change("Level ${q.g} • ${esc(q.type)}",
       "${mejVoyagePlace(q.g)} • ${esc(q.type)}")

# Navigation headings/buttons: 'stations' rather than 'levels'.
change("🗺️ المستويات","🗺️ المحطات")
change("<b>🏝️</b>المستويات","<b>🏝️</b>المحطات")
change("'المستويات'","'المحطات'")
change("خريطة المستويات","خريطة المحطات")
change("عودة إلى المستويات","عودة إلى المحطات")

assert MARK in doc
assert "g===0?'🔤 مرحلة التأسيس':'🏝️ المرحلة '+g} • المستوى ${part} / 2" not in doc
assert "mejVoyagePlace(g)} • ${mejVoyageLeg(part)}" in doc
assert "function mejStageQuestions(g,part){" in doc
assert "function mejPartUnlocked(g,part,p=active()){" in doc
assert "const LV=" in doc
assert "function maxAllowed(p=active()){" in doc
assert len(doc)>3000000  # large original app, not the maintenance page
path.write_text(doc,encoding="utf-8")
print("VOYAGE_LABELS_APPLIED",len(doc),"bytes; question IDs, progress and permissions untouched")
