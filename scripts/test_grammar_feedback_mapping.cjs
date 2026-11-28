'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const feedback=require('../assets/mej-grammar-feedback-v1.js');
const match=html.match(/const BANK=(\[[\s\S]*?\]);\s*\n/);
assert.ok(match,'Question BANK must be readable');
const bank=JSON.parse(match[1]);
const grammar=bank.filter(q=>q.type==='Grammar');
const normalize=p=>String(p).replace(/^\s*(?:Grammar check|Choose the best form|Choose)\s*:\s*/i,'').replace(/_{2,}/g,'___').replace(/\s+/g,' ').trim();
const stems=new Set(grammar.map(q=>normalize(q.prompt)));
assert.equal(grammar.length,198,'Expected 198 Grammar questions');
assert.equal(stems.size,86,'Expected 86 normalized Grammar stems');
assert.equal(Object.keys(feedback.questionRules).length,198,'Every question ID must have an explicit rule ID');
for(const q of grammar)assert.ok(feedback.questionRules[q.id]&&feedback.rules[feedback.questionRules[q.id]],'Missing rule mapping: '+q.id);
const expected={
 'L7-181':'enjoy_gerund','L7-178':'arrive_at','L8-169':'present_perfect_pastpart',
 'L8-175':'past_continuous_interruption','L5-075':'going_to_base','L12-160':'third_conditional',
 'L12-178':'despite_gerund','L11-172':'future_passive'
};
for(const [id,rule] of Object.entries(expected))assert.equal(feedback.questionRules[id],rule,'Incorrect rule for '+id);
const render=feedback.render({id:'not-mapped',type:'Grammar',prompt:'A ___ sentence',answer:'test'},x=>String(x));
assert.match(render,/لم تُسند إلى هذا السؤال قاعدة محددة/,'Missing metadata must use neutral feedback');
assert.doesNotMatch(feedback.rules.enjoy_gerund.explanation,/مضارع مستمر/);
assert.match(feedback.rules.enjoy_gerund.explanation,/enjoy/);
console.log('Grammar feedback mapping OK: 198 questions / 86 stems / '+Object.keys(feedback.rules).length+' rule definitions.');
