import assert from 'node:assert/strict';
import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');
const app=text('index.html'),worker=text('sw.js'),bridge=text('coastal-arcade/app-bridge.js'),arcade=text('coastal-arcade/index.html');
const oldGate=text('games/release.js');
assert.match(app,/function journey\(\)/,'Original journey logic must remain');
assert.match(app,/coastal-arcade\/app-bridge\.js/,'Student bridge must load');
assert.match(worker,/COASTAL_BADGES/,'Offline badge asset list missing');
assert.match(worker,/coastal-arcade\/index\.html/,'Arcade missing from offline shell');
assert.match(oldGate,/MEJArcadeRelease\s*=\s*false/,'Old four-game preview must remain gated');
assert.match(bridge,/countMaster\(stage/,'Use actual mastery to unlock');
assert.match(bridge,/mej:coastal-init/,'Student grade and stage handshake missing');
assert.match(bridge,/grade=stage===0\?1:Math\.max\(1,Math\.min\(12,stage\)\)/,'Game content must use active learning stage instead of registered school grade');
assert.match(bridge,/MEJ_STUDENT_ACCESS_V1/,'Student identity linkage missing');
assert.ok(!/service_role|SUPABASE_SERVICE_ROLE_KEY/.test(bridge),'Server secret must stay off client');
assert.match(arcade,/mej:coastal-ready/,'Coastal iframe handshake missing');
assert.match(arcade,/mej-arcade-rewards/,'Dedicated student reward API missing');
assert.match(arcade,/mode.*student/,'Student mode missing');
assert.match(arcade,/CLIENT_REPORTED_UNVERIFIED|practiceOnly|practiceOnly/,'Practice fallback missing');
assert.match(arcade,/coast-10\.webp/,'Original badge images must be referenced');
assert.match(arcade,/mej:v10-finished/,'Gameplay completion must be handled');
assert.match(arcade,/mej:v10-replay/,'Replay must be handled');
assert.match(arcade,/mej:hidden-ready/,'Hidden Objects practice bridge missing');
let total=0;
for(let n=1;n<=10;n++){
 const p='coastal-arcade/badges/coast-'+String(n).padStart(2,'0')+'.webp';
 const image=fs.readFileSync(p);
 assert(image.length>8000,'Corrupt badge '+p);
 assert.equal(image.toString('ascii',0,4),'RIFF');
 assert.equal(image.toString('ascii',8,12),'WEBP');
 total+=image.length;
}
new Function(bridge);
for(const match of arcade.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
 if(match[1].trim())new Function(match[1]);
}
console.log('MEJ_COASTAL_LIVE_STATIC_PASS: restored journey, ten original WEBP badges, grade handoff, student bonus API, practice fallback, offline cache. Art bytes='+total);
