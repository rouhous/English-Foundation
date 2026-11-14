import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {chromium} from 'playwright-core';

const base='http://127.0.0.1:8765/games/';
const source=fs.readFileSync('games/bank.js','utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox,{timeout:2000});
const bank=sandbox.window.MEJArcadeBank;
assert.equal(Object.keys(bank).length,12);
for(let g=1;g<=12;g++){
 const data=bank[g];
 assert.equal(data.words.length,8,'Grade '+g+' vocabulary');
 assert.equal(data.sentences.length,4,'Grade '+g+' sentences');
 assert.equal(data.grammar.length,3,'Grade '+g+' grammar');
 assert.equal(new Set(data.words.map(w=>w.en)).size,8);
 for(const q of data.grammar){
  assert.equal(q.options.length,4);
  assert.ok(Number.isInteger(q.answer) && q.answer>=0 && q.answer<4);
  assert.ok(q.why);
 }
}
console.log('Curriculum-themed supplementary bank: 12 grades / 96 words / 48 sentences / 36 grammar questions');
const chromePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'].find(p=>fs.existsSync(p));
assert.ok(chromePath,'Expected Google Chrome or Chromium on runner');
const browser=await chromium.launch({headless:true,executablePath:chromePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const issues=[];
const hostHtml=String.raw`<!doctype html><html lang="ar"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100dvh;display:block}</style></head><body><script>window.addEventListener('message',function(e){const child=document.getElementById('qaGame');if(child&&e.origin===location.origin&&e.source===child.contentWindow&&e.data?.type==='mej:arcade-ready'){e.source.postMessage({type:'mej:arcade-init',stageStars:0,stage:9},location.origin);}});</script><iframe id="qaGame" src="/games/index.html"></iframe></body></html>`;
const unlock=(page,stars,stage=9)=>page.evaluate(({stars,stage})=>document.getElementById('qaGame').contentWindow.postMessage({type:'mej:arcade-init',stageStars:stars,stage},location.origin),{stars,stage});
try{
 const desktop=await browser.newPage({viewport:{width:1280,height:850}});
 desktop.on('pageerror',e=>issues.push('desktop: '+e.message));
 await desktop.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('body').getAttribute('data-state'),'locked');
 assert.equal(await desktop.locator('#locked').isVisible(),true);
 console.log('Maintenance remains enabled: PASS');
 await desktop.route('**/games/release.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'window.MEJArcadeRelease=true;'}));
 await desktop.reload({waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('body').getAttribute('data-state'),'locked','Standalone page must remain locked even with preview flag');
 await desktop.route('**/qa-arcade-host',route=>route.fulfill({status:200,contentType:'text/html',body:hostHtml}));
 await desktop.goto('http://127.0.0.1:8765/qa-arcade-host');
 const game=desktop.frameLocator('#qaGame'),child=desktop.frame({url:/\/games\/index\.html/});
 assert.ok(child,'Expected embedded arcade frame');
 await game.locator('body[data-state="open"]').waitFor();
 assert.equal(await game.locator('#gameGrid .game-card').count(),6);
 assert.equal(await game.locator('[data-game="hidden"]').isDisabled(),true);
 assert.equal(await game.locator('[data-game="sailor"]').isDisabled(),true);
 await child.evaluate(()=>window.postMessage({type:'mej:arcade-init',stageStars:200,stage:9},location.origin));
 await desktop.waitForTimeout(200);
 assert.equal(await game.locator('[data-game="hidden"]').isDisabled(),true,'Self-postMessage must not unlock games');
 await unlock(desktop,20);
 await child.waitForFunction(()=>!document.querySelector('[data-game="hidden"]').disabled);
 assert.equal(await game.locator('[data-game="sailor"]').isDisabled(),true,'Omani Sailor requires second badge at 40 stars');
 await unlock(desktop,40);
 await child.waitForFunction(()=>!document.querySelector('[data-game="sailor"]').disabled);
 console.log('Trusted iframe handshake and 20/40 star gates: PASS');
 await desktop.screenshot({path:'games-qa-desktop.png',fullPage:true});
 await game.locator('#grade').selectOption('9');
 await game.locator('[data-game="words"]').click();
 const english=(await game.locator('#prompt').textContent()).trim();
 const target=bank[9].words.find(w=>w.en===english);
 assert.ok(target);
 assert.equal(await game.locator('#answers button').count(),4);
 let clicked=false;
 for(const b of await game.locator('#answers button').all()){
  if(await b.getAttribute('aria-label')===target.ar){await b.click();clicked=true;break;}
 }
 assert.ok(clicked);
 await game.locator('#feedback.good').waitFor();
 assert.match(await game.locator('#score').textContent(),/1 \/ 8/);
 await game.locator('#next').click();
 assert.match(await game.locator('#round').textContent(),/2 \/ 8/);
 await game.locator('#exit').click();
 console.log('Vocabulary gameplay: PASS');
 await game.locator('[data-game="grammar"]').click();
 const grammarPrompt=(await game.locator('#prompt').textContent()).trim();
 const grammar=bank[9].grammar.find(q=>q.q===grammarPrompt);
 assert.ok(grammar);
 const answer=grammar.options[grammar.answer];
 let correct=false;
 for(const btn of await game.locator('#answers button').all()){
  if((await btn.textContent()).trim()===answer){await btn.click();correct=true;break;}
 }
 assert.ok(correct);
 await game.locator('#feedback.good').waitFor();
 await game.locator('#exit').click();
 console.log('Grammar explanations and feedback: PASS');
 await game.locator('[data-game="sentences"]').click();
 const tokens=await game.locator('#wordBank button').allTextContents();
 const sentence=bank[9].sentences.find(s=>{
  const a=s.text.split(' ');
  return a.length===tokens.length&&a.sort().join('|')===[...tokens].sort().join('|');
 });
 assert.ok(sentence);
 await child.evaluate(text=>{
  for(const token of text.split(' ')){
   const btn=[...document.querySelectorAll('#wordBank button')].find(b=>!b.disabled&&b.textContent===token);
   if(!btn)throw new Error('Missing word '+token);
   btn.click();
  }
 },sentence.text);
 await game.locator('#check').click();
 await game.locator('#feedback.good').waitFor();
 await game.locator('#exit').click();
 console.log('Sentence-building interaction: PASS');
 await game.locator('#grade').selectOption('5');
 await game.locator('[data-game="hidden"]').click();
 const hunt=game.frameLocator('iframe[title="Hidden Objects practice"]');
 await hunt.locator('.scene .spot').first().waitFor({timeout:30000});
 assert.match(await hunt.locator('#stage').textContent(),/الجزيرة 9/,'Actual host island must override grade selector for hunt');
 assert.match(await hunt.locator('#instruction').textContent(),/التدريب/,'Hunt must clearly be practice-only');
 await game.locator('#exit').click();
 assert.equal(await game.locator('iframe').count(),0);
 console.log('Hidden Objects practice and return: PASS');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>issues.push('mobile: '+e.message));
 await mobile.route('**/games/release.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'window.MEJArcadeRelease=true;'}));
 await mobile.route('**/qa-arcade-host',route=>route.fulfill({status:200,contentType:'text/html',body:hostHtml}));
 await mobile.goto('http://127.0.0.1:8765/qa-arcade-host');
 const mGame=mobile.frameLocator('#qaGame'),mChild=mobile.frame({url:/\/games\/index\.html/});
 await mGame.locator('body[data-state="open"]').waitFor();
 const overflow=await mChild.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=3,'Mobile horizontal overflow '+overflow);
 await mGame.locator('#grade').selectOption('1');
 await mGame.locator('[data-game="words"]').click();
 assert.equal(await mGame.locator('#answers button').count(),4);
 await mobile.screenshot({path:'games-qa-mobile.png',fullPage:true});
 await mGame.locator('#exit').click();
 console.log('Mobile responsive layout: PASS');
 assert.deepEqual(issues,[],'Uncaught page errors: '+issues.join(' | '));
 console.log('All arcade browser checks passed');
}finally{
 await browser.close();
}
