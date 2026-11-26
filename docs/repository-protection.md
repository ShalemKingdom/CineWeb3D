# Repository protection — administrator activation required

At step 14 inspection, CineWeb3D was already public, default main pointed to the initial commit and both main and sandbox reported unprotected. The ruleset list was empty; the branch-protection API returned 403 for the connected integration. No repository settings have been changed. The files in .github/rulesets are importable configuration proposals, not active rules.

## Apply the rules

Visit https://github.com/ShalemKingdom/CineWeb3D/settings/rules . In New ruleset, choose Import a ruleset, download the JSON proposals from the sandbox branch (.github/rulesets/main.json and sandbox.json), inspect target and settings, then activate. Alternatively create the same branch rules manually. No bypass actors. The sandbox rule blocks deletion and non-fast-forward updates, but still allows ordinary development pushes. The main rule requires a pull request, resolved conversations, up-to-date required checks, and blocks deletion/force pushes.

Main requires check contexts build, shield, skill, showcase, quality, media, community. Verify these actual check names and select GitHub Actions as the expected source where possible. All corresponding workflows must run on pull_request, without path filters that leave required checks pending. Blender is a separate release gate, not a required PR context because its current workflow is sandbox/path-scoped. Do not weaken checks if the first release PR needs a fresh run. No merge queue is configured.

The proposal uses zero mandatory approving reviews for the initial owner-maintained project; a PR and successful checks are still mandatory. This avoids an impossible self-approval requirement. Once a second independent maintainer with write access is confirmed, require at least one independent approving review and CODEOWNERS approval, dismiss stale approvals, and require latest-push approval. Do not add broad bypass permissions.

## Security settings

At Settings > Advanced Security / Code security and analysis, enable private vulnerability reporting, Dependabot alerts/security updates, secret scanning and push protection where available for this public repository. Confirm actual enabled status and use read-only default Actions token with no PR write permissions. Existing workflows pin actions and use read-only tokens; Dependabot config is committed, but settings are not verified active. Do not give CI an administration token. Account-level 2FA is separate; enable it on the maintainer account.

Verify Rulesets lists both active, branch metadata reports protected, and a normal pull request requires intended checks. Review rules before initial release and adjust only explicitly. No tag, release, visibility change, production deployment or merge is authorized by this document.

Official references: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository ; https://docs.github.com/en/rest/repos/rules ; https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository .
