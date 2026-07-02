# Tasks — CI Workflow (M4-E1)

> Execution checklist for [`prd-e1-ci-workflow.md`](prd-e1-ci-workflow.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-04/Epic-01/prd-e1-ci-workflow.md` — The Change Plan this executes.
- `…/Milestone-04/Epic-01/overview/e1-ci-workflow.md` — The epic overview.
- `packages/hardhat-diamonds/.github/workflows/ci.yml` — **Created** (the only file added; `.github/` already exists from M3-E2).
- `packages/hardhat-diamonds/yarn.lock` — Verified (needed for `--immutable`/cache); committed if absent.
- `packages/hardhat-diamonds/package.json` — Read only (scripts/`packageManager`/`engines`).
- `…/Milestone-04/Epic-01/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Config-only, reversible — **no backup needed**; branch is the snapshot. Workflow is **inert until merged** to `main`.
- Mirror the package's **real** scripts (`yarn build/lint/test`) + `packageManager` (corepack/Yarn 4).
- Don't widen scope: no release workflow (M4-E2), no secrets/protection (M4-E3), no merge (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch; `.github/` exists. — **On branch ✓; `.github/` present (M3-E2).**
  - [x] 0.2 `yarn.lock` decision. — **FINDING: no committed `yarn.lock` + no `.yarnrc.yml` (submodule is developed in the monorepo workspace; no standalone lockfile). Using plain `yarn install` (no `--immutable`, no `cache: yarn`). Committing a standalone `yarn.lock` for reproducible CI is flagged as a FOLLOW-UP (can't be generated safely in-place — yarn resolves against the monorepo workspace).**

- [x] 1.0 Author `.github/workflows/ci.yml`
  - [x] 1.1 Triggers `pull_request` + `push: branches:[main]`; `concurrency` cancel-in-progress. — **Done.**
  - [x] 1.2 `permissions: { contents: read }`. — **Done.**
  - [x] 1.3 Job `test`: ubuntu-latest, matrix node [18,20,22], `fail-fast: false`. — **Done.**
  - [x] 1.4 Steps checkout@v4 → setup-node@v4 → corepack enable → `yarn install` → build → lint → test. — **Plain `yarn install` (no lockfile); cache omitted; follow-up commented in the file.**

- [x] 2.0 Validate the change
  - [x] 2.1 YAML parses. — **js-yaml load OK; name CI, job test.**
  - [x] 2.2 Content checks. — **triggers pull_request+push ✓; matrix [18,20,22] ✓; corepack ✓; yarn build/lint/test ✓; contents:read ✓.**
  - [x] 2.3 Diff scope. — **Only `.github/workflows/ci.yml` added.**

- [x] 3.0 Record the change
  - [x] 3.1 Create/append `…/Milestone-04/Epic-01/CHANGELOG.md`. — **Done (+ yarn.lock follow-up).**
  - [x] 3.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked; yarn.lock follow-up noted in milestone risks.**
  - [x] 3.3 Commit; **no push/merge**. — **See commit below.**
