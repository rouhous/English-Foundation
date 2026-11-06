import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const rows=[];
for(const [width,height] of [[390,844],[360,740],[412,915]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,locale:'ar'});
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.mobile-ocean-v31').waitFor({timeout:10000});
 await page.waitForTimeout(700);
 const data=await page.evaluate(()=>{
  function box(selector){
   const element=document.querySelector(selector);
   if(!element)return null;
   const r=element.getBoundingClientRect();
   const style=getComputedStyle(element);
   return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),
     height:Math.round(r.height),bottom:Math.round(r.bottom),
     display:style.display,position:style.position};
  }
  return {
   innerHeight:innerHeight,documentHeight:document.documentElement.scrollHeight,
   home:box('#app>.mobile-ocean-v31'),
   art:box('.mobile-ocean-v31>.m31-art'),
   image:box('.mobile-ocean-v31 .m31-sea'),
   head:box('.mobile-ocean-v31>.m31-head'),
   start:box('.mobile-ocean-v31 .m31-start'),
   nav:box('.mobile-ocean-v31 .m31-nav'),
   rights:box('#mej-owner-rights-notice'),
   imageCount:document.querySelectorAll('.mobile-ocean-v31 .m31-sea').length,
   backgroundImage:getComputedStyle(document.querySelector('.mobile-ocean-v31')).backgroundImage,
   title:document.querySelector('.mobile-ocean-v31 .m31-title')?.textContent.trim(),
  };
 });
 rows.push({width,height,...data});
 await page.screenshot({path:'/tmp/mej-'+width+'.png',fullPage:true});
 await page.close();
}
await browser.close();
fs.mkdirSync('diagnostics',{recursive:true});
fs.writeFileSync('diagnostics/approved-home-viewport-test.json',JSON.stringify(rows,null,2)+'\n');
for(const r of rows){
 console.log(JSON.stringify({viewport:r.width+'x'+r.height,
  scene:r.image,nav:r.nav,rights:r.rights,scroll:r.documentHeight}));
 if(r.imageCount!==1)throw Error('Scene must have exactly one image');
 if(!r.image||r.image.height<400)throw Error('Scene not full-height');
 if(!r.nav||r.nav.bottom>r.height+5)throw Error('Navigation below viewport');
 if(!r.rights||r.rights.bottom>r.height+5)throw Error('Copyright below viewport');
 if(!r.start||r.start.y<r.head.bottom)throw Error('Start overlapping header');
 if(r.backgroundImage!=='none'&&!r.backgroundImage.startsWith('linear-gradient'))throw Error('Unexpected duplicate background');
}
console.log('HOME_VIEWPORT_QA_PASSED');
