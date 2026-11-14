import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright-core';

const base='http://127.0.0.1:8765/games/';
const source=fs.readFileSync('games/bank.js','utf8');
const ctx={window:{}};
vm.runInNewContext(source,ctx,{timeout:2000});
const bank=ctx.window.MEJArcadeBank;
assert.equal(Object.keys(bank).length,12);
for(let grade=1;grade<=12;grade++){
 const pack=bank[grade];
 assert.equal(pack.words.length,8,'Vocabulary grade '+grade);
 assert.equal(pack.sentences.length,4,'Sentences grade '+grade);
 assert.equal(pack.grammar.length,3,'Grammar grade '+grade);
 assert.equal(new Set(pack.words.map(x=>x.en)).size,8);
 for(const q of pack.grammar){
   assert.equal(q.options.length,4);
   assert.ok(q.options[q.answer], 'Correct grammar option '+grade);
 }
 for(const s of pack.sentences){
   assert.ok(s.text.endsWith('.'), 'Sentence punctuation '+grade);
   assert.ok(s.text.split(' ').length>=3, 'Sentence token length '+grade);
 }
}
console.log('Bank validated: 12 grades, 96 words, 48 sentences, 36 grammar questions');
const browserCandidates=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'];
const chromePath=browserCandidates.find(p=>fs.existsSync(p));
assert.ok(chromePath,'Expected Chrome/Chromium on CI runner');
const browser=await chromium.launch({headless:true,executablePath:chromePath,args:['--no-sandbox','--disable-dev-shm-usage']});
const issues=[];
browser.on('disconnected',()=>console.log('Browser disconnected'));
try{
 const desktop=await browser.newPage({viewport:{width:1280,height:850}});
 desktop.on('pageerror',e=>issues.push('desktop: '+e.message));
 await desktop.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await desktop.locator('body').getAttribute('data-state'),'locked','Maintenance gate must remain locked by default');
 assert.equal(await desktop.locator('#locked').isVisible(),true);
 assert.equal(await desktop.locator('.arcade').isVisible(),false);
 console.log('Maintenance gate: PASS');
 // Statically route the release flag to a test-only value. The repository's flag stays false.
 await desktop.route('**/games/release.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'window.MEJArcadeRelease=true;'}));
 await desktop.reload({waitUntil:'domcontentloaded'});
 await desktop.locator('body[data-state="open"]').waitFor();
 assert.equal(await desktop.locator('#gameGrid .game-card').count(),6);
 assert.equal(await desktop.locator('[data-game="hidden"]').isDisabled(),true);
 assert.equal(await desktop.locator('[data-game="sailor"]').isDisabled(),true);
 await desktop.screenshot({path:'games-qa-desktop.png',fullPage:true});
 console.log('Desktop game hub: PASS');
 await desktop.selectOption('#grade','9');
 await desktop.locator('[data-game="words"]').click();
 const english=(await desktop.locator('#prompt').textContent()).trim();
 const target=bank[9].words.find(w=>w.en===english);
 assert.ok(target,'Vocabulary question must come from selected grade');
 const opts=desktop.locator('#answers button');
 assert.equal(await opts.count(),4);
 let clicked=false;
 for(const b of await opts.all()){
  if(await b.getAttribute('aria-label')===target.ar){await b.click();clicked=true;break;}
 }
 assert.ok(clicked,'Correct vocabulary option must exist');
 await desktop.locator('#feedback.good').waitFor();
 assert.ok((await desktop.locator('#score').textContent()).includes('1 / 8'));
 await desktop.locator('#next').click();
 assert.ok((await desktop.locator('#round').textContent()).includes('2 / 8'));
 await desktop.locator('#exit').click();
 console.log('Vocabulary gameplay and exit: PASS');
 await desktop.locator('[data-game="grammar"]').click();
 const grammarPrompt=(await desktop.locator('#prompt').textContent()).trim();
 const grammar=bank[9].grammar.find(q=>q.q===grammarPrompt);
 assert.ok(grammar);
 const correct=grammar.options[grammar.answer];
 const grammarOptions=desktop.locator('#answers button');
 let grammarClicked=false;
 for(const b of await grammarOptions.all()){
  if((await b.textContent()).trim()===correct){await b.click();grammarClicked=true;break;}
 }
 assert.ok(grammarClicked);
 await desktop.locator('#feedback.good').waitFor();
 await desktop.locator('#exit').click();
 console.log('Grammar gameplay: PASS');
 await desktop.locator('[data-game="sentences"]').click();
 const visible=await desktop.locator('#wordBank button').allTextContents();
 const match=bank[9].sentences.find(s=>{
  const tokens=s.text.split(' ');
  return tokens.length===visible.length&&tokens.sort().join('|')===[...visible].sort().join('|');
 });
 assert.ok(match,'Sentence question must match a valid grade-specific prompt');
 await desktop.evaluate(text=>{
  for(const part of text.split(' ')){
   const b=[...document.querySelectorAll('#wordBank button')].find(x=>!x.disabled&&x.textContent===part);
   if(!b)throw new Error('Missing token '+part);
   b.click();
  }
 },match.text);
 await desktop.locator('#check').click();
 await desktop.locator('#feedback.good').waitFor();
 assert.ok((await desktop.locator('#score').textContent()).includes('1 / 4'));
 await desktop.locator('#exit').click();
 console.log('Sentence builder gameplay: PASS');
 await desktop.evaluate(()=>window.postMessage({type:'mej:arcade-init',stageStars:50,stage:9},location.origin));
 await desktop.locator('[data-game="hidden"]').waitFor({state:'visible'});
 assert.equal(await desktop.locator('[data-game="hidden"]').isEnabled(),true);
 assert.equal(await desktop.locator('[data-game="sailor"]').isEnabled(),true);
 await desktop.locator('[data-game="hidden"]').click();
 const gameFrame=desktop.frameLocator('iframe[title="Hidden Objects practice"]');
 await gameFrame.locator('.scene .spot').first().waitFor({timeout:30000});
 assert.ok(await gameFrame.locator('.scene .spot').count()>5);
 await desktop.locator('#exit').click();
 assert.equal(await desktop.locator('iframe').count(),0,'Closing must release iframe resources');
 console.log('Hidden Objects integration: PASS');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>issues.push('mobile: '+e.message));
 await mobile.route('**/games/release.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'window.MEJArcadeRelease=true;'}));
 await mobile.goto(base,{waitUntil:'domcontentloaded'});
 await mobile.locator('body[data-state="open"]').waitFor();
 const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=3,'Mobile page must not have major horizontal overflow: '+overflow);
 await mobile.selectOption('#grade','1');
 await mobile.locator('[data-game="words"]').click();
 assert.equal(await mobile.locator('#answers button').count(),4);
 await mobile.screenshot({path:'games-qa-mobile.png',fullPage:true});
 await mobile.locator('#exit').click();
 console.log('Mobile layout and touch: PASS');
 assert.deepEqual(issues,[],'JavaScript page errors: '+issues.join(' | '));
 console.log('All game arcade checks passed');
}finally{
 await browser.close();
}
