'use strict';
const fs=require('fs');
const updates={
  "L6-198": [
    "Our class sent a message to the school magazine ___ we wanted to share our ideas.",
    "because",
    "although",
    "unless",
    "because تربط الفكرة بسبب إرسال الرسالة. الصف السادس: الكتابة عن المدرسة والتواصل.",
    "Team Together Oman 6A — school magazine and communication"
  ],
  "L7-196": [
    "First, we bought tickets for the aquarium. What happened next?",
    "Next, we entered the aquarium and saw the fish.",
    "Finally, we went home after the visit.",
    "Before our visit, we packed our bags.",
    "Next تقدم الحدث التالي في سرد زيارة مكان ترفيهي.",
    "Team Together Oman 7A — Entertainment"
  ],
  "L7-199": [
    "We packed our suitcases in the evening. ___, we travelled to the airport early the next morning.",
    "Then",
    "However",
    "For example",
    "Then تُظهر تسلسل أحداث الاستعداد للسفر.",
    "Team Together Oman 7A — Travel"
  ],
  "L8-196": [
    "First, our group chose an endangered animal to study. ___, we collected information about its habitat.",
    "Next",
    "However",
    "Finally",
    "Next تعطي الخطوة التالية في إعداد تقرير عن حيوان مهدد بالانقراض.",
    "Team Together Oman 8A — Our planet: survey / report"
  ],
  "L8-197": [
    "Choose the sentence that best follows this opening of a brochure: 'Sandboarding is an exciting adventure sport in Oman.'",
    "You should wear a helmet and follow the instructor's advice.",
    "My cousin bought a new phone yesterday.",
    "The school library closes at two o'clock.",
    "بعد تقديم الرياضة، تضيف النشرة معلومات ونصائح مناسبة للقراء.",
    "Team Together Oman 8A — Adventure sports: brochure"
  ],
  "L8-198": [
    "Choose the sentence that best completes an informal email: 'Thanks for inviting me to your shopping trip on Friday.'",
    "I'd love to come, but I need to ask my parents first.",
    "The average annual rainfall is shown in this chart.",
    "Please find attached the official research report.",
    "الرد على الدعوة يجب أن يكون وديًا ومرتبطًا بموضوع الرسالة.",
    "Team Together Oman 8A — Spend or save?: informal email reply"
  ],
  "L9-196": [
    "Choose the best next sentence in a short story: 'When I opened my notebook, I found a letter inside.'",
    "I read it carefully and wondered who had written it.",
    "I usually eat breakfast at seven every day.",
    "Many people enjoy watching sports on television.",
    "تتابع الجملة الثانية الحدث وتضيف عنصر التشويق بصورة منطقية.",
    "English for Me 9A — Writers and Writing"
  ],
  "L9-198": [
    "The writer planned the beginning and ending of her story. ___, she wrote the first draft.",
    "Then",
    "However",
    "For example",
    "Then تربط التخطيط بالمرحلة التالية في عملية الكتابة.",
    "English for Me 9A — Writers and Writing"
  ],
  "L10-196": [
    "Choose the sentence that best follows: 'Plastic waste is becoming a serious problem for marine life.'",
    "Many sea animals are harmed when they swallow plastic.",
    "The school football team won its match yesterday.",
    "The library has new books about ancient history.",
    "الفقرة تشرح أثر المشكلة وتطور فكرة التلوث البلاستيكي.",
    "English for Me 10A — Climate Change: effects and opinion writing"
  ],
  "L10-197": [
    "Burning fossil fuels releases greenhouse gases. ___, the Earth's temperature can rise over time.",
    "As a result",
    "However",
    "For example",
    "As a result تعرض النتيجة المترتبة على السبب المذكور.",
    "English for Me 10A — Climate Change: cause and effect"
  ]
};
const ids=Object.keys(updates),targets=['index.html','reviews/admin-levels-catalog.json'],changes=[];
if(ids.length!==10)throw Error('Expected exactly ten teacher rejections');
for(const path of targets){
  let count=0;
  const input=fs.readFileSync(path,'utf8');
  const result=input.replace(/\{[^{}]*"id":"L\d+-\d+"[^{}]*\}/g,raw=>{
    const found=raw.match(/"id":"(L\d+-\d+)"/);
    const id=found?.[1];
    if(!id||!Object.prototype.hasOwnProperty.call(updates,id))return raw;
    count++;
    const original=JSON.parse(raw);
    if(original.type!=='Writing'||original.mode!=='mcq')throw Error('Unexpected type at '+id);
    const [prompt,answer,wrongA,wrongB,tip,topic]=updates[id];
    const options=[answer,wrongA,wrongB];
    if(new Set(options).size!==3)throw Error('Duplicated choices at '+id);
    const shift=Number(id.match(/-(\d+)/)[1])%3;
    const rotated=options.slice(shift).concat(options.slice(0,shift));
    const changed={...original,prompt,answer,options:rotated,tip};
    changes.push({path,id,grade:Number(id.match(/L(\d+)/)[1]),topic,old:original.prompt,replacement:prompt});
    return JSON.stringify(changed);
  });
  if(count!==10)throw Error('Missing or duplicate replacements in '+path+': '+count);
  fs.writeFileSync(path,result);
}
const catalog=JSON.parse(fs.readFileSync('reviews/admin-levels-catalog.json','utf8'));
const all=catalog.levels.flatMap(level=>level.parts.flatMap(part=>part.questions));
for(const id of ids){
  const q=all.find(item=>item.id===id);
  if(!q||q.type!=='Writing'||q.mode!=='mcq'||q.options.filter(v=>v===q.answer).length!==1||new Set(q.options).size!==3)throw Error('Validation failed: '+id);
}
const audit={date:'2026-11-12',decision:{approved:51,rejectedAndReplaced:10,awaitingTeacherReview:10},notes:'Approved items were not altered. Each replacement has grade-relevant original wording and three distinct MCQ options. These are candidate alternatives pending teacher approval; none was copied verbatim from the textbooks.',changes:changes.filter(c=>c.path==='reviews/admin-levels-catalog.json')};
fs.mkdirSync('reviews/quality-audit',{recursive:true});
fs.writeFileSync('reviews/quality-audit/writing-review-round2-20261112.json',JSON.stringify(audit,null,2));
console.log('Patched ten Writing entries in both runtime bank and review catalog');
