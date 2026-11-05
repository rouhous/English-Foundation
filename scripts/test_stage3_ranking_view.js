#!/usr/bin/env node
"use strict";
const fs=require("fs"),vm=require("vm"),assert=require("assert");
const source=fs.readFileSync("assets/class-ranking-v1.js","utf8");
const nodes=[];
class FakeNode{
 constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.className="";nodes.push(this)}
 appendChild(node){this.children.push(node);return node}
 replaceChildren(){this.children=[]}
}
const host=new FakeNode("div");
const sandbox={window:{},document:{createElement:tag=>new FakeNode(tag)}};
vm.runInNewContext(source,sandbox,{timeout:1000});
const view=sandbox.window.MEJClassRanking;
assert.equal(typeof view.render,"function");
const sample={
 ok:true,scope:"OWN_VERIFIED_CLASS",scoreVerification:"SERVER_CHECKED_PILOT",
 className:"9A",count:3,
 entries:[
  {rank:1,name:"طالب <img src=x onerror=alert(1)>",stars:50,isMe:true},
  {rank:2,name:"طالب ثان",stars:40,isMe:false},
  {rank:2,name:"طالب ثالث",stars:40,isMe:false}
 ]
};
assert.equal(view.render(host,sample),true);
assert.equal(host.children.length,1);
const ranking=host.children[0];
const rows=ranking.children.find(x=>x.tag==="ol").children;
assert.equal(rows.length,3);
assert.equal(rows[0].children[1].textContent,"طالب <img src=x onerror=alert(1)> • أنت");
assert(!source.includes(".innerHTML"),"User names must never be placed into innerHTML");
assert(!JSON.stringify(sample.entries.map(x=>x.rank)).includes("level"));
assert.equal(rows[1].children[0].textContent,"2");
assert.equal(rows[2].children[0].textContent,"2");
assert.equal(view.render(host,{...sample,scoreVerification:"CLIENT_REPORTED_UNVERIFIED"}),false);
assert.equal(host.children[0].className,"mej-rank-unavailable");
assert.equal(view.render(host,{...sample,entries:sample.entries.map(x=>({...x,isMe:false}))}),false);
console.log("STAGE3_VIEW_TESTS_PASSED: trusted-only, ties, safe text, own-student highlight, no unverified ranking");
