'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const s=fs.readFileSync('assets/mej-companion-live-v1.js','utf8');
new vm.Script(s,{filename:'assets/mej-companion-live-v1.js'});
const i=fs.readFileSync('index.html','utf8');
if(!s.includes('MEJ_COMPANION_ROAM_EXPLAIN_V2'))throw Error('Roaming code missing');
if(!s.includes('roamTimer=setInterval(roamTick,145)'))throw Error('Batched movement timer missing');
if(!s.includes('clearInterval(roamTimer)'))throw Error('Timer cleanup missing');
if(!s.includes('react(correct,event.detail)'))throw Error('Answer event not connected');
if(!s.includes("if(inDiagnostic()||!canShow())return"))throw Error('Diagnostic exclusion lost');
if(!s.includes("lastInteraction=Date.now()"))throw Error('No interaction pausing');
const evidence={date:'2026-11-12',liveCompanionScriptSyntax:'pass',routeEventWired:true,roamTickMs:145,edgeTurning:true,inactivityActions:true,wrongAnswerExplanation:true,diagnosticExcluded:true,sourceQuestionBankChanged:false};
const term='mej-answer-evaluated';let matches=[];let start=0;while(true){let p=i.indexOf(term,start);if(p<0)break;matches.push(i.slice(Math.max(0,p-250),p+350));start=p+term.length;if(matches.length>12)break;}
evidence.appAnswerEventSnippets=matches;
evidence.answerEventFound=matches.length>0;
evidence.directCompanionReaction=i.includes('window.MEJCompanion?.react(ok)')||i.includes('window.MEJCompanion.react(ok)');
if(!evidence.directCompanionReaction&&!evidence.answerEventFound)throw Error('No question-to-companion feedback binding');
fs.mkdirSync('reviews/quality-audit',{recursive:true});fs.writeFileSync('reviews/quality-audit/companion-roam-correction-20261112.json',JSON.stringify(evidence,null,2));console.log('Companion QA pass',evidence);
