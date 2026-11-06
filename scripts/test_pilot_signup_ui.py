from pathlib import Path
import re,subprocess,tempfile
owner=Path('reviews/owner-login.html').read_text(encoding='utf8')
full=Path('reviews/pilot-full.html').read_text(encoding='utf8')
app=Path('index.html').read_text(encoding='utf8')
assert '<section id="privateArea" hidden>' in owner
assert '<section id="teacherPanel" hidden>' in owner
assert 'teacherPanel.hidden=false' in owner
assert 'ownerCredential=response.credential' in owner
assert 'mej-pilot-teacher-approve' in owner
assert "if(!ownerCredential)return" in owner
assert 'https://wa.me/96898262956' in full
assert 'MEJ_PILOT_CAPACITY_STUDENT_GATE_V1' in app
assert "mejPilotReserveStudent(p.id)" in app
assert "await mejPilotMayCreateStudent()" in app
assert "MEJ_PILOT_REGISTER_URL" in app
assert "100 طالب" not in Path('LICENSE').read_text()
assert "10 معلمين" not in Path('LICENSE').read_text()
with tempfile.TemporaryDirectory() as tmp:
 for file in ('reviews/owner-login.html','index.html'):
  page=Path(file).read_text(encoding='utf8')
  for i,code in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',page,re.I|re.S)):
   if code.strip():
    js=Path(tmp)/f'{Path(file).stem}-{i}.js'
    js.write_text(code,encoding='utf8')
    completed=subprocess.run(['node','--check',str(js)],text=True,capture_output=True)
    if completed.returncode:raise AssertionError(f'{file} script {i}: {completed.stderr}')
print('PILOT_INTERFACE_AND_INLINE_JS_PASSED')
