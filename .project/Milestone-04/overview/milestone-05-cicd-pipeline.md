# Milestone 5 — CI/CD Pipeline (M4)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a*
> **Status:** 📋 Planned — ready for `/breakout-epics`
> **Prod/impact:** Medium · adds automation + the **real publish path**; the only milestone with **hard owner gates**
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-28
> **Branch:** integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`) — workflows are **inert until merged to `main`** (M5)
> **Epic breakouts:** [M4-E1 `e1-ci-workflow`](../Epic-01/overview/e1-ci-workflow.md) · [M4-E2 `e2-release-workflow`](../Epic-02/overview/e2-release-workflow.md) · [M4-E3 `e3-repo-secrets-and-protection`](../Epic-03/overview/e3-repo-secrets-and-protection.md)

---

## 1. Why this milestone exists

The package has **no CI** (the legacy `.travis.yml` was removed in M0) and **no automated release** — quality is unenforced and publishing would be manual and error-prone. M4 adds a **GitHub Actions quality gate** (build/lint/test on every PR/push) and a **tag-triggered, provenanced npm publish**, so the M5 `v1.2.0` cut is a push-a-tag operation rather than a hand process. The `.github/` dir already exists (M3-E2 templates); M4 adds `workflows/`.

It sits on the critical path **before M5** (the release uses the publish workflow) and is gated on **owner-only provisioning** (npm token, repo secrets, branch protection) that the agent cannot perform.

## 2. Goal & exit criteria

**Goal:** A CI workflow that gates merges on green build/lint/test across the supported Node range, and a release workflow that publishes to npm with provenance when a `vX.Y.Z` tag is pushed — backed by the owner-provisioned secrets/protection.

**Exit criteria:**

- [ ] `.github/workflows/ci.yml` runs `install → build → lint → test` on PR + push, across a Node matrix (18/20/22) using Yarn 4 (corepack); YAML valid.
- [ ] `.github/workflows/release.yml` triggers on `v*` tags only, builds, and runs `npm publish --provenance --access public` with `id-token: write` + `NPM_TOKEN`; YAML valid.
- [ ] **Owner (M4-E3):** npm automation token (or npm Trusted Publisher/OIDC) configured; `NPM_TOKEN` repo secret set; branch protection on `main` requires CI; Actions permitted to write `id-token` (provenance). **Blocking for a live publish.**
- [ ] Workflows are committed (inert on the branch); a dry-run/local validation passes; nothing merged to `main` yet.

## 3. Scope

**In scope:**
- `.github/workflows/ci.yml` (quality gate).
- `.github/workflows/release.yml` (tag-triggered provenance publish).
- Optional: a lightweight commitlint/conventional-commit check in CI.
- Owner provisioning of secrets + branch protection (M4-E3) — **tracked, owner-executed**.

**Out of scope (deferred):**
- The actual `v1.2.0` tag/publish → **M5** (M4 builds the mechanism; M5 uses it).
- Devcontainer image builds, SLSA/Sigstore beyond npm provenance → future hardening.
- Multi-registry / GitHub Packages mirroring.
- Changesets/auto-version tooling — the runbook (M5) drives the bump manually per `docs/VERSIONING.md`.

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** | Author + validate `ci.yml` and `release.yml` (YAML, logic, guards). Cannot provision secrets or push workflows live. |
| **Owner** | **OP-1 (blocking, M4-E3):** create npm **automation** token (or configure npm Trusted Publisher/OIDC for the repo); add `NPM_TOKEN` as a repo secret; enable **branch protection** on `main` requiring the CI check; ensure Actions has `id-token: write` permission for provenance. None of this can be done by the agent. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M4-E1 | `ci-workflow` | Eng | Med | [e1-ci-workflow](../Epic-01/overview/e1-ci-workflow.md) |
| M4-E2 | `release-workflow` | Eng | Med | [e2-release-workflow](../Epic-02/overview/e2-release-workflow.md) |
| M4-E3 | `repo-secrets-and-protection` | **Owner** | High (blocking) | [e3-repo-secrets-and-protection](../Epic-03/overview/e3-repo-secrets-and-protection.md) |

### M4-E1 — `ci-workflow`
`.github/workflows/ci.yml`: on `pull_request` + `push`, a matrix job (Node 18/20/22, ubuntu-latest) that enables corepack/Yarn 4, `yarn install --immutable`, `yarn build`, `yarn lint`, `yarn test`. Optionally a separate `commitlint`/conventional-commit check. Acceptance: YAML parses; steps map to the package's real scripts; matrix matches `engines.node >=18`.

### M4-E2 — `release-workflow`
`.github/workflows/release.yml`: on `push` of tags matching `v*`, a single job with `permissions: { contents: read, id-token: write }`, corepack/Yarn install + `yarn build`, then **`npm publish --provenance --access public`** with `NODE_AUTH_TOKEN` from `secrets.NPM_TOKEN`. (npm's `--provenance`+OIDC is the well-supported path; `prepack: tsc --build --force` guarantees a clean `dist`.) Guard so it only runs on tags. Acceptance: YAML parses; tag-only trigger; provenance permission + token wired; dry-run reasoning documented (real publish is M5).

### M4-E3 — `repo-secrets-and-protection` *(OWNER-ONLY, blocking)*
Owner provisions: an npm **automation** access token for `@diamondslab` (or sets up npm **Trusted Publisher**/OIDC for the repo, preferred — no long-lived token); adds it as the `NPM_TOKEN` repo secret; enables **branch protection** on `main` requiring the CI status check (and review); confirms repo Actions settings allow `id-token: write`. Acceptance: secret present; branch protection active; a test workflow run can mint an OIDC token. **The agent prepares everything up to this gate and stops.**

## 6. Dependencies & sequencing

- **Upstream:** M2 (publish-ready `package.json` — `publishConfig.access`, `engines`, `prepack`) — done; M3 (docs) — done.
- **Internal order:** E1 ∥ E2 (independent workflow files); **E3 (owner) gates the live publish** and must be done before M5-E3. E1/E2 can be authored without E3.
- **Owner gates:** **OP-1 (M4-E3)** — the project's primary blocking owner work.
- **Downstream:** M5 (the `v1.2.0` cut pushes a `vX.Y.Z` tag → release.yml publishes; the runbook references both workflows).

## 7. Rollback posture

Workflow files are config on the integration branch; **inert until merged** (no Action runs on an unmerged branch). Rollback = `git rm` the workflow files / `git revert`. Owner-provisioned secrets/protection (M4-E3) are reversible in GitHub settings (revoke token, remove secret, relax protection). No publish happens without a pushed tag (M5).

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| `release.yml` publishes unintentionally | Tag-only trigger (`on: push: tags: ['v*']`); no publish step on PR/branch; real publish deferred to M5 with a human pushing the tag. |
| Provenance misconfigured (missing `id-token: write`) | Set permissions explicitly; document the requirement for M4-E3; verify in a dry-run. |
| CI matrix/yarn setup doesn't match the package | Mirror the real scripts (`yarn build/lint/test`) + `packageManager` (corepack); validate YAML; the first real run is observed at M5. |
| Owner provisioning (M4-E3) blocks release | Surface OP-1 early and explicitly; E1/E2 proceed independently; M5 cannot publish until E3 is done. |
| Workflow can't be pushed (token lacks `workflow` scope) | N/A locally (release-only-`main`); the owner pushes/merges at M5 with appropriate rights. |

## 9. Definition of Done for Milestone 5 (M4)

- [ ] `ci.yml` + `release.yml` authored, YAML-valid, and committed (inert) on the integration branch.
- [ ] Workflow logic matches the real scripts/`engines`; release is tag-only + provenanced.
- [ ] **Owner (M4-E3):** secrets + branch protection provisioned (or explicitly tracked as the open blocking item before M5-E3).
- [ ] Gates green; nothing merged to `main`.

➡️ **Next:** run **`/df3ndr:breakout-epics`** on M4 to expand E1/E2/E3.
