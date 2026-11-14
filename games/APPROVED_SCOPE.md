# My English Journey — approved interactive games scope

Approved interactive games for the current release candidate:

- **Word Explorer** — matching English words to pictures/meanings, with grade-level question banks.
- **Sentence Builder** — order words to form correct English sentences.
- **Grammar Gate** — respond to grammar challenges with short explanations for errors.
- **Hidden Objects** — find English-language objects in educational scenes (practice score stays separate from learning stars).

**Explicitly excluded until a new user decision:** the Omani Sailor / boat steering and jewel-collection game, and related chest/money mechanics. No boat card, button, iframe, navigation link, scoring or reward integration is authorized in the student-facing app.

The older prototypes in `boat-game/` and `omani-sailor/` remain as *archived source only*, not included in the approved arcade. Retaining source in Git history or the repository **does not** constitute approval to reintroduce the game.

Root maintenance and `games/release.js` remain locked. The parent app should show only the four approved games when the overall application is restored and the arcade release gate is deliberately opened.
