# Change Plan (PRD) — CI Workflow (M4-E1)

> **Epic overview:** [`overview/e1-ci-workflow.md`](overview/e1-ci-workflow.md)
> **Parent milestone:** [Milestone 5 — CI/CD Pipeline (M4)](../overview/milestone-05-cicd-pipeline.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The package has **no CI** (legacy `.travis.yml` removed in M0). Nothing enforces that `build`/`lint`/`test` stay green, and there's no automated gate for PRs. With a `v1.2.0` release approaching, an automated quality gate is needed.

**Goal:** Add `.github/workflows/ci.yml` that runs `install → build → lint → test` on PRs and `main` pushes, across the supported Node range, using the real Yarn 4 toolchain — **inert until merged** to `main` (M5).

## 2. Goals

1. A valid `.github/workflows/ci.yml` exists.
2. It runs on `pull_request` and `push` to `main`, with a Node 18/20/22 matrix on `ubuntu-latest`.
3. Each job runs the package's real scripts: `yarn install` → `yarn build` → `yarn lint` → `yarn test` (Yarn 4 via corepack).
4. YAML is valid (parses); the workflow stays inert on the branch (no run until merged).

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `.github/workflows/ci.yml` | **Create** — the only file added |
| `yarn.lock` | **Verify** — needed for `--immutable` + `setup-node` yarn cache; commit if absent (see Open Questions) |

`.github/` already exists (M3-E2). No `src/`/`package.json` change.

## 4. Stakeholders & Impact

- **Contributors / maintainers:** PRs get an automated green/red signal; merges can be gated (once M4-E3 branch protection lands).
- **Downstream consumers:** indirectly benefit from enforced quality.
- **Runtime / production:** none — CI config; inert until merged.

## 5. Operational Requirements

1. `ci.yml` triggers: `pull_request` (all) and `push` to `main`; a `concurrency` group cancels superseded runs.
2. Job matrix: `node-version: [18, 20, 22]` on `ubuntu-latest`.
3. Steps: `actions/checkout@v4` → `actions/setup-node@v4` (`node-version` from matrix; `cache: yarn` if a lockfile is present) → `corepack enable` → `yarn install --immutable` → `yarn build` → `yarn lint` → `yarn test`.
4. The job name / check must be stable (e.g. `test (18)`…) so M4-E3 branch protection can require it.
5. `yarn install --immutable` requires a committed `yarn.lock`; if none exists, either commit one or use plain `yarn install` (decided at execution — see Open Questions).
6. The YAML must parse cleanly (validate with `js-yaml`/python before commit).
7. Committed on the integration branch; **not** merged to `main` (inert).

## 6. Security & Compliance Considerations

- **No secrets** in CI (build/lint/test only — the publish secret is M4-E2/E3).
- `permissions` should be minimal (default `contents: read`); no write permissions needed for the test workflow.
- Pin actions to major versions (`@v4`); no third-party actions beyond official `actions/*`.

## 7. Non-Goals (Out of Scope)

- The release/publish workflow → **M4-E2**.
- Secrets, branch protection → **M4-E3** (owner).
- Coverage upload / external services (Codecov, etc.) → optional future hardening.
- commitlint/conventional-commit enforcement → deferred (note as a follow-up; `docs/VERSIONING.md` documents the policy).
- Merging the workflow live → **M5**.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — single additive workflow file on the integration branch; inert until merged.
- **Rollback:** `git rm .github/workflows/ci.yml` / revert. Fully reversible; nothing runs until merged.

| Risk | Mitigation |
|------|------------|
| Corepack/Yarn 4 not enabled → install fails on the runner | `corepack enable` before install; `packageManager` pins 4.10.3. |
| `--immutable` fails (no committed `yarn.lock`) | Verify lockfile; commit it or drop `--immutable` (Req 5 / Open Questions). |
| `yarn test` (Hardhat) needs solc download/network | ubuntu-latest has network; Hardhat fetches solc; acceptable. |
| YAML invalid → workflow ignored | Validate with a parser before commit (Req 6). |

## 9. Validation / Success Metrics

- `test -f .github/workflows/ci.yml`; `js-yaml`/python parses it without error.
- The workflow declares `on: [pull_request, push(main)]`, the 18/20/22 matrix, and the `yarn build/lint/test` steps.
- `git diff --stat` shows only the new workflow file (+ a `yarn.lock` if committed) + record docs.
- (Deferred to M5) the first real run on `main` is green — observed after merge, not now.

## 10. Open Questions

- **`yarn.lock`:** does the submodule commit one? If yes → `--immutable` + `cache: yarn`. If no → commit a lockfile (preferred, for reproducible CI) or use plain `yarn install`. Decide at execution.
- **commitlint in CI:** deferred; could add a `commitlint` job later (policy already in `docs/VERSIONING.md`).
