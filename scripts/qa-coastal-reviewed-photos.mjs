import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const arcade=fs.readFileSync('coastal-arcade/index.html','utf8');
const bridge=fs.readFileSync('coastal-arcade/app-bridge.js','utf8');
const embedded=arcade.split('\n').find(line=>line.startsWith('window.MEJV11Inline='));
assert.ok(embedded,'Embedded coastal game is missing');
const parsed=JSON.parse(embedded.slice('window.MEJV11Inline='.length).replace(/;$/,''));
const game=parsed.game;
const scripts=[...game.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.ok(scripts.length>=4,'Expected the embedded game scripts');
scripts.forEach((match,index)=>new vm.Script(match[1],{filename:'embedded-game-'+index+'.js'}));

const requirements=[
 ['main app parent image bank','window.parent?.parent?.MEJ_APPROVED_IMAGES'],
 ['approved image bank reader','function photoSources(word)'],
 ['grade-scoped photo pool','function photoRecordsForGrade()'],
 ['image question rotation',"visualDeck=variedDeck(photoRecordsForGrade()"],
 ['photo-only distractors',"function optionsFor(rec){return [rec,...mix(visualDeck.filter"],
 ['Memory Cards pictures',"const r=visualDeck[index],others=mix(visualDeck.filter"],
 ['Flip Cards images',"group==='upper'?data[group]:visualDeck"],
 ['Listening Safari images',"if(game==='safari'){const r=visualDeck[index]"],
 ['Sound Maze images',"if(game==='maze'){const r=visualDeck[index]"],
 ['picture-match photo painter',"function paintPicture(button,rec)"],
 ['incomplete bank guard','if(imageGame&&visualDeck.length<10)'],
 ['known mismatched examples quarantine',"photoQuarantineName(name)"]
];
for(const [name,signature] of requirements)assert.ok(game.includes(signature),name+' regression');
assert.ok(!game.includes("button.append(make('span','emoji'"),'No emoji substitutes for approved photographs');
assert.ok(bridge.includes('photoBank=20261115-v2'),'Coastal cache bust version must match');
console.log('COASTAL_REVIEWED_PHOTOS_QA_PASS: all photo-based games share verified assets; compiled 5 scripts');
