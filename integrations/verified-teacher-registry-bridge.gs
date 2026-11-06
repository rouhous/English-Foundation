/**
 * MY ENGLISH JOURNEY: safe bridge from the existing private English Explorer
 * teacher registry to Supabase school licenses.
 *
 * Append this file to the ORIGINAL Apps Script project that already has:
 *   eeRegistry_(), eeConfirmMinistryEmail_(), eeStartMinistryVerification_()
 * Leave those existing functions, triggers, form and students' reporting route
 * unchanged. The bridge only reads verified rows and posts approved records.
 *
 * One-time setup:
 * 1. On https://rouhous.github.io/English-Foundation/reviews/teacher-portal.html
 *    log in as the verified owner and choose "إنشاء رمز ربط النموذج".
 * 2. Paste that 64-character secret in Apps Script Project Settings ->
 *    Script Properties as MEJ_REGISTRY_BRIDGE_SECRET.
 * 3. Run mejBridgeVerifiedTeacherRegistry once, then installMejBridgeTrigger.
 *    The private registry only stages teachers whose original @moe.om
 *    verification is Active. No teacher access is granted by this step.
 * 4. The school issues a separate private teacher-join code and distributes
 *    it to its teachers. Each teacher signs in with Google and enters
 *    school name, 4-digit number and the private join code.
 *
 * The bridge fails closed: no secret or unverified ministry address means
 * NO teacher record is staged in Supabase. Actual activation additionally
 * requires the teacher's verified Google account and the school join code.
 */
const MEJ_BRIDGE_API='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-teacher-portal';
function mejBridgeVerifiedTeacherRegistry(){
  const secret=PropertiesService.getScriptProperties().getProperty('MEJ_REGISTRY_BRIDGE_SECRET');
  if(!/^[a-f0-9]{64}$/.test(String(secret||''))) throw new Error('Set MEJ_REGISTRY_BRIDGE_SECRET in Script Properties.');
  // This is the real private registry, not the STAGING teacher registry.
  const sh=eeRegistry_();
  const last=sh.getLastRow();
  if(last<=1){console.log('No teacher registrations to sync.');return {approved:0,processed:0}}
  if(!sh.getRange(1,16).getValue())sh.getRange(1,16).setValue('MEJ License Sync Status');
  if(!sh.getRange(1,17).getValue())sh.getRange(1,17).setValue('MEJ License Sync Time');
  const data=sh.getRange(2,1,last-1,17).getDisplayValues();
  let approved=0,processed=0,failed=0;
  for(let i=0;i<data.length;i++){
    const row=data[i];
    const google=String(row[1]||'').trim().toLowerCase();
    const name=String(row[2]||'').trim();
    const school=String(row[3]||'').trim();
    const code=String(row[4]||'').trim();
    const spreadsheet=String(row[5]||'').trim();
    const classes=String(row[6]||'').trim();
    const status=String(row[7]||'').trim().toLowerCase();
    const ministry=String(row[9]||'').trim().toLowerCase();
    if(status!=='active')continue;
    approved++;
    if(!/^[^@ ]+@[^@ ]+\.[^@ ]+$/.test(google) ||
       !/^[a-z0-9._%+\-]+@moe\.om$/.test(ministry) ||
       !/^[A-Za-z0-9_-]{15,150}$/.test(spreadsheet) ||
       !/^[0-9]{6}$/.test(code) ||
       !name || name.length>150 || !classes || classes.length>500){
      sh.getRange(i+2,16).setValue('INCOMPLETE_VERIFIED_RECORD');
      failed++;continue;
    }
    // School name is not identity proof. This step only stages a verified
    // ministry account; teacher must enter a private school join code.
    if(!/(الحواسنة|hawasn|hawasna)/i.test(school)){
      sh.getRange(i+2,16).setValue('SCHOOL_NAME_MISMATCH');
      failed++;continue;
    }
    const body={action:'verified_registry_push',schoolNumber:'2429',
      registrationStatus:'verified',googleEmail:google,ministryEmail:ministry,
      teacherName:name,classes,reportSheetId:spreadsheet,teacherCode:code};
    try{
      const response=UrlFetchApp.fetch(MEJ_BRIDGE_API,{
        method:'post',contentType:'application/json',payload:JSON.stringify(body),
        headers:{'x-mej-registry-secret':secret},
        muteHttpExceptions:true,followRedirects:true
      });
      const codeStatus=response.getResponseCode();
      const raw=response.getContentText();
      let result={};try{result=JSON.parse(raw)}catch(_){}
      if(codeStatus===200 && result.ok===true && result.verificationRecorded===true){
        sh.getRange(i+2,16).setValue('VERIFIED_AWAITING_SCHOOL_CODE');
        sh.getRange(i+2,17).setValue(new Date());
        processed++;
      }else{
        sh.getRange(i+2,16).setValue('SYNC_ERROR_'+codeStatus+'_'+String(result.error||'UNKNOWN').slice(0,60));
        failed++;
      }
    }catch(err){
      sh.getRange(i+2,16).setValue('SYNC_CONNECTION_ERROR');
      failed++;
    }
  }
  SpreadsheetApp.flush();
  console.log('Verified registry bridge: eligible='+approved+', staged='+processed+', failed='+failed);
  return {approved,processed,failed};
}
function installMejBridgeTrigger(){
  const existing=ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='mejBridgeVerifiedTeacherRegistry');
  if(!existing) ScriptApp.newTrigger('mejBridgeVerifiedTeacherRegistry').timeBased().everyMinutes(15).create();
  console.log('Bridge trigger: '+(existing?'already installed':'installed'));
}
