from pathlib import Path
import sys
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="// MEJ_PLACEMENT_RESUME_IPAD_V1"
if marker in s:
    print("Placement resume already present")
    sys.exit(0)
if "--check" in sys.argv:
    raise SystemExit("Placement resume not installed")
def replace_once(old,new):
    global s
    count=s.count(old)
    if count!=1: raise RuntimeError(f"Expected one occurrence, found {count}: {old[:90]}")
    s=s.replace(old,new,1)
helper="""// MEJ_PLACEMENT_RESUME_IPAD_V1
// Per-student checkpoint; never sends diagnostic answers to a remote service.
function mejDiagnosticKey(){return 'MEJ_DIAGNOSTIC_CHECKPOINT_V1_'+String(db.active||'');}
function mejReadDiagnostic(){
  try{
    const draft=JSON.parse(localStorage.getItem(mejDiagnosticKey())||'null');
    const p=active();
    if(!draft||draft.kind!=='diagnostic'||!p||draft.registeredGrade!==p.grade||draft.ceiling!==placementCeiling(p))return null;
    if(!Array.isArray(draft.ids)||draft.ids.length!==24||!draft.ids.every(id=>!!questionById[id]))return null;
    if(!Number.isInteger(draft.index)||draft.index<0||draft.index>draft.ids.length)return null;
    if(!Number.isInteger(draft.score)||draft.score<0||draft.score>draft.ids.length)return null;
    if(!Array.isArray(draft.responses)||draft.responses.length>draft.ids.length)return null;
    return draft;
  }catch(_){return null;}
}
function mejHasDiagnostic(){return !!mejReadDiagnostic();}
function mejSaveDiagnostic(nextIndex){
  if(!activeSession||activeSession.kind!=='diagnostic')return;
  try{
    const draft={...activeSession,index:nextIndex===undefined?activeSession.index:nextIndex};
    localStorage.setItem(mejDiagnosticKey(),JSON.stringify(draft));
  }catch(error){console.warn('Placement checkpoint could not be stored',error);}
}
function mejRestoreDiagnostic(){
  const draft=mejReadDiagnostic();
  if(!draft)return false;
  activeSession=draft;
  return true;
}
function mejClearDiagnostic(){
  try{localStorage.removeItem(mejDiagnosticKey());}catch(_){}
}
"""
replace_once("function startDiagnostic(){\n  const p=active();","function startDiagnostic(){\n  const p=active();\n  if(mejRestoreDiagnostic()){displayQuestion();return;}")
replace_once("activeSession={kind:'diagnostic',registeredGrade:p.grade,ceiling:cap,ids,index:0,score:0,mistakes:[],responses:[]};\n  displayQuestion();","activeSession={kind:'diagnostic',registeredGrade:p.grade,ceiling:cap,ids,index:0,score:0,mistakes:[],responses:[]};\n  mejSaveDiagnostic();\n  displayQuestion();")
replace_once("function nextQuestion(){if(!activeSession)return;activeSession.index++;displayQuestion()}","function nextQuestion(){if(!activeSession)return;activeSession.index++;mejSaveDiagnostic();displayQuestion()}")
replace_once("function stopQuiz(){const target=activeSession?.origin||mejQuizOrigin||'levels';activeSession=null;route(target)}","function stopQuiz(){if(activeSession?.kind==='diagnostic'){mejSaveDiagnostic();activeSession=null;route('diagnostic');return;}const target=activeSession?.origin||mejQuizOrigin||'levels';activeSession=null;route(target)}")
replace_once("try{window.MEJCompanion?.react(ok)}catch(_){}}","try{window.MEJCompanion?.react(ok)}catch(_){}if(activeSession?.kind==='diagnostic')mejSaveDiagnostic(activeSession.index+1);}")
replace_once("}else persist();activeSession=null;\n document.getElementById('app').innerHTML=","}else persist();if(s.kind==='diagnostic')mejClearDiagnostic();activeSession=null;\n document.getElementById('app').innerHTML=")
replace_once("p.diagnosed?'إعادة الاختبار':'ابدأ اختبار المستوى'","mejHasDiagnostic()?'متابعة التشخيص':p.diagnosed?'إعادة الاختبار':'ابدأ اختبار المستوى'")
replace_once("function diagnosticLanding(){",helper+"\nfunction diagnosticLanding(){")
if "route('home');\n\n// Keep Latin sentences" in s:
    replace_once("route('home');\n\n// Keep Latin sentences","route('home');\nif(mejRestoreDiagnostic())displayQuestion();\n\n// Keep Latin sentences")
elif "route('home');\n \n // Keep Latin sentences" in s:
    replace_once("route('home');\n \n // Keep Latin sentences","route('home');\nif(mejRestoreDiagnostic())displayQuestion();\n \n // Keep Latin sentences")
else:
    raise RuntimeError("Could not locate startup handler")
assert s.count(marker)==1
assert "mejSaveDiagnostic(activeSession.index+1)" in s
p.write_text(s,encoding="utf-8")
print("Placement resume installed and checks passed")
