# Epic 1 — CI Workflow (M4-E1)

> **Parent milestone:** [Milestone 5 — CI/CD Pipeline (M4)](../../overview/milestone-05-cicd-pipeline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med (config; inert until merged) · **Estimated effort:** S (~1–2h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Add `.github/workflows/ci.yml` — a GitHub Actions quality gate that runs `install → build → lint → test` on every PR and push, across the supported Node range, using the package's real Yarn 4 toolchain. This makes green build/lint/test a merge requirement (enforced once branch protection lands in M4-E3).

## 3. Acceptance criteria

- [x] `.github/workflows/ci.yml` exists and is **valid YAML** (parses via js-yaml).
- [x] Triggers on `pull_request` and `push` to `main`.
- [x] Matrix: Node **18, 20, 22** on `ubuntu-latest`; enables **corepack** (Yarn 4).
- [x] Steps: `checkout@v4` → `setup-node@v4` → `corepack enable` → `yarn install` → `yarn build` → `yarn lint` → `yarn test`. *(Plain `yarn install` — no committed `yarn.lock`; cache omitted.)*
- [~] commitlint check — **deferred** (policy in `docs/VERSIONING.md`; can add a CI job later).
- [x] Workflow committed but **inert** (no run until merged); YAML validation passed.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Author `ci.yml` (triggers, matrix, corepack, real `yarn` scripts) | Eng | file present |
| 2 | Add Node version matrix matching `engines.node >=18` (18/20/22) | Eng | matrix set |
| 3 | Wire Yarn cache in `setup-node` (`cache: yarn`) | Eng | cache configured |
| 4 | (Optional) add a commitlint/conventional-commit check | Eng | check present or explicitly deferred to a follow-up |
| 5 | Validate the YAML (js-yaml/python parse) | Eng | parses cleanly |

## 5. Dependencies & owner gates

- **Upstream:** M2 (real `yarn` scripts + `engines`) — done.
- **Owner gates:** none for authoring; **enforcement** (required check) is M4-E3 (branch protection).
- **Downstream:** M4-E3 (branch protection references the CI check name), M5 (CI must be green to merge the release).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Corepack/Yarn 4 not enabled → install fails | `corepack enable` before install; pin via `packageManager`. |
| `yarn test` (Hardhat) needs solc/network | Hardhat downloads solc; ensure the job has network; cache where possible. |
| Matrix too broad/narrow vs `engines` | Match `>=18` → 18/20/22; drop EOL versions. |
| YAML invalid | Validate with a parser before commit (task 5). |

## 7. Notes

- Reversible: a single workflow file; `git rm`/revert.
- **Inert until merged** to `main` (release-only-`main`); the first real run is observed at M5.
- Stays untouched: source, `package.json`.
