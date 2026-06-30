# Tasks — Versioning & Commit Policy (M1-E3)

> Execution checklist for [`prd-e3-versioning-policy.md`](prd-e3-versioning-policy.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-01/Epic-03/prd-e3-versioning-policy.md` — The Change Plan this executes.
- `…/Milestone-01/Epic-03/overview/e3-versioning-policy.md` — The epic overview.
- `packages/hardhat-diamonds/docs/VERSIONING.md` — **Created** (SemVer + Conventional Commits + Keep a Changelog policy).
- `packages/hardhat-diamonds/CHANGELOG.md` — **Edit (1 line)** — resolve the policy reference (drop "added in M1-E3").
- `…/Milestone-01/Epic-03/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Additive doc + a one-line CHANGELOG edit — **no backup needed**; integration branch is the snapshot.
- Documents conventions **already in use** (descriptive, not a retrofit).
- Don't widen scope: **no** commitlint/Husky/hook install (M4), no `CONTRIBUTING.md` (M3-E2), no version bump (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline`, clean tree. — **On branch ✓.**
  - [x] 0.2 No backup needed. Baseline: `docs/VERSIONING.md` absent; CHANGELOG line 7 has the marker `<!-- versioning policy added in M1-E3 -->`. — **Confirmed.**

- [x] 1.0 Write `docs/VERSIONING.md`
  - [x] 1.1 SemVer section + `v1.1.15 → 1.2.0` worked example. — **Done (public API defined; minor = exports map + signer widening; loadDiamondContract noted as already shipped).**
  - [x] 1.2 Conventional Commits section + SemVer mapping table. — **Done.**
  - [x] 1.3 Keep a Changelog section: `[Unreleased]` → release flow. — **Done (M5 dates/tags).**
  - [x] 1.4 Note commitlint/Husky enforcement is M4. — **Done (Enforcement section).**

- [x] 2.0 Resolve the CHANGELOG reference
  - [x] 2.1 Edit `CHANGELOG.md`: link to `docs/VERSIONING.md`, remove the marker. — **Marker removed; now `[versioning policy](docs/VERSIONING.md)`.**

- [x] 3.0 Validate the change
  - [x] 3.1 VERSIONING.md present with all 3 sections + 1.2.0 rationale + M4 note. — **All YES.**
  - [x] 3.2 `added in M1-E3` → 0 matches; policy link resolves. — **Confirmed.**
  - [x] 3.3 Gates + diff scope. — **lint exit 0 ✓, build exit 0 ✓; only `docs/VERSIONING.md` + `CHANGELOG.md` + `.project` docs changed.**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-01/Epic-03/CHANGELOG.md`. — **Done.**
  - [x] 4.2 Tick acceptance in PRD/epic overview; **mark M1 milestone complete** (E1+E2+E3). — **Done.**
  - [x] 4.3 Commit; **no push/merge**. — **See commit below.**
