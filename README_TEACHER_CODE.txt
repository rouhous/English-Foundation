English Explorer – Teacher registration code, class-organized reports

IMPORTANT: DO NOT put your actual code into the GitHub HTML or this ZIP.

1) Google Apps Script -> Project Settings -> Script properties:
   Property: TEACHER_REGISTRATION_CODE
   Value: choose a random private code (12+ characters is recommended).
2) Back up your existing Apps Script receiver, then replace Code.gs with the included Code.gs. Keep any existing SPREADSHEET_ID setting if you need it.
3) Deploy > Manage deployments > Edit > New version > Deploy. Set Execute as Me; Who has access Anyone. Keep the existing /exec URL.
4) Select testReceiver, Run; then testLiveDeployment, Run. Those tests require the Script Property first.
5) Upload index.html, manifest.webmanifest, sw.js and icon files to your GitHub Pages repo root. GitHub may need some time before the installed app loads the updated cache.
6) Register a student with Name, Grade, School, Class (e.g. 9A) and the teacher code. Without a code, learning works locally but reports are not sent. Wrong code is rejected by server.
7) The workbook has Student_Progress, Progress_Log and Class_9A etc. Old rows are preserved.

PRIVACY: Google Sheet Editor/Viewer permission applies to ALL sheets in the workbook, not individual class tabs. For class-limited teacher access use separate spreadsheets with separately configured permissions. A shared code authorizes reports but does not authenticate student identity; avoid sensitive student details and apply school privacy policy.
