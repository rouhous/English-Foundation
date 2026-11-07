#!/usr/bin/env python3
"""Extend verified cloud snapshot without changing local-first progress scoring."""
from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='MEJ_STUDENT_PRIVATE_CLOUD_BACKUP_V1'
if marker in s:
 print('ALREADY_PATCHED')
 raise SystemExit(0)
old='highestLevel:Math.max(0,Math.min(12,maxAllowed(profile))),levelStats'
assert s.count(old)==1, 'Expected one cloud report builder'
new='''highestLevel:Math.max(0,Math.min(12,maxAllowed(profile))),levelStats,
   /* MEJ_STUDENT_PRIVATE_CLOUD_BACKUP_V1: only learning state; never teacher code or auth secrets */
   privateState:{
    correct:profile.correct||{},wrong:profile.wrong||{},
    writing:profile.writing||{},
    activity:(profile.activity||[]).slice(-1500),
    diagnosticScore:profile.diagnosticScore??null,
    diagnosticDate:profile.diagnosticDate||'',
    journeyIsland:profile.journeyIsland??null
   }'''
s=s.replace(old,new,1)
p.write_text(s,encoding='utf8')
print('PRIVATE_SNAPSHOT_PATCHED')

# Trigger private cloud snapshot validation.
