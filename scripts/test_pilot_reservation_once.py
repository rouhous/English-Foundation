#!/usr/bin/env python3
"""Enrolment must reject a valid-looking account without a teacher invite."""
import json,urllib.request,urllib.error
url='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-pilot-register'
request=urllib.request.Request(url,data=json.dumps({
 'role':'student','accountRef':'deadc0de'*8
}).encode(),method='POST',headers={
 'Origin':'https://rouhous.github.io','Content-Type':'application/json'
})
try:
 with urllib.request.urlopen(request,timeout=20) as response:
  raise AssertionError('Uninvited enrolment was accepted: '+str(response.status))
except urllib.error.HTTPError as error:
 assert error.code==400,(error.code,error.read().decode()[:300])
 print('PASS: valid-shaped student account denied without approved teacher invitation')
