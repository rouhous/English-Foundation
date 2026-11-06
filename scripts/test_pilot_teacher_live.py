#!/usr/bin/env python3
import urllib.request,urllib.error,json
url='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-pilot-teacher-approve'
for label,method,headers,body,expected in [
 ('no-token','POST',{'Origin':'https://rouhous.github.io','Content-Type':'application/json'},{'teacherEmail':'sample@example.com'},403),
 ('forged-token','POST',{'Origin':'https://rouhous.github.io','Content-Type':'application/json','Authorization':'Bearer fake'},{'teacherEmail':'sample@example.com'},403),
 ('wrong-origin','POST',{'Origin':'https://invalid.example','Content-Type':'application/json'},{'teacherEmail':'sample@example.com'},403),
 ('preflight','OPTIONS',{'Origin':'https://rouhous.github.io'},None,204)
]:
 data=None if body is None else json.dumps(body).encode()
 request=urllib.request.Request(url,data=data,headers=headers,method=method)
 try:
  with urllib.request.urlopen(request,timeout=20) as response:actual=response.status
 except urllib.error.HTTPError as error:actual=error.code
 assert actual==expected,(label,actual,expected)
 print('PASS',label,actual)
