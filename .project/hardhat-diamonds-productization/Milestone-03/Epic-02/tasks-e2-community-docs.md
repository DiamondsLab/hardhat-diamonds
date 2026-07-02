# Tasks — Community & Governance Docs (M3-E2)

> Execution checklist for [`prd-e2-community-docs.md`](prd-e2-community-docs.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng. SECURITY contact = GitHub private vulnerability reporting + DiamondsLab issues URL (default).

## Relevant Files & Resources

- `…/Milestone-03/Epic-02/prd-e2-community-docs.md` — The Change Plan this executes.
- `…/Milestone-03/Epic-02/overview/e2-community-docs.md` — The epic overview.
- `packages/hardhat-diamonds/CONTRIBUTING.md` — **Created**.
- `packages/hardhat-diamonds/SECURITY.md` — **Created**.
- `packages/hardhat-diamonds/CODE_OF_CONDUCT.md` — **Created** (Contributor Covenant v2.1).
- `packages/hardhat-diamonds/.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md` — **Created**.
- `packages/hardhat-diamonds/.github/PULL_REQUEST_TEMPLATE.md` — **Created**.
- `packages/hardhat-diamonds/README.md` — **Edited** (cross-link Contributing + Security).
- `packages/hardhat-diamonds/docs/VERSIONING.md` — Read only (linked from CONTRIBUTING).
- `…/Milestone-03/Epic-02/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Additive docs + a small README edit — **no backup needed**; branch is the snapshot.
- SECURITY uses GitHub private reporting + issues URL — **no fabricated email**.
- These files are **repo-only** — the M2-E3 `files` whitelist must NOT ship them (verify in a pack check).
- Don't widen scope: no `.github/workflows` (M4), no `package.json`, no publish (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch, clean tree. — **On branch ✓.**
  - [x] 0.2 Confirm none of the target files exist. — **All absent; `.github/` absent.**

- [x] 1.0 Add community health files
  - [x] 1.1 `CONTRIBUTING.md`. — **Flow + yarn commands + links `docs/VERSIONING.md`/Conventional Commits + CoC.**
  - [x] 1.2 `SECURITY.md`. — **Supported versions (1.2.x) + GitHub private vulnerability reporting + DiamondsLab issues fallback.**
  - [x] 1.3 `CODE_OF_CONDUCT.md`. — **Contributor Covenant v2.1; enforcement contact = the SECURITY channel.**

- [x] 2.0 Add `.github/` templates
  - [x] 2.1 Issue templates. — **`bug_report.md` + `feature_request.md`.**
  - [x] 2.2 PR template. — **Checklist: Conventional Commits, build/test/lint, CHANGELOG, docs.**

- [x] 3.0 Cross-link from README + reconcile docs/TESTING
  - [x] 3.1 README "Contributing" → links `CONTRIBUTING.md`; added "Security" section → `SECURITY.md`. — **Done.**
  - [x] 3.2 `docs/TESTING.md` reference resolves (M3-E1 Documentation section); repo-only. — **Confirmed.**

- [x] 4.0 Validate the change
  - [x] 4.1 All 6 files present. — **✓.**
  - [x] 4.2 Content checks. — **CONTRIBUTING→VERSIONING ✓; SECURITY channel ✓; CoC Contributor Covenant ✓; README links both ✓.**
  - [x] 4.3 **Pack check.** — **CONTRIBUTING/SECURITY/CODE_OF_CONDUCT/`.github` all EXCLUDED from the tarball (still 39 files) ✓.**
  - [x] 4.4 Gates + status. — **lint 0 ✓, build 0 ✓; only README.md + new community docs/`.github`.**

- [x] 5.0 Record the change
  - [x] 5.1 Create/append `…/Milestone-03/Epic-02/CHANGELOG.md`; **M3 milestone marked complete** (E1+E2). — **Done.**
  - [x] 5.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 + milestone DoD ticked.**
  - [x] 5.3 Commit; **no push/merge**. — **See commit below.**
