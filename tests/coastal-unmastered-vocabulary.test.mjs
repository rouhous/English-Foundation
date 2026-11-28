import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../coastal-arcade/app-bridge.js',import.meta.url),'utf8');
const start=source.indexOf('function coastalUnmasteredVocabulary');
const end=source.indexOf('\nfunction safe',start);
assert.ok(start>=0&&end>start,'helper source is present');
const helper=source.slice(start,end)+'\nthis.coastalUnmasteredVocabulary=coastalUnmasteredVocabulary;';
function run(rows,correct={}) {
 const context={byGrade:{3:rows}};
 vm.runInNewContext(helper,context);
 return context.coastalUnmasteredVocabulary(3,{correct});
}

test('selects only unmastered unique vocabulary and recovers Arabic meaning',()=>{
 const rows=[
  {id:'v1',type:'Vocabulary',word:'coast',answer:'ساحل'},
  {id:'v2',type:'Vocabulary',word:'coast',answer:'coast'},
  {id:'v3',type:'Vocabulary',word:'harbour',answer:'harbour'},
  {id:'v3-ar',type:'Vocabulary',word:'harbour',answer:'ميناء'},
  {id:'v4',type:'Vocabulary',word:'island',answer:'جزيرة'}
 ];
 const out=run(rows,{v1:2});
 assert.deepEqual(Array.from(out,x=>x.word),['coast','harbour','island']);
 assert.equal(out[0].answer,'ميناء');
});

test('keeps zero/one-correct attempts and excludes mastered words',()=>{
 const out=run([
  {id:'a',type:'Vocabulary',word:'boat',answer:'قارب'},
  {id:'b',type:'Vocabulary',word:'sail',answer:'شراع'}
 ],{a:1,b:2});
 assert.deepEqual(Array.from(out,x=>x.word),['boat']);
});
