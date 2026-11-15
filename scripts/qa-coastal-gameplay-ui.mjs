import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const origin='http://127.0.0.1:8765';
const chrome=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>fs.existsSync(p));
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(chrome?{executablePath:chrome}:{})});
const errors=[];
try{
 const source=await browser.newPage();
 source.on('pageerror',e=>errors.push('host: '+e.message));
 await source.goto(origin+'/coastal-arcade/index.html?mode=owner',{waitUntil:'domcontentloaded'});
 const template=await source.evaluate(()=>window.MEJV11Inline?.game);
 assert.ok(template?.includes('MEJ ARCADE MOBILE GRID AND SURVIVAL FIX'),'Updated embedded game missing');
 await source.close();

 async function pageFor(game,grade=8,width=390,autoStart=true){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(game+': '+e.message));
  const ctx='<script>window.MEJ_GAME_CONTEXT={search:'+JSON.stringify('?game='+game+'&grade='+grade+'&run=1')+'}</script>';
  await page.setContent(template.replace('<!-- MEJ_INLINE_CONTEXT -->',ctx),{waitUntil:'load'});
  if(autoStart)await page.locator('#start').click();
  return page;
 }
 async function checkGrid(page,selector,columns,expected,label){
  const els=page.locator(selector);
  assert.equal(await els.count(),expected,label+' card count');
  const geo=await els.evaluateAll(items=>items.map(n=>{
   const r=n.getBoundingClientRect();
   return {x:r.x,y:r.y,w:r.width,h:r.height};
  }));
  const first=geo.filter(g=>Math.abs(g.y-geo[0].y)<3).sort((a,b)=>a.x-b.x);
  assert.equal(first.length,columns,label+' column count');
  for(const g of geo)assert.ok(Math.abs(g.w-g.h)<5,label+' square aspect ratio');
  for(let i=1;i<first.length;i++)assert.ok(first[i].x-(first[i-1].x+first[i-1].w)>=9,label+' spacing');
  const grid=await page.locator(selector).first().evaluate(el=>getComputedStyle(el.parentElement).display);
  assert.equal(grid,'grid',label+' layout');
 }
 {
  const p=await pageFor('flip');
  await checkGrid(p,'#scene .flip-grid .tile',3,10,'Flip Cards');
  await p.screenshot({path:'arcade-qa-flip-mobile.png',fullPage:true});
  await p.close();
 }

 {
  const p=await pageFor('flip',12,390,false);
  await p.evaluate(()=>{
   const list=MEJV10Data.upper;
   const i=list.findIndex(x=>x[0]==='collaboration');
   if(i>=0)list.unshift(...list.splice(i,1));
   Math.random=()=>.5;
  });
  await p.locator('#start').click();
  await p.locator('.flip-hint').click();
  await p.locator('.flip-grid .flip-word.flip-open').first().waitFor();
  await p.waitForTimeout(160);
  const words=await p.locator('.flip-grid .flip-word.flip-open').evaluateAll(cards=>cards.map(el=>({
   word:el.innerText,font:getComputedStyle(el).fontSize,wrap:getComputedStyle(el).whiteSpace,
   scroll:el.scrollWidth,client:el.clientWidth,height:el.clientHeight
  })));
  assert.ok(words.some(w=>w.word==='collaboration'),'Advanced Flip Cards must include collaboration');
  for(const w of words){
   assert.equal(w.wrap,'nowrap','Flip Cards must not split '+w.word);
   assert.ok(w.scroll<=w.client+2,'Flip Cards must fit '+w.word+' (width '+w.scroll+'/'+w.client+', font '+w.font+')');
  }
  await p.screenshot({path:'arcade-qa-flip-advanced-mobile.png',fullPage:true});
  await p.close();
 }
 {
  const p=await pageFor('memory');
  await checkGrid(p,'#scene .memory-grid .tile',2,6,'Memory Cards');
  await p.locator('.memory-start').click();
  const first=await p.locator('.memory-grid .memory-number').first().innerText();
  assert.equal(first,'1','Memory: reveal numbered backs');
  await checkGrid(p,'#scene .memory-grid .tile',2,6,'Memory Cards hidden');
  await p.screenshot({path:'arcade-qa-memory-mobile.png',fullPage:true});
  await p.close();
 }
 {
  const p=await pageFor('sentence');
  const bank=p.locator('#scene .sentence-bank .token'),verify=p.locator('#scene .sentence-verify');
  assert.ok(await bank.count()>=4,'Sentence Builder: words are displayed');
  assert.ok(await verify.isVisible(),'Sentence Builder: verify button visible');
  await bank.first().click();
  assert.equal(await p.locator('.sentence-slots .token').count(),1,'Sentence Builder: selected token');
  const panel=await p.locator('.sentence-bank').boundingBox(),button=await verify.boundingBox();
  assert.ok(button.y>=panel.y+panel.height-2,'Sentence Builder: button not overlaid on word bank');
  await p.screenshot({path:'arcade-qa-sentence-mobile.png',fullPage:true});
  await p.close();
 }
 {
  const p=await pageFor('falling');
  await p.waitForSelector('.falling-sky .falling-bubble',{timeout:6000});
  const bubble=await p.locator('.falling-sky .falling-bubble').first().boundingBox();
  assert.ok(bubble.width<=84&&bubble.height<=52,'Falling Words: bubbles must be small');
  await p.waitForFunction(()=>document.querySelector('.falling-pile')?.children.length>0,null,{timeout:18000});
  const count=await p.locator('.falling-pile .falling-bubble').count();
  assert.ok(count>0,'Falling Words: bubble must enter basket');
  const direction=await p.locator('.falling-box-count').evaluate(el=>getComputedStyle(el).direction);
  assert.equal(direction,'ltr','Falling Words: basket count direction');
  const pile=await p.locator('.falling-pile').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length}));
  assert.ok(pile.scroll<=pile.width+2,'Falling Words: no horizontal overflow');
  assert.equal(pile.columns,5,'Falling Words: five basket columns on phone');
  const firstWord=await p.locator('.falling-pile .falling-bubble').first().innerText();
  await p.waitForTimeout(1200);
  assert.ok(await p.locator('.falling-pile .falling-bubble').allInnerTexts().then(arr=>arr.includes(firstWord)),
   'Falling Words: unselected bubbles remain in the basket');
  await p.screenshot({path:'arcade-qa-falling-mobile.png',fullPage:true});
  await p.close();
 }
 assert.deepEqual(errors,[],'Uncaught browser errors');
 console.log('MEJ_GAMES_UI_BROWSER_PASS: 3-column Flip, 2-column Memory, stable Sentence Builder verify, persistent 5-column Falling basket');
}finally{await browser.close()}
