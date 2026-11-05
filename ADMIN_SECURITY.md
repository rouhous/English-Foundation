# Owner access and security — My English Journey

## Owner account
- GitHub source repository: `rouhous/English-Foundation`.
- Intended application owner Google account: `rouhous@gmail.com`.
- **Important:** Matching an email string in browser JavaScript, localStorage,
  a query parameter, or a hidden UI switch is NOT authentication.
- GitHub account ownership and Google sign-in are distinct identities. Their
  association must be explicitly configured and verified on a trusted server.

## Required Admin full access design
1. Place an **Admin** entry in Settings, visible to the authenticated owner.
2. Authenticate with Google OpenID Connect, including a verifiable ID token.
3. Validate ID token signature, expiry, issuer, and audience on a trusted backend.
   Match a stable Google `sub` user ID to the owner allowlist (email only as a
   supporting verified attribute). Reject other users by default.
4. Issue a short-lived scoped admin session; do not store credentials or service
   role keys in GitHub Pages, browser source, or localStorage.
5. Enforce authorization **for every privileged operation** on the server:
   viewing all levels, content editing, student reset, data exports, cloud sync
   management, and teacher/learner account administration. Log changes.
6. Permit owner preview of all levels and learning pages without tampering with
   learner progress or stars. Preserve offline study for ordinary users.
7. Add a confirmation dialog and backup for irreversible administrative actions.
8. If the network is offline, do not allow previously cached UI state to authorize
   cloud mutations. Offline Admin content preview may be made read-only.

## Current status
The `reviews/admin-levels.html` and `reviews/learning.html` pages are
public educational-content previews, not authenticated full Admin access.
Do not place student data or private admin actions in those files.
The owner login and server authorization **must be implemented and tested**
before claiming full Admin is enabled.

## Copyright and practical protection
See `LICENSE`. A restrictive copyright notice forbids unauthorized reuse,
but it cannot technically prevent viewing or copying files served by a public
GitHub Pages app. Disabling right-click or obscuring/minifying JavaScript is
not a security boundary. For stronger protection, keep the canonical private
source in a private repository, publish generated/minified public assets,
and move privileged logic and private data to a server with authorization.
Never put student secrets, credentials, service keys, or private data in this
public repository.

Report vulnerabilities privately to the repository owner, not in public issues
containing sensitive information.
