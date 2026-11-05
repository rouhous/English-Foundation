#!/usr/bin/env python3
"""Stage 2 static validation: syntax, local consistency, and server envelope tests."""
from pathlib import Path
import re, json, subprocess, tempfile
root=Path('.')
html=(root/'index.html').read_text(encoding='utf8')
server=(root/'Code.gs').read_text(encoding='utf8')
assert html.count('MEJ_STAGE2_LOCAL_STAR_CONSISTENCY_V1')==1
assert 'function mejReconcileLocalStars(profile)' in html
assert 'function persist(send=true){mejReconcileLocalStars(active());' in html
assert server.count('CLIENT_REPORTED_UNVERIFIED')>=4
assert 'wadiValidateProgressEnvelope_(d);' in server
assert 'STALE_IGNORED' in server
assert 'scoreVerification' in server
assert "function testStage2Envelope_()" in server
with tempfile.TemporaryDirectory() as temp:
 d=Path(temp)
 for i,script in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',html,re.S|re.I)):
  if not script.strip():continue
  f=d/f'inline-{i}.js';f.write_text(script,encoding='utf8')
  r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError('Client JavaScript syntax '+str(i)+': '+r.stderr[:1000])
 f=d/'Code.js';f.write_text(server,encoding='utf8')
 r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError('Apps Script JavaScript syntax: '+r.stderr[:1000])
 tester='const fs=require("fs"),vm=require("vm");let s=fs.readFileSync(process.argv[1],"utf8");let result=vm.runInNewContext(s+"\\ntestStage2Envelope_()",{});if(result!=="STAGE2_ENVELOPE_CHECKS_PASSED")throw Error(result);'
 r=subprocess.run(['node','-e',tester,str(f)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError('Server envelope unit tests: '+r.stderr[:1000])
# Exercise the real deterministic scoring function on malformed and duplicate states.
match=re.search(r'function mejReconcileLocalStars\\(profile\\)\\{[\\s\\S]*?^\\}',html,re.M)
if not match:raise RuntimeError('Local star reconciliation function not found')
star_test=(
 'const questionById={A:{},B:{},C:{}};\\n'+match.group(0)+
 '\\nconst p={stars:999,correct:{A:2,B:2,C:1,unknown:2}};'
 'if(mejReconcileLocalStars(p)!==2||p.stars!==2)throw Error("Recount failed");'
 'if(mejReconcileLocalStars(p)!==2)throw Error("Non-idempotent recount");'
 'p.correct.A=1;'
 'if(mejReconcileLocalStars(p)!==1)throw Error("Incorrect downgrade handling");'
)
result=subprocess.run(['node','-e',star_test],capture_output=True,text=True)
if result.returncode:raise RuntimeError('Local score behavior test: '+result.stderr[:1000])
report={
 'status':'STAGE2_STATIC_CHECKS_PASSED',
 'local_star_reconciliation':'derived_from_unique_mastered_question_ids',
 'server_input_validation':'bounds_and_correct_attempt_consistency',
 'offline_stale_reports':'ignored_without_replacing_newer_star_total',
 'server_score_label':'CLIENT_REPORTED_UNVERIFIED',
 'fully_authenticated_students':False,
 'server_verified_answers':False,
 'server_deployment_verified':False,
 'safe_for_real_student_leaderboards':False,
 'note':'Static tests only. Must deploy revised Apps Script and implement per-student authentication plus authoritative server-side scoring before public launch.'
}
(root/'diagnostics/stage2-security-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
