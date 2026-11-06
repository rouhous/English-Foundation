#!/usr/bin/env python3
"""Non-privileged live smoke checks for the My English Journey owner endpoint."""
import json, urllib.request, urllib.error, pathlib

URL="https://xboracsbzikojobumcke.supabase.co/functions/v1/mej-owner-verify"
ORIGIN="https://rouhous.github.io"
def call(method="GET", headers=None):
    request=urllib.request.Request(URL,headers=headers or {},method=method)
    try:
        with urllib.request.urlopen(request,timeout=20) as r:
            return r.status,r.read().decode("utf-8"),dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code,e.read().decode("utf-8"),dict(e.headers)

checks=[]
for label, method, headers, expected in [
 ("No token rejected","GET",{},403),
 ("Forged token rejected","GET",{"Origin":ORIGIN,"Authorization":"Bearer fake-token"},403),
 ("Wrong origin rejected","GET",{"Origin":"https://untrusted.invalid"},403),
 ("Allowed origin preflight","OPTIONS",{"Origin":ORIGIN},204),
]:
    status,body,respheaders=call(method,headers)
    if status!=expected:
        raise RuntimeError(f"{label}: expected {expected} but got {status}: {body[:200]}")
    checks.append(f"PASS: {label} ({status})")
result="\n".join(["# Owner verification live acceptance", "", "Target: dedicated My-English-Journey Supabase project","",*checks,"",
"Only unauthenticated and counterfeit requests were tested. Signed Google owner-login still requires a real browser sign-in.",
"Admin data operations remain disabled."])
path=pathlib.Path("diagnostics/owner-verification-live.md")
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(result+"\n",encoding="utf8")
print(result)
