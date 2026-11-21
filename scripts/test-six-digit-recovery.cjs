// Static rollout checks; no production account credentials or records are used.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const backend=fs.readFileSync('admin-backend/supabase/functions/mej-student-account/index.ts','utf8');
const frontend=fs.readFileSync('assets/student-cloud-progress-v1.js','utf8');
new vm.Script(frontend,{filename:'student-cloud-progress-v1.js'});
assert.match(backend,/function code6\(\)/);
assert.doesNotMatch(backend,/code20\(\)/);
assert.match(backend,/action==='free_upgrade'/);
assert.match(backend,/validRecoveryCode\(code\)/);
assert.match(backend,/recovery_hash=eq\./);
assert.match(frontend,/upgradeCode\(p\)/);
assert.match(frontend,/normalizedRecovery\(codeInput\.value\)/);
assert.match(frontend,/navigator\.clipboard\.writeText\(shown\)/);
assert.match(frontend,/هل تريد المتابعة؟/);
function normalize(code){return String(code||'').trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).toUpperCase().replace(/[\s-]/g,'')}
function valid(code){const s=normalize(code);return /^[0-9]{6}$/.test(s)||/^[A-HJ-NP-Z2-9]{20}$/.test(s)}
for(const code of ['000001','123456','٠٠١٢٣٤','۱۲۳۴۵۶','ABCDEFGHJKLMNPQRSTUV','ABCDE-FGHJK-LMNPQ-RSTUV'])assert.equal(valid(code),true,code);
for(const code of ['12345','1234567','abcdef','0000000','ABCDEFGHJKLMNPQRSTU'])assert.equal(valid(code),false,code);
console.log('Six-digit recovery static checks and frontend syntax: PASS');
