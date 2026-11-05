#!/usr/bin/env python3
"""Stage 6 conservative readiness decision — never certify an untested
cloud deployment, student authentication or physical iPhone/Android QA.
"""
from pathlib import Path
import json,re
root=Path(".")
def read(path):
 try:return json.loads((root/path).read_text(encoding="utf8"))
 except (OSError,ValueError):return {}
def existence(path,needle):
 try:return needle in (root/path).read_text(encoding="utf8")
 except OSError:return False
a=read("diagnostics/prelaunch-asset-validation.json")
b=read("diagnostics/stage5-browser-qa.json")
c=read("diagnostics/stage5-offline-browser.json")
d=read("diagnostics/stage6-learner-browser.json")
e=read("diagnostics/stage2-security-audit.json")
f=read("diagnostics/stage4-security.json")
code=(root/"Code.gs").read_text(encoding="utf8")
checks={
 "approved_images_1136":a.get("status")=="STATIC_ASSET_CHECKS_PASSED" and a.get("approved_images")==1136,
 "two_sublevels_present":a.get("two_levels") is True,
 "mobile_widths_no_overflow":b.get("status")=="STAGE5_BROWSER_CHECKS_PASSED",
 "offline_app_shell_and_12_image_shards":c.get("status")=="STAGE5_REAL_CHROMIUM_OFFLINE_PASSED",
 "offline_local_learning_and_star_persistence":d.get("status")=="STAGE6_OFFLINE_LEARNER_ACCEPTANCE_PASSED",
 "client_score_consistency_static":e.get("status")=="STAGE2_STATIC_CHECKS_PASSED",
 "isolated_verified_student_pilot_exists": "function mejV2Handle_(d)" in code,
 "isolated_restore_endpoint_exists":"function mejV2Snapshot_" in code,
 "isolated_class_ranking_endpoint_exists":"function mejV2Leaderboard_" in code,
 "class_ranking_disabled_by_default":"MEJ_V2_RANKING_ENABLED" in code,
}
known_release_blockers=[
 "Verified student account service is not deployed to a school-controlled Apps Script /exec production endpoint.",
 "Existing browser registration, answer grading and cloud reports have not been switched to authenticated verified scoring.",
 "Offline verified answer outbox is a tested module but is not wired into the current browser's practice flow.",
 "Verified class leaderboard is deliberately disabled; school-approved class membership and name-visibility review remain pending.",
 "Diagnostic placement and writing drafts have not been added to the verified cross-device progress snapshot.",
 "Physical Android Chrome/Firefox and iPhone Safari real-device tests are not completed.",
 "School privacy and authorization requirements for real student records are not yet confirmed.",
 "708 approved images are 316×316, below the preferred 384×384 quality threshold; do not silently replace approved assets."
]
decision={
 "product":"My English Journey",
 "stage":6,
 "tested_at_utc":"2026-11-05 (CI run; see GitHub Actions timestamps)",
 "status":"TEST_SUITE_PASSED_WITH_RELEASE_BLOCKERS" if all(checks.values()) else "TEST_SUITE_INCOMPLETE",
 "release_decision":"NO_GO_FOR_REAL_STUDENTS",
 "offline_first_requirement":"MANDATORY",
 "checked":checks,
 "passed_checks":sum(checks.values()),
 "total_checks":len(checks),
 "remaining_blockers":known_release_blockers,
 "student_data_used":"Synthetic account and local-only browser. No real student account registration.",
 "last_cleanup":"Existing trial cloud records reset during prior stage, do not delete any additional records automatically.",
 "recommendation":"Preserve offline app; deploy verified v2 to isolated school-owned staging, securely connect client, then repeat full end-to-end device and student privacy checks before GO."
}
(root/"diagnostics/stage6-release-gate.json").write_text(json.dumps(decision,ensure_ascii=False,indent=2),encoding="utf8")
print(json.dumps(decision,ensure_ascii=False,indent=2))
