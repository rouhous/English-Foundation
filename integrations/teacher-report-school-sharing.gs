/**
 * Optional report-sharing companion for ORIGINAL English Explorer Apps Script.
 * This does not create reports or change original teacher registration.
 * The current owner of a report sheet must authorize this Apps Script
 * to change that file's Google Drive sharing permissions. When teacher-owned
 * reports are inaccessible to this script, the script reports OWNER_CONSENT_NEEDED
 * and DOES NOT claim sharing succeeded. In that case the teacher must grant
 * permission from their own Google account (or use per-teacher OAuth).
 *
 * Install alongside verified-teacher-registry-bridge.gs in the same Apps Script.
 * Uses preexisting eeRegistry_() and MEJ_REGISTRY_BRIDGE_SECRET Script Property.
 * Teacher sheet ID is column F, Google account is B, ministry verification H.
 * Only active verified teachers at Wadi Al Hawasna are considered.
 * The verified manager email is fetched from the signed private integration.
 *
 * This function grants READER access, not editor. To grant editor access,
 * an explicit separate approval/audit workflow is required.
 */
function mejShareVerifiedReportsWithSchoolManager(){
  const secret=PropertiesService.getScriptProperties().getProperty('MEJ_REGISTRY_BRIDGE_SECRET');
  if(!/^[a-f0-9]{64}$/.test(String(secret||'')))throw new Error('MEJ_REGISTRY_BRIDGE_SECRET not configured');
  const response=UrlFetchApp.fetch('https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-teacher-portal',{
    method:'post',contentType:'application/json',payload:JSON.stringify({action:'verified_registry_get_manager'}),
    headers:{'x-mej-registry-secret':secret},muteHttpExceptions:true
  });
  if(response.getResponseCode()!==200)throw new Error('Manager authorization query rejected');
  const status=JSON.parse(response.getContentText());
  if(!status.ok||status.managerReady!==true||status.schoolNumber!=='2429'){
    console.log('School manager not independently approved; no file shared');
    return {shared:0,skipped:0,managerReady:false};
  }
  const manager=String(status.managerEmail||'').trim().toLowerCase();
  if(!/^[^ @]+@[^ @]+\.[^ @]+$/.test(manager))throw new Error('Invalid verified manager email');
  const sh=eeRegistry_();
  const last=sh.getLastRow();
  if(last<2)return {shared:0,skipped:0,managerReady:true};
  if(!sh.getRange(1,18).getValue())sh.getRange(1,18).setValue('School Report Share Status');
  if(!sh.getRange(1,19).getValue())sh.getRange(1,19).setValue('School Report Share Time');
  const rows=sh.getRange(2,1,last-1,10).getDisplayValues();
  let shared=0,skipped=0,ownerConsentNeeded=0;
  for(let i=0;i<rows.length;i++){
    const row=rows[i];
    const school=String(row[3]||'');
    const fileId=String(row[5]||'').trim();
    const verification=String(row[7]||'').trim().toLowerCase();
    const ministry=String(row[9]||'').trim().toLowerCase();
    if(verification!=='active'||!/(الحواسنة|hawasn)/i.test(school)||
       !/^[a-z0-9._%+\-]+@moe\.om$/.test(ministry)||!/^[A-Za-z0-9_-]{15,150}$/.test(fileId)){
      skipped++;continue;
    }
    try{
      const f=DriveApp.getFileById(fileId);
      const permissions=f.getSharingAccess();
      // Never enable public/link access. Grant the one verified manager only.
      if(manager!==String(f.getOwner().getEmail()||'').toLowerCase()){
        if(!f.getViewers().some(x=>String(x.getEmail()).toLowerCase()===manager)&&
           !f.getEditors().some(x=>String(x.getEmail()).toLowerCase()===manager)){
          f.addViewer(manager);
        }
      }
      sh.getRange(i+2,18).setValue('SHARED_READER_TO_VERIFIED_MANAGER');
      sh.getRange(i+2,19).setValue(new Date());
      shared++;
    }catch(err){
      // A teacher-owned file may not be shareable from this script account.
      sh.getRange(i+2,18).setValue('OWNER_CONSENT_NEEDED');
      ownerConsentNeeded++;
    }
  }
  SpreadsheetApp.flush();
  console.log('School report sharing: shared='+shared+', skipped='+skipped+', ownerConsentNeeded='+ownerConsentNeeded);
  return {shared,skipped,ownerConsentNeeded,managerReady:true};
}
