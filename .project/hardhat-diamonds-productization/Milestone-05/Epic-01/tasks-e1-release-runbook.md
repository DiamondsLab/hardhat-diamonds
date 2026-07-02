# Tasks — Release Runbook (M5-E1)

> Execution checklist for [`prd-e1-release-runbook.md`](prd-e1-release-runbook.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-05/Epic-01/prd-e1-release-runbook.md` — The Change Plan this executes.
- `…/Milestone-05/Epic-01/overview/e1-release-runbook.md` — The epic overview.
- `packages/hardhat-diamonds/notes/RELEASE_RUNBOOK.md` — **Created** (the requested deliverable; `notes/` un-ignored in M0).
- Referenced (read-only): `package.json`, `CHANGELOG.md`, `docs/VERSIONING.md`, `.github/workflows/{ci,release}.yml`, M2-E3 pack manifest.
- `…/Milestone-05/Epic-01/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Doc-only, reversible — **no backup needed**; branch is the snapshot.
- Use the project's **real** commands/manifest; mark each step's actor (Eng vs **Owner**).
- Don't widen scope: no version bump / publish (M5-E3), no dry-run execution (M5-E2).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch; `notes/` tracked. — **On branch ✓; `notes/` tracked (un-ignored M0); current version 1.1.15.**

- [x] 1.0 Author `notes/RELEASE_RUNBOOK.md`
  - [x] 1.1 Preflight (clean tree, CI, M4-E3 secrets, dry-run). — **§0.**
  - [x] 1.2 Version bump (manual `npm pkg set version` → X.Y.Z; not `npm version` to avoid premature auto-tag). — **§1.**
  - [x] 1.3 Changelog finalize. — **§2.**
  - [x] 1.4 Build + pack audit (≈39 files/174.6kB; includes/excludes). — **§3.**
  - [x] 1.5 Merge to `main` [Owner] + Tag/Publish [Owner pushes tag → release.yml]. — **§4.**
  - [x] 1.6 Verify (npm view, provenance badge, clean install). — **§5.**
  - [x] 1.7 Rollback/recovery (no-re-publish → deprecate + patch + dist-tag). — **§7.**
  - [x] 1.8 Post-release monorepo verification + cross-links. — **§8 + References.** *(Also added a Dry-run §6.)*

- [x] 2.0 Validate the change
  - [x] 2.1 Present + all sections (0–8). — **Confirmed via literal grep (earlier ✗ were `+`-in-title regex artifacts).**
  - [x] 2.2 Owner gates (6 `[Owner]`), M4-E3 prerequisite, rollback no-re-publish + deprecate + dist-tag, links resolve, tag-only noted. — **All ✓.**
  - [x] 2.3 Diff scope. — **Only `notes/RELEASE_RUNBOOK.md` added; no `package.json`/`CHANGELOG` change (those are M5-E3).**

- [x] 3.0 Record the change
  - [x] 3.1 Create/append `…/Milestone-05/Epic-01/CHANGELOG.md`. — **Done.**
  - [x] 3.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked.**
  - [x] 3.3 Commit; **no push/merge**. — **See commit below.**
