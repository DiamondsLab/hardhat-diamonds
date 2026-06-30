# Tasks — Tarball Verification (M2-E3)

> Execution checklist for [`prd-e3-tarball-verification.md`](prd-e3-tarball-verification.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng. Final M2 epic.

## Relevant Files & Resources

- `…/Milestone-02/Epic-03/prd-e3-tarball-verification.md` — The Change Plan this executes.
- `…/Milestone-02/Epic-03/overview/e3-tarball-verification.md` — The epic overview.
- `packages/hardhat-diamonds/package.json` — **Edited** (`files` whitelist, `prepack` clean build).
- `packages/hardhat-diamonds/.npmignore` — **Deleted** (redundant; `files` is the single source of truth).
- `…/Milestone-02/Epic-03/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Reversible config edits — **no backup needed**; branch is the snapshot.
- Validation is read-only (`npm pack --dry-run`, install-test, `git`).
- Don't widen scope: no `exports`/metadata (E1/E2 done), no README (M3), no publish/version (M4/M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline`, clean tree. — **On branch ✓.**
  - [x] 0.2 Baseline pack list. — **40 files; `CHANGELOG.md` NOT shipping; `docs/TESTING*` shipping; `.npmignore` present.**

- [x] 1.0 Reconcile to one packaging strategy
  - [x] 1.1 Set `files` to the precise 5-entry list. — **Done.**
  - [x] 1.2 Delete `.npmignore` (read-before-delete: blocklist now superseded by the stricter allowlist). — **Deleted via `git rm`.**

- [x] 2.0 Harden the clean-build-on-publish
  - [x] 2.1 `prepack` → `tsc --build --force`. — **Done.**
  - [x] 2.2 Prove it. — **Deleted `dist/index.d.ts` (dirty incremental state) → `tsc --build --force` RESTORED it ✓ (plain incremental `tsc` did not).**

- [x] 3.0 Validate the change
  - [x] 3.1 Pack-list audit. — **39 files / 174.6kB. Includes dist/index.d.ts, LICENSE, README, CHANGELOG.md, docs/VERSIONING.md, package.json; excludes TESTING*; no src/test/coverage/tsbuildinfo leaks.**
  - [x] 3.2 Install-test. — **install exit 0; `.`/`/dist/utils`/`/dist/lib` resolve; LICENSE+CHANGELOG+VERSIONING present; TESTING absent.**
  - [x] 3.3 Gates + diff scope. — **lint 0 ✓, build 0 ✓, test 120 passing ✓; `package.json` M + `.npmignore` D only.**
  - [x] 3.4 Record manifest. — **39 files / 174.6kB; non-dist = CHANGELOG.md, LICENSE, README.md, docs/VERSIONING.md, package.json + dist/**. Recorded for M5.**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-02/Epic-03/CHANGELOG.md`; **M2 milestone marked complete** (E1+E2+E3+E4). — **Done.**
  - [x] 4.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 + milestone DoD ticked.**
  - [x] 4.3 Commit; **no push/merge**. — **See commit below.**
