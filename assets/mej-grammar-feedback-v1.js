/* MEJ_GRAMMAR_FEEDBACK_V1 — explicit, question-ID based feedback. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.MEJ_GRAMMAR_FEEDBACK_V1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const questionRules={
  "L1-116": "be_am_i",
  "L1-117": "be_is_singular",
  "L1-118": "plural_regular",
  "L1-119": "subject_pronoun_she",
  "L1-183": "demonstrative_this",
  "L1-184": "article_an",
  "L2-086": "have_has",
  "L2-087": "be_are_plural",
  "L2-088": "there_is",
  "L2-089": "modal_can",
  "L2-145": "present_simple_i",
  "L2-146": "there_are",
  "L3-072": "present_simple_third",
  "L3-073": "present_continuous",
  "L3-074": "preposition_in_place",
  "L3-075": "past_simple_regular",
  "L3-123": "present_simple_third",
  "L3-124": "frequency_adverb",
  "L4-072": "there_are",
  "L4-073": "past_simple_regular",
  "L4-074": "comparative_short",
  "L4-075": "because_reason",
  "L4-121": "past_simple_irregular",
  "L4-122": "comparative_short",
  "L5-072": "modal_should",
  "L5-073": "modal_must",
  "L5-074": "comparative_short",
  "L5-075": "going_to_base",
  "L5-123": "future_will",
  "L5-124": "modal_should",
  "L6-160": "present_simple_third",
  "L6-161": "present_simple_third",
  "L6-162": "present_simple_third",
  "L6-163": "present_continuous",
  "L6-164": "present_continuous",
  "L6-165": "present_continuous",
  "L6-166": "past_simple_irregular",
  "L6-167": "past_simple_irregular",
  "L6-168": "past_simple_irregular",
  "L6-169": "comparative_short",
  "L6-170": "comparative_short",
  "L6-171": "comparative_short",
  "L6-172": "superlative_short",
  "L6-173": "superlative_short",
  "L6-174": "superlative_short",
  "L6-175": "present_perfect_have",
  "L6-176": "present_perfect_have",
  "L6-177": "present_perfect_have",
  "L6-178": "modal_should",
  "L6-179": "modal_should",
  "L6-180": "modal_should",
  "L6-181": "there_is",
  "L6-182": "there_is",
  "L6-183": "there_is",
  "L7-160": "past_simple_regular",
  "L7-161": "past_simple_regular",
  "L7-162": "past_simple_regular",
  "L7-163": "first_conditional",
  "L7-164": "first_conditional",
  "L7-165": "first_conditional",
  "L7-166": "present_perfect_been",
  "L7-167": "present_perfect_been",
  "L7-168": "present_perfect_been",
  "L7-169": "comparative_double",
  "L7-170": "comparative_double",
  "L7-171": "comparative_double",
  "L7-172": "present_continuous",
  "L7-173": "present_continuous",
  "L7-174": "present_continuous",
  "L7-175": "there_are",
  "L7-176": "there_are",
  "L7-177": "there_are",
  "L7-178": "arrive_at",
  "L7-179": "arrive_at",
  "L7-180": "arrive_at",
  "L7-181": "enjoy_gerund",
  "L7-182": "enjoy_gerund",
  "L7-183": "enjoy_gerund",
  "L8-160": "modal_should",
  "L8-161": "modal_should",
  "L8-162": "modal_should",
  "L8-163": "first_conditional",
  "L8-164": "first_conditional",
  "L8-165": "first_conditional",
  "L8-166": "superlative_short",
  "L8-167": "superlative_short",
  "L8-168": "superlative_short",
  "L8-169": "present_perfect_pastpart",
  "L8-170": "present_perfect_pastpart",
  "L8-171": "present_perfect_pastpart",
  "L8-172": "present_simple_passive",
  "L8-173": "present_simple_passive",
  "L8-174": "present_simple_passive",
  "L8-175": "past_continuous_interruption",
  "L8-176": "past_continuous_interruption",
  "L8-177": "past_continuous_interruption",
  "L8-178": "since_point",
  "L8-179": "since_point",
  "L8-180": "since_point",
  "L8-181": "present_passive_pastpart",
  "L8-182": "present_passive_pastpart",
  "L8-183": "present_passive_pastpart",
  "L9-160": "present_simple_third",
  "L9-161": "present_simple_third",
  "L9-162": "present_simple_third",
  "L9-163": "present_continuous",
  "L9-164": "present_continuous",
  "L9-165": "present_continuous",
  "L9-166": "past_continuous_interruption",
  "L9-167": "past_continuous_interruption",
  "L9-168": "past_continuous_interruption",
  "L9-169": "past_simple_regular",
  "L9-170": "past_simple_regular",
  "L9-171": "past_simple_regular",
  "L9-172": "going_to_future",
  "L9-173": "going_to_future",
  "L9-174": "going_to_future",
  "L9-175": "modal_should",
  "L9-176": "modal_should",
  "L9-177": "modal_should",
  "L9-178": "enjoy_gerund",
  "L9-179": "enjoy_gerund",
  "L9-180": "enjoy_gerund",
  "L9-181": "stative_present_simple",
  "L9-182": "stative_present_simple",
  "L9-183": "stative_present_simple",
  "L10-160": "first_conditional",
  "L10-161": "first_conditional",
  "L10-162": "first_conditional",
  "L10-163": "past_simple_passive",
  "L10-164": "past_simple_passive",
  "L10-165": "past_simple_passive",
  "L10-166": "present_simple_third",
  "L10-167": "present_simple_third",
  "L10-168": "present_simple_third",
  "L10-169": "relative_which",
  "L10-170": "relative_which",
  "L10-171": "relative_which",
  "L10-172": "for_duration",
  "L10-173": "for_duration",
  "L10-174": "for_duration",
  "L10-175": "present_simple_third",
  "L10-176": "present_simple_third",
  "L10-177": "present_simple_third",
  "L10-178": "modal_must_base",
  "L10-179": "modal_must_base",
  "L10-180": "modal_must_base",
  "L10-181": "made_from",
  "L10-182": "made_from",
  "L10-183": "made_from",
  "L11-160": "second_conditional",
  "L11-161": "second_conditional",
  "L11-162": "second_conditional",
  "L11-163": "relative_who",
  "L11-164": "relative_who",
  "L11-165": "relative_who",
  "L11-166": "should_have_pp",
  "L11-167": "should_have_pp",
  "L11-168": "should_have_pp",
  "L11-169": "present_simple_third",
  "L11-170": "present_simple_third",
  "L11-171": "present_simple_third",
  "L11-172": "future_passive",
  "L11-173": "future_passive",
  "L11-174": "future_passive",
  "L11-175": "since_point",
  "L11-176": "since_point",
  "L11-177": "since_point",
  "L11-178": "suggest_gerund",
  "L11-179": "suggest_gerund",
  "L11-180": "suggest_gerund",
  "L11-181": "past_simple_regular",
  "L11-182": "past_simple_regular",
  "L11-183": "past_simple_regular",
  "L12-160": "third_conditional",
  "L12-161": "third_conditional",
  "L12-162": "third_conditional",
  "L12-163": "ask_for",
  "L12-164": "ask_for",
  "L12-165": "ask_for",
  "L12-166": "past_passive_considered",
  "L12-167": "past_passive_considered",
  "L12-168": "past_passive_considered",
  "L12-169": "modal_must_base",
  "L12-170": "modal_must_base",
  "L12-171": "modal_must_base",
  "L12-172": "interested_in",
  "L12-173": "interested_in",
  "L12-174": "interested_in",
  "L12-175": "past_perfect",
  "L12-176": "past_perfect",
  "L12-177": "past_perfect",
  "L12-178": "despite_gerund",
  "L12-179": "despite_gerund",
  "L12-180": "despite_gerund",
  "L12-181": "so_that",
  "L12-182": "so_that",
  "L12-183": "so_that"
};
 const rules={
  "be_am_i": {
    "title": "فعل be مع I",
    "explanation": "مع الضمير I نستخدم am في المضارع. الصيغة هنا: I + am + اسم/صفة.",
    "example": "I am a student."
  },
  "be_is_singular": {
    "title": "فعل be مع المفرد",
    "explanation": "نستخدم is مع الاسم المفرد أو الضمير he/she/it في المضارع.",
    "example": "This is my book."
  },
  "plural_regular": {
    "title": "جمع الاسم المعدود",
    "explanation": "غالبًا نضيف s إلى الاسم المفرد المعدود لتكوين الجمع.",
    "example": "two cats"
  },
  "subject_pronoun_she": {
    "title": "ضمائر الفاعل",
    "explanation": "نستخدم she بدل اسم مؤنث عندما يكون هو الفاعل في الجملة.",
    "example": "She is my mother."
  },
  "demonstrative_this": {
    "title": "أسماء الإشارة: This",
    "explanation": "نستخدم This للإشارة إلى شيء مفرد قريب من المتحدث؛ أما These فللجمع القريب.",
    "example": "This is a pen."
  },
  "article_an": {
    "title": "أداة التنكير an",
    "explanation": "نستخدم an قبل الاسم المفرد المعدود الذي يبدأ بصوت متحرك، وليس لمجرد أن حرفه الأول متحرك.",
    "example": "I have an apple."
  },
  "have_has": {
    "title": "Have وHas",
    "explanation": "نستخدم has مع he/she/it أو الاسم المفرد، ونستخدم have مع I/you/we/they والجمع.",
    "example": "She has a red bag."
  },
  "be_are_plural": {
    "title": "فعل be مع الجمع",
    "explanation": "نستخدم are مع you/we/they ومع الأسماء الجمع في المضارع.",
    "example": "They are happy."
  },
  "there_is": {
    "title": "There is للمفرد",
    "explanation": "نستخدم There is قبل الاسم المفرد، للدلالة على وجود شيء واحد.",
    "example": "There is a library here."
  },
  "modal_can": {
    "title": "Can + الفعل الأساسي",
    "explanation": "بعد can نضع الفعل في صورته الأساسية دون to أو s أو ing.",
    "example": "I can play football."
  },
  "present_simple_i": {
    "title": "المضارع البسيط مع I",
    "explanation": "نستخدم الفعل الأساسي مع I في المضارع البسيط، دون إضافة s.",
    "example": "I like apples."
  },
  "there_are": {
    "title": "There are للجمع",
    "explanation": "نستخدم There are قبل الاسم الجمع للدلالة على وجود أكثر من شيء.",
    "example": "There are two books."
  },
  "present_simple_third": {
    "title": "المضارع البسيط مع المفرد الغائب",
    "explanation": "في المضارع البسيط نضيف s أو es إلى الفعل مع he/she/it أو اسم مفرد؛ ويُستخدم للعادة أو الحقيقة.",
    "example": "She plays tennis every Friday."
  },
  "present_continuous": {
    "title": "المضارع المستمر",
    "explanation": "للحدث الجاري الآن نستخدم am/is/are + verb-ing، مع اختيار be المناسب للفاعل.",
    "example": "They are watching a documentary now."
  },
  "preposition_in_place": {
    "title": "حرف الجر in للمكان",
    "explanation": "نستخدم in عندما يكون الشيء داخل مساحة أو حيز، مثل صندوق أو غرفة.",
    "example": "The ball is in the box."
  },
  "past_simple_regular": {
    "title": "الماضي البسيط للأفعال المنتظمة",
    "explanation": "لحدث انتهى في الماضي نستخدم التصريف الثاني؛ والأفعال المنتظمة غالبًا تنتهي بـ ed.",
    "example": "The audience listened quietly."
  },
  "frequency_adverb": {
    "title": "موضع ظرف التكرار",
    "explanation": "يأتي ظرف التكرار مثل always غالبًا قبل الفعل الرئيسي، وبعد فعل be.",
    "example": "I always wake up early."
  },
  "comparative_short": {
    "title": "صيغة المقارنة",
    "explanation": "نستخدم صيغة المقارنة للصفات القصيرة بإضافة er غالبًا، ثم than عند ذكر الطرف الثاني.",
    "example": "A plane is faster than a car."
  },
  "because_reason": {
    "title": "Because لذكر السبب",
    "explanation": "نستخدم because لربط النتيجة بالسبب، وتأتي بعدها جملة تحتوي على فاعل وفعل.",
    "example": "I stayed home because I was tired."
  },
  "past_simple_irregular": {
    "title": "الماضي البسيط للفعل الشاذ",
    "explanation": "بعض الأفعال لا تأخذ ed في الماضي، بل لها تصريف ثانٍ خاص يجب حفظه مثل go → went.",
    "example": "We went to Nizwa yesterday."
  },
  "modal_should": {
    "title": "Should للنصيحة",
    "explanation": "نستخدم should لتقديم النصيحة أو التوصية، ويتبعها الفعل الأساسي دون to أو s.",
    "example": "You should drink enough water."
  },
  "modal_must": {
    "title": "Must للإلزام",
    "explanation": "نستخدم must للتعبير عن ضرورة أو إلزام قوي، ويتبعها الفعل الأساسي دون to.",
    "example": "You must wear a seat belt."
  },
  "going_to_base": {
    "title": "Going to + المصدر",
    "explanation": "بعد am/is/are going to نستخدم الفعل في صورته الأساسية دون s أو ed أو ing.",
    "example": "I am going to finish my project."
  },
  "future_will": {
    "title": "Will للمستقبل",
    "explanation": "نستخدم will + الفعل الأساسي للتعبير عن قرار أو توقع أو حدث مستقبلي.",
    "example": "I will help you."
  },
  "superlative_short": {
    "title": "صيغة التفضيل",
    "explanation": "نستخدم the + الصفة القصيرة مع est غالبًا عند مقارنة شيء بمجموعة كاملة.",
    "example": "This is the safest helmet in the shop."
  },
  "present_perfect_have": {
    "title": "المضارع التام: have + التصريف الثالث",
    "explanation": "نستخدم have/has + past participle للتعبير عن تجربة أو حدث له صلة بالحاضر؛ ومع I نستخدم have.",
    "example": "I have visited this museum before."
  },
  "first_conditional": {
    "title": "الشرط الأول",
    "explanation": "للاحتمال الحقيقي في المستقبل: If + present simple, will + base verb.",
    "example": "If it rains, we will stay inside."
  },
  "present_perfect_been": {
    "title": "Present perfect مع been",
    "explanation": "نستخدم has/have + been عند الحديث عن تجربة زيارة أو وجود في مكان حتى الآن.",
    "example": "She has been to Salalah."
  },
  "comparative_double": {
    "title": "مقارنة الصفات القصيرة مع مضاعفة الحرف",
    "explanation": "بعض الصفات القصيرة التي تنتهي بحرف ساكن بعد حركة قصيرة تضاعف الحرف الأخير قبل إضافة er.",
    "example": "The elephant is bigger than the lion."
  },
  "arrive_at": {
    "title": "Arrive at + مكان محدد",
    "explanation": "نستخدم arrive at مع مكان أو نقطة محددة مثل airport أو station، بينما arrive in تُستخدم عادةً مع المدن والدول.",
    "example": "We arrived at the airport early."
  },
  "enjoy_gerund": {
    "title": "Enjoy + gerund",
    "explanation": "يأتي بعد enjoy فعل بصيغة -ing؛ لأن enjoy من الأفعال التي يتبعها gerund وليس to-infinitive.",
    "example": "He enjoys visiting new places."
  },
  "present_perfect_pastpart": {
    "title": "المضارع التام: has + التصريف الثالث",
    "explanation": "بعد has في المضارع التام نستخدم التصريف الثالث للفعل (past participle)، وليس الماضي البسيط لمجرد وجود ed.",
    "example": "She has finished her homework."
  },
  "present_simple_passive": {
    "title": "المضارع البسيط للمجهول",
    "explanation": "صيغة المبني للمجهول في المضارع البسيط: am/is/are + past participle؛ نركز على ما يحدث للشيء.",
    "example": "The mountain is visited by many visitors."
  },
  "past_continuous_interruption": {
    "title": "الماضي المستمر مع حدث قاطع",
    "explanation": "نستخدم was/were + verb-ing للفعل المستمر في الماضي، ثم الماضي البسيط للحدث الذي قطعه.",
    "example": "I was cycling when it started to rain."
  },
  "since_point": {
    "title": "Since + نقطة بداية",
    "explanation": "نستخدم since مع نقطة بداية زمنية محددة، مثل سنة أو تاريخ، مع المضارع التام غالبًا.",
    "example": "We have lived here since 2021."
  },
  "present_passive_pastpart": {
    "title": "المبني للمجهول: be + التصريف الثالث",
    "explanation": "بعد فعل be في المبني للمجهول نستخدم التصريف الثالث للفعل؛ هنا receipt هو الشيء الذي يُعطى.",
    "example": "A receipt is given after payment."
  },
  "going_to_future": {
    "title": "Be going to للمستقبل المخطط",
    "explanation": "نستخدم am/is/are going to + الفعل الأساسي للتعبير عن خطة أو نية مستقبلية.",
    "example": "We are going to visit the science museum tomorrow."
  },
  "stative_present_simple": {
    "title": "أفعال الحالة في المضارع البسيط",
    "explanation": "الفعل know يصف حالة أو معرفة، لذلك نستخدم المضارع البسيط عادةً حتى مع right now، لا المضارع المستمر.",
    "example": "He knows the answer right now."
  },
  "past_simple_passive": {
    "title": "الماضي البسيط للمجهول",
    "explanation": "صيغة المبني للمجهول في الماضي: was/were + past participle.",
    "example": "The report was written by a journalist."
  },
  "relative_which": {
    "title": "ضمير الوصل Which",
    "explanation": "نستخدم which للعودة إلى شيء أو حيوان في جملة الوصل، وليس إلى شخص.",
    "example": "The article which I read was interesting."
  },
  "for_duration": {
    "title": "For + مدة زمنية",
    "explanation": "نستخدم for مع مدة زمنية مثل three years أو many years؛ أما since فتأتي مع نقطة بداية.",
    "example": "Scientists have studied climate change for years."
  },
  "modal_must_base": {
    "title": "Must + الفعل الأساسي",
    "explanation": "بعد must يأتي الفعل في صورته الأساسية مباشرةً، دون to أو s أو ing.",
    "example": "We must check reliable sources."
  },
  "made_from": {
    "title": "Made from + مادة خام",
    "explanation": "نستخدم made from عندما تتحول المادة أو تتغير صورتها في المنتج النهائي.",
    "example": "The bag was made from recycled materials."
  },
  "second_conditional": {
    "title": "الشرط الثاني",
    "explanation": "للحالة الافتراضية أو غير المرجحة في الحاضر: If + past simple, would + base verb.",
    "example": "I would travel more if I had more free time."
  },
  "relative_who": {
    "title": "ضمير الوصل Who",
    "explanation": "نستخدم who للعودة إلى شخص في جملة الوصل، ويأتي بعدها وصف أو معلومة عنه.",
    "example": "The guide, who speaks Arabic, helped us."
  },
  "should_have_pp": {
    "title": "Should have + التصريف الثالث",
    "explanation": "نستخدم should have + past participle للنصيحة أو النقد بشأن شيء كان من الأفضل فعله في الماضي.",
    "example": "You should have emailed before arriving."
  },
  "future_passive": {
    "title": "المستقبل للمجهول",
    "explanation": "صيغة المبني للمجهول في المستقبل: will be + past participle.",
    "example": "The results will be announced tomorrow."
  },
  "suggest_gerund": {
    "title": "Suggest + gerund",
    "explanation": "يأتي بعد suggest فعل بصيغة -ing عند اقتراح القيام بنشاط.",
    "example": "He suggested taking a virtual tour."
  },
  "third_conditional": {
    "title": "الشرط الثالث",
    "explanation": "للتحدث عن نتيجة افتراضية لم تحدث في الماضي: If + past perfect, would have + past participle.",
    "example": "If I had applied earlier, I would have met the deadline."
  },
  "ask_for": {
    "title": "Ask for + الشيء المطلوب",
    "explanation": "نستخدم ask for قبل الشيء الذي يطلبه الشخص، مثل help أو a refund.",
    "example": "The customer asked for a refund."
  },
  "past_passive_considered": {
    "title": "الماضي للمجهول مع considered",
    "explanation": "نستخدم was/were + past participle في الماضي للمجهول؛ was considered تعني اعتُبر.",
    "example": "The advert was considered misleading by viewers."
  },
  "interested_in": {
    "title": "Interested in + اسم أو gerund",
    "explanation": "التعبير الثابت هو interested in، ويأتي بعد in اسم أو فعل بصيغة -ing.",
    "example": "She is interested in hospitality."
  },
  "past_perfect": {
    "title": "الماضي التام",
    "explanation": "نستخدم had + past participle لحدث وقع قبل حدث آخر في الماضي.",
    "example": "The flight had departed before we reached the airport."
  },
  "despite_gerund": {
    "title": "Despite + اسم أو gerund",
    "explanation": "يأتي بعد despite اسم أو فعل بصيغة -ing، ولا نضع بعدها جملة كاملة مباشرةً دون of.",
    "example": "Despite being busy, he helped guests."
  },
  "so_that": {
    "title": "So + adjective + that",
    "explanation": "نستخدم so + صفة + that للتعبير عن نتيجة قوية أو أثر مترتب على الصفة.",
    "example": "The service was so efficient that everyone was satisfied."
  }
};
 const warnedMissing=new Set();
 function render(q,escapeHtml){
  if(!q||q.type!=='Grammar')return '';
  const esc=typeof escapeHtml==='function'?escapeHtml:(v=>String(v??''));
  const ruleId=questionRules[String(q.id||'')];
  const rule=ruleId?rules[ruleId]:null;
  let explanation='',title='شرح القاعدة';
  if(rule){title=rule.title;explanation=rule.explanation+' مثال: '+rule.example;}
  else{
   const id=String(q.id||'unknown');
   if(!warnedMissing.has(id)){
    warnedMissing.add(id);
    if(typeof console!=='undefined'&&console.warn)console.warn('[MEJ grammar feedback] Missing grammarRuleId for question:',id);
   }
   explanation='لم تُسند إلى هذا السؤال قاعدة محددة بعد. راجع الإجابة الصحيحة دون افتراض قاعدة غير مؤكدة.';
  }
  const prompt=String(q.prompt||'').replace(/___|_{2,}/g,String(q.answer||''));
  return '<div class="mej-grammar-rule" dir="rtl" style="margin-top:12px;padding:12px 14px;background:#edf8ff;border:2px solid #69b5e4;border-radius:12px;color:#164069;font-size:16px;line-height:1.8;text-align:right"><strong>📘 '+esc(title)+'</strong><div>'+esc(explanation)+'</div><div style="margin-top:5px;font-weight:700;color:#116047">✓ '+esc(prompt)+'</div></div>';
 }
 return {questionRules,rules,render};
});
