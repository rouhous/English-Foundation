/** STAGING diagnostic only: no student operations. Deploy manually to Apps Script as a NEW file and add a separate doGet route. */
function eeRecoveryBridgeDiagnosticPage_() {
  eeAssertStagingConfigured_();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Recovery bridge diagnostic</title></head><body>
<script>
(function(){
  'use strict';
  var APP_ORIGIN = 'https://rouhous.github.io';
  function announce(){
    try { window.top.postMessage({eeRecoveryBridge:true,ready:true,diagnostic:'top-ready-v1'}, APP_ORIGIN); }
    catch(err) {}
  }
  announce();
  window.addEventListener('load',announce);
  // No requests or student data accepted.
})();
<\/script></body></html>`;
  return HtmlService.createHtmlOutput(html)
    .setTitle('My English Journey STAGING Recovery Diagnostic')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
