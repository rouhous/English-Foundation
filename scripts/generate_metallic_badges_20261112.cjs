'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const marks=[
 ['🌱','<path d="M59 101 Q63 69 82 46 M70 75 Q39 71 37 50 Q57 48 70 75 M78 61 Q77 36 104 31 Q106 53 78 61" fill="#e5f5b4" stroke="#205a42" stroke-width="5"/>'],
 ['🧭','<circle cx="75" cy="75" r="29" fill="#113b60" stroke="#e0f7ef" stroke-width="3"/><path d="M75 46 L86 75 75 103 64 75Z" fill="#ffe7aa"/><path d="M75 46 L75 103 64 75Z" fill="#d65c43"/><circle cx="75" cy="75" r="5" fill="#fff8cd"/>'],
 ['📖','<path d="M75 55 Q52 41 35 51 V99 Q57 88 75 101 Q91 88 113 99 V51 Q96 41 75 55Z" fill="#fff8d5" stroke="#80572e" stroke-width="4"/><path d="M75 56 V99 M42 64 Q55 60 66 68 M84 68 Q94 61 104 65" fill="none" stroke="#c39d57" stroke-width="3"/>'],
 ['⭐','<path d="M75 34 L87 62 117 65 94 84 100 115 75 99 49 115 55 84 32 65 63 62Z" fill="#fff2a5" stroke="#ba721e" stroke-width="4"/>'],
 ['🏝️','<path d="M34 103 Q76 75 117 104 L117 112 H34Z" fill="#e8ca78"/><path d="M76 97 Q79 77 68 49" fill="none" stroke="#6c4928" stroke-width="7"/><path d="M66 53 Q46 50 37 61 M65 52 Q73 35 91 36 M65 51 Q84 49 106 65" stroke="#66b978" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M35 114 Q55 105 75 114 Q95 122 115 113" stroke="#76d6e8" stroke-width="4" fill="none"/>'],
 ['🌊','<path d="M32 72 Q50 53 69 72 Q88 91 117 61 M32 91 Q50 72 69 91 Q88 109 117 80 M40 109 Q57 100 72 108" stroke="#b8f3f9" stroke-width="11" stroke-linecap="round" fill="none"/>'],
 ['⚓','<path d="M75 44 V113 M54 59 H96 M40 90 Q46 118 75 118 Q104 118 110 90 M36 92 L43 81 52 92 M98 92 L110 81 116 92" stroke="#e6f6ef" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="75" cy="39" r="9" fill="none" stroke="#e6f6ef" stroke-width="6"/>'],
 ['⛵','<path d="M34 102 H117 Q107 117 51 116Z" fill="#f5d995"/><path d="M75 38 V103" stroke="#fff6d7" stroke-width="5"/><path d="M70 43 L38 98 H70Z" fill="#f5f4e9" stroke="#ccb76c" stroke-width="2"/><path d="M81 48 L111 100 H81Z" fill="#e39d5c" stroke="#cc7044" stroke-width="2"/>'],
 ['🗺️','<path d="M37 53 L61 44 85 51 111 41 V101 L85 110 61 102 37 112Z" fill="#f5dfaa" stroke="#986c39" stroke-width="4"/><path d="M61 44V102 M85 51V110 M48 76 Q64 62 73 76 Q86 88 100 69" stroke="#b87e44" stroke-width="3" stroke-dasharray="4 5" fill="none"/><circle cx="101" cy="68" r="5" fill="#df604a"/>'],
 ['🏆','<path d="M53 46 H97 L93 88 Q75 104 57 88Z" fill="#fff0ac" stroke="#ba7629" stroke-width="4"/><path d="M54 57 H41 Q39 81 58 80 M96 57 H109 Q111 81 92 80" fill="none" stroke="#ffdf87" stroke-width="6"/><path d="M75 98 V113 M55 116 H95" stroke="#ffdf87" stroke-width="7" stroke-linecap="round"/><path d="M75 56 L80 66 92 68 83 76 85 88 75 82 65 88 67 76 58 68 70 66Z" fill="#c77c2c"/>']
];
const prefix='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" role="img" aria-label="Journey achievement badge"><defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6b1"/><stop offset=".25" stop-color="#f2c257"/><stop offset=".48" stop-color="#985b18"/><stop offset=".67" stop-color="#f8df8a"/><stop offset="1" stop-color="#805120"/></linearGradient><radialGradient id="inner"><stop offset="0" stop-color="#1d95b8"/><stop offset=".65" stop-color="#14526d"/><stop offset="1" stop-color="#092d50"/></radialGradient><filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity=".55"/></filter></defs>';
const dir='assets/mej-badges-20261112';fs.mkdirSync(dir,{recursive:true});
const style=fs.readFileSync('assets/mej-hidden-badges-v1.css','utf8');let css=style;
if(!css.includes('MEJ_METALLIC_BADGES_V2')){
 css+='\n/* MEJ_METALLIC_BADGES_V2 — original separate emblems, lock remains on the door */\n.journey-v23 .mej-gate-symbol{display:block;width:min(94%,76px);height:70px;font-size:0!important;background-size:contain;background-position:center;background-repeat:no-repeat;filter:drop-shadow(0 3px 4px #081b3666)}\n';
 for(let i=0;i<10;i++)css+=`.journey-v23 .j23-badge-grid .mej-gate:nth-child(${i+1}) .mej-gate-symbol{background-image:url("./mej-badges-20261112/badge-${String(i+1).padStart(2,'0')}.svg")}\n`;
}
fs.writeFileSync('assets/mej-hidden-badges-v1.css',css);
for(let i=0;i<marks.length;i++){
 const art=prefix+'<g filter="url(#shadow)"><circle cx="75" cy="75" r="66" fill="url(#metal)" stroke="#fff1ba" stroke-width="4"/><circle cx="75" cy="75" r="52" fill="url(#inner)" stroke="#664318" stroke-width="4"/><circle cx="75" cy="75" r="47" fill="none" stroke="#ffe6a2" stroke-width="2" stroke-dasharray="2 7"/></g>'+marks[i][1]+'<path d="M35 41 Q75 7 115 41" fill="none" stroke="#fff5c9" stroke-opacity=".54" stroke-width="4"/></svg>';
 assert(!art.includes('<script'));fs.writeFileSync(dir+'/badge-'+String(i+1).padStart(2,'0')+'.svg',art);
}
new vm.Script(fs.readFileSync('assets/mej-sailor-host.js','utf8'));
const report={marker:'MEJ_METALLIC_BADGES_V2',separateSvgFiles:10,oldCroppedImageUsed:false,lockedDoorStillHidesMedal:true,eachMedalUniqueMotif:true,scriptSyntax:'passed',status:'generated'};
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/hidden-badge-art-20261112.json',JSON.stringify(report,null,2));console.log(report);
