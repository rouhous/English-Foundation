#!/usr/bin/env python3
"""Remove report internals from public Settings while preserving sync functions."""
from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf8")
marker="MEJ_PUBLIC_SETTINGS_MINIMAL_V1"
if marker in s:
 print("Already updated");raise SystemExit(0)

def one(old,new,why):
 global s
 n=s.count(old)
 if n!=1: raise RuntimeError(f"{why}: expected 1, got {n}")
 s=s.replace(old,new,1)

# The visible status reports connectivity only, not server-generated opaque IDs.
old="""<div class="notice blue" id="journeySettingsStatus" style="overflow-wrap:anywhere;white-space:pre-wrap">${esc(p.syncStatus||'لم يُجرَ فحص بعد')}</div>"""
new="""<div class="notice blue" id="journeySettingsStatus">${esc(mejSimpleConnectionStatus(p.syncStatus))}</div>"""
one(old,new,"connection status")
ids=re.compile(r"""\s*<p style="font-size:12px;overflow-wrap:anywhere"><b>آخر رقم تقرير:</b> <span id="journeyLastReportId" dir="ltr">.*?</span></p>\s*<p style="font-size:12px;overflow-wrap:anywhere"><b>آخر تقرير مؤكد:</b> <span id="journeyConfirmedReportId" dir="ltr">.*?</span></p>""",re.S)
if len(ids.findall(s))!=1:raise RuntimeError("Report ID paragraphs cannot be identified uniquely")
s=ids.sub("",s,count=1)

card=re.compile(r"""\s*<div class="card" style="margin:12px 0;padding:14px"><h3>🧩 معلومات تقنية</h3>.*?</p></div>""",re.S)
if len(card.findall(s))!=1:raise RuntimeError("Technical card cannot be identified uniquely")
s=card.sub("",s,count=1)

old="""function refreshJourneySettingsStatus(){const p=active();const el=document.getElementById('journeySettingsStatus');if(el)el.textContent=p.syncStatus||'لا توجد تفاصيل';const last=document.getElementById('journeyLastReportId');if(last)last.textContent=p.lastReportId||'—';const ok=document.getElementById('journeyConfirmedReportId');if(ok)ok.textContent=p.lastConfirmedReport||'—';}"""
new="""// MEJ_PUBLIC_SETTINGS_MINIMAL_V1
function mejSimpleConnectionStatus(raw){
 const status=String(raw||'');
 if(/غير متصل|تعذر|فشل|خطأ|unavailable|offline|error/i.test(status))return '⚠️ تعذر الاتصال بالخدمة';
 if(/الاتصال بالخدمة|الوصول إلى خدمة الاستقبال ناجح|تم الاتصال|نجاح|successful/i.test(status))
  return '✅ الاتصال بالخدمة متاح';
 return navigator.onLine?'الاتصال بالإنترنت متاح':'غير متصل بالإنترنت';
}
function refreshJourneySettingsStatus(){const p=active();const el=document.getElementById('journeySettingsStatus');if(el)el.textContent=mejSimpleConnectionStatus(p.syncStatus);}"""
one(old,new,"status refresher")

assert marker in s
assert 'id="journeyLastReportId"' not in s
assert 'id="journeyConfirmedReportId"' not in s
assert '<h3>🧩 معلومات تقنية</h3>' not in s
assert 'function settingsCheckConnection()' in s
assert 'onclick="settingsCheckConnection()"' in s
assert 'function closeJourneySettings()' in s
p.write_text(s,encoding="utf8")
print("Removed technical report metadata; settings connection check preserved.")
