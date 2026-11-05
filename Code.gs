/**
 * Wadi English Explorer — Google Sheets receiver
 * Updated: 2026-10-22
 * Paste into the GOOGLE APPS SCRIPT PROJECT THAT OWNS THE EXISTING /exec URL.
 * If the Apps Script is attached to the intended Google Spreadsheet, keep SPREADSHEET_ID blank.
 * If standalone, fill SPREADSHEET_ID with the ID between /d/ and /edit in the Sheet URL.
 * Requires deployment as a Web App: Execute as Me; Who has access: Anyone.
 * Use only with your school's approval for student-data collection.
 */
const WADI_CONFIG = {
  SPREADSHEET_ID: '',
  SUMMARY_TAB: 'Student_Progress',
  HISTORY_TAB: 'Progress_Log',
  MAX_POST_CHARS: 120000,
  RECEIVER_VERSION: '2026-11-05-unverified-scores-v3',
  LIVE_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzyPJ9z93yJbEUx_XCbkPO_FPSoAEy_nXHvBPQ1-a1DrxrzUXAv8veIsYNIFfVvnZvv1w/exec'
};

const WADI_HEADERS = [
  'Student ID','Student Name','Grade','School','Teacher','Last Updated',
  'Diagnostic Completed','Diagnostic Level','Diagnostic Score %','Diagnostic Date',
  'Highest Accessible Level','Completed Levels','Stars','Attempts',
  'Correct Answers','Accuracy %','Mastered Items','Total Items','Last Activity',
  'Weekly Attempts','Writing Drafts',
  'L0 %','L1 %','L2 %','L3 %','L4 %','L5 %','L6 %',
  'L7 %','L8 %','L9 %','L10 %','L11 %','L12 %','Level Details JSON',
  'Last Event','Last Receipt ID','Class','Score Verification'
];
const WADI_LOG_HEADERS = [
  'Report ID','Received At','Student ID','Student Name','Grade','Event',
  'Stars','Attempts','Accuracy %','Mastered Items','Max Level','Level Details JSON','Class','Score Verification'
];

function wadiSpreadsheet_() {
  const id = String(WADI_CONFIG.SPREADSHEET_ID || '').trim();
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No linked Google Sheet. Set WADI_CONFIG.SPREADSHEET_ID to the spreadsheet ID, then redeploy.');
  return ss;
}
function wadiTab_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  } else {
    const first=String(sheet.getRange(1,1).getDisplayValue());
    if(first!==headers[0]) throw new Error('Tab "'+name+'" has an incompatible header (expected '+headers[0]+').');
    // Extend the earlier deployment's tabs without destroying saved progress.
    const current=sheet.getRange(1,1,1,headers.length).getValues()[0];
    headers.forEach((h,i)=>{if(!current[i])sheet.getRange(1,i+1).setValue(h);});
  }
  return sheet;
}
function wadiText_(value, maxLen) {
  let s = String(value == null ? '' : value).slice(0,maxLen).trim();
  // Do not interpret malicious student-provided names as spreadsheet formulas.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function wadiInt_(value, maxVal) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(maxVal, Math.round(n))) : 0;
}
function wadiPct_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0,Math.min(100,Math.round(n))) : 0;
}
/** Store the teacher's code in Project Settings -> Script properties: TEACHER_REGISTRATION_CODE.
 * Never place it in GitHub/HTML. Code is a submission gate, not student authentication.
 */
function wadiValidateTeacherCode_(candidate) {
  const expected=String(PropertiesService.getScriptProperties().getProperty('TEACHER_REGISTRATION_CODE')||'').trim();
  if(!expected) throw new Error('TEACHER_CODE_NOT_CONFIGURED');
  const value=String(candidate||'').trim();
  if(value.length<4 || value.length>80 || value!==expected) throw new Error('INVALID_TEACHER_CODE');
}
function wadiClass_(input,grade) {
  const clean=String(input||'').toUpperCase().replace(/[^A-Z0-9 _-]/g,'').trim().slice(0,24);
  const fallback=String(grade||'').replace(/[^0-9]/g,'').slice(0,2);
  return clean || (fallback ? 'G'+fallback : 'UNASSIGNED');
}
function wadiClassTab_(ss, grade, className) {
  const group=wadiClass_(className,grade).replace(/[ _-]+/g,'_').slice(0,23);
  return wadiTab_(ss,'Class_'+group,WADI_HEADERS);
}
function wadiReceipt_(value) {
  const id = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{12,100}$/.test(id)) throw new Error('Invalid/missing reportId');
  return id;
}
function wadiRow_(d, reportId) {
  const levels = Array.isArray(d.levelStats) ? d.levelStats : [];
  const levelPct = Array.from({length:13},(_,g)=>{
    const item = levels.find(x => Number(x.level) === g);
    return item ? wadiPct_(item.masteryPercent) : 0;
  });
  const levelsSafe = levels.slice(0,13).map(x=>({
    level: wadiInt_(x.level,12),
    mastered: wadiInt_(x.mastered,200),
    total:200,
    masteryPercent: wadiPct_(x.masteryPercent)
  }));
  const levelDetails = JSON.stringify(levelsSafe);
  return [
    wadiText_(d.studentId,100), wadiText_(d.studentName,100),
    wadiText_(d.studentGrade,20), wadiText_(d.school,120),
    wadiText_(d.teacher,100), new Date(),
    d.diagnosticDone === true ? 'Yes' : 'No',
    wadiInt_(d.assignedLevel,12), wadiPct_(d.diagnosticPercent),
    wadiText_(d.diagnosticDate,35),
    wadiInt_(d.maxAccessibleLevel,12), wadiText_(d.completedLevels,80),
    wadiInt_(d.stars,100000000), wadiInt_(d.attempts,100000000),
    wadiInt_(d.correctAnswers,100000000), wadiPct_(d.accuracyPercent),
    wadiInt_(d.masteredItems,2600), 2600,
    wadiText_(d.lastActivity,40), wadiInt_(d.weeklyAttempts,100000),
    wadiInt_(d.writingDraftCount,10000), ...levelPct, levelDetails,
    wadiText_(d.event,35), reportId, wadiClass_(d.className,d.studentGrade), 'CLIENT_REPORTED_UNVERIFIED'
  ];
}
function wadiFind_(sheet, column, key) {
  if (sheet.getLastRow()<2) return null;
  return sheet.getRange(2,column,sheet.getLastRow()-1,1)
    .createTextFinder(String(key)).matchEntireCell(true).findNext();
}
function wadiJson_(data, mime) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(mime || ContentService.MimeType.JSON);
}

/** Store a small error flag for an unguessable receipt without revealing student data. */
function wadiFlag_(reportId, state, code) {
  if (!/^[a-zA-Z0-9_-]{12,100}$/.test(String(reportId||''))) return;
  try { CacheService.getScriptCache().put('wadi:'+reportId,
    JSON.stringify({state:state,code:String(code||'').slice(0,160)}),3600); }
  catch(ignore) {}
}
function wadiCode_(error) {
  const msg = String(error && error.message || error || 'Unknown receiver error');
  if (/Missing\/oversize/.test(msg)) return 'EMPTY_OR_TOO_LARGE';
  if (/Unexpected report format/.test(msg)) return 'SCHEMA_MISMATCH';
  if (/Missing student/.test(msg)) return 'MISSING_STUDENT';
  if (/TEACHER_CODE_NOT_CONFIGURED/.test(msg)) return 'TEACHER_CODE_NOT_CONFIGURED';
  if (/INVALID_TEACHER_CODE/.test(msg)) return 'INVALID_TEACHER_CODE';
  if (/STUDENT_IDENTITY_CONFLICT/.test(msg)) return 'STUDENT_IDENTITY_CONFLICT';
  if (/INVALID_PROGRESS_/.test(msg)) return 'INVALID_PROGRESS';
  if (/reportId/.test(msg)) return 'INVALID_RECEIPT';
  if (/No linked Google Sheet/.test(msg)) return 'SPREADSHEET_NOT_CONFIGURED';
  if (/incompatible header/.test(msg)) return 'WRONG_TAB_HEADERS';
  if (/Permission|permission|authorization|Access denied/i.test(msg)) return 'GOOGLE_PERMISSION';
  return 'RECEIVER_ERROR';
}
/** Stage 2: reject impossible totals; never treat self-reported values as verified.
 * This receiver has no per-student authentication or private answer validation.
 * Class rankings must NOT use these reports until a trusted scoring service exists.
 */
function wadiValidateProgressEnvelope_(d) {
  const fields={stars:2600,attempts:100000000,correctAnswers:100000000,masteredItems:2600};
  Object.keys(fields).forEach(function(field){
    const value=Number(d[field]);
    if(!Number.isSafeInteger(value)||value<0||value>fields[field])
      throw new Error('INVALID_PROGRESS_COUNTER_'+field);
  });
  if(Number(d.stars)!==Number(d.masteredItems))
    throw new Error('INVALID_PROGRESS_STARS_MASTERY');
  if(Number(d.correctAnswers)>Number(d.attempts))
    throw new Error('INVALID_PROGRESS_CORRECT_GT_ATTEMPTS');
  // A mastered question requires two correct practice answers in this app.
  // Do not assume other reported statistics, identities, or star totals are genuine.
}

function doPost(e) {
  const lock=LockService.getScriptLock();
  let locked=false, reportId='';
  try {
    const body=String(e && e.postData && e.postData.contents || '');
    if (!body || body.length>WADI_CONFIG.MAX_POST_CHARS) throw new Error('Missing/oversize request');
    const d=JSON.parse(body);
    if (d.schema==='mej-verified-v2') return wadiJson_(mejV2Handle_(d));
    reportId=String(d.reportId||'').trim();
    if (d.schema!=='english-foundation-oman-progress-v1') throw new Error('Unexpected report format');
    if (!d.studentId || !d.studentName) throw new Error('Missing student ID or name');
    wadiValidateTeacherCode_(d.teacherCode);
    wadiValidateProgressEnvelope_(d);
    reportId=wadiReceipt_(reportId);
    lock.waitLock(20000); locked=true;
    const ss=wadiSpreadsheet_();
    const summary=wadiTab_(ss,WADI_CONFIG.SUMMARY_TAB,WADI_HEADERS);
    const history=wadiTab_(ss,WADI_CONFIG.HISTORY_TAB,WADI_LOG_HEADERS);
    const classSheet=wadiClassTab_(ss,d.studentGrade,d.className);
    if (wadiFind_(history,1,reportId)) {
      wadiFlag_(reportId,'stored','DUPLICATE_OK');
      return wadiJson_({ok:true,duplicate:true,reportId,scoreVerification:'CLIENT_REPORTED_UNVERIFIED',version:WADI_CONFIG.RECEIVER_VERSION});
    }
    const row=wadiRow_(d,reportId);
    const identity=wadiText_(d.studentId,100);
    const oldRow=wadiFind_(summary,1,identity);
    // A shared teacher code is not sufficient proof of identity. This check
    // prevents accidental profile collisions but does not replace auth.
    if(oldRow){
      const saved=summary.getRange(oldRow.getRow(),1,1,row.length).getValues()[0];
      const previousName=String(saved[1]||'').trim();
      const previousGrade=String(saved[2]||'').trim();
      const previousClass=String(saved[37]||'').trim();
      if((previousName&&previousName!==String(row[1])) ||
         (previousGrade&&previousGrade!==String(row[2])) ||
         (previousClass&&previousClass!==String(row[37])))
        throw new Error('STUDENT_IDENTITY_CONFLICT');
    }
    // Offline reports may arrive out of order. Never overwrite a larger saved
    // star count with an older report. Receipt remains permanently in history.
    if(oldRow){
      const previousStars=Number(summary.getRange(oldRow.getRow(),13).getValue())||0;
      const previousAttempts=Number(summary.getRange(oldRow.getRow(),14).getValue())||0;
      if(Number(d.stars)<previousStars || Number(d.attempts)<previousAttempts){
        history.appendRow([
          reportId,new Date(),identity,wadiText_(d.studentName,100),
          wadiText_(d.studentGrade,20),'STALE_IGNORED',
          wadiInt_(d.stars,2600),wadiInt_(d.attempts,100000000),
          wadiPct_(d.accuracyPercent),wadiInt_(d.masteredItems,2600),
          wadiInt_(d.maxAccessibleLevel,12),row[34],
          wadiClass_(d.className,d.studentGrade),'CLIENT_REPORTED_UNVERIFIED'
        ]);
        SpreadsheetApp.flush();
        wadiFlag_(reportId,'stored','STALE_IGNORED');
        return wadiJson_({ok:true,stale:true,reportId,scoreVerification:'CLIENT_REPORTED_UNVERIFIED',version:WADI_CONFIG.RECEIVER_VERSION});
      }
    }
    if (oldRow) summary.getRange(oldRow.getRow(),1,1,row.length).setValues([row]);
    else summary.appendRow(row);
    const existingClassRow=wadiFind_(classSheet,1,identity);
    if(existingClassRow) classSheet.getRange(existingClassRow.getRow(),1,1,row.length).setValues([row]);
    else classSheet.appendRow(row);
    history.appendRow([
      reportId,new Date(),identity,wadiText_(d.studentName,100),
      wadiText_(d.studentGrade,20),wadiText_(d.event,35),
      wadiInt_(d.stars,100000000),wadiInt_(d.attempts,100000000),
      wadiPct_(d.accuracyPercent),wadiInt_(d.masteredItems,2600),
      wadiInt_(d.maxAccessibleLevel,12),row[34],wadiClass_(d.className,d.studentGrade),'CLIENT_REPORTED_UNVERIFIED'
    ]);
    SpreadsheetApp.flush();
    wadiFlag_(reportId,'stored','SAVED');
    return wadiJson_({ok:true,reportId,scoreVerification:'CLIENT_REPORTED_UNVERIFIED',version:WADI_CONFIG.RECEIVER_VERSION});
  } catch(err) {
    const code=wadiCode_(err);
    console.error('Wadi report error ['+code+']: '+String(err && err.stack || err));
    wadiFlag_(reportId,'rejected',code);
    return wadiJson_({ok:false,reportId,code,error:String(err && err.message || err)});
  } finally { if (locked) try {lock.releaseLock()}catch(ignore){} }
}

/** Health and receipt status contain no student records or PII. */
function doGet(e) {
  const pars=(e && e.parameter)||{};
  const id=String(pars.ack||'');
  if (/^[a-zA-Z0-9_-]{12,100}$/.test(id)) {
    let state='unknown',code='NOT_FOUND';
    try {
      const ss=wadiSpreadsheet_();
      const history=ss.getSheetByName(WADI_CONFIG.HISTORY_TAB);
      if (history && wadiFind_(history,1,id)) {state='stored';code='SAVED';}
      else {
        const flag=CacheService.getScriptCache().get('wadi:'+id);
        if(flag){const data=JSON.parse(flag);state=data.state||'unknown';code=data.code||code;}
      }
    } catch(err) { state='receiver-error';code=wadiCode_(err); }
    const data=JSON.stringify({reportId:id,received:state==='stored',state,code,version:WADI_CONFIG.RECEIVER_VERSION});
    return ContentService.createTextOutput('window.WADI_RECEIPT_CALLBACK&&window.WADI_RECEIPT_CALLBACK('+data+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  if (String(pars.health||'')==='1') {
    let configured=false,code='OK';
    try {configured=!!wadiSpreadsheet_();}
    catch(err){code=wadiCode_(err)}
    const data=JSON.stringify({ready:true,version:WADI_CONFIG.RECEIVER_VERSION,configured,code,scoreVerification:'CLIENT_REPORTED_UNVERIFIED'});
    return ContentService.createTextOutput('window.WADI_HEALTH_CALLBACK&&window.WADI_HEALTH_CALLBACK('+data+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return wadiJson_({service:'Wadi English Explorer receiver',version:WADI_CONFIG.RECEIVER_VERSION,ready:true});
}

/** In Apps Script click Run > testReceiver to authorize Sheets access and create a safe test record. */
function testReceiver() {
  const sample = {
    schema:'english-foundation-oman-progress-v1',
    reportId:'test-'+Date.now().toString(36)+'-receiver',
    studentId:'TEST-ONLY-DELETE',studentName:'TEST STUDENT - DELETE',
    studentGrade:'6',school:'Wadi Al Hawasna School',teacher:'Houssem Rouatbi',
    event:'test',teacherCode:PropertiesService.getScriptProperties().getProperty('TEACHER_REGISTRATION_CODE'),className:'G6A',diagnosticDone:false,levelStats:[],stars:0,attempts:0,
    correctAnswers:0,accuracyPercent:0,masteredItems:0,maxAccessibleLevel:0
  };
  const result = doPost({postData:{contents:JSON.stringify(sample)}});
  Logger.log(result.getContent());
  Logger.log('Check Student_Progress and Progress_Log tabs in your Google Sheet.');
}

/** REAL deployment test: tests /exec, not just a direct editor call to doPost().
 * After deploying NEW VERSION, select testLiveDeployment > Run.
 * A synthetic TEST LIVE record should appear in BOTH sheets.
 * The script logs HTTP status, the returned body, and whether the receipt was found.
 */
function testLiveDeployment() {
  const webUrl=String(WADI_CONFIG.LIVE_WEB_APP_URL||'').trim();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(webUrl))
    throw new Error('Set WADI_CONFIG.LIVE_WEB_APP_URL to your published /exec URL');
  const sample={
    schema:'english-foundation-oman-progress-v1',
    reportId:'testlive-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),
    studentId:'TEST-LIVE-DELETE',studentName:'TEST LIVE DEPLOYMENT - DELETE',
    studentGrade:'6',school:'Wadi Al Hawasna School',teacher:'Houssem Rouatbi',
    event:'live-deployment-test',teacherCode:PropertiesService.getScriptProperties().getProperty('TEACHER_REGISTRATION_CODE'),className:'G6A',diagnosticDone:false,assignedLevel:0,levelStats:[],
    stars:0,attempts:0,correctAnswers:0,accuracyPercent:0,masteredItems:0,maxAccessibleLevel:0
  };
  const response=UrlFetchApp.fetch(webUrl,{
    method:'post',contentType:'text/plain',payload:JSON.stringify(sample),
    muteHttpExceptions:true,followRedirects:true
  });
  Logger.log('Live HTTP status: '+response.getResponseCode());
  Logger.log('Live response (first 1200 chars): '+response.getContentText().slice(0,1200));
  Logger.log('Report ID: '+sample.reportId);
  const ss=wadiSpreadsheet_();
  const log=ss.getSheetByName(WADI_CONFIG.HISTORY_TAB);
  const found=!!(log && wadiFind_(log,1,sample.reportId));
  Logger.log('LIVE SHEET WRITE: '+(found?'CONFIRMED':'NOT FOUND'));
  if(!found) throw new Error('The deployed /exec endpoint did not write to the spreadsheet! Check HTTP status, latest deployment, permissions and whether the URL belongs to this project.');
}

/** Stage 2 offline-only unit checks; requires no spreadsheet authorization. */
function testStage2Envelope_() {
  const base={stars:3,attempts:7,correctAnswers:6,masteredItems:3};
  wadiValidateProgressEnvelope_(base);
  function expectReject(patch){
    let rejected=false;
    try{wadiValidateProgressEnvelope_(Object.assign({},base,patch));}
    catch(err){rejected=true;}
    if(!rejected)throw new Error('Expected progress envelope rejection');
  }
  expectReject({stars:2601});
  expectReject({stars:-1});
  expectReject({correctAnswers:8});
  expectReject({attempts:NaN});
  expectReject({masteredItems:3000});
  expectReject({stars:2,masteredItems:3});
  return 'STAGE2_ENVELOPE_CHECKS_PASSED';
}


/**
 * MEJ VERIFIED PROGRESS PILOT V2 — DISABLED unless MEJ_V2_ENABLED=true
 *
 * Separate, append-only attempt ledger and student-scoped credentials.
 * Does not read, rewrite, migrate, or delete legacy progress.
 * Never expose the protected sheets, tokens, or invite codes to clients other
 * than the single token returned once to its enrolling student.
 *
 * IMPORTANT: The question answers are also embedded in the public legacy
 * app. This verifies that stars match submitted answers, but does NOT prove
 * that a learner solved a question without looking at the answer key.
 * Only use for synthetic pilot accounts pending school privacy approval.
 */
const MEJ_V2_SCHEMA='mej-verified-v2';
const MEJ_V2_TABS={
  students:'MEJ_V2_Students',invites:'MEJ_V2_Invites',
  attempts:'MEJ_V2_Attempts',mastery:'MEJ_V2_Mastery',keys:'MEJ_V2_QuestionKeys',recovery:'MEJ_V2_Recovery'
};
function mejV2RequireEnabled_(){
  if(String(PropertiesService.getScriptProperties().getProperty('MEJ_V2_ENABLED')||'').toLowerCase()!=='true')
    throw new Error('VERIFIED_PILOT_DISABLED');
}
function mejV2Hash_(value){
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8);
  return bytes.map(function(b){return ('0'+(b<0?b+256:b).toString(16)).slice(-2)}).join('');
}
function mejV2Secret_(){
  return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
}
function mejV2Table_(name,headers){
  const ss=wadiSpreadsheet_();
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){sh.appendRow(headers);sh.setFrozenRows(1)}
  else {
    const current=sh.getRange(1,1,1,headers.length).getValues()[0].map(String);
    if(headers.some(function(h,i){return h!==current[i]}))
      throw new Error('VERIFIED_SCHEMA_CONFLICT_'+name);
  }
  return sh;
}
function mejV2Tables_(){
  return {
    students:mejV2Table_(MEJ_V2_TABS.students,
      ['Student ID','Token Hash','Display Name','Grade','Class','Created','Cohort']),
    invites:mejV2Table_(MEJ_V2_TABS.invites,
      ['Invite Hash','Grade','Class','Used By','Created','Cohort']),
    attempts:mejV2Table_(MEJ_V2_TABS.attempts,
      ['Event ID','Student ID','Question ID','Answer Hash','Correct','Received']),
    mastery:mejV2Table_(MEJ_V2_TABS.mastery,
      ['Student ID','Question ID','Correct Count','Updated']),
    keys:mejV2Table_(MEJ_V2_TABS.keys,
      ['Question ID','Stage','Correct Answer']),
    recovery:mejV2Table_(MEJ_V2_TABS.recovery,
      ['Student ID','Recovery Hash','Revision','Last Rotated'])
  };
}
function mejV2Rows_(sheet){
  const end=sheet.getLastRow();
  if(end<2)return [];
  return sheet.getRange(2,1,end-1,sheet.getLastColumn()).getValues();
}
function mejV2Find_(sheet,col,value){
  const rows=mejV2Rows_(sheet);
  for(let i=0;i<rows.length;i++)if(String(rows[i][col])===String(value))return {row:i+2,values:rows[i]};
  return null;
}
function mejV2Name_(name){
  const s=String(name||'').trim();
  if(s.length<2||s.length>80||/^[=+\-@]/.test(s))throw new Error('INVALID_LEARNER_NAME');
  return s;
}
function mejV2Grade_(grade){
  const g=Number(grade);
  if(!Number.isInteger(g)||g<1||g>12)throw new Error('INVALID_LEARNER_GRADE');
  return g;
}
function mejV2Answer_(value){
  const s=String(value==null?'':value).trim().toLocaleLowerCase('en');
  if(!s||s.length>300)throw new Error('INVALID_ANSWER');
  return s.replace(/\s+/g,' ');
}
function mejV2Auth_(d,students){
  const id=String(d.studentId||'');
  const token=String(d.deviceToken||'');
  if(!/^mejv2-[a-z0-9]{32}$/.test(id)||!/^[a-f0-9]{64}$/.test(token))
    throw new Error('INVALID_STUDENT_CREDENTIALS');
  const found=mejV2Find_(students,0,id);
  if(!found||String(found.values[1])!==mejV2Hash_(token))
    throw new Error('INVALID_STUDENT_CREDENTIALS');
  return found.values;
}
function mejV2Stars_(mastery,studentId){
  return mejV2Rows_(mastery).filter(function(row){
    return String(row[0])===studentId&&Number(row[2])>=2;
  }).length;
}
/**
 * Admin-only: run from a school-owned Apps Script editor to create
 * a single-use invitation. Do NOT expose this function through doPost.
 */
function mejV2IssueInvite_(grade,className,cohortId){
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const g=mejV2Grade_(grade),group=wadiClass_(className,g);
    const cohort=mejV2Cohort_(cohortId);
    const code=mejV2Secret_();
    mejV2Table_(MEJ_V2_TABS.invites,
      ['Invite Hash','Grade','Class','Used By','Created','Cohort'])
      .appendRow([mejV2Hash_(code),g,group,'',new Date(),cohort]);
    return code;
  }finally{lock.releaseLock()}
}
/**
 * Admin-only: initialize the server-side answer table from the CURRENT
 * public GitHub bank. No student records or tokens are involved.
 * Answers are publicly inspectable in the existing browser bundle,
 * so this is score integrity, not a cheat-proof examination.
 */
function mejV2InstallQuestionKeys_(){
  const rawUrl='https://raw.githubusercontent.com/rouhous/English-Foundation/main/index.html';
  const html=UrlFetchApp.fetch(rawUrl,{muteHttpExceptions:false}).getContentText();
  const match=html.match(/const BANK=(\[.*?\]);\s*const PHOTO=/s);
  if(!match)throw new Error('QUESTION_BANK_NOT_FOUND');
  const questions=JSON.parse(match[1]);
  if(questions.length!==2600)throw new Error('UNEXPECTED_QUESTION_COUNT');
  const ids={}, rows=[];
  questions.forEach(function(q){
    if(!/^L(?:[0-9]|1[0-2])-[0-9]{3}$/.test(String(q.id||''))||ids[q.id])
      throw new Error('INVALID_QUESTION_ID');
    ids[q.id]=true;
    rows.push([q.id,Number(q.g),mejV2Answer_(q.answer)]);
  });
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const keySheet=mejV2Table_(MEJ_V2_TABS.keys,['Question ID','Stage','Correct Answer']);
    if(keySheet.getLastRow()>1)throw new Error('QUESTION_KEYS_ALREADY_INSTALLED');
    keySheet.getRange(2,1,rows.length,3).setValues(rows);
    return 'INSTALLED_'+rows.length;
  }finally{lock.releaseLock()}
}
/** Publicly reachable ONLY after school explicitly enables the pilot.
 * No student enumeration, score submission, ranking, or student search.
 */
function mejV2Handle_(d){
  mejV2RequireEnabled_();
  if(!d||d.schema!==MEJ_V2_SCHEMA)throw new Error('INVALID_V2_REQUEST');
  const action=String(d.action||'');
  if(!['enroll','answer','summary','progress','leaderboard','recover','rotateRecovery'].includes(action))throw new Error('INVALID_V2_ACTION');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const t=mejV2Tables_();
    if(t.keys.getLastRow()<2)throw new Error('QUESTION_KEYS_NOT_INSTALLED');
    if(action==='enroll'){
      wadiValidateTeacherCode_(d.teacherCode);
      const name=mejV2Name_(d.studentName),grade=mejV2Grade_(d.grade);
      const group=wadiClass_(d.className,grade);
      const invite=String(d.inviteCode||'');
      if(!/^[a-f0-9]{64}$/.test(invite))throw new Error('INVALID_INVITE');
      const match=mejV2Find_(t.invites,0,mejV2Hash_(invite));
      if(!match||match.values[3]||Number(match.values[1])!==grade||
         String(match.values[2])!==group)throw new Error('INVALID_OR_USED_INVITE');
      const uid='mejv2-'+Utilities.getUuid().replace(/-/g,'').toLowerCase();
      const token=mejV2Secret_().toLowerCase();
      const cohort=mejV2Cohort_(match.values[5]);
      const recoveryCode=mejV2Secret_().toLowerCase();
      t.students.appendRow([uid,mejV2Hash_(token),name,grade,group,new Date(),cohort]);
      t.recovery.appendRow([uid,mejV2Hash_(recoveryCode),1,new Date()]);
      t.invites.getRange(match.row,4).setValue(uid);
      return {ok:true,studentId:uid,deviceToken:token,recoveryCode,revision:1,stars:0,scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
    }
    if(action==='recover'){
      const studentId=String(d.studentId||'');
      const recoveryCode=String(d.recoveryCode||'');
      if(!/^mejv2-[a-z0-9]{32}$/.test(studentId)||!/^[a-f0-9]{64}$/.test(recoveryCode))
        throw new Error('INVALID_RECOVERY_CREDENTIALS');
      const saved=mejV2Find_(t.recovery,0,studentId);
      const owner=mejV2Find_(t.students,0,studentId);
      if(!saved||!owner||String(saved.values[1])!==mejV2Hash_(recoveryCode))
        throw new Error('INVALID_RECOVERY_CREDENTIALS');
      const newToken=mejV2Secret_().toLowerCase();
      const newRecovery=mejV2Secret_().toLowerCase();
      const revision=(Number(saved.values[2])||1)+1;
      t.students.getRange(owner.row,2).setValue(mejV2Hash_(newToken));
      t.recovery.getRange(saved.row,2,1,3).setValues([[mejV2Hash_(newRecovery),revision,new Date()]]);
      return {ok:true,studentId,deviceToken:newToken,recoveryCode:newRecovery,revision,
        stars:mejV2Stars_(t.mastery,studentId),scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
    }
    const user=mejV2Auth_(d,t.students), studentId=String(user[0]);
    if(action==='rotateRecovery'){
      const saved=mejV2Find_(t.recovery,0,studentId);
      if(!saved)throw new Error('RECOVERY_NOT_CONFIGURED');
      const newRecovery=mejV2Secret_().toLowerCase();
      const revision=(Number(saved.values[2])||1)+1;
      t.recovery.getRange(saved.row,2,1,3).setValues([[mejV2Hash_(newRecovery),revision,new Date()]]);
      return {ok:true,studentId,recoveryCode:newRecovery,revision,
        scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
    }
    if(action==='leaderboard'){
      mejV2RequireRankingEnabled_();
      return mejV2Leaderboard_(t,user);
    }
    if(action==='progress'){
      return mejV2Snapshot_(t,studentId);
    }
    if(action==='summary'){
      return {ok:true,studentId,stars:mejV2Stars_(t.mastery,studentId),
        scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
    }
    const eventId=String(d.eventId||''),qid=String(d.questionId||'');
    if(!/^[a-zA-Z0-9_-]{16,96}$/.test(eventId))throw new Error('INVALID_EVENT_ID');
    if(!/^L(?:[0-9]|1[0-2])-[0-9]{3}$/.test(qid))throw new Error('INVALID_QUESTION_ID');
    const response=mejV2Answer_(d.answer);
    const answerHash=mejV2Hash_(response);
    const previous=mejV2Find_(t.attempts,0,eventId);
    if(previous){
      if(String(previous.values[1])!==studentId||String(previous.values[2])!==qid||
         String(previous.values[3])!==answerHash)throw new Error('EVENT_ID_CONFLICT');
      return {ok:true,duplicate:true,correct:previous.values[4]===true,
        stars:mejV2Stars_(t.mastery,studentId),scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
    }
    const key=mejV2Find_(t.keys,0,qid);
    if(!key)throw new Error('UNKNOWN_QUESTION');
    if(Number(key.values[1])>Number(user[3]))throw new Error('QUESTION_ABOVE_SCHOOL_GRADE');
    // Match the existing two-part journey: the second 100 questions remain
    // locked until the first 100 questions of this stage are mastered.
    const stage=Number(key.values[1]),questionIndex=Number(qid.slice(-3));
    if(questionIndex>=100){
      const prefix='L'+stage+'-';
      const firstPartMastered=mejV2Rows_(t.mastery).filter(function(row){
        const id=String(row[1]);
        return String(row[0])===studentId&&id.startsWith(prefix)&&
          Number(id.slice(-3))<100&&Number(row[2])>=2;
      }).length;
      if(firstPartMastered<100)throw new Error('SUBLEVEL_LOCKED');
    }
    // Limit accidental loops and unauthorized bulk requests in the pilot.
    const today=new Date().toISOString().slice(0,10);
    const recentAttempts=mejV2Rows_(t.attempts).filter(function(row){
      return String(row[1])===studentId&&
        row[5]&&new Date(row[5]).toISOString().slice(0,10)===today;
    }).length;
    if(recentAttempts>=600)throw new Error('DAILY_PILOT_LIMIT');
    const correct=response===String(key.values[2]);
    if(correct){
      const rows=mejV2Rows_(t.mastery);
      let match=null;
      for(let i=0;i<rows.length;i++)if(String(rows[i][0])===studentId&&String(rows[i][1])===qid){
        match={row:i+2,correctCount:Number(rows[i][2])||0};break;
      }
      if(match){
        t.mastery.getRange(match.row,3,1,2).setValues([[Math.min(2,match.correctCount+1),new Date()]]);
      }else{
        t.mastery.appendRow([studentId,qid,1,new Date()]);
      }
    }
    t.attempts.appendRow([eventId,studentId,qid,answerHash,correct,new Date()]);
    return {ok:true,correct,duplicate:false,stars:mejV2Stars_(t.mastery,studentId),
      scoreVerification:'SERVER_CHECKED_PILOT',pilot:true};
  }finally{lock.releaseLock()}
}


/**
 * STAGE 3: CLASS-ONLY VERIFIED RANKING. Disabled unless an administrator
 * explicitly enables both MEJ_V2_ENABLED and MEJ_V2_RANKING_ENABLED.
 * Never use the legacy self-reported score to rank students.
 */
function mejV2Cohort_(value){
  const s=String(value||'').trim();
  if(!/^[A-Z0-9][A-Z0-9_-]{7,63}$/.test(s))
    throw new Error('INVALID_COHORT_SCOPE');
  return s;
}
function mejV2RequireRankingEnabled_(){
  mejV2RequireEnabled_();
  const state=String(PropertiesService.getScriptProperties()
    .getProperty('MEJ_V2_RANKING_ENABLED')||'').toLowerCase();
  if(state!=='true')throw new Error('CLASS_RANKING_DISABLED');
}
function mejV2Leaderboard_(tables,requestingStudent){
  const requestingId=String(requestingStudent[0]);
  const grade=Number(requestingStudent[3]);
  const className=String(requestingStudent[4]);
  const cohort=mejV2Cohort_(requestingStudent[6]);
  const students=mejV2Rows_(tables.students).filter(function(row){
    return Number(row[3])===grade&&String(row[4])===className&&
      String(row[6])===cohort;
  });
  if(students.length>100)throw new Error('COHORT_TOO_LARGE');
  const counts=Object.create(null);
  students.forEach(function(row){counts[String(row[0])]=0});
  mejV2Rows_(tables.mastery).forEach(function(row){
    const id=String(row[0]);
    if(Object.prototype.hasOwnProperty.call(counts,id)&&Number(row[2])>=2)counts[id]++;
  });
  const ranked=students.map(function(row){
    return {id:String(row[0]),name:String(row[2]),stars:counts[String(row[0])]||0};
  }).sort(function(a,b){
    return b.stars-a.stars||a.name.localeCompare(b.name,'ar')||a.id.localeCompare(b.id);
  });
  let previousStars=null,previousRank=0;
  const entries=ranked.map(function(row,index){
    const rank=row.stars===previousStars?previousRank:index+1;
    previousStars=row.stars;previousRank=rank;
    return {rank,name:row.name,stars:row.stars,isMe:row.id===requestingId};
  });
  if(!entries.some(function(row){return row.isMe}))
    throw new Error('STUDENT_NOT_IN_COHORT');
  return {ok:true,pilot:true,scope:'OWN_VERIFIED_CLASS',className,
    count:entries.length,entries,scoreVerification:'SERVER_CHECKED_PILOT'};
}


/**
 * STAGE 4 — authenticated device restoration snapshot.
 * Returns mastery COUNTS for the requesting student only. No answers, token,
 * names of classmates, or client-submitted totals. Diagnostic placement and
 * draft writing are not yet stored in this pilot and cannot be restored here.
 */
function mejV2Snapshot_(tables,studentId){
  const mastered=mejV2Rows_(tables.mastery).filter(function(row){
    return String(row[0])===String(studentId)&&
      /^L(?:[0-9]|1[0-2])-[0-9]{3}$/.test(String(row[1]));
  }).map(function(row){
    return {questionId:String(row[1]),
      correctCount:Math.min(2,Math.max(0,Number(row[2])||0))};
  });
  if(mastered.length>2600)throw new Error('PROGRESS_SNAPSHOT_OVERSIZE');
  return {
    ok:true,pilot:true,studentId:String(studentId),
    stars:mastered.filter(function(r){return r.correctCount>=2}).length,
    mastered,scoreVerification:'SERVER_CHECKED_PILOT',
    scope:'OWN_STUDENT_PROGRESS'
  };
}
