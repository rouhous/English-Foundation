import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const host=fs.readFileSync('assets/mej-sailor-host.js','utf8');
assert.ok(html.length>3_000_000,'Full original app must remain intact');
assert.ok(html.includes("['🎮','الألعاب',\"window.openMejArcade()\"]"),'Journey must expose arcade');
assert.ok(html.includes('mej-arcade-journey-links'),'Responsive game button CSS');
assert.ok(sw.includes('mej-games-release-20261114-v2'),'New cache version');
for(const path of ['games/index.html','games/arcade.css','games/arcade.js','games/bank.js','games/release.js']){
 assert.ok(sw.includes(path),'Game cached for PWA: '+path);
}
assert.ok(host.includes('window.openMejArcade=function()'),'Host missing arcade dialog');
console.log('Integration static checks: PASS');
const browserLocations=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium'];
const exec=browserLocations.find(x=>fs.existsSync(x));assert.ok(exec);
const browser=await chromium.launch({headless:true,executablePath:exec,args:['--no-sandbox','--disable-dev-shm-usage']});
async function inspect(size,mobile){
 const context=await browser.newContext({viewport:size,isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/games/release.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.MEJArcadeRelease=true;'}));
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>typeof window.openMejArcade==='function',null,{timeout:60000});
 console.log('Original app boot: PASS ('+(mobile?'mobile':'desktop')+')');
 const outcome=await page.evaluate(()=>{
  try{route('journey');return {ok:true,button:[...document.querySelectorAll('.j23-link')].some(b=>b.textContent.includes('الألعاب'))};}
  catch(error){return {ok:false,error:String(error)};}
 });
 assert.ok(outcome.ok,'Journey render: '+outcome.error);
 assert.ok(outcome.button,'Game launcher must appear in quick access');
 // First-time learners choose their companion before the app permits clicks.
 await page.waitForTimeout(250);
 const companion=page.locator('#mej-companion-choice');
 if(await companion.isVisible().catch(()=>false)){
  await companion.locator('.mej-c-pick').first().click();
  await companion.locator('input').fill('مرشد');
  await companion.locator('.mej-c-save').click();
  await companion.waitFor({state:'detached'});
 }
 await page.locator('.j23-links button').filter({hasText:'الألعاب'}).click();
 await page.locator('#mejArcadeDialog').waitFor();
 const arcade=page.frameLocator('#mejArcadeDialog iframe');
 await arcade.locator('body[data-state="open"]').waitFor({timeout:60000});
 assert.equal(await arcade.locator('[data-game="sailor"]').isDisabled(),true,'Unlocked only at 40 stage stars');
 assert.equal(await arcade.locator('[data-game="hidden"]').isDisabled(),true,'Hidden challenge locked at 20 stage stars');
 await page.screenshot({path:mobile?'mej-integration-mobile.png':'mej-integration-desktop.png',fullPage:true});
 await page.locator('#mejArcadeDialog button').first().click();
 await page.locator('#mejArcadeDialog').waitFor({state:'detached',timeout:15000});
 assert.equal(await page.locator('#mejArcadeDialog iframe').count(),0,'Iframe resources released');
 assert.ok(errors.length===0,'Unexpected runtime errors: '+errors.slice(0,5).join('; '));
 await context.close();
 console.log('Journey → Arcade → Journey: PASS ('+(mobile?'mobile':'desktop')+')');
}
try{
 await inspect({width:1280,height:800},false);
 await inspect({width:390,height:844},true);
}finally{await browser.close();}
console.log('Release candidate integration verified.');
