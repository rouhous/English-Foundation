'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const path='index.html';let s=fs.readFileSync(path,'utf8');
const marker='MEJ_OMAN_CURRENT_WEEK_ACTIVITY_20261117';
if(s.includes(marker)){console.log('Already applied');process.exit(0)}
function swap(old,new,label){assert.equal(s.split(old).length-1,1,'Expected exactly one '+label);s=s.replace(old,new)}
const helpers=String.raw