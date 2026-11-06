import { test } from 'node:test';
import assert from 'node:assert/strict';
import {GET,OPTIONS} from '../api/admin/me.mjs';

test('missing bearer token denies access',async()=>{
 const response=await GET(new Request('https://verify.example/api/admin/me'));
 assert.equal(response.status,403);
 assert.deepEqual(await response.json(),{ok:false,error:'OWNER_AUTH_REQUIRED'});
});
test('fake Google credential denies access',async()=>{
 const response=await GET(new Request('https://verify.example/api/admin/me',{
  headers:{Authorization:'Bearer fake-token',Origin:'https://rouhous.github.io'}
 }));
 assert.equal(response.status,403);
 assert.equal(response.headers.get('access-control-allow-origin'),'https://rouhous.github.io');
});
test('other origin denied before authorization',async()=>{
 const response=await GET(new Request('https://verify.example/api/admin/me',{
  headers:{Origin:'https://attacker.example'}
 }));
 assert.equal(response.status,403);
 assert.equal(response.headers.get('access-control-allow-origin'),null);
});
test('CORS preflight restricted to GitHub Pages',async()=>{
 const good=await OPTIONS(new Request('https://verify.example/api/admin/me',{method:'OPTIONS',headers:{Origin:'https://rouhous.github.io'}}));
 assert.equal(good.status,204);
 const bad=await OPTIONS(new Request('https://verify.example/api/admin/me',{method:'OPTIONS',headers:{Origin:'https://attacker.example'}}));
 assert.equal(bad.status,403);
});
