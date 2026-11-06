#!/usr/bin/env python3
"""Public pilot endpoint checks that cannot claim any seats."""
import json,urllib.request,urllib.error
base='https://xboracsbzikojobumcke.supabase.co/functions/v1/'
site='https://rouhous.github.io'
def run(route,method,body=None,headers=None):
 data=None if body is None else json.dumps(body).encode()
 req=urllib.request.Request(base+route,data=data,method=method,headers=headers or {})
 try:
  with urllib.request.urlopen(req,timeout=20) as resp:
   return resp.status,resp.read().decode(),dict(resp.headers)
 except urllib.error.HTTPError as error:
  return error.code,error.read().decode(),dict(error.headers)
status,body,headers=run('mej-pilot-status','GET',headers={'Origin':site})
assert status==200,(status,body)
data=json.loads(body)
assert data.get('ok') is True and data.get('registration')
assert type(data['registration']['studentOpen']) is bool
assert type(data['registration']['teacherOpen']) is bool
print('PASS status endpoint online, with opaque availability booleans')
status,body,_=run('mej-pilot-register','POST',{'role':'teacher','accountRef':'0'*64},{'Origin':site,'Content-Type':'application/json'})
assert status==403,(status,body)
print('PASS anonymous teacher enrolment rejected')
status,body,_=run('mej-pilot-register','POST',{'role':'student','accountRef':'invalid'},{'Origin':site,'Content-Type':'application/json'})
assert status==400,(status,body)
print('PASS invalid student identity denied')
status,body,_=run('mej-pilot-register','POST',{'role':'student','accountRef':'0'*64},{'Origin':'https://attacker.invalid','Content-Type':'application/json'})
assert status==403,(status,body)
print('PASS external origin denied')
status,_,_=run('mej-pilot-register','OPTIONS',headers={'Origin':site})
assert status==204,status
print('PASS CORS preflight')
