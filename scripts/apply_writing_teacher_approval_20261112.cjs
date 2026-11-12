'use strict';
const fs=require('fs');
const crypto=require('crypto');
const replacements={
  "L6-196": [
    "We stayed inside during the break ___ it was raining heavily.",
    "because",
    "although",
    "unless",
    "because تقدم سبب البقاء في الداخل."
  ],
  "L6-197": [
    "___ I finished my homework, I went outside to play.",
    "After",
    "Before",
    "Although",
    "After تربط حدثًا وقع بعد إنهاء الواجب."
  ],
  "L6-198": [
    "I took a bottle of water ___ I would not feel thirsty during the trip.",
    "so that",
    "although",
    "unless",
    "so that تعبر عن الهدف من أخذ الماء."
  ],
  "L7-196": [
    "___ the weather was very hot, the students completed their walk.",
    "Although",
    "Because",
    "Until",
    "Although توضح التباين بين الحر ومواصلة السير."
  ],
  "L7-197": [
    "Maha was checking the map ___ her brother was packing the bags.",
    "while",
    "because",
    "unless",
    "while تستخدم لحدثين يجريان في الوقت نفسه."
  ],
  "L7-198": [
    "We waited at the bus stop ___ our teacher arrived.",
    "until",
    "because",
    "although",
    "until تحدد نهاية مدة الانتظار."
  ],
  "L8-196": [
    "You will not finish the science project on time ___ you share the tasks fairly.",
    "unless",
    "because",
    "although",
    "unless تعني إذا لم يحدث الشرط."
  ],
  "L8-197": [
    "The first island has sandy beaches, ___ the second has steep rocky cliffs.",
    "whereas",
    "because",
    "therefore",
    "whereas تقارن بين حقيقتين متباينتين."
  ],
  "L8-198": [
    "The team checked every source carefully. ___, their report contained fewer errors.",
    "As a result",
    "However",
    "For example",
    "As a result تُظهر نتيجة التحقق الدقيق."
  ],
  "L9-196": [
    "___ the journey was difficult, the volunteers continued helping the villagers.",
    "Even though",
    "Because",
    "As soon as",
    "Even though تُظهر التباين مع الصعوبة."
  ],
  "L9-197": [
    "___ online messages can be misunderstood, it is important to use clear and respectful language.",
    "Since",
    "Unless",
    "Whereas",
    "Since تقدم سبب أهمية اللغة الواضحة."
  ],
  "L9-198": [
    "The beach looked clean from a distance. ___, the students found plastic under the rocks.",
    "Nevertheless",
    "Consequently",
    "For instance",
    "Nevertheless تشير إلى نتيجة مفاجئة مخالفة للتوقع."
  ],
  "L10-196": [
    "The research team can use the survey results ___ the participants have agreed to share their answers.",
    "provided that",
    "even though",
    "whereas",
    "provided that تربط الاستخدام بتحقق شرط الموافقة."
  ],
  "L10-197": [
    "Wind turbines need moving air, ___ solar panels depend on sunlight.",
    "whereas",
    "because",
    "therefore",
    "whereas تقارن بين مصدرَي طاقة مختلفين."
  ],
  "L10-198": [
    "The neighbourhood installed more recycling bins. ___, less paper was thrown away with general waste.",
    "Consequently",
    "Nevertheless",
    "For instance",
    "Consequently تبين نتيجة زيادة صناديق إعادة التدوير."
  ],
  "L11-196": [
    "___ the exchange programme was expensive, several students applied for a place.",
    "Although",
    "Because",
    "Unless",
    "Although تُظهر التباين بين التكلفة والتقديم."
  ],
  "L11-197": [
    "The school organised a reading campaign. ___, library visits increased during the term.",
    "As a result",
    "On the other hand",
    "For example",
    "As a result تقدم النتيجة المباشرة للحملة."
  ],
  "L11-198": [
    "The application will not be considered ___ the required documents are submitted before the deadline.",
    "unless",
    "although",
    "whereas",
    "unless تفيد الشرط الضروري للنظر في الطلب."
  ],
  "L12-196": [
    "___ the evidence was limited, the writer presented the conclusion as certain.",
    "Although",
    "Because",
    "Since",
    "Although تبرز التعارض بين محدودية الدليل واليقين."
  ],
  "L12-197": [
    "The first proposal focuses on short-term costs, ___ the second examines long-term benefits.",
    "whereas",
    "therefore",
    "since",
    "whereas تُبرز المقارنة بين منظورين."
  ],
  "L12-198": [
    "The figures were collected from only one school. ___, the report should avoid generalising to all students.",
    "Therefore",
    "Nevertheless",
    "For instance",
    "Therefore تُظهر نتيجة منطقية لحدود العينة."
  ],
  "L8-199": [
    "The project costs more at first. ___, it will save money over time.",
    "However,",
    "Consequently,",
    "For example,",
    "However تربط فكرتين متعارضتين وتناسب المعنى."
  ],
  "L11-199": [
    "The trip offers valuable experiences. ___, the cost may prevent some students from taking part.",
    "However,",
    "Consequently,",
    "For example,",
    "However تُظهر التباين بين الفوائد والعائق المالي."
  ]
};
const rejected=new Set(["L6-196","L6-197","L6-198","L7-196","L7-197","L7-198","L8-196","L8-197","L8-198","L9-196","L9-197","L9-198","L10-196","L10-197","L10-198","L11-196","L11-197","L11-198","L12-196","L12-197","L12-198"]);
const revised=new Set(["L8-199","L11-199"]);
const expectedChanged=new Set([...rejected,...revised]);
const paths=['index.html','reviews/admin-levels-catalog.json'];
const changes=[];
function mutate(content,path){
  const encountered=new Set();
  // In both source files, each question is a compact flat JSON record.
  const result=content.replace(/\{[^{}]*"id":"L\d+-\d+"[^{}]*\}/g,raw=>{
    const match=raw.match(/"id":"(L\d+-\d+)"/);
    if(!match||!expectedChanged.has(match[1]))return raw;
    const id=match[1];if(encountered.has(id))throw Error('Repeated ID '+id+' in '+path);
    encountered.add(id);
    const before=JSON.parse(raw);
    if(before.type!=='Writing'||before.mode!=='mcq')throw Error('Unexpected type/mode at '+id);
    const [prompt,answer,a,b,tip]=replacements[id];
    const options=[answer,a,b];if(new Set(options).size!==3)throw Error('Duplicate options at '+id);
    // Rotate answer location across cards to avoid a predictable first-choice key.
    const answerIndex=Number(id.split('-')[1])%3;
    const rotated=options.slice(3-answerIndex).concat(options.slice(0,3-answerIndex));
    const after={...before,prompt,answer,options:rotated,tip};
    if(after.options.filter(x=>x===answer).length!==1)throw Error('Bad key at '+id);
    changes.push({path,id,grade:Number(id.split('-')[0].slice(1)),reason:rejected.has(id)?'teacher_rejected_replacement':'teacher_requested_rewording',oldPrompt:before.prompt,newPrompt:prompt,correctAnswer:answer});
    return JSON.stringify(after);
  });
  if(encountered.size!==expectedChanged.size)throw Error(path+': expected '+expectedChanged.size+' patches; found '+encountered.size+'; missing '+[...expectedChanged].filter(id=>!encountered.has(id)));
  return result;
}
for(const path of paths){
  const before=fs.readFileSync(path,'utf8'),after=mutate(before,path);
  if(before===after)throw Error('No modifications '+path);
  fs.writeFileSync(path,after);
}
const catalog=JSON.parse(fs.readFileSync(paths[1],'utf8'));
const questionList=catalog.levels.flatMap(l=>l.parts.flatMap(p=>p.questions));
const writing=questionList.filter(q=>q.type==='Writing'&&/^L(6|7|8|9|10|11|12)-19[6-9]$/.test(q.id));
if(writing.length!==28)throw Error('Expected 28 Writing questions, found '+writing.length);
for(const q of writing){
  if(q.mode!=='mcq'||q.options.length!==3||q.options.filter(v=>v===q.answer).length!==1||new Set(q.options).size!==3)throw Error('Bad updated question '+q.id);
}
const report={date:'2026-11-12',teacherReview:{approvedUnchanged:38,rejectedReplaced:21,revised:2},note:'All 38 approved entries remain unchanged; 21 rejected and two revisions updated in application and review catalog. Replacements need teacher review before acceptance.',changed:changes.filter(c=>c.path===paths[1])};
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/teacher-writing-approval-20261112.json',JSON.stringify(report,null,2));
console.log('Validated Writing changes:',changes.length,'records across',paths.length,'files; approved originals preserved.');
