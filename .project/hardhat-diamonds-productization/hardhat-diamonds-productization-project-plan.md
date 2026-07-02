# `@diamondslab/hardhat-diamonds` — Productization & Release Project Plan

> **Status:** 📋 Plan of record — *for owner/maintainer approval*
> **Author:** Am0rfu5 (DiamondsLab)
> **Date:** 2026-06-27
> **Package:** `@diamondslab/hardhat-diamonds` — current `v1.1.15` (HEAD is +2 commits, untagged)
> **Target release:** `v1.2.0` (minor) — **corrected rationale (M1-E2):** `LoadDiamondArtifact`/`loadDiamondContract` actually shipped *in* `v1.1.15`; the minor bump is justified by the forthcoming **M2 `exports` map** (new supported entry points) + the **M2-E4 `signer` public type change**. Post-`v1.1.15` code changes alone are fix-level; **final number decided at M5.**
> **Companion architecture doc:** *none at this scope.* Chosen scope is **code & packaging hardening**, not full API stabilization, so a formal API-surface/architecture doc is **deferred** to a future `v2` stabilization effort (see M2-E2 note).

**Governing constraint:** This is a **published npm package** consumed both downstream (public registry) and inside this monorepo via `workspace:*`. Every change must keep the package **buildable, type-resolvable, and publishable**, and must **not break the consuming monorepo**. Reversible-first; the actual npm publish and any GitHub repo-settings/secret changes are **owner-gated**.

---

## 1. How to read this plan

This plan is the **front of the planning pipeline**. It decomposes the work into **milestones** (independently-valuable, releasable deliverables that each leave the package in a working state) and **epics** (coherent bodies of work tracked as a unit). Later commands expand it:

```
/create-project-plan → /breakout-milestone → /breakout-epics → /create-prd → /generate-tasks → /process-task-list
   (this doc)              (per milestone)        (per epic)       (per epic)      (per epic)        (execution)
```

**Naming & ID conventions** (stable handles every later command keys off):

- **Milestones:** `M0`…`M5` (zero-indexed; `M0` is foundations/groundwork).
- **Epics:** `M<n>-E<m>` (e.g. `M2-E1`).
- **Slugs:** short kebab-case (e.g. `repo-hygiene-baseline`).

**Roles referenced throughout:**

- **Eng** — engineering work executable by the agent/contributor (files, code, config, docs, workflows-as-code).
- **Owner** — the maintainer (Am0rfu5 / DiamondsLab) for **privileged, outside-the-agent** actions: npm publish credentials, GitHub repo settings/secrets/branch protection, approving the live publish, and confirming the legal entity name on the LICENSE. These are **blocking owner tasks**, never silently deferred.

---

## 2. Objectives & success criteria

| # | Objective | Measurable definition of done |
|---|-----------|-------------------------------|
| O1 | **Legal clarity** | A root `LICENSE` (MIT) exists, matches `package.json: "license": "MIT"`, names the DiamondsLab copyright holder, and is included in the published tarball. |
| O2 | **Traceable history** | `CHANGELOG.md` in *Keep a Changelog* format covers `v1.0.x → v1.1.15` and an `Unreleased`/`1.2.0` section; SemVer + Conventional Commits adopted going forward. |
| O3 | **Accurate documentation** | README contains **zero** wrong package names, badges, peer-dep names, or org links; install/usage snippets work verbatim against `v1.2.0`; Prerequisites/Project-Structure sections reflect reality. |
| O4 | **Clean, correct packaging** | `yarn pack` produces a tarball containing exactly the intended files (dist, README, LICENSE, docs); `package.json` has correct `author`, `engines`, `publishConfig`, `repository`, and a verified `exports` map; legacy `.travis.yml`/`tslint.json` and duplicate eslint config removed. |
| O5 | **Automated quality gate & release** | `.github/workflows` runs test/lint/build on every PR and **auto-publishes to npm with provenance** on a `vX.Y.Z` tag; a green pipeline is required to merge. |
| O6 | **Repeatable release** | A `notes/` **release runbook** exists; it has been **dry-run rehearsed** end-to-end; following it cuts a release with rollback/deprecation procedures documented. |
| O7 | **Shipped release** | `v1.2.0` published to npm under `@diamondslab/hardhat-diamonds`, installable in a clean project, and the consuming monorepo builds green against it. |

**Overarching acceptance gate:** `v1.2.0` is live on npm via the automated pipeline, the published tarball is clean and complete, the README install path works verbatim, and the monorepo root still builds and tests green against the new release.

---

## 3. Guiding execution principles

Pulled from `CLAUDE.md` and standard release hygiene:

1. **Keep it publishable at every step.** No milestone may leave `yarn build` / `yarn pack` broken. Packaging changes are validated with a dry-run pack before merge.
2. **Don't break the consumer.** The monorepo root consumes this package via `workspace:*`. After packaging/metadata/`exports` changes, verify the root still builds (`yarn workspace:build`, `yarn compile`).
3. **Reversible-first ordering.** Hygiene, docs, and metadata (easy to revert) land before CI and the irreversible npm publish.
4. **Owner-gate the irreversible.** npm publish, registry tokens, repo secrets, and branch protection are **Owner** tasks; the agent prepares everything up to the gate and stops.
5. **`yarn`, not `npm`.** All scripts, lifecycle hooks, and the runbook use Yarn 4 (`packageManager: yarn@4.10.3`). The existing `prepublishOnly: "npm run build"` is corrected as part of M2.
6. **Conventional Commits + SemVer.** Adopted from this project forward so the CHANGELOG and version bumps are mechanical and the release workflow can reason about them.
7. **One canonical identity.** Everything points to **DiamondsLab** / `@diamondslab`; GeniusVentures/subaskar-s references are removed or demoted to upstream-mirror notes.
8. **No secrets in artifacts.** Re-audit the published tarball and repo for tokens/keys before the first automated publish.
9. **`main` is release-only.** (Owner direction, 2026-06-27.) Do **not** push/PR/merge productization work to `main` until the project is ready for a full `v1.2.0` release. Work accumulates on a release branch; merging to `main` is a deliberate release-time step in M5, not an end-of-epic action.
10. **Branch & release strategy (updated 2026-06-29).** The productization work now lives on **`release/v1.2.0`** (cut from the prior `chore/m0-repo-hygiene-baseline`, off `main`). CI (`ci.yml`) triggers on `release/**`; the cut merges `release/v1.2.0` → **`main`** → tag `v1.2.0` → publish. **⚠️ `develop` divergence:** the remote `develop` branch (active GitFlow line) independently has a **failing/incomplete** CI/CD suite (`ci/coverage/test/release.yml`), its own `CHANGELOG`/`README`, the **`chalk@4` fix** (now adopted here), and flatten/discovery feature epics. Per owner direction we **complete + release v1.2.0 off `main` first**, then **reconcile `develop`** (fix its CI, fold in our additive deltas + its features) as a **post-v1.2.0 follow-up** — we do **not** merge to `develop` during this project.

---

## 4. Milestone map (at a glance)

| Milestone | Title | Outcome | Impact / Risk |
|-----------|-------|---------|---------------|
| **M0** | `repo-hygiene-baseline` | Legacy cruft removed, gitignore corrected (incl. un-ignoring `notes/` & `.project/`), public-API + pack baseline captured | Low risk · unblocks everything |
| **M1** | `licensing-changelog` | `LICENSE` + `CHANGELOG.md` + SemVer/Conventional-Commits policy | Low risk · high trust value |
| **M2** | `packaging-metadata` | `package.json` correctness, `exports` map, clean verified tarball, yarn lifecycle | Med risk · touches publish surface |
| **M3** | `docs-readme-audit` | README + supporting docs corrected to DiamondsLab/`@diamondslab` reality | Low risk · outward-facing |
| **M4** | `cicd-pipeline` | GitHub Actions CI + tag-triggered provenance publish; repo secrets/branch protection | Med risk · owner-gated secrets |
| **M5** | `release-runbook-cut` | Release runbook in `notes/`, rehearsed dry-run, **`v1.2.0` cut & verified** | High risk · irreversible publish |

**Critical path:** `M0 → M2 → M4 → M5`. `M1` and `M3` are docs/legal and run **in parallel** off `M0`. `M5` is last (it consumes the runbook, the verified package, and the publish workflow).

```
                 ┌──────────────┐
                 │ M0 hygiene   │
                 │  + baseline  │
                 └──────┬───────┘
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
 ┌────────────┐  ┌──────────────┐  ┌────────────┐
 │ M1 license │  │ M2 packaging │  │ M3 README  │
 │ + changelog│  │  + metadata  │  │  + docs    │
 └─────┬──────┘  └──────┬───────┘  └─────┬──────┘
       │                ▼                │
       │         ┌──────────────┐        │
       └────────▶│ M4 CI/CD     │◀───────┘
                 │ (owner gate) │
                 └──────┬───────┘
                        ▼
                 ┌──────────────┐
                 │ M5 runbook   │
                 │ + cut v1.2.0 │  ◀── owner-gated publish
                 └──────────────┘
```

---

## 5. Milestones & epics

### M0 — `repo-hygiene-baseline`

**Goal:** Remove release-blocking cruft, correct `.gitignore`, and capture a baseline so later changes are measurable.

**Exit criteria:** `git status` is clean and intentional; `notes/` and `.project/` are tracked (no longer gitignored); legacy `.travis.yml`/`tslint.json` removed; eslint config de-duplicated; a written baseline of the public API surface, current `yarn pack` contents, version/tag state, and test/coverage numbers exists.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M0-E1 | `gitignore-and-cruft` | Un-ignore `notes/` and `.project/` (remove the `notes` line); ensure `coverage.json`, `package.tgz`, `test-output/`, `.nyc_output/` are ignored & untracked; delete legacy `.travis.yml` and `tslint.json`; consolidate the duplicate eslint config (`.eslintrc.json` vs `eslint.config.mjs`) to **one** — first verify which eslint `^8.57` actually resolves (flat config needs eslint 9 or `ESLINT_USE_FLAT_CONFIG`); a full eslint-9/flat migration may defer to M2. | Eng | Low |
| M0-E2 | `release-baseline-inventory` | Record current public exports (`index.ts`, `lib/`, `utils`), `yarn pack --dry-run` file list, tag-vs-HEAD state (`v1.1.15` +2), and test/coverage baseline into `.project/`. | Eng | Low |
| M0-E3 | `prettier-formatting-pass` | ✅ **DONE (2026-06-27).** Ran `yarn lint:fix`; reformatted 6 `src/` files; `yarn lint` now exits 0 (was 225 errors), build + tests unchanged. See [Epic-03 overview](../Milestone-00/Epic-03/overview/e3-prettier-formatting-pass.md). | Eng | Low |

### M1 — `licensing-changelog`

**Goal:** Establish legal and historical record-keeping.

**Exit criteria:** `LICENSE` present and shipped in the tarball; `CHANGELOG.md` backfilled and forward-ready; commit/version policy documented.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M1-E1 | `license-mit` | Add root `LICENSE` (MIT), copyright **DiamondsLab** (year 2025–2026). **Owner confirms exact legal entity name.** Ensure listed in `package.json: files`. | Eng + Owner (confirm) | Low |
| M1-E2 | `changelog-backfill` | Create `CHANGELOG.md` (Keep a Changelog). Backfill from tags `v1.0.11 → v1.1.15`; add `[Unreleased]`/`[1.2.0]` documenting `LoadDiamondArtifact` (`loadDiamondContract`), circular-dep fix, peer-dep export, and the **M2-E4 `signer` type widening** (`SignerWithAddress` → `Signer`). | Eng | Low |
| M1-E3 | `versioning-policy` | Document SemVer + Conventional Commits adoption (short `CONTRIBUTING`-level policy); optional commitlint wiring noted for M4. | Eng | Low |

### M2 — `packaging-metadata`

**Goal:** Make `package.json` correct and the published artifact clean, with formalized entry points — without breaking existing `/dist/utils` and `/dist/lib` consumers.

**Exit criteria:** `package.json` metadata correct; `exports` map verified for `.`, `./utils`, `./lib` (with back-compat for raw `/dist/*`); `yarn pack` tarball audited (intended files only, includes LICENSE); yarn-based lifecycle hooks; monorepo root still builds.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M2-E1 | `package-json-metadata` | Replace non-standard `authors` with `author`; add `engines` (node/yarn); add `publishConfig` (`access: public`, provenance); convert `repository` to object form with correct **DiamondsLab** casing; verify `bugs`/`homepage`; fix `prepublishOnly` to use yarn (or `prepack`). | Eng | Med |
| M2-E2 | `exports-entrypoints` | Add an `exports` map formalizing `.`, `./utils`, `./lib` (README documents `@diamondslab/hardhat-diamonds/dist/utils`). Preserve raw `./dist/*` subpaths for back-compat to avoid a breaking change; verify types resolve under `NodeNext`. *(Full public-API redesign deferred to v2.)* | Eng | Med |
| M2-E3 | `tarball-verification` | Reconcile `.npmignore` vs `files` whitelist (pick one strategy); `yarn pack` and audit contents include dist + README + LICENSE + docs and exclude tests/source/cruft; install the tarball into a throwaway consumer to confirm it works. | Eng | Med |
| M2-E4 | `fix-tsc-build` | ✅ **DONE (pulled forward, 2026-06-27).** Fixed `LocalDiamondDeployer.ts` TS2740 by widening `signer` to ethers `Signer`; `yarn build` exits 0, tests unchanged (120 passing). See [Epic-04 overview](../Milestone-02/Epic-04/overview/e4-fix-tsc-build.md). Minor public type change → fold into M2-E2. | Eng | High |

### M3 — `docs-readme-audit`

**Goal:** Bring all outward-facing docs to DiamondsLab/`@diamondslab` reality.

**Exit criteria:** README has zero incorrect names/links/badges; install & usage snippets work verbatim; supporting community docs present.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M3-E1 | `readme-correctness` | Fix install to `@diamondslab/hardhat-diamonds` + `@diamondslab/diamonds`; fix badges (scoped npm, DiamondsLab); correct peer-dep names; replace all `GeniusVentures` links with DiamondsLab; update Prerequisites (Node/TS/Hardhat actuals), "Project Structure", and "Dev Dependencies" sections; document `exports` subpaths. | Eng | Low |
| M3-E2 | `community-docs` | Add `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and issue/PR templates under `.github/`; reconcile `docs/TESTING*.md` references with README. | Eng | Low |

### M4 — `cicd-pipeline`

**Goal:** Continuous quality gate plus automated, provenanced publishing on tag.

**Exit criteria:** PRs run test/lint/build green; pushing a `vX.Y.Z` tag publishes to npm with provenance; required repo secrets/branch-protection configured by Owner.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M4-E1 | `ci-workflow` | `.github/workflows/ci.yml`: Yarn 4 install, build, lint, `hardhat test` (+ coverage) on PR/push; Node matrix per `engines`. Optional commitlint check. | Eng | Med |
| M4-E2 | `release-workflow` | `.github/workflows/release.yml`: on `v*` tag, build + **`npm publish --provenance --access public`** (npm's provenance+OIDC path) with `id-token: write` + `NPM_TOKEN`; guard so only tags publish. | Eng | Med |
| M4-E3 | `repo-secrets-and-protection` | **Owner-only:** create npm **automation** token, add as repo secret (or configure npm OIDC trusted publisher); enable branch protection requiring CI; confirm Actions permissions for provenance. | **Owner** | High (blocking) |

### M5 — `release-runbook-cut`

**Goal:** Document the release process, rehearse it, then ship `v1.2.0`.

**Exit criteria:** `notes/RELEASE_RUNBOOK.md` complete; a full dry-run rehearsal passes; `v1.2.0` is live on npm, installable clean, and the monorepo builds against it.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M5-E1 | `release-runbook` | Author `notes/RELEASE_RUNBOOK.md`: preflight checklist, version bump, changelog finalize, build, `yarn pack` audit, tag & push, pipeline verification, npm verification, **rollback/deprecate** (`yarn npm deprecate` / dist-tag), and post-release monorepo verification. | Eng | Med |
| M5-E2 | `release-dry-run` | Rehearse the runbook end-to-end: `yarn npm publish --dry-run`, verify CI on a release branch, confirm the consuming monorepo builds against a packed prerelease. | Eng | Med |
| M5-E3 | `cut-v1.2.0` | Finalize changelog, bump to `1.2.0`, tag `v1.2.0`, **Owner approves/triggers publish**, verify on npm, update/verify monorepo consumers. | Eng + **Owner** (publish gate) | High (irreversible) |

---

## 6. Cross-cutting workstreams

These run through every milestone:

- **Changelog upkeep** — every user-facing change updates `[Unreleased]` (M1 onward).
- **Consumer-green guarantee** — after any packaging/metadata/`exports` change, build the monorepo root (`yarn workspace:build`, `yarn compile`) to catch breakage early.
- **Secret/artifact hygiene** — re-scan repo and tarball for keys/tokens before the first automated publish (ties into the monorepo security tooling).
- **Owner approvals & credentials** — npm token, repo secrets, branch protection, LICENSE entity name, and the live publish are tracked as explicit Owner gates, not assumptions.

---

## 7. Dependencies & sequencing rules

1. **M0 precedes all** — hygiene/baseline must land first (un-ignoring `notes/`/`.project/` is required for later artifacts to be tracked).
2. **M1 ∥ M3** — licensing/changelog and README/docs can proceed in parallel after M0.
3. **M2 precedes M4** — CI/release needs correct metadata, `engines`, and a verified tarball.
4. **M2 precedes M5** — a release can't be cut on an unverified package.
5. **M4 precedes M5-E3** — the automated publish workflow is the mechanism the release cut uses; **M4-E3 (Owner secrets) must be done before M5-E3**.
6. **M5 is terminal** — it consumes the runbook (M5-E1), the dry-run (M5-E2), and the live pipeline.

---

## 8. Risk register (plan-level)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| ~~`tsc` build broken at baseline (`LocalDiamondDeployer.ts` TS2740)~~ — **RESOLVED 2026-06-27 via M2-E4** (widened `signer` to `Signer`; build green, no test regression) | ~~Certain~~ → Resolved | High | Fixed on the integration branch; CI build gate (M4) will prevent regression before publish | Eng |
| `exports` map breaks existing `/dist/utils` / `/dist/lib` imports (incl. this monorepo & README guidance) | Med | High | Preserve raw `./dist/*` subpaths for back-compat; build monorepo root after change; install-test a consumer (M2-E3) | Eng |
| npm publish misconfigured (wrong access/scope, missing provenance, publishes secrets) | Med | High | Dry-run pack + `--dry-run` publish; tarball content audit; provenance via OIDC; secret scan before first publish | Eng + Owner |
| Owner credential/secret tasks (M4-E3) block the release | Med | High | Surface as explicit blocking owner tasks early; M1–M3 proceed independently while pending | Owner |
| Version/tag drift (HEAD +2 over `v1.1.15`; historically messy `release:` commits) | Med | Med | Reconcile in M0-E2; SemVer/Conventional Commits + runbook make bumps mechanical | Eng |
| README/`exports`/metadata fixes drift out of sync with code | Low | Med | Single canonical-identity pass (DiamondsLab); CI lint gate; docs verified against `v1.2.0` snippets | Eng |
| Wrong/ambiguous copyright entity on LICENSE | Low | Med | Owner confirms legal entity name before M1-E1 merges | Owner |

---

## 9. Rollback posture per milestone

| Milestone | Primary rollback lever |
|-----------|------------------------|
| M0 | `git revert` the hygiene commits; gitignore/cruft changes are pure git history. |
| M1 | Revert the LICENSE/CHANGELOG additions; no runtime impact. |
| M2 | Revert `package.json`/`exports` changes; nothing published yet, so no consumer impact. Build monorepo to confirm restoration. |
| M3 | Revert doc commits; outward-facing only, no runtime impact. |
| M4 | Disable/delete the workflow files; remove repo secret. No publish occurs without a tag. |
| M5 | **Pre-publish:** delete tag, abort. **Post-publish (irreversible):** npm disallows re-publishing a version — recover forward with a patch (`1.2.1`) and `yarn npm deprecate` / dist-tag the bad version. The runbook documents this explicitly. |

---

## 10. Deliverables checklist (project-level)

- [ ] `.gitignore` corrected; `notes/` & `.project/` tracked; legacy `.travis.yml`/`tslint.json` and duplicate eslint config removed (M0)
- [ ] Baseline inventory (API surface, pack contents, tag state, coverage) recorded in `.project/` (M0)
- [ ] `LICENSE` (MIT, DiamondsLab) present and shipped (M1)
- [ ] `CHANGELOG.md` (Keep a Changelog) backfilled + `1.2.0` section (M1)
- [ ] SemVer + Conventional Commits policy documented (M1)
- [ ] `package.json`: `author`, `engines`, `publishConfig`, `repository`, yarn lifecycle corrected (M2)
- [ ] `exports` map verified with back-compat; monorepo builds green (M2)
- [ ] `yarn pack` tarball audited + install-tested (M2)
- [ ] README corrected (names, badges, peer deps, DiamondsLab links, prerequisites, structure) (M3)
- [ ] `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates (M3)
- [ ] `.github/workflows/ci.yml` (test/lint/build) (M4)
- [ ] `.github/workflows/release.yml` (tag-triggered provenance publish) (M4)
- [ ] **Owner:** npm token/OIDC, repo secrets, branch protection configured (M4)
- [ ] `notes/RELEASE_RUNBOOK.md` complete with rollback/deprecation (M5)
- [ ] Dry-run rehearsal passed (M5)
- [ ] **`v1.2.0` published, install-verified, monorepo green** (M5)

---

## 11. Next step — breaking this out

This plan lives at the root of the per-project directory `packages/hardhat-diamonds/.project/`. Later commands fill in the tree (directory `Milestone-NN` is zero-padded to the `M<n>` id; the milestone **overview filename/title** uses the 1-based human number — `M0` → `Milestone-00/overview/milestone-01-…`):

```
packages/hardhat-diamonds/.project/
├── hardhat-diamonds-productization-project-plan.md   ← THIS document (plan of record)
├── Milestone-00/                                     ← M0
│   ├── overview/
│   │   └── milestone-01-repo-hygiene-baseline.md     ← /breakout-milestone
│   ├── Epic-01/                                      ← M0-E1
│   │   ├── overview/
│   │   │   └── e1-gitignore-and-cruft.md             ← /breakout-epics → input to /create-prd
│   │   ├── prd-e1-gitignore-and-cruft.md             ← /create-prd
│   │   ├── tasks-e1-gitignore-and-cruft.md           ← /generate-tasks
│   │   └── CHANGELOG.md                              ← running epic change log
│   └── Epic-02/ …                                    ← M0-E2
├── Milestone-01/ …                                   ← M1 (licensing-changelog)
├── Milestone-02/ …                                   ← M2 (packaging-metadata)
├── Milestone-03/ …                                   ← M3 (docs-readme-audit)
├── Milestone-04/ …                                   ← M4 (cicd-pipeline)
└── Milestone-05/ …                                   ← M5 (release-runbook-cut)
```

**Recommended order to break out:** start with **M0** (`repo-hygiene-baseline`) — it unblocks everything and is fully reversible. M1 and M3 can be broken out in parallel.

➡️ **Next:** run **`/df3ndr:breakout-milestone`** on **M0** to produce its milestone overview, then `/df3ndr:breakout-epics` for its epics.

> **Note on the runbook deliverable:** the release runbook you requested in `packages/hardhat-diamonds/notes/` is **M5-E1** (`notes/RELEASE_RUNBOOK.md`). It is intentionally sequenced last because a trustworthy runbook must describe the *finished* packaging + CI pipeline, and it is rehearsed (M5-E2) before the real `v1.2.0` cut (M5-E3).
