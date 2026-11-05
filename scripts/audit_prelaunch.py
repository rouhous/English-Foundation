#!/usr/bin/env python3
"""Non-destructive pre-release inspection; never reads user records or credentials."""
from pathlib import Path
import re, json
s=Path('index.html').read_text(encoding='utf-8')
patterns={
 'question_store':r'(?m)^.{0,120}(?:byGrade|q\.word|type===.Vocabulary.|imageSrc|imageUrl|wordImage|vocabImage).{0,180}$',
 'learning_render':r'(?m)^.{0,120}(?:function learnLevel|function displayQuestion|function home|function renderHome|function route|function active|registerStudent).{0,180}$',
 'data_security':r'(?m)^.{0,120}(?:localStorage|sessionStorage|fetch\(|script\.google|teacherCode|stars|leaderboard|className).{0,180}$',
 'viewport':r'(?m)^.{0,120}(?:mobile-ocean-v31|m31-head|m31-lower|mobile-home-fix\.css|viewport|height:100dvh).{0,180}$'
}
lines=s.splitlines()
out=[]
for label, pat in patterns.items():
 out.append('## '+label)
 selected=0
 for i,line in enumerate(lines):
  for m in re.finditer(pat,line,re.I):
   frag=line[max(0,m.start()-70):min(len(line),m.end()+70)]
   frag=re.sub(r'data:image/[^\s"\x27]{30,}', '[EMBEDDED_IMAGE]',frag)
   frag=re.sub(r'https://script\.google\.com/macros/s/[^/\s]+','[GOOGLE_SCRIPT_ENDPOINT]',frag)
   frag=frag[:350]
   out.append(f'{i+1}: {frag}')
   selected+=1
   if selected>=85: break
  if selected>=85:break
 out.append('MATCHED_LINES: '+str(selected))
out.append('\n## summary')
out.append('index_bytes: '+str(len(s.encode('utf8'))))
out.append('questions_occurrences: '+str(s.count('byGrade')))
out.append('has_mobile_css_link: '+str('mobile-home-fix.css' in s))
out.append('has_mej_home_mobile_patch: '+str('mej-home-mobile-viewport-v1' in s))

out.append('\n## key_functions_full')
for start in ['function learnLevel(', 'function displayQuestion(', 'function renderQuestion(', 'const BANK=', 'let BANK=', 'function register(', 'function home(', 'function route(', 'function imageHtml(', 'function save(']:
 pos=s.find(start)
 if pos<0: continue
 fragment=s[pos:pos+2600]
 fragment=re.sub(r'data:image/[^\\s"\\x27]{30,}', '[EMBEDDED_IMAGE]', fragment)
 out.append('START '+start+'\n'+fragment)


out.append('\n## stage1_diagnostic_functions')
for match in re.finditer(r'(?m)^function (?:diagnosticLanding|beginDiagnostic|startDiagnostic|endSession|beginStagePart|levels|checkAccess|beginLevel|skipQuestion|choose|submitTyped|processAnswer|diagnostic|permitted|award|endDiagnostic|gradeAnswer|placementPlan|placementCeiling|maxAllowed|mejStageQuestions|mejStageMastered|nextQuestion|achieved)\s*\(',s):
    st=match.start()
    tail=s[st:]
    nxt=re.search(r'\n(?:async )?function [A-Za-z_$][\w$]*\s*\(',tail[20:])
    length=(nxt.start()+20) if nxt else 8000
    frag=tail[:min(length,14000)]
    frag=re.sub(r'data:image/[^\s"\x27]{30,}', '[EMBEDDED_IMAGE]', frag)
    out.append(f'FUNCTION {match.group(0).strip()} @ {s[:st].count(chr(10))+1}\n'+frag)
Path('diagnostics/prelaunch-code-audit.txt').write_text('\n'.join(out),encoding='utf8')
print('Wrote non-sensitive diagnostic')
