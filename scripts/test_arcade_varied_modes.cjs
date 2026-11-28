'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('games/index.html','utf8');
const js=fs.readFileSync('games/arcade.js','utf8');
for(const mode of ['definitions','truefalse']){
 assert.match(html,new RegExp('data-game="'+mode+'"'),'missing arcade card: '+mode);
 assert.ok(js.includes(mode+':'),'missing mode registration: '+mode);
 assert.ok(js.includes("state.mode==='"+mode+"'"),'missing renderer: '+mode);
}
assert.ok(js.includes("word.en===current.en"),'reverse vocabulary answer check missing');
assert.ok(js.includes("(label==='True')===current.truth"),'true/false answer check missing');
assert.ok(js.includes('practice-only'),'arcade must remain supplementary practice');
assert.ok(js.includes('no cash, wallets or student mastery stars are written here'),'arcade must remain practice-only');
console.log('Arcade varied-mode checks passed.');
