'use strict';
const fs=require('fs');
const files=['index.html','omani-sailor/index.html'];
const hits={};
for(const file of files){
const s=fs.readFileSync(file,'utf8');const patterns=['Hidden Objects','hidden objects','hiddenObjects','hiddenObject','hidden-object','object hunt','Find the','mejSailor','openMejSailor','countMaster','function persist','function currentIsland','function route(','stars','reward','mistakes','wrongClicks','three mistakes','objectFound'];
const found=[];
for(const p of patterns){let from=0,list=[];while((from=s.toLowerCase().indexOf(p.toLowerCase(),from))>=0&&list.length<8){list.push({at:from,around:s.slice(Math.max(0,from-360),Math.min(s.length,from+1100))});from+=p.length;}if(list.length)found.push({p,list});}
hits[file]={bytes:s.length,found};
}
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/hidden-objects-inventory-20261112.json',JSON.stringify(hits,null,2));
console.log('Wrote inventory');
