import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const html=await readFile(new URL('../coastal-arcade/index.html',import.meta.url),'utf8');
const marker='window.MEJV11Inline=';
const at=html.indexOf(marker);
assert.ok(at>=0,'inline game bundle exists');
const jsonStart=at+marker.length;
const jsonEnd=html.indexOf('};'+String.fromCharCode(10)+'</script>',jsonStart)+1;
const inline=JSON.parse(html.slice(jsonStart,jsonEnd));
assert.ok(inline.game.includes('event.origin!==window.origin'),'srcdoc validates inherited parent origin');

const server=createServer((req,res)=>{
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
 res.end('<!doctype html><html><body>parent origin</body></html>');
});
await new Promise(resolve=>server.listen(4178,'127.0.0.1',resolve));
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4178');
 const game=inline.game.replace(
  '<!-- MEJ_INLINE_CONTEXT -->',
  '<script>window.MEJ_GAME_CONTEXT={search:"?game=vocab&grade=12"};</script>'
 );
 await page.setContent('<iframe id="child"></iframe>');
 await page.locator('#child').evaluate((frame,src)=>{frame.srcdoc=src;},game);
 await page.waitForFunction(()=>document.querySelector('#child')?.contentDocument?.readyState==='complete',null,{timeout:15000});
 await page.evaluate(()=>{
  const frame=document.querySelector('#child');
  frame.contentWindow.postMessage({
   type:'mej:coastal-init',stage:12,grade:12,stageStars:0,accessToken:'',masteryWords:[
    {id:'synthetic-1',word:'harbour',answer:'ميناء',pic:'harbour'}
   ]
  },location.origin);
 });
 const child=page.frameLocator('#child');
 await page.waitForFunction(()=>document.querySelector('#child')?.contentDocument?.querySelector('#start')?.disabled===false,null,{timeout:15000});
 const status=await page.locator('#child').evaluate(frame=>({
  origin:frame.contentWindow.origin,
  startDisabled:frame.contentDocument.querySelector('#start').disabled,
  intro:frame.contentDocument.querySelector('#introText').textContent
 }));
 assert.equal(status.origin,'http://127.0.0.1:4178');
 assert.equal(status.startDisabled,false);
 assert.ok(!status.intro.includes('تعذر تجهيز بنك الأسئلة'),'deck initialization did not throw');
 await child.locator('#start').click();
 await child.locator('#play').waitFor({state:'visible'});
 console.log('srcdoc init passed:',JSON.stringify(status));
} finally {
 if(browser)await browser.close();
 server.close();
}
