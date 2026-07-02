# Tasks — Changelog Backfill (M1-E2)

> Execution checklist for [`prd-e2-changelog-backfill.md`](prd-e2-changelog-backfill.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-01/Epic-02/prd-e2-changelog-backfill.md` — The Change Plan this executes.
- `…/Milestone-01/Epic-02/overview/e2-changelog-backfill.md` — The epic overview.
- `packages/hardhat-diamonds/CHANGELOG.md` — **Created** (Keep a Changelog; backfill + `[Unreleased]`/`[1.2.0]`).
- `packages/hardhat-diamonds/package.json` — Read only (`version` for latest heading).
- git tags / `git log` — Read only (backfill source).
- `…/Milestone-00/baseline-inventory.md` — version/tag facts (§4).
- `…/Milestone-01/Epic-02/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Additive doc — **no backup needed**; integration branch is the snapshot.
- Backfill **strictly from git** (`git tag`, `git log <a>..<b>`); summarize uncertain old entries, never invent.
- Consumer-facing doc — no private addresses/infra/PII; API/behavior-level descriptions only.
- No `1.2.0` release date (M5 dates it). Don't bump `package.json`.
- Don't widen scope: no LICENSE/policy/README/metadata work here.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline`, clean tree. — **On branch ✓.**
  - [x] 0.2 No backup needed (additive). Baseline: `CHANGELOG.md` absent. — **Confirmed absent.**

- [x] 1.0 Extract release history from git
  - [x] 1.1 List tags chronologically. — **10 tags 2025-09→12; confirmed `v1.0.11` (2025-12-16) tagged AFTER `v1.1.7` (2025-11-01); skipped patch numbers.**
  - [x] 1.2 Summarize notable commits per boundary. — **Mapped the migrate→peer-dep-export→circular-dep-fix→LoadDiamondArtifact arc to tags v1.0.11/v1.1.12/v1.1.14/v1.1.15.**
  - [x] 1.3 Capture post-`v1.1.15` deltas. — **⚠️ FINDING: `loadDiamondContract` & peer-dep export are ALREADY RELEASED (v1.1.14/v1.1.15, v1.1.12) — NOT 1.2.0 deltas. True `[Unreleased]` = fork-upgrade signer fix (`c9e2e07`) + M2-E4 signer-type widening. Corrects the "new export justifies minor" premise.**

- [x] 2.0 Author `CHANGELOG.md`
  - [x] 2.1 Scaffold Keep a Changelog header + top `## [Unreleased]`. — **Done (intro, SemVer/KaC links, compare links).**
  - [x] 2.2 Write `[Unreleased]` with the **true** deltas: **Fixed** (fork-upgrade signer) + **Changed** (`signer`→`Signer`, M2-E4). *(loadDiamondContract/peer-dep moved to their real released sections — see 1.3.)* Next version finalized at M5. — **Done.**
  - [x] 2.3 Backfill `v1.1.15 → v1.1.0` (newest first) with git-accurate summaries; detail the LocalDiamondDeployer/LoadDiamondArtifact arc. — **Done.**
  - [x] 2.4 Add the historical-tagging note + versioning-policy reference (marked "added in M1-E3"). — **Done.**

- [x] 3.0 Validate the change
  - [x] 3.1 Structure check. — **[Unreleased] ✓, [1.1.15] ✓, Keep a Changelog ref ✓, Added/Changed/Fixed groups ✓.**
  - [x] 3.2 `[Unreleased]` content + no `1.2.0` date. — **Names the `signer` type change ✓; `loadDiamondContract` correctly in `[1.1.15]` (NOT leaked into Unreleased) ✓; no `1.2.0` date ✓.**
  - [x] 3.3 Gates + diff scope. — **lint exit 0 ✓, build exit 0 ✓; only `CHANGELOG.md` + `.project` docs changed.**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-01/Epic-02/CHANGELOG.md`. — **Done (incl. the version-rationale correction).**
  - [x] 4.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked; PRD Req-3 deviation noted (loadDiamondContract is released, not Unreleased).**
  - [x] 4.3 Commit; **no push/merge**. — **See commit below.**
