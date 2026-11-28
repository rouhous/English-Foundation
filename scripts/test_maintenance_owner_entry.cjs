'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const index=read('index.html');
const sw=read('sw.js');
const login=read('reviews/owner-login.html');
const preview=read('reviews/admin-preview.html');

// The public app no longer exposes the former owner-login emblem entry.
// Keep this as a negative assertion so the test reflects the reopened app shell.
assert.doesNotMatch(index,/href=["']\.\/reviews\/owner-login\.html["']/,
  'Public app shell must not expose the retired owner-login entry');

// Track the active app-shell cache, not the retired maintenance-mode cache.
assert.match(sw,/mej-journey-release-20261128-v5/);
assert.match(login,/id="reviewLink" href="admin-preview\.html" hidden>معاينة التطبيق المحدثة/);
assert.match(preview,/MEJ_PREVIEW_BASE/);
assert.match(preview,/savedCredential/);
assert.match(preview,/mej-owner-preview-gate/);
assert.match(preview,/mej-owner-preview-content/);
assert.match(preview,/cdn\.jsdelivr\.net/);
const scriptStart=preview.indexOf('<script>');
const scriptEnd=preview.indexOf('</script>',scriptStart);
assert.ok(scriptStart>=0&&scriptEnd>scriptStart,'Owner preview must keep one syntactically complete inline controller');
new Function(preview.slice(scriptStart+8,scriptEnd));
console.log('MAINTENANCE_OWNER_ENTRY_CHECKS_PASSED');
