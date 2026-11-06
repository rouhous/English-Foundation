#!/usr/bin/env python3
"""One synthetic account only; its record must be cleaned by project administration."""
import json,urllib.request,urllib.error
base='https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-pilot-register'
ref='deadc0de'*8
for number in (1,2):
 req=urllib.request.Request(base,data=json.dumps({'role':'student','accountRef':ref}).encode(),
   method='POST',headers={'Origin':'https://rouhous.github.io','Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=20) as r:
   payload=json.loads(r.read())
   assert r.status==200 and payload.get('ok') is True,payload
   assert payload.get('existing') is (number==2),payload
   print('PASS request',number,'reserved' if number==1 else 'idempotent existing')
 except urllib.error.HTTPError as e:
  raise RuntimeError(f"HTTP {e.code}: {e.read().decode()[:300]}")
