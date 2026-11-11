#!/usr/bin/env python3
"""Replace the generic illustrated Listening 1 tasks for Grades 5–9.
Uses grade-specific 4×4 illustrated scene banks. Run only after scene files exist.
Original scripts are held in git history. All replacement tasks stay under review.
"""
import json,re
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/"exam-practice/index.html"
PAT=re.compile(r'(<script id="activityData" type="application/json">)([\s\S]*?)(</script>)')
TEXT=PAGE.read_text(encoding="utf8")
MATCH=PAT.search(TEXT)
if not MATCH: raise SystemExit("activityData not found")
BANK=json.loads(MATCH.group(2))
def pack(label,detail):
    return {"label":label,"detail":detail}
SCENES={
5:[
[pack("Reading a book","I settled at the library table with an adventure story. I turned the pages slowly because I wanted to discover what happened to the main character."),
 pack("Writing in a notebook","I opened my exercise book and wrote a paragraph about my family. I checked my spelling before showing the work to my teacher."),
 pack("Drawing with pencils","I took out my coloured pencils and carefully drew a mountain and a bright flower. I gave my picture to our classroom display."),
 pack("Counting blocks","I arranged little wooden blocks on the desk to solve a maths puzzle. I counted each group twice to check the answer.")],
[pack("Running in the playground","During the break, I ran across the playground with my friends. We raced to a tree and back before the bell rang."),
 pack("Jumping rope","I held the handles of a skipping rope and jumped over it many times. My friend counted the jumps for me."),
 pack("Riding a bicycle","I wore my helmet and rode my blue bicycle along the safe path in the park. I slowed down near the corner."),
 pack("Playing football","I passed the ball to my teammate before running towards the goal. We played a short football match on the grass.")],
[pack("Eating rice and chicken","At lunchtime, I ate a plate of rice with chicken. The meal was warm, and I finished it with a glass of water."),
 pack("Eating a sandwich","I made a cheese sandwich for my lunch. I put it on a plate and cut it into two pieces."),
 pack("Eating a salad","I mixed lettuce, tomatoes and cucumber in a bowl. It was a colourful, crunchy vegetable salad."),
 pack("Eating soup","My mother served a warm bowl of soup for dinner. I used a spoon because it was too hot to drink.")],
[pack("Brushing teeth","Before school, I stood at the bathroom sink and brushed my teeth with toothpaste. I rinsed my mouth afterwards."),
 pack("Washing hands","I washed my hands with soap under running water before eating. Then I dried them with a clean towel."),
 pack("Packing a schoolbag","I put my books, pencil case and water bottle inside my schoolbag. I checked my timetable before closing it."),
 pack("Making the bed","After waking up, I pulled the blanket straight and placed my pillow at the top of the bed. My room looked tidy.")]],
6:[
[pack("Buying fruit","At the market I chose a basket of apples, bananas and oranges. The shopkeeper weighed the fruit and put it into a bag."),
 pack("Buying vegetables","I bought tomatoes, carrots and green vegetables for our family dinner. I checked that they were fresh."),
 pack("Buying dairy products","My shopping list included milk, yoghurt and a piece of cheese. I found them in the cold section of the shop."),
 pack("Buying bread","The bakery smelled wonderful. I chose fresh loaves of bread from the basket and paid at the counter.")],
[pack("Walking for exercise","Every evening I walk around the park at a comfortable pace. Walking helps me feel relaxed after school."),
 pack("Jogging outdoors","I wear comfortable trainers and jog along the park path. I begin slowly and drink water after exercise."),
 pack("Getting enough sleep","I put my phone away and went to bed early. A good night's sleep helps me feel ready for school."),
 pack("Eating healthy vegetables","For lunch, I prepared a bowl of fresh vegetables and ate a colourful salad rather than fast food.")],
[pack("Planting a seedling","Our group dug a small hole and planted a young tree in the soil. We covered its roots carefully."),
 pack("Watering flowers","I carried a watering can to the garden and gave the flowers some water. I avoided wasting any."),
 pack("Recycling bottles","I washed an empty plastic bottle and put it into the correct recycling bin rather than leaving it on the ground."),
 pack("Cleaning the school garden","We picked up paper and litter from the school garden. We wore gloves and left the ground clean.")],
[pack("Using a microscope","In our science lesson, I looked through a microscope to examine a tiny sample."),
 pack("Measuring a growing plant","I used a ruler to measure how much a small plant had grown since last week."),
 pack("Mixing liquids in a lab","My partner and I carefully mixed coloured liquids in laboratory containers while wearing safety glasses."),
 pack("Observing an insect","I used a magnifying glass to study a butterfly without touching its delicate wings.")]],
7:[
[pack("Visiting a fort","Our class stopped at an old coastal fort. We climbed the steps and looked at its thick stone walls and towers."),
 pack("Visiting a maritime museum","Inside the museum we studied a traditional wooden dhow on display. Our guide explained how sailors travelled in the past."),
 pack("Visiting an aquarium","We stood behind a large glass wall and watched colourful fish swimming through the water."),
 pack("Exploring a sea cave","Our guide took us to a large natural cave beside the sea. We watched the waves near its rocky entrance.")],
[pack("Travelling by plane","We arrived at the airport early and saw the large passenger aircraft waiting beside the terminal."),
 pack("Travelling by bus","Our group boarded a comfortable coach and travelled along a mountain road, watching the scenery through the windows."),
 pack("Travelling by train","I sat beside the window of a passenger train while it moved along railway tracks between the hills."),
 pack("Travelling by ferry","We crossed the water on a passenger boat. I could see the mountains behind us as we left the harbour.")],
[pack("Watching birds","We carried binoculars and quietly watched birds in a nature reserve without disturbing them."),
 pack("Cleaning a beach","Our class collected plastic rubbish from the beach and placed it in bags to keep the coast clean."),
 pack("Hiking in the mountains","We followed a marked trail on foot and climbed towards the rocky hills with our teacher."),
 pack("Camping in the mountains","We put up a tent beside the hills and prepared for a night outdoors under the stars.")],
[pack("Rainy weather","When we arrived at the village, rain was falling and puddles formed beside the road."),
 pack("Sunny weather","The sky was bright and clear. We needed hats because the sunshine was strong."),
 pack("Foggy weather","Thick fog covered the village and we could hardly see the mountains in the distance."),
 pack("Windy weather","Strong wind made the trees bend and we held our hats firmly while walking.")]],
8:[
[pack("Factory air pollution","A tall factory chimney was releasing dark smoke into the sky. The polluted air could affect families living nearby."),
 pack("Traffic air pollution","Many cars were waiting in a busy street. Grey exhaust gases came from their engines and made the air unpleasant."),
 pack("Water pollution","Plastic bottles and other rubbish were floating in a river. We worried about the fish living in the dirty water."),
 pack("Land pollution","Litter and waste were scattered on the ground in a field. We discussed the damage rubbish can do to soil and wildlife.")],
[pack("Solar energy","We visited a solar farm where large dark blue panels changed sunlight into electricity."),
 pack("Wind energy","On the hills, tall wind turbines turned as the moving air produced electricity."),
 pack("Hydroelectric energy","We studied a dam where flowing water passed through turbines to generate electricity."),
 pack("Geothermal energy","Our teacher showed us a power station that used heat from deep underground to produce electricity.")],
[pack("Drought","After months without enough rain, the earth became dry and cracked, and some plants died."),
 pack("Flooding","Heavy rain caused floodwater to cover the streets and reach the doors of several buildings."),
 pack("Heatwave","Temperatures stayed extremely high for days. People avoided being outside during the hottest hours."),
 pack("Severe storm","Strong winds bent palm trees and dark clouds moved across the sky during the storm.")],
[pack("Sorting recyclables","Students separated plastic, paper and metal into different recycling bins after the school event."),
 pack("Saving water","I turned off the tap immediately after washing my hands because clean water should not be wasted."),
 pack("Planting trees","Volunteers planted young trees around the school courtyard to provide shade and improve the environment."),
 pack("Cycling instead of driving","Several students used bicycles for short trips instead of travelling in cars, helping reduce emissions.")]],
9:[
[pack("Building wooden boats","An experienced craftsman shaped wooden pieces for a traditional dhow. He explained how boatbuilding skills are passed between generations."),
 pack("Making pottery","At a workshop, an artisan shaped wet clay into a pot using careful movements and traditional tools."),
 pack("Weaving palm baskets","We watched a craftswoman weave dried palm leaves into a basket. She described the patterns used by her grandparents."),
 pack("Making silver jewellery","An artisan carefully formed a traditional silver necklace in his workshop and described the meaning of its design.")],
[pack("Making a video call","I spoke face to face with my cousin on the screen of my laptop, even though she lives in another country."),
 pack("Sending an email","I typed a message on my laptop and sent it to our exchange-school partner with an attachment."),
 pack("Talking face to face","My classmates and I met at school and discussed the project while sitting together in the same room."),
 pack("Making a phone call","I held my mobile phone beside my ear and called my friend to explain the new meeting time.")],
[pack("Planting trees as a volunteer","Our volunteer group planted a young tree beside the community centre to provide more shade."),
 pack("Cleaning the beach as a volunteer","We spent the morning collecting discarded plastic and other rubbish along the shoreline."),
 pack("Helping at a library","I arranged returned books on library shelves so that younger children could find their favourite stories."),
 pack("Helping an older neighbour","I offered my arm to an elderly neighbour while we walked slowly through the park.")],
[pack("Using a digital map","I opened a map on my phone to find the safest route to the museum."),
 pack("Joining an online lesson","I wore headphones and followed a live online class on my computer."),
 pack("Working with a tablet","Our team sat together around one tablet and compared information for a group presentation."),
 pack("Recording a voice message","I spoke into my phone and recorded a short voice message instead of typing a reply.")]]
}
MODEL_QUESTIONS={"A":[(0,0),(1,1),(2,2),(3,3),(0,2)],"B":[(1,2),(2,0),(3,1),(0,3),(1,0)],"C":[(2,3),(3,2),(0,1),(1,3),(2,1)],"D":[(3,0),(0,3),(1,2),(2,0),(3,3)]}
MATCH_POOLS={
5:{"A":[0,1,2,3,4,5],"B":[4,5,6,7,12,13],"C":[8,9,10,11,12,13],"D":[12,13,14,15,0,1]},
6:{"A":[0,1,2,3,7,10],"B":[4,5,6,7,8,9],"C":[8,9,10,11,13,14],"D":[12,13,14,15,8,9]}
}
def picture(grade,index):
    return "pictures/listening/g%d/%02d.webp"%(grade,index)
def voice_prefix(grade,model,item):
    return ["This afternoon","During our school visit","Yesterday","Last week","On our class project"][(item+"ABCD".index(model))%5]
changed=0
for grade in range(5,10):
    cells=[item for row in SCENES[grade] for item in row]
    assert len(cells)==16,(grade,len(cells))
    for model in "ABCD":
        activity=next(a for a in BANK["activities"] if a["grade"]==grade and a["track"]=="Standard" and a["model"]==model and a["skill"]=="listening" and a["group"]==1)
        if grade<=6:
            pool=MATCH_POOLS[grade][model]
            # The five recordings cover five different scenes; the remaining picture is the extra option.
            target=pool[:5]
            # Deterministic shuffle of display options, without changing identity of their source image.
            permutations={'A':[2,5,0,4,1,3],'B':[4,2,5,1,3,0],'C':[1,3,5,0,2,4],'D':[5,0,3,2,4,1]}
            disp=[pool[j] for j in permutations[model]]
            activity["options"]=[cells[k]["label"] for k in disp]
            activity["optionPictures"]=[picture(grade,k) for k in disp]
            activity["questions"]=[{"type":"match","stem":str(i+1)+". Listen to dialogue "+str(i+1)+". Match it to the correct picture. One picture is extra.","answer":str(disp.index(k)+1)} for i,k in enumerate(target)]
            conversations=[]
            for i,k in enumerate(target):
                scene=cells[k]
                lines=[
                    "Speaker 1: What did you do "+["today","after school","yesterday","this morning","at the weekend"][i]+"?",
                    "Speaker 2: "+scene["detail"],
                    "Speaker 1: That sounds interesting. What did you enjoy most?",
                    "Speaker 2: I liked doing it carefully and learning something useful."
                ]
                conversations.append("\n".join(lines))
            activity["passage"]="\n\n".join(conversations)
            activity["instructions"]="You will hear five short dialogues twice. Match each dialogue with the correct picture. There is ONE extra picture."
        else:
            clips=[]
            questions=[]
            for i,(row,target_col) in enumerate(MODEL_QUESTIONS[model]):
                correct_id=row*4+target_col
                other_cols=[c for c in range(4) if c!=target_col]
                # Distractors are ALWAYS from the same visual/semantic category.
                chosen=[correct_id,row*4+other_cols[(i+grade)%3],row*4+other_cols[(i+grade+1)%3]]
                order=([0,1,2],[1,2,0],[2,0,1])[(i+grade+"ABCD".index(model))%3]
                display=[chosen[n] for n in order]
                assert len(set(display))==3
                clips.append("Text "+str(i+1)+". "+["On our recent school project, ","During a class activity, ","I learned something interesting yesterday. ","Our teacher asked us to describe what we saw. ","I want to tell you about an important experience. "][i]+cells[correct_id]["detail"]+" It helped me understand this topic and explain it clearly to my classmates.")
                questions.append({"type":"mc","stem":str(i+1)+". Listen to text "+str(i+1)+". Which picture matches the details in the recording?","opts":["Picture A","Picture B","Picture C"],"optionPictures":[picture(grade,k) for k in display],"answer":display.index(correct_id)})
            activity["passage"]="\n\n".join(clips)
            activity["questions"]=questions
            activity["instructions"]="You will hear five short texts twice. For each text, choose the picture (A, B or C) that matches what the speaker describes."
            activity.pop("options",None)
            activity.pop("optionPictures",None)
        activity["imageBankVersion"]="grade-specific-3d-v1"
        activity["status"]="review"
        activity["audioReady"]=False
        activity["mediaPending"]=False
        activity["audio"]="audio/"+activity["id"]+".mp3"
        changed+=1

# Full consistency test, including every referenced image on disk.
for grade in range(5,10):
    for model in "ABCD":
        a=next(x for x in BANK["activities"] if x["grade"]==grade and x["model"]==model and x["skill"]=="listening" and x["group"]==1)
        assert len(a["questions"])==5
        images=(a.get("optionPictures") or [])+[p for q in a["questions"] for p in q.get("optionPictures",[])]
        assert all((ROOT/"exam-practice"/p).is_file() for p in images),(a["id"],images)
        if grade<=6:
            assert len(set(a["options"]))==6
            assert len(set(q["answer"] for q in a["questions"]))==5
        else:
            assert all(len(set(q["optionPictures"]))==3 and 0<=q["answer"]<3 for q in a["questions"])

PAGE.write_text(TEXT[:MATCH.start()]+MATCH.group(1)+json.dumps(BANK,indent=2,ensure_ascii=False)+MATCH.group(3)+TEXT[MATCH.end():],encoding="utf8")
print("Rebuilt",changed,"illustrated Listening 1 activities with genuine grade-specific 3D distractors.")
