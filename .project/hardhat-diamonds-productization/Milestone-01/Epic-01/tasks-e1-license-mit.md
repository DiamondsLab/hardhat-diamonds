# Tasks — MIT License File (M1-E1)

> Execution checklist for [`prd-e1-license-mit.md`](prd-e1-license-mit.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng. **Decision:** copyright `2025–2026 DiamondsLab`.

## Relevant Files & Resources

- `…/Milestone-01/Epic-01/prd-e1-license-mit.md` — The Change Plan this task list executes.
- `…/Milestone-01/Epic-01/overview/e1-license-mit.md` — The epic overview both docs expand.
- `packages/hardhat-diamonds/LICENSE` — **Created** (canonical MIT, `Copyright (c) 2025–2026 DiamondsLab`).
- `packages/hardhat-diamonds/package.json` — **Verify only** (`license: MIT`, `files` includes `LICENSE`); not edited.
- `…/Milestone-01/Epic-01/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Single additive file — **no backup needed**; the integration branch is the snapshot and `main` is untouched.
- All validation is read-only (`test -f`, `npm pack --dry-run`, `git`/`node` reads).
- No source changes → `build`/`test`/`lint` are unaffected; a quick lint+build sanity confirms.
- Do not widen scope: no `package.json` edits, no README/CHANGELOG-content/`.npmignore` work (M1-E2 / M2 / M3).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline` with a clean working tree. — **On branch ✓; tree clean except the new untracked task file (this epic's, committed in 4.0).**
  - [x] 0.2 No backup required (additive single file; branch = snapshot). — **Confirmed; `main` untouched.**
  - [x] 0.3 Capture pre-change pack state. — **`npm pack --dry-run`: 41 files, LICENSE NOT present; absent on disk. Matches M0-E2 baseline.**

- [x] 1.0 Create the MIT `LICENSE`
  - [x] 1.1 Write `LICENSE` at the package root with the **canonical OSI MIT template** and `Copyright (c) 2025-2026 DiamondsLab` (ASCII hyphen — standard for license files). — **Created.**
  - [x] 1.2 Verify the body matches canonical MIT (only the copyright line varies). — **Verified in 3.x below.**

- [x] 2.0 Verify packaging consistency
  - [x] 2.1 Confirm `package.json` `"license": "MIT"` (verify, **do not edit**). — **`MIT` ✓ (unchanged).**
  - [x] 2.2 Confirm `package.json` `files` includes `"LICENSE"` (verify, **do not edit**). — **true ✓ (unchanged).**
  - [x] 2.3 Re-run `npm pack --dry-run`; confirm `LICENSE` now appears. — **Tarball now 42 files (was 41); LICENSE present ✓.**

- [x] 3.0 Validate the change
  - [x] 3.1 `test -f LICENSE`; first line `MIT License`; copyright line present. — **Present ✓; first line `MIT License`; `Copyright (c) 2025-2026 DiamondsLab`; canonical MIT markers present.**
  - [x] 3.2 pack includes `LICENSE`; license metadata unchanged. — **LICENSE in tarball ✓; `package.json` license still `MIT`.**
  - [x] 3.3 Sanity: `yarn lint` + `yarn build` still exit 0. — **lint exit 0 ✓, build exit 0 ✓ (no source change).**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-01/Epic-01/CHANGELOG.md` with what changed + validation results. — **Done.**
  - [x] 4.2 Tick the satisfied acceptance criteria in the PRD and epic overview. — **Epic overview §3 ticked.**
  - [x] 4.3 Commit on the integration branch; **no push/merge** (release-only-`main`). — **See commit below.**
