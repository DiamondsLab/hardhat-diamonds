# Tasks — Release Workflow (M4-E2)

> Execution checklist for [`prd-e2-release-workflow.md`](prd-e2-release-workflow.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng (workflow).

## Relevant Files & Resources

- `…/Milestone-04/Epic-02/prd-e2-release-workflow.md` — The Change Plan this executes.
- `…/Milestone-04/Epic-02/overview/e2-release-workflow.md` — The epic overview.
- `packages/hardhat-diamonds/.github/workflows/release.yml` — **Created** (the only file added).
- `packages/hardhat-diamonds/package.json` — Read only (`publishConfig`, `prepack`, `files` from M2).
- `…/Milestone-04/Epic-02/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Config-only, reversible — **no backup needed**. The workflow is **inert until merged + a `v*` tag is pushed**; the real publish is **M5-E3** (owner-approved) and needs **M4-E3** secrets.
- **Publishing is irreversible** — tag-only trigger + human-pushed tag are the safety controls.
- `NPM_TOKEN` is referenced via `secrets.*`, never echoed. Don't widen scope: no secrets/protection (M4-E3), no tag/publish (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch; `.github/workflows/` exists. — **On branch ✓; dir exists (M4-E1).**

- [x] 1.0 Author `.github/workflows/release.yml`
  - [x] 1.1 Trigger tags only `push.tags: ['v*']`. — **Done.**
  - [x] 1.2 `permissions: { contents: read, id-token: write }`. — **Done.**
  - [x] 1.3 Job `publish`: checkout → setup-node (node 20, registry-url) → corepack → install → build. — **Done.**
  - [x] 1.4 `npm publish --provenance --access public` + `NODE_AUTH_TOKEN: secrets.NPM_TOKEN`. — **Done.**
  - [x] 1.5 Commented M4-E3 (secret/OIDC) + M5-E3 (owner-approved) deps + Trusted-Publisher alternative. — **Done.**

- [x] 2.0 Validate the change
  - [x] 2.1 YAML parses. — **js-yaml OK; name Release, job publish.**
  - [x] 2.2 Content checks. — **trigger only `push.tags:['v*']`; id-token:write; contents:read; publish step `npm publish --provenance --access public`; NODE_AUTH_TOKEN←secrets.NPM_TOKEN ✓.**
  - [x] 2.3 **Safety check.** — **No `pull_request`, no `push.branches` → no publish path on non-tag events ✓.**
  - [x] 2.4 Diff scope. — **Only `.github/workflows/release.yml` added.**

- [x] 3.0 Record the change
  - [x] 3.1 Create/append `…/Milestone-04/Epic-02/CHANGELOG.md`. — **Done.**
  - [x] 3.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked.**
  - [x] 3.3 Commit; **no push/merge**. — **See commit below.**
