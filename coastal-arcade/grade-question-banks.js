/* My English Journey: level-specific, varied game question banks.
 * Educational practice material, NOT copied from or certified as Ministry examination questions.
 * Effective stage (not registered student grade) selects one of twelve banks.
 */
(function(root){'use strict';
const V={
1:[['apple','تفاحة','🍎','a red or green fruit'],['cat','قطة','🐈','a small pet that says meow'],['dog','كلب','🐕','a pet that barks'],['book','كتاب','📕','something you read'],['pen','قلم','🖊️','something you write with'],['sun','شمس','☀️','the star in our sky'],['fish','سمكة','🐟','an animal that swims'],['ball','كرة','⚽','something you play with'],['tree','شجرة','🌳','a tall plant'],['car','سيارة','🚗','a vehicle on roads'],['milk','حليب','🥛','a white drink'],['house','بيت','🏠','a place to live']],
2:[['school','مدرسة','🏫','a place for lessons'],['teacher','معلم','🧑‍🏫','a person who teaches'],['chair','كرسي','🪑','something you sit on'],['table','طاولة','🪑','furniture with a flat top'],['door','باب','🚪','an entrance'],['window','نافذة','🪟','a glass opening'],['bird','طائر','🐦','an animal with wings'],['flower','زهرة','🌼','a colourful plant'],['banana','موز','🍌','a yellow fruit'],['bread','خبز','🍞','food from flour'],['bag','حقيبة','🎒','something to carry books'],['rain','مطر','🌧️','water that falls from clouds']],
3:[['library','مكتبة','📚','a place to borrow books'],['hospital','مستشفى','🏥','a place for medical care'],['doctor','طبيب','🧑‍⚕️','someone who treats patients'],['farmer','فلاح','🧑‍🌾','someone who grows crops'],['mountain','جبل','⛰️','a very high hill'],['beach','شاطئ','🏖️','sand by the sea'],['boat','قارب','⛵','a vehicle on water'],['bicycle','دراجة','🚲','a vehicle with two wheels'],['clock','ساعة','🕒','shows the time'],['map','خريطة','🗺️','shows places'],['river','نهر','🏞️','moving water'],['family','عائلة','👨‍👩‍👦','parents and children']],
4:[['museum','متحف','🏛️','a place showing old objects'],['fort','قلعة','🏰','a strong old building'],['camel','جمل','🐪','a desert animal'],['desert','صحراء','🏜️','a hot dry place'],['village','قرية','🏘️','a small community'],['market','سوق','🏬','a place where people shop'],['garden','حديقة','🌻','a place for plants'],['turtle','سلحفاة','🐢','an animal with a shell'],['recycle','إعادة التدوير','♻️','use old things again'],['island','جزيرة','🏝️','land surrounded by water'],['bridge','جسر','🌉','crosses water or a road'],['weather','طقس','🌦️','conditions in the sky']],
5:[['forest','غابة','🌲','an area with many trees'],['ocean','محيط','🌊','a very large sea'],['planet','كوكب','🪐','a world going around a star'],['telescope','تلسكوب','🔭','used to see distant objects'],['scientist','عالم','🔬','someone who studies science'],['compass','بوصلة','🧭','shows direction'],['volunteer','متطوع','🙋','someone who helps freely'],['festival','مهرجان','🎪','a public celebration'],['pollution','تلوث','🏭','harmful waste in air or water'],['helmet','خوذة','⛑️','protects the head'],['journey','رحلة','🧳','travel from one place to another'],['reusable','قابل لإعادة الاستخدام','♻️','can be used again']],
6:[['wildlife','حياة برية','🦓','animals living in nature'],['habitat','موطن طبيعي','🌳','a natural home for an animal'],['research','بحث','🔬','careful study to learn facts'],['coast','ساحل','🏖️','land next to the sea'],['oxygen','أكسجين','🫧','a gas needed for breathing'],['climate','مناخ','🌤️','usual weather of a region'],['tradition','تقليد','🏺','a practice passed down'],['message','رسالة','✉️','something sent to another person'],['invention','اختراع','💡','a useful new creation'],['battery','بطارية','🔋','stores electrical energy'],['transport','نقل','🚌','moving people or goods'],['compost','سماد عضوي','🌱','decayed matter used for plants']],
7:[['energy','طاقة','🔆','power that makes things work'],['renewable','متجدد','☀️','naturally replaced over time'],['environment','البيئة','🌍','the natural world around us'],['community','مجتمع','🏘️','people living in one area'],['heritage','تراث','🏺','customs and things from the past'],['technology','تقنية','💻','tools based on scientific knowledge'],['experiment','تجربة','🧪','a test used to find facts'],['recycle','إعادة تدوير','♻️','process waste into new materials'],['volunteer','متطوع','🙋','someone who helps freely'],['document','وثيقة','📄','a written record'],['protect','يحمي','🛡️','keep something safe'],['tourism','سياحة','🧳','visiting places for pleasure']],
8:[['research','بحث','🔬','careful study of a question'],['museum','متحف','🏛️','a place displaying important objects'],['recycling','إعادة التدوير','♻️','making new products from waste'],['habitat','موطن','🌳','an animal’s natural home'],['telescope','تلسكوب','🔭','a tool to view distant things'],['conservation','حماية الموارد','🌱','careful protection of nature'],['volunteer','متطوع','🙋','someone who helps freely'],['project','مشروع','📋','planned work with a goal'],['survey','استبيان','📊','questions asked to gather opinions'],['library','مكتبة','📚','a place to read or borrow books'],['cooperation','تعاون','🤝','working together'],['heritage','تراث','🏺','things inherited from the past']],
9:[['communication','تواصل','💬','sharing information with others'],['identity','هوية','🪪','who someone is'],['connection','اتصال','🔗','a link between people or things'],['network','شبكة','🕸️','connected people or devices'],['culture','ثقافة','🎭','the way people live and think'],['tradition','تقاليد','🏺','customs passed through families'],['migration','هجرة','🧭','moving to a different region'],['conservation','حفاظ','🌱','protecting natural resources'],['evidence','دليل','🔎','facts supporting an idea'],['community','مجتمع','🏘️','people who share an area'],['opinion','رأي','💬','what someone thinks'],['interview','مقابلة','🎤','questions asked to someone']],
10:[['climate','مناخ','🌤️','typical weather over many years'],['emissions','انبعاثات','🏭','gases released into the air'],['renewable','متجدد','☀️','able to be replaced naturally'],['sustainable','مستدام','🌱','able to continue without waste'],['biodiversity','تنوع حيوي','🦋','variety of living organisms'],['conservation','حفاظ','🛡️','protection of resources'],['research','بحث','🔬','systematic investigation'],['evidence','دليل','📊','facts used to support a claim'],['reliable','موثوق','✅','able to be trusted'],['heritage','تراث','🏺','cultural traditions and history'],['volunteering','تطوع','🤝','helping without payment'],['pollution','تلوث','🌫️','harmful substances in the environment']],
11:[['innovation','ابتكار','💡','a useful new idea or method'],['perspective','وجهة نظر','👀','a particular way of seeing something'],['analysis','تحليل','📊','careful study of information'],['consequence','نتيجة','🔁','an effect of an action'],['interpret','يفسر','📖','explain the meaning of something'],['evaluate','يقيّم','📝','judge the quality of something'],['responsibility','مسؤولية','🤝','a duty to act properly'],['adaptation','تكيّف','🌿','adjusting to new conditions'],['collaboration','تعاون','🧩','working together on a task'],['heritage','تراث','🏺','things inherited from the past'],['survey','استبيان','📊','questions used to collect information'],['solution','حل','💡','an answer to a problem']],
12:[['sustainability','استدامة','🌱','using resources without exhausting them'],['innovation','ابتكار','💡','a new and useful idea'],['biodiversity','تنوع حيوي','🦋','the variety of living things'],['evidence','دليل','🔍','facts that support a conclusion'],['hypothesis','فرضية','🧪','a testable explanation'],['perspective','منظور','👀','a particular point of view'],['conservation','حماية الموارد','🛡️','protecting natural resources'],['resilience','مرونة','🌊','the ability to recover from difficulty'],['collaboration','تعاون','🤝','working together'],['responsibility','مسؤولية','🤝','a duty to act properly'],['renewable','متجدد','☀️','naturally replaced'],['interpretation','تفسير','📖','an explanation of meaning']]
};
const G={
early:[
['I ___ a student.',['am','is','are'],'am','Use am after I.'],
['She ___ happy.',['is','am','are'],'is','She goes with is.'],
['We ___ at school.',['are','is','am'],'are','We goes with are.'],
['I have two ___.',['books','book','booking'],'books','Two takes a plural noun.'],
['The ___ is yellow.',['sun','stars','tree'],'sun','Sun is singular.'],
['He ___ a red bag.',['has','have','having'],'has','He takes has.'],
['The cat ___ small.',['is','are','am'],'is','The cat is singular.'],
['They ___ football.',['play','plays','playing'],'play','They takes play.'],
['I can ___.',['swim','swims','swimming'],'swim','After can, use the base verb.'],
['These ___ pencils.',['are','is','am'],'are','These takes are.'],
['My mother ___ kind.',['is','are','be'],'is','Use is with one person.'],
['An apple ___ a fruit.',['is','are','am'],'is','An apple is singular.'],
['Where ___ my book?',['is','are','do'],'is','One book takes is.'],
['We ___ lunch at school.',['eat','eats','eating'],'eat','Use eat with we.']
],
primary:[
['She ___ to school every day.',['walks','walk','walking'],'walks','He or she takes -s in the present simple.'],
['Yesterday I ___ my grandmother.',['visited','visit','visiting'],'visited','Yesterday tells us it is past.'],
['There ___ three boats.',['are','is','was'],'are','Three boats is plural.'],
['I am ___ a book now.',['reading','read','reads'],'reading','Now can show an action in progress.'],
['The bag is ___ than the box.',['smaller','small','smallest'],'smaller','Use the comparative smaller.'],
['They ___ at home last night.',['were','was','are'],'were','They takes were in the past.'],
['I ___ to the market on Fridays.',['go','goes','went'],'go','Use go with I for routines.'],
['Please ___ the door.',['open','opens','opened'],'open','An instruction uses the base form.'],
['My sister ___ a bicycle.',['has','have','having'],'has','She takes has.'],
['The children ___ in the garden now.',['are playing','play','plays'],'are playing','Use are + -ing for now.'],
['We ___ the museum last week.',['visited','visit','visits'],'visited','Last week means past simple.'],
['The sky ___ blue today.',['is','are','were'],'is','The sky is singular.'],
['He can ___ English.',['speak','speaks','spoke'],'speak','Can takes a base verb.'],
['I would like ___ water.',['some','many','few'],'some','Water is uncountable.']
],
intermediate:[
['Yesterday we ___ the museum.',['visited','visit','visiting'],'visited','Use the past simple for yesterday.'],
['She ___ her homework every evening.',['does','do','doing'],'does','She takes does.'],
['There ___ many visitors.',['are','is','was'],'are','Visitors is plural.'],
['If it rains, we ___ inside.',['will stay','stayed','would stay'],'will stay','First conditional: if + present, will + verb.'],
['They have lived here ___ 2020.',['since','for','during'],'since','Since gives a starting point.'],
['You should ___ water.',['drink','drank','drinks'],'drink','Should takes the base form.'],
['This bag is ___ than that one.',['heavier','heaviest','heavy'],'heavier','Use comparative adjectives with than.'],
['The posters ___ by students yesterday.',['were made','made','are making'],'were made','Passive past plural: were + participle.'],
['He was reading when I ___.',['called','call','calling'],'called','A short completed past action uses past simple.'],
['She has ___ finished.',['already','yet','tomorrow'],'already','Use already for an affirmative completed action.'],
['The road was closed ___ the rain.',['because of','although','despite'],'because of','Because of introduces a reason noun.'],
['We look forward to ___ you.',['seeing','see','seen'],'seeing','After look forward to, use -ing.'],
['The book ___ I borrowed is interesting.',['that','who','where'],'that','Use that for an object.'],
['The team ___ the project last Monday.',['completed','complete','completes'],'completed','Last Monday is in the past.'],
['He has been here ___ three hours.',['for','since','by'],'for','For gives a duration.']
],
advanced:[
['If the weather improves, we ___ to the beach.',['will go','went','would go'],'will go','First conditional: if + present, will + base verb.'],
['The report ___ yesterday.',['was published','published','is publish'],'was published','Past simple passive: was + past participle.'],
['They ___ the experiment before writing the report.',['completed','completing','completes'],'completed','Use a past form for a finished action.'],
['She is interested ___ environmental science.',['in','on','at'],'in','Interested in is the correct phrase.'],
['The findings ___ clearly in the graph.',['are shown','shows','showing'],'are shown','Plural passive: are + past participle.'],
['Although the task was difficult, we ___ it.',['finished','finish','finishing'],'finished','A completed past event takes past simple.'],
['We should ___ less plastic.',['use','using','used'],'use','Should takes a base verb.'],
['The survey ___ carried out last week.',['was','were','is being'],'was','Survey is singular and last week is past.'],
['Many students prefer ___ in groups.',['working','work','worked'],'working','Prefer + -ing is natural here.'],
['The museum ___ by tourists each year.',['is visited','visits','visited'],'is visited','The museum receives the action.'],
['This source is more reliable ___ the other one.',['than','then','that'],'than','Comparisons use than.'],
['The article ___ three possible solutions.',['suggests','suggest','suggesting'],'suggests','Article is singular.'],
['If I had more time, I ___ more often.',['would read','will read','read'],'would read','Second conditional: would + base verb.'],
['The students have ___ the task.',['completed','complete','completing'],'completed','Have + past participle.'],
['The presentation was helpful ___ it was short.',['although','because','so'],'although','Although introduces contrast.'],
['The teacher asked us ___ our ideas.',['to explain','explain','explaining'],'to explain','Ask someone to + verb.'],
['We decided ___ the plan.',['to change','changing','changed'],'to change','Decide to + verb.'],
['The results were ___ by the team.',['checked','checking','checks'],'checked','Were + past participle.']
]};
const BASE_SENTENCES={
early:['I can swim.','This is my bag.','The cat is small.','My book is blue.','We go to school.','She has a pen.','I like red apples.','The bird can fly.','Our teacher is kind.','The sun is hot.','We play outside.','I have two books.','My family is happy.','The ball is under the chair.','He likes milk.','The dog runs fast.','They are my friends.'],
primary:['I went to the market yesterday.','We visited the museum on Friday.','The children are playing outside.','She can ride a bicycle.','Our family went to the beach.','The boat sailed across the sea.','I always finish my homework.','This village has a small school.','The doctor works at the hospital.','We should keep the beach clean.','My friends enjoy reading stories.','The weather is sunny today.','The market is near the fort.','We learned about Omani culture.','The turtle lives in the sea.','The teacher showed us a map.'],
intermediate:['We should protect the environment.','The students visited the museum yesterday.','Our community can reduce plastic waste.','She was reading when I called.','If it rains, we will stay inside.','We have lived in Oman for three years.','The scientist explained the results clearly.','The library is quieter than the playground.','Many people use reusable water bottles.','The project was completed last month.','He has already finished his homework.','The team planted trees near the beach.','We should respect local traditions.','The school organised a recycling campaign.','Students should listen to different opinions.','The experiment helped us understand the problem.'],
advanced:['Renewable energy can reduce pollution.','The report presents three possible solutions.','Students should evaluate sources carefully.','The researcher explained the results in the report.','Communities can help protect natural resources.','The article discusses the advantages of recycling.','Reliable evidence can strengthen an argument.','The team completed the project last week.','Schools should encourage students to volunteer.','The museum provides information about local heritage.','Some people prefer online learning to traditional lessons.','The results were presented in a clear chart.','The committee suggested a practical solution.','The writer supports her opinion with examples.','We must consider the effect on the environment.','The project was successful because everyone helped.']
};
const GRADE_SENTENCES={
1:['I see a red apple.','My cat is sleeping.','The fish is in the water.','This is my school.'],
2:['Our classroom has a window.','The teacher has a book.','I eat bread for breakfast.','The flowers are beautiful.'],
3:['The doctor works in a hospital.','We crossed the river yesterday.','My family went to the library.','The boat is near the beach.'],
4:['The museum is next to the market.','Omani forts are important buildings.','The turtle swam in the sea.','Our village has a beautiful garden.'],
5:['We used a telescope to see the moon.','Volunteers cleaned the beach on Saturday.','The scientist planned a new experiment.','Our journey began in the morning.'],
6:['A healthy habitat protects wildlife.','We need oxygen to stay alive.','The climate affects plants and animals.','Our class collected facts for research.'],
7:['Technology helps us share information.','Renewable energy can save resources.','Everyone can help protect the environment.','The volunteers completed the project.'],
8:['The survey asked students about recycling.','Our group visited the museum for research.','Many animals need a safe habitat.','Working together can improve a project.'],
9:['Communication helps people understand each other.','Cultural traditions are part of our identity.','The article explains a connection between ideas.','We considered different opinions in our discussion.'],
10:['Climate change can affect coastal communities.','The report presents evidence about pollution.','Renewable energy is important for the future.','We should compare reliable sources of information.'],
11:['The writer explained two possible solutions.','Collaboration helped the students finish the project.','Our class evaluated the evidence in the article.','A good conclusion follows from strong examples.'],
12:['The investigation used reliable sources.','The results supported the original hypothesis.','Sustainability is an important long-term goal.','The author explained the limitations of the evidence.']
};
const E={
easy:[
['The school starts at eight.','the school timetable','a guess from a friend','an old poster'],
['The library closes at four.','the library opening hours','a story without a date','a colourful picture'],
['Tomorrow is a school holiday.','the school announcement','an unknown rumour','a shop advert'],
['A plant grew taller.','measurements from two days','a child’s favourite colour','a song about plants'],
['The bus leaves at seven.','the bus timetable','a guess','a newspaper from last year'],
['The market opens in the morning.','the market opening hours','a friend’s drawing','an old postcard'],
['A museum opens on Friday.','the museum website','an undated photo','a story about birds'],
['The class has twenty pupils.','the class register','a visitor’s guess','a weather forecast'],
['It rained yesterday.','yesterday’s weather records','an old painting','a holiday advert'],
['A book has 50 pages.','the number printed on its pages','a song','an empty notebook'],
['The school trip is on Monday.','the teacher’s written notice','a neighbour’s guess','a sports poster'],
['The shop sells fresh fruit.','a current product list','an old photo of a bus','a story about pets']
],
middle:[
['The club meets on Tuesday.','the official club schedule','a friend’s memory','a poster without a date'],
['The bus was late last week.','dated bus arrival records','an unrelated photograph','a student’s favourite song'],
['The school used less electricity.','meter readings before and after','the school logo','a personal guess'],
['The beach was cleaner after a campaign.','recorded litter counts','a holiday advert','a drawing of the sea'],
['A museum has new opening hours.','the museum’s current website','a very old brochure','a personal opinion'],
['A recycling project collected 80 bottles.','the recorded collection total','a colourful poster','a bus ticket'],
['The number of visitors increased.','visitor records for both months','a painting','a one-day guess'],
['The experiment showed a change.','measurements taken twice','a friend’s prediction','a travel magazine'],
['People prefer a new bus route.','responses to a passenger survey','one driver’s guess','a cinema advert'],
['A species needs protection.','a recent wildlife report','a music review','an anonymous comment'],
['The school library has many books.','the library inventory','a student’s favourite colour','a weather chart'],
['Rainfall was higher last year.','rainfall records from both years','a beach photograph','a tourist advert']
],
upper:[
['The class survey reports that students read more.','the survey results and dates','a personal guess','a colourful cover'],
['The new route is shorter.','measured distances for both routes','a travel slogan','an old postcard'],
['A recycling campaign reduced waste.','waste totals before and after','one anonymous comment','a project logo'],
['Electricity use fell after new lights were installed.','meter readings before and after','a social media rumour','the colour of the lights'],
['Students improved their reading scores.','scores from comparable tests','one teacher’s feeling','a library photo'],
['The local museum had more visitors.','monthly visitor records','an undated photograph','an unrelated advert'],
['The water became cleaner after treatment.','repeated laboratory tests','an unlabelled image','a tourist brochure'],
['The report says a plant grows faster in sunlight.','controlled growth measurements','one colourful picture','an old newspaper'],
['A website claims the rainfall increased.','official weather records over time','a comment without a source','a travel advert'],
['The survey reflects the whole school.','responses collected across grades','one class only','one student’s opinion'],
['The project increased participation.','attendance data from two periods','a personal prediction','a promotional flyer'],
['A species is now less common.','recent conservation surveys','a holiday review','a magazine cover'],
['The campaign saved money.','receipts and cost records','a television slogan','an unknown guess'],
['The experiment was repeated successfully.','the recorded repeat test results','an old poster','a colourful design']
]};
const D={
simple:[
['Salim took an umbrella because dark clouds covered the sky. Why?','He expected rain.',['He expected rain.','He lost his bag.','He wanted shade.']],
['The class went to the library to borrow books. Why did they go?','To borrow books.',['To borrow books.','To play football.','To buy food.']],
['Maha watered the plant every day. It grew taller. What helped the plant?','Water.',['Water.','Paint.','Sand.']],
['The bus was late, so the pupils waited. Why did they wait?','The bus was late.',['The bus was late.','The school was closed.','They were eating.']],
['The sea was rough, so the boat returned. Why?','The weather was unsafe.',['The weather was unsafe.','The crew wanted tea.','The map was missing.']],
['Ali put on a jacket before going outside. What might the weather be?','Cold.',['Cold.','Very hot.','Dry and warm.']],
['The museum closed at five, so they arrived at three. Why?','To visit before closing.',['To visit before closing.','To sleep there.','To miss the visit.']],
['The teacher told the class to recycle paper. What should they do?','Reuse or recycle paper.',['Reuse or recycle paper.','Throw books into the sea.','Burn the paper.']],
['The team planted trees near the school. What was their goal?','To improve the area.',['To improve the area.','To build a bus.','To paint a car.']],
['Fahad read the instructions before starting. Why?','To understand the task.',['To understand the task.','To delay the lesson.','To avoid reading.']],
['The shop was closed, so Sara returned home. Why?','She could not shop.',['She could not shop.','The market was free.','She bought everything.']],
['The farmer covered the plants before a cold night. Why?','To protect them.',['To protect them.','To hide a book.','To water the road.']]
],
advanced:[
['The boat returned early because the wind became stronger. Why did the trip end?','The weather was unsafe.',['The weather was unsafe.','The map was missing.','The boat was new.']],
['Sara checked three sources before writing. What did she do?','She evaluated information.',['She evaluated information.','She copied without reading.','She counted buildings.']],
['The class reduced plastic use after an awareness campaign. What may have helped?','The campaign encouraged change.',['The campaign encouraged change.','The school closed.','Plastic became free.']],
['The museum was open but unusually quiet. What can we infer?','There were few visitors.',['There were few visitors.','The museum had no doors.','All visitors arrived early.']],
['The study involved only ten pupils. What is one limitation?','The group was small.',['The group was small.','The questions were long.','The pupils wrote notes.']],
['The report includes data from several years. Why is that useful?','It shows change over time.',['It shows change over time.','It prevents all mistakes.','It replaces the conclusion.']],
['Students volunteered after a storm damaged the beach. Why?','They wanted to help restore the beach.',['They wanted to help restore the beach.','They wanted to stop the rain.','They wanted to build a school.']],
['The author gives two examples to explain the idea. What do the examples do?','They support the main point.',['They support the main point.','They change the topic.','They replace the title.']],
['The project succeeded after several attempts. What can we infer?','The team kept trying.',['The team kept trying.','They did not plan.','The task was cancelled.']],
['A survey included pupils from all grades. Why is this helpful?','It includes different age groups.',['It includes different age groups.','It proves every opinion.','It removes all bias.']],
['Although the results improved, some students still needed help. What is true?','Progress was not the same for everyone.',['Progress was not the same for everyone.','Nobody improved.','The test was cancelled.']],
['The weather forecast predicted rain, so the trip was moved indoors. Why?','To keep the event safe.',['To keep the event safe.','To avoid learning.','To use more paper.']],
['The report describes both advantages and disadvantages. What is its approach?','It considers different sides.',['It considers different sides.','It ignores evidence.','It tells a fairy tale.']],
['A student used a reliable source to check a surprising claim. What skill is this?','Checking information.',['Checking information.','Guessing randomly.','Writing fiction.']]
]};
const A={
early:[
['School recycling','Schools should recycle more paper.','Recycling can reduce waste.','It takes effort, but it helps keep our environment clean.'],
['Reading time','Students should read every day.','Reading helps us learn new words.','Some pupils are busy, but ten minutes can help.'],
['Healthy snacks','Schools should offer healthy snacks.','Fruit can provide useful nutrients.','Sweets are popular, but healthy choices also taste good.'],
['Teamwork','Group work helps students learn.','Pupils can share ideas and support each other.','Working in groups needs practice, but everyone can contribute.'],
['Keeping beaches clean','People should keep beaches clean.','Plastic waste can harm sea animals.','Cleaning takes time, but it protects wildlife.'],
['School trips','School trips can improve learning.','Museums show real examples of history.','Trips need planning, but they can be useful.'],
['Saving water','Families should save water.','Turning taps off reduces waste.','Small actions may seem minor, but they add up.'],
['Exercise','Students should exercise regularly.','Moving helps people stay active and healthy.','Some days are busy, but short walks are possible.'],
['School gardens','Schools should grow more plants.','Plants can make outdoor spaces pleasant.','Gardens require care, but students can help.'],
['Using technology','Technology can help students study.','Learning apps let pupils practise skills.','Screen time needs limits, but useful apps can support learning.'],
['Protecting animals','We should protect local animals.','Wildlife needs safe habitats.','Protection may cost money, but it has long-term value.'],
['Helping others','Volunteering helps communities.','Volunteers can clean public places.','People may be busy, but even an hour can help.']
],
upper:[
['Plastic waste','Schools should reduce single-use plastic.','Reusable bottles can replace disposable ones.','Some items are convenient, but reducing waste has lasting benefits.'],
['Reading','Daily reading improves language skills.','Regular practice can increase vocabulary.','Time may be limited, but short sessions help.'],
['Public transport','Cities should invest in reliable buses.','Reliable buses can reduce traffic.','New routes need funding, but they can benefit many people.'],
['Renewable energy','More renewable energy should be developed.','Solar panels can produce electricity without burning fuel.','Start-up costs can be high, but later savings are possible.'],
['Technology','Digital tools can support learning.','Interactive feedback helps students understand mistakes.','Screen time needs limits, but guided use is valuable.'],
['Local heritage','Communities should preserve heritage sites.','Old buildings help people learn about the past.','Repairs can be costly, but history is worth protecting.'],
['Healthy food','Schools should offer nutritious meals.','Healthy choices can support concentration.','Tastes differ, but schools can offer a variety.'],
['Community service','Teenagers can benefit from volunteering.','Service projects build teamwork.','School life is busy, but occasional projects are manageable.'],
['Water conservation','Households should reduce water waste.','Fixing leaks prevents unnecessary loss.','Some upgrades cost money, but simple changes are possible.'],
['Checking claims','Claims should be tested with evidence.','Repeated measurements are more dependable than one guess.','Some examples are persuasive, but one example may not be enough.'],
['Environment','Protecting habitats is important.','Safe habitats help animals survive.','Conservation requires effort, but it supports nature.'],
['School projects','Students should learn to plan projects.','Clear goals and teamwork improve results.','Planning takes time, but it prevents confusion.']
]};
function uniqueRows(rows){const keys=new Set();return rows.filter(r=>{const k=r[0];if(keys.has(k))return false;keys.add(k);return true})}
const legacy=root.MEJV10Data||{};
function forGrade(rawGrade){
 const grade=Math.max(1,Math.min(12,Math.floor(Number(rawGrade)||1)));
 const key=grade<=2?'early':grade<=4?'primary':grade<=9?'intermediate':'advanced';
 const base=grade<=4?'lower':grade<=9?'middle':'upper';
 const words=uniqueRows([...(V[grade]||[]),...(legacy[base]||[]).map(w=>[w[0],w[1],w[2],w[0]])]).slice(0,25);
 const vocab=words.map(w=>w.slice(0,3));
 const grammar=G[key].map(a=>[a[0],[...a[1]],a[2],a[3]]);
 const sentences=[...(GRADE_SENTENCES[grade]||[]),...BASE_SENTENCES[key]].filter((x,i,a)=>a.indexOf(x)===i);
 const evidence=(grade<=4?E.easy:grade<=9?E.middle:E.upper).map(x=>x.slice());
 const detective=(grade<=7?D.simple:D.advanced).map(x=>[x[0],x[1],[...x[2]]]);
 const argument=(grade<=9?A.early:A.upper).map(x=>x.slice());
 const vocabEscape=words.map((w,i)=>{
  const options=[w[0],words[(i+3)%words.length][0],words[(i+7)%words.length][0]];
  const q=grade<=5?'Which word means "'+w[1]+'"?':'Which word means: '+w[3]+'?';
  return ['Door · Word code',q,w[0],options];
 });
 const grammarEscape=grammar.map(q=>['Door · Grammar code',q[0],q[2],[...q[1]]]);
 const evidenceEscape=evidence.map(q=>['Door · Evidence code','Which source best checks this claim? '+q[0],q[1],q.slice(1)]);
 const detectiveEscape=detective.map(q=>['Door · Reading code',q[0],q[1],q[2]]);
 const escape=[...grammarEscape,...vocabEscape,...evidenceEscape,...detectiveEscape];
 return {grade,vocab,grammar,sentences,evidence,detective,argument,escape};
}
root.MEJGradeBanks=Object.freeze({forGrade,version:'2026-11-15-grade-aware-v1'});
})(window);
