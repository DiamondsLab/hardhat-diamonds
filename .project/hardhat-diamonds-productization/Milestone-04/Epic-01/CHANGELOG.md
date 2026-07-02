# Changelog — M4-E1 CI Workflow

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M4-E1 — Add CI workflow (2026-06-28)

- Added `.github/workflows/ci.yml`: runs on `pull_request` + `push` to `main`; matrix Node 18/20/22 on ubuntu-latest; corepack (Yarn 4) → `yarn install` → `yarn build` → `yarn lint` → `yarn test`. Minimal `contents: read` permission; `concurrency` cancel-in-progress.
- **Finding:** the submodule has no committed `yarn.lock` (developed in the monorepo workspace), so CI uses a plain `yarn install` (no `--immutable`, no `cache: yarn`).
- **Validated:** YAML parses (js-yaml); triggers/matrix/steps confirmed; only the workflow file added.
- ✅ **M4-E1 complete (local).** Workflow is **inert until merged** to `main` (M5). M4-E3 (owner) will require this CI check in branch protection.

**Follow-up:** commit a standalone `yarn.lock` for reproducible CI (then switch to `yarn install --immutable` + `cache: yarn`). Can't be generated safely in-place (yarn resolves against the monorepo workspace).
