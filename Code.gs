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
  RECEIVER_VERSION: '2026-10-23-teacher-code-v1',
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
  'Last Event','Last Receipt ID','Class'
];
const WADI_LOG_HEADERS = [
  'Report ID','Received At','Student ID','Student Name','Grade','Event',
  'Stars','Attempts','Accuracy %','Mastered Items','Max Level','Level Details JSON','Class'
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
    wadiText_(d.event,35), reportId, wadiClass_(d.className,d.studentGrade)
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
  if (/reportId/.test(msg)) return 'INVALID_RECEIPT';
  if (/No linked Google Sheet/.test(msg)) return 'SPREADSHEET_NOT_CONFIGURED';
  if (/incompatible header/.test(msg)) return 'WRONG_TAB_HEADERS';
  if (/Permission|permission|authorization|Access denied/i.test(msg)) return 'GOOGLE_PERMISSION';
  return 'RECEIVER_ERROR';
}
function doPost(e) {
  const lock=LockService.getScriptLock();
  let locked=false, reportId='';
  try {
    const body=String(e && e.postData && e.postData.contents || '');
    if (!body || body.length>WADI_CONFIG.MAX_POST_CHARS) throw new Error('Missing/oversize request');
    const d=JSON.parse(body);
    reportId=String(d.reportId||'').trim();
    if (d.schema!=='english-foundation-oman-progress-v1') throw new Error('Unexpected report format');
    if (!d.studentId || !d.studentName) throw new Error('Missing student ID or name');
    wadiValidateTeacherCode_(d.teacherCode);
    reportId=wadiReceipt_(reportId);
    lock.waitLock(20000); locked=true;
    const ss=wadiSpreadsheet_();
    const summary=wadiTab_(ss,WADI_CONFIG.SUMMARY_TAB,WADI_HEADERS);
    const history=wadiTab_(ss,WADI_CONFIG.HISTORY_TAB,WADI_LOG_HEADERS);
    const classSheet=wadiClassTab_(ss,d.studentGrade,d.className);
    if (wadiFind_(history,1,reportId)) {
      wadiFlag_(reportId,'stored','DUPLICATE_OK');
      return wadiJson_({ok:true,duplicate:true,reportId,version:WADI_CONFIG.RECEIVER_VERSION});
    }
    const row=wadiRow_(d,reportId);
    const identity=wadiText_(d.studentId,100);
    const oldRow=wadiFind_(summary,1,identity);
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
      wadiInt_(d.maxAccessibleLevel,12),row[34],wadiClass_(d.className,d.studentGrade)
    ]);
    SpreadsheetApp.flush();
    wadiFlag_(reportId,'stored','SAVED');
    return wadiJson_({ok:true,reportId,version:WADI_CONFIG.RECEIVER_VERSION});
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
    const data=JSON.stringify({ready:true,version:WADI_CONFIG.RECEIVER_VERSION,configured,code});
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
