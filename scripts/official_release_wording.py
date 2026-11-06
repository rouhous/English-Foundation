#!/usr/bin/env python3
"""Publish production-facing branding without weakening security gates."""
from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
mark='MEJ_PUBLIC_OFFICIAL_RELEASE_20261106'
if mark in s: raise SystemExit(0)
count={}
def replace_once(old,new,key):
 global s
 n=s.count(old)
 if n!=1:raise RuntimeError(f'{key}: expected one match, got {n}')
 s=s.replace(old,new,1)
 count[key]=n
replace_once('My English Journey V36 | STAGING','My English Journey | رحلتي مع الإنجليزية','page_title')
banner='🧪 هذه نسخة STAGING للتجارب فقط. التقارير المرسلة تستخدم أسماء ومعرّفات وهمية، ولا تُستخدم لبيانات الطلاب الحقيقية.'
if s.count(banner)!=1:raise RuntimeError('Expected staging banner missing')
s=s.replace('<div class="notice" style="font-weight:800;margin:8px 0">'+banner+'</div>','',1)
replace_once('V36 · STAGING Release Candidate','رحلتي مع الإنجليزية — الإصدار الرسمي','technical_card_version')
replace_once('My English Journey V36 - STAGING','My English Journey — Official Release','diagnostics_version')
replace_once('⏳ الاتصال بخادم STAGING...','⏳ جار الاتصال بالخدمة...','cloud_status')
old="<p class=\"ee-note\"><strong>STAGING فقط:</strong> اختبر بحسابات وهمية. بعد نجاح الاسترجاع على الجهاز الثاني سنراجع الحماية والتجهيز للإنتاج.</p>"
if s.count(old)!=1:raise RuntimeError('Expected recovery staging disclaimer missing')
s=s.replace(old,'',1)
s=s.replace('title="STAGING recovery connection"','title="اتصال استعادة التقدم"')
s=s.replace('>📨 إرسال تقرير تجريبي</button>','>📨 إرسال تقرير فحص</button>') # Preserve function and synthetic data safety
# Do not display the diagnostics or synthetic report actions to ordinary students.
s=s.replace('<button class="btn mint" onclick="settingsSendReport()">📨 إرسال تقرير فحص</button>','')
s=s.replace('<button class="btn light" onclick="copyJourneyDiagnostics()">📋 نسخ تفاصيل التشخيص</button>','')
s=s.replace("بيانات الطالب وإعدادات الاتصال والتشخيص.","بيانات الطالب والاتصال.")
# Technical function names and synthetic identifiers remain untouched to avoid
# silently turning testing records into apparently real student records.
s=s.replace('</head>','<!-- '+mark+' -->\n</head>',1)
assert s.count(mark)==1
p.write_text(s,encoding='utf-8')
print('Official public branding applied; backend test identifiers preserved for safety.')
