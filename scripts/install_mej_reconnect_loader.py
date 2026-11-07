#!/usr/bin/env python3
"""Make local-first learner progress reconnect even if PWA script missed offline startup."""
from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf8')
mark='MEJ_RELOAD_SYNC_ON_RECONNECT_V1'
if mark in s:
 print('ALREADY_UPDATED');raise SystemExit(0)
old="if(!window.MEJStudentCloudProgress){if(manual)toast('خدمة المزامنة لم تُحمّل؛ تقدمك محفوظ محلياً.');return;}"
assert s.count(old)==1
new="""if(!window.MEJStudentCloudProgress&&navigator.onLine){
  // MEJ_RELOAD_SYNC_ON_RECONNECT_V1
  // An offline PWA launch may have missed the external transport script.
  try{
   await new Promise((resolve,reject)=>{
    document.getElementById('mej-cloud-progress-retry')?.remove();
    const script=document.createElement('script');
    script.id='mej-cloud-progress-retry';
    script.src='./assets/student-cloud-progress-v1.js?v=2';
    script.onload=resolve;script.onerror=reject;
    document.head.append(script);
    setTimeout(()=>reject(Error('SYNC_SCRIPT_TIMEOUT')),10000);
   });
  }catch(_){}
 }
 if(!window.MEJStudentCloudProgress){if(manual)toast('خدمة المزامنة لم تُحمّل؛ تقدمك محفوظ محلياً.');return;}"""
s=s.replace(old,new,1)
p.write_text(s,encoding='utf8')
print('RECONNECT_LOADER_ADDED')

# Trigger verified reconnect deployment.
