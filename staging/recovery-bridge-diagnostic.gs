/** Diagnostic-only nonce handshake. No student records or recovery operations. */
function eeRecoveryBridgeDiagnosticPage_(nonce) {
  eeAssertStagingConfigured_();
  nonce = String(nonce || '');
  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return HtmlService.createHtmlOutput('Invalid diagnostic nonce');
  }
  const safeNonce = JSON.stringify(nonce);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bridge diagnostic</title></head><body><script>
(function(){
  'use strict';
  var nonce = ${safeNonce};
  var target = 'https://rouhous.github.io';
  function announce() {
    window.top.postMessage({eeRecoveryBridge:true,ready:true,diagnostic:'nonce-v2',nonce:nonce},target);
  }
  announce();
  window.addEventListener('load',announce);
})();
<\/script></body></html>`;
  return HtmlService.createHtmlOutput(html)
    .setTitle('My English Journey STAGING diagnostic')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
