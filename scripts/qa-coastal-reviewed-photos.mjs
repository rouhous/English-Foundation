import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const arcade=fs.readFileSync('coastal-arcade/index.html','utf8');
const bridge=fs.readFileSync('coastal-arcade/app-bridge.js','utf8');
const embedded=arcade.split('\\n').find(line=>line.startsWith('window.MEJV11Inline='));
assert.ok(embedded,'Embedded coastal game is missing');
const parsed=JSON.parse(embedded.slice('window.MEJV11Inline='.length).replace(/;$/,''));
const game=parsed.game;
for (const [n,s] of [...game.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)].entries()){
  new vm.Script(s[1],{filename:'game-script-'+n+'.js'});
}
assert.match(game,/window\\.parent\\?\\.parent\\?\\.MEJ_APPROVED_IMAGES/,'Nested preview must access the main owner's photo bank');
assert.match(game,/function photoRecordsForGrade\\(/,'All picture games must use level-appropriate approved photos');
assert.match(game,/const visualDeck=variedDeck\\(photoRecordsForGrade\\(/,'Visual questions must rotate');
assert.match(game,/const source|function optionsFor\\(rec\\)\\{return \\[rec,\\.\\.\\.mix\\(visualDeck/,'Only photographed distractors');
assert.match(game,/if\\(game==='memory'\\)\\{[\\s\\S]*?const r=visualDeck\\[index\\]/,'Memory Cards must use verified photos');
assert.match(game,/if\\(game==='flip'\\)\\{if\\(!flipDeck\\.length\\)\\{const pairs=mix\\(group==='upper'\\?data\\[group\\]:visualDeck\\)/,'Lower and middle Flip Cards must use verified photos');
assert.match(game,/function paintPicture\\(/,'Single photo adapter must render approved images');
assert.doesNotMatch(game,/button\\.append\\(make\\('span','emoji'/,'No emoji placeholder in photo exercises');
assert.match(game,/const imageGame=/,'Must disable image round if ten photographed targets are unavailable');
assert.match(game,/photoQuarantineName\\(/,'Known mismatched examples must be excluded');
assert.match(bridge,/photoBank=20261115-v2/,'Coastal game query must request latest photo policy');
console.log('COASTAL_REVIEWED_PHOTOS_QA_PASS: approved photo routing, level scope, mismatch quarantine, picture games, syntax');
