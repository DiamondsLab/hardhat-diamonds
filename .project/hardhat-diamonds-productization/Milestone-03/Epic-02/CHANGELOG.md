# Changelog — M3-E2 Community & Governance Docs

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M3-E2 — Add community/governance docs (2026-06-28)

- Added `CONTRIBUTING.md` (workflow + yarn commands + links `docs/VERSIONING.md` / Conventional Commits + CoC).
- Added `SECURITY.md` (supported versions; reporting via GitHub private vulnerability reporting + DiamondsLab issues fallback — no fabricated email).
- Added `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
- Added `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md` + `.github/PULL_REQUEST_TEMPLATE.md`.
- Cross-linked from README (Contributing → CONTRIBUTING.md; new Security section → SECURITY.md).
- **Validated:** all files present + internally linked; **pack check confirms they're repo-only** (excluded from the 39-file tarball); lint/build exit 0.
- ✅ **M3-E2 complete (local).** No push/merge.

---

### 🏁 M3 milestone (Docs & README Audit) COMPLETE

Both epics done on the integration branch: **M3-E1** (README correctness — names, links, prerequisites, entry points, signer) · **M3-E2** (CONTRIBUTING/SECURITY/CODE_OF_CONDUCT + GitHub templates). The package's documentation is now accurate and professional. Remaining before release: **M4** (CI/CD) and **M5** (release runbook + `v1.2.0` cut).
