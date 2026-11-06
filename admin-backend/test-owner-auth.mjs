import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const port=18129;
const child=spawn(process.execPath,['admin-backend/server.mjs'],{
 env:{...process.env,PORT:String(port),GOOGLE_OAUTH_CLIENT_ID:'',MEJ_OWNER_GOOGLE_SUB:''},
 stdio:'ignore'
});
async function waitForHealth(){
 for(let n=0;n<60;n++){
  try{const r=await fetch('http://127.0.0.1:'+port+'/health');if(r.ok)return r.json()}catch(_){}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw new Error('Server did not start');
}
try{
 const h=await waitForHealth();
 assert.deepEqual(h,{ok:true,configured:false});
 const denied=await fetch('http://127.0.0.1:'+port+'/api/admin/me');
 assert.equal(denied.status,403);
 const data=await denied.json();
 assert.equal(data.error,'OWNER_AUTH_REQUIRED');
 const spoof=await fetch('http://127.0.0.1:'+port+'/api/admin/me',{
  headers:{Origin:'https://attacker.invalid',Authorization:'Bearer fake'}
 });
 assert.equal(spoof.status,403);
 const fake=await fetch('http://127.0.0.1:'+port+'/api/admin/me',{
  headers:{Origin:'https://rouhous.github.io',Authorization:'Bearer fake'}
 });
 assert.equal(fake.status,403);
 const missing=await fetch('http://127.0.0.1:'+port+'/api/admin/unknown');
 assert.equal(missing.status,404);
 console.log('OWNER_AUTH_GATE_SMOKE_PASSED: unconfigured, spoofed and fake callers rejected');
}finally{
 child.kill('SIGTERM');
}
