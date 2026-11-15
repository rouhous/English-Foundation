#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Use grade names on voyage cards rather than lesson titles/descriptions.

Presentation-only change. Keeps LV curriculum metadata, source questions,
mastery, grades (0..12), parts (1/2), stars and all storage keys intact.
"""
from pathlib import Path
from collections import Counter

path=Path("index.html")
doc=path.read_text(encoding="utf-8")
marker="MEJ_VOYAGE_GRADE_LABELS_20261115"
if marker in doc:
    print("ALREADY_APPLIED",marker)
    raise SystemExit(0)

assert "MEJ_PORT_12_ISLANDS_ARRIVAL_DEPARTURE_20261115" in doc
assert len(doc)>3000000, "Not the full student app"

def replace_once(old,new):
    global doc
    found=doc.count(old)
    if found!=1:
        raise RuntimeError("Anchor count must be 1, got "+str(found)+": "+old[:130])
    doc=doc.replace(old,new,1)

anchor="function mejVoyageLeg(part){return Number(part)===2?'مغادرة':'وصول'}"
helper="""// MEJ_VOYAGE_GRADE_LABELS_20261115
// Names of school grades. Stage IDs (0..12) and internal level parts do not change.
function mejVoyageGrade(g){
 const labels=['التأسيسي','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
 const n=Number(g);
 return Number.isInteger(n)&&n>=0&&n<labels.length?'الصف '+labels[n]:'الصف غير محدد';
}
"""
replace_once(anchor,anchor+"\n"+helper)
# The 26 arrival/departure cards currently show English lesson titles and
# their English learning-topic subline. Use grade only and omit that subline.
replace_once(
    '<h3>${esc(LV[g][0])}</h3><p>${esc(LV[g][1])}</p>',
    '<h3>${esc(mejVoyageGrade(g))}</h3>'
)
# Align the current-island summary with the same school-grade label.
replace_once(
    '${mejVoyagePlace(g)} · ${esc(LV[g][0])}',
    '${mejVoyagePlace(g)} · ${esc(mejVoyageGrade(g))}'
)

assert doc.count(marker)==1
assert "mejVoyagePlace(g)} • ${mejVoyageLeg(part)}" in doc
assert "function mejStageQuestions(g,part){" in doc
assert "function mejPartUnlocked(g,part,p=active()){" in doc
assert "function maxAllowed(p=active()){" in doc
assert "const LV=" in doc, "Keep teaching metadata for other pages"
assert "<h3>${esc(LV[g][0])}</h3><p>${esc(LV[g][1])}</p>" not in doc
assert "<h3>${esc(mejVoyageGrade(g))}</h3>" in doc
assert "الصف الثاني عشر" not in doc  # dynamically assembled at render time
path.write_text(doc,encoding="utf-8")
print("GRADE_LABEL_UI_PATCH_OK",len(doc),"bytes")
