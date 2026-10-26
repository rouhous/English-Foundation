/**
 * STAGING recovery bridge v2. A session nonce correlates the iframe with
 * messages from the Google HTMLService inner window. The nonce is NOT
 * user authentication: the recovery service itself must validate tokens,
 * teacher codes, challenges, throttling and authorizations.
 *
 * In code.gs doGet(e), immediately after declaring 'pars', add:
 * if (String(pars.studentRecoveryV2 || '') === '1')
 *   return eeRecoveryBridgeV2Page_(pars.nonce);
 */
function eeRecoveryBridgeV2Page_(nonce) {
  eeAssertStagingConfigured_();
  nonce = String(nonce || '');
  if (!/^[a-f0-9]{32}$/.test(nonce))
    return HtmlService.createHtmlOutput('Invalid recovery session');
  const encoded = JSON.stringify(nonce);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Recovery v2</title></head><body>
<script>
(function(){
  'use strict';
  var nonce = ${encoded};
  var appOrigin = 'https://rouhous.github.io';
  var allowed = {
    enroll: 'eeClientEnroll',
    save: 'eeClientSave',
    challenge: 'eeClientChallenge',
    restore: 'eeClientRestore'
  };
  function send(data) {
    data.eeRecoveryBridge = true;
    data.nonce = nonce;
    window.top.postMessage(data, appOrigin);
  }
  function notify() { send({ready:true, protocol:2}); }
  notify();
  window.addEventListener('load', notify);
  window.addEventListener('message', function(e){
    if (e.origin !== appOrigin || e.source !== window.top) return;
    var x = e.data;
    if (!x || x.eeRecoveryRequest !== true || x.nonce !== nonce) return;
    var id = x.requestId;
    if (typeof id !== 'string' || !/^ee[0-9_]+$/.test(id) || id.length > 90) return;
    var method = Object.prototype.hasOwnProperty.call(allowed,x.action) ? allowed[x.action] : null;
    if (!method) { send({requestId:id,error:'INVALID_ACTION'}); return; }
    google.script.run
      .withSuccessHandler(function(payload){send({requestId:id,payload:payload});})
      .withFailureHandler(function(error){send({requestId:id,error:'SERVER_ERROR'});})
      [method](x.payload || {});
  });
})();
<\/script></body></html>`;
  return HtmlService.createHtmlOutput(html)
    .setTitle('My English Journey STAGING Recovery v2')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
