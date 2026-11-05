# Admin authentication audit (static)

Generated from main index.html. Counts indicate code references, not verified authentication.

- **google_signin**: 0 occurrences
- **firebase_auth**: 0 occurrences
- **supabase_auth**: 0 occurrences
- **settings_heading**: 32 occurrences
- **settings_function**: 0 occurrences
- **admin_keywords**: 7 occurrences
- **owner_email_literal**: 0 occurrences
- **server_code_references**: 2 occurrences
- **review_link**: 1 occurrences

## Interpretation
- Browser-only role checks do not establish secure authorization.
- A Google OAuth credential must be validated by a trusted server and mapped to stable owner subject.
- Student data and progress modifications require server-side guards.
- Review links must remain read-only until authentication and a separate owner backend exist.

## Deployment
- Review entry marker: present
- Publish path remains GitHub Pages; source is public.
