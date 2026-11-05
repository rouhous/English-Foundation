#!/usr/bin/env python3
"""Audit auth and settings architecture without dumping credentials into commits."""
from pathlib import Path
import re
s=Path("index.html").read_text(encoding="utf8")
patterns={
 "google_signin":r"google\.accounts|accounts\.google|GoogleAuth|googleSignIn|signInWithGoogle",
 "firebase_auth":r"firebase\.auth|signInWithPopup|GoogleAuthProvider",
 "supabase_auth":r"supabase\.auth|createClient\(",
 "settings_heading":r"الإعدادات|Settings",
 "settings_function":r"function\s+(?:settings|showSettings|renderSettings)\b",
 "admin_keywords":r"admin|administrator|مشرف|مدير",
 "owner_email_literal":r"rouhous@gmail\.com",
 "server_code_references":r"script\.google\.com/macros|\.supabase\.co",
 "review_link":r"reviews/owner-review\.html",
}
out=["# Admin authentication audit (static)", "", "Generated from main index.html. Counts indicate code references, not verified authentication.", ""]
for name,pattern in patterns.items():
 matches=list(re.finditer(pattern,s,re.I))
 out.append(f"- **{name}**: {len(matches)} occurrences")
out+=["","## Interpretation","- Browser-only role checks do not establish secure authorization.","- A Google OAuth credential must be validated by a trusted server and mapped to stable owner subject.","- Student data and progress modifications require server-side guards.","- Review links must remain read-only until authentication and a separate owner backend exist.","","## Deployment","- Review entry marker: "+("present" if "MEJ_SAFE_ADMIN_SETTINGS_ENTRY_V1" in s else "absent"),"- Publish path remains GitHub Pages; source is public.",""]
Path("diagnostics").mkdir(exist_ok=True)
Path("diagnostics/admin-auth-audit.md").write_text("\n".join(out),encoding="utf8")
print("\n".join(out))
