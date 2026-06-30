# Milestone 1 — Repository Hygiene & Baseline (M0)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M0](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a (no companion architecture doc at this scope)*
> **Status:** 📋 Planned — ready for `/breakout-epics`
> **Prod/impact:** Low risk · fully `git`-reversible · **unblocks every other milestone**
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-27
> **Epic breakouts:** [M0-E1 `e1-gitignore-and-cruft`](../Epic-01/overview/e1-gitignore-and-cruft.md) · [M0-E2 `e2-release-baseline-inventory`](../Epic-02/overview/e2-release-baseline-inventory.md) *(links resolve once `/breakout-epics` runs)*

---

## 1. Why this milestone exists

Before anything can be productized, the repository must be **clean, honest, and measured**:

- The requested release **runbook location (`notes/`) is currently gitignored** — so are scratch files. Until `.gitignore` is corrected, the M5 runbook and this `.project/` planning tree can't be tracked.
- The repo carries **legacy CI/lint cruft** (`.travis.yml` targeting Node 8/10/11; `tslint.json` — TSLint was deprecated in 2019) and a **duplicate eslint config** (`.eslintrc.json` *and* `eslint.config.mjs`). These confuse contributors and CI and must be reconciled before the M4 pipeline is authored.
- Every later milestone (packaging, docs, CI, release) is **measured against a baseline** — the public-API surface, the `yarn pack` file list, the version/tag state, and the test/coverage numbers. Capturing that baseline now makes M2/M3/M5 changes provable rather than asserted.

This is the **first node on the critical path** (`M0 → M2 → M4 → M5`); M1 and M3 fan out from it. It is intentionally the smallest, most reversible milestone so the riskier work lands on a clean foundation.

---

## 2. Goal & exit criteria

**Goal:** Remove release-blocking cruft, correct `.gitignore` so planning/release artifacts are tracked, consolidate to a single working lint config, and record a measurable baseline of the package's current state.

**Exit criteria:**

- [ ] `.gitignore` no longer ignores `notes/` (the `# random notes` → `notes` line removed); `notes/` and `.project/` are tracked by git.
- [ ] Root cruft is ignored & untracked: `coverage.json`, `package.tgz` (via `*.tgz`), `test-output/`, `.nyc_output/`.
- [ ] Legacy `.travis.yml` and `tslint.json` deleted.
- [ ] Exactly **one** eslint config remains, and `yarn lint` runs green against it.
- [ ] `yarn build` (`tsc`) still succeeds after all removals.
- [ ] A committed **baseline inventory** doc exists under `.project/Milestone-00/` capturing: public-API surface, `yarn pack` file list, version/tag reconciliation, and test/coverage numbers.
- [ ] `git status` is clean and every tracked/untracked change is intentional (no secrets in newly-tracked `notes/`).

---

## 3. Scope

**In scope:**

- `.gitignore` corrections (un-ignore `notes/`/`.project/`; ignore root coverage/pack/test-output cruft).
- Deleting `.travis.yml` and `tslint.json`.
- Consolidating the duplicate eslint config to one that resolves and passes under eslint `^8.57`.
- Capturing the baseline inventory as a tracked document.
- Confirming `yarn build` + `yarn lint` still pass post-cleanup.

**Out of scope (deferred):**

- Authoring the new GitHub Actions CI/release workflows → **M4** (the deleted `.travis.yml` is *replaced* there, not here).
- Any `package.json` metadata, `exports`, `.npmignore`/`files`, or tarball-content changes → **M2**.
- A full **eslint 9 / flat-config migration** (upgrading the eslint major + dependency surface) → may fold into **M2** hardening; M0 only de-duplicates to a working config.
- LICENSE, CHANGELOG, README, runbook content → **M1/M3/M5**.

---

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** (agent/contributor) | All of M0 — gitignore edits, file deletions, eslint consolidation, baseline capture, verification. |
| **Owner** | None blocking. One light review: before `notes/` is first tracked, confirm no private/local scratch notes with secrets are swept into git (Eng flags candidates; Owner okays). |

There are **no blocking owner gates** in M0 — that's why it leads. (The owner gates live in M4-E3 and M5-E3.)

---

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M0-E1 | `gitignore-and-cruft` | Eng | Low | [e1-gitignore-and-cruft](../Epic-01/overview/e1-gitignore-and-cruft.md) |
| M0-E2 | `release-baseline-inventory` | Eng | Low | [e2-release-baseline-inventory](../Epic-02/overview/e2-release-baseline-inventory.md) |
| M0-E3 ✅ | `prettier-formatting-pass` *(added during M0-E1)* | Eng | Low | [e3-prettier-formatting-pass](../Epic-03/overview/e3-prettier-formatting-pass.md) |

> **Discovered during M0-E1 execution (2026-06-27) — both now RESOLVED:** `yarn lint` and `yarn build` were **both red at baseline** (225 `prettier/prettier` errors + a `tsc` TS2740 in `LocalDiamondDeployer.ts`); neither was caused by M0-E1. The lint failure spawned **M0-E3** (formatting pass) → ✅ lint green. The build failure spawned **M2-E4** (`fix-tsc-build`) → ✅ build green. Both fixed on the integration branch.
>
> ✅ **M0 milestone COMPLETE (2026-06-27):** all three epics done (E1 gitignore/cruft, E2 baseline, E3 formatting). `yarn lint` + `yarn build` + `yarn test` all green.

### M0-E1 — `gitignore-and-cruft`

Correct `.gitignore` and remove legacy tooling so the repo is honest and contributor-clean.

- **Tasks (running start):**
  - Remove the `notes` line (under `# random notes`) from `.gitignore`; verify `.project/` is not ignored by any pattern.
  - Add `coverage.json` to `.gitignore` (the existing `coverage` pattern matches the dir, not the root `coverage.json` file); confirm `*.tgz`, `.nyc_output`, and `test-output/` are covered.
  - `git rm --cached` any of those cruft paths that are currently tracked (baseline check: `package.tgz`/`coverage.json` appear untracked already — verify).
  - Delete `.travis.yml` and `tslint.json`.
  - **eslint consolidation:** determine which config eslint `^8.57.1` actually loads (default = `.eslintrc.json`; `eslint.config.mjs` flat config only activates under eslint 9 or `ESLINT_USE_FLAT_CONFIG=true`). Both currently reference `tsconfig.eslint.json`. Keep the one that resolves and passes `yarn lint`, delete the other. Recommended: keep the active config for M0; schedule the flat-config/eslint-9 migration for M2 if desired. If `eslint.config.mjs` is kept, confirm its `globals` dependency is installed.
  - Run `yarn lint` and `yarn build`; both must pass.
- **Acceptance shape:** `notes/` + `.project/` tracked; cruft ignored; `.travis.yml`/`tslint.json` gone; single eslint config; `yarn lint` + `yarn build` green; `git status` intentional.
- **Risks:** deleting the *active* eslint config silently breaks linting (mitigate by verifying resolution first); un-ignoring `notes/` could stage stale local scratch files or secrets (review the working tree before commit).

### M0-E2 — `release-baseline-inventory`

Record the package's current state so every later milestone is measured, not asserted.

- **Tasks (running start):**
  - **Public-API surface:** enumerate exports from `src/index.ts`, `src/lib/index.ts`, `src/tasks/index.ts`, `src/utils.ts`, and the documented subpaths `@diamondslab/hardhat-diamonds/dist/utils` and `/dist/lib`. This is the contract M2-E2's `exports` map must preserve.
  - **Pack contents:** run `yarn pack` (or dry-run) and record the exact file list that would ship — the baseline M2-E3 verifies against (note: LICENSE is currently *listed* in `files` but missing on disk).
  - **Version/tag reconciliation:** record `package.json` `1.1.15`, latest tag `v1.1.15`, HEAD = `v1.1.15` +2 (`c9e2e07`, `c497fab`), and flag the historically inconsistent `release:` commit messages so M1's CHANGELOG backfill is accurate.
  - **Test/coverage baseline:** run `yarn test` (and coverage) and record pass/fail counts and coverage % (note any known-flaky tests).
  - Write all of the above into `.project/Milestone-00/baseline-inventory.md` and commit it.
- **Acceptance shape:** a committed `baseline-inventory.md` containing the four captures above, referenced by M2/M3/M5.
- **Risks:** the full test suite may be slow or have environment-dependent failures — the goal is an honest *snapshot* (record failures as-is), not to fix tests here.

---

## 6. Dependencies & sequencing

- **Upstream:** none — M0 is the first milestone.
- **Internal ordering:** prefer **M0-E2 baseline capture before (or concurrent with) M0-E1 cleanup** so the inventory reflects the pre-cleanup state (snapshot-before-risk). Both epics are low-risk and `git`-reversible, so they may also run in parallel; cleanup does not change the API surface or shipped tarball (cruft files aren't in the `files` whitelist).
- **Carried-over owner gates:** none in M0.
- **Downstream consumers:** **all** later milestones. Specifically — M5 (runbook in `notes/`) and the whole `.project/` tree depend on the gitignore fix; M2/M3/M5 depend on the baseline inventory; M4 replaces the deleted `.travis.yml`.

---

## 7. Rollback posture

Pure git history with no published or outward-facing effect. Rollback lever: `git revert` the M0 commits (or restore `.travis.yml`/`tslint.json`/the removed eslint config from history). Re-adding the `notes` ignore line restores the prior gitignore behavior. No npm, no consumers, no infra touched.

---

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Deleting the eslint config that is actually active breaks `yarn lint` | Verify which config eslint `^8.57` resolves *before* deleting; keep the passing one; run `yarn lint` to confirm green. |
| Un-ignoring `notes/` stages stale or sensitive local files | Review the working tree before committing; flag any secret-bearing scratch files to Owner; only commit intended release notes. |
| Baseline test run is flaky/slow and stalls the milestone | Treat as a snapshot — record results (including failures) verbatim; do not attempt fixes in M0. |
| Cleanup accidentally affects the published tarball | None expected — cruft files aren't in the `files` whitelist; M0-E2 captures the pack list to confirm before/after parity. |

---

## 9. Definition of Done for Milestone 1 (M0)

M0 is closeable when:

- [ ] All §2 exit criteria are checked.
- [ ] `notes/` and `.project/` are tracked; the requested runbook location is now committable.
- [ ] Legacy `.travis.yml`/`tslint.json` removed and a single eslint config passes `yarn lint`.
- [ ] `yarn build` passes.
- [ ] `.project/Milestone-00/baseline-inventory.md` is committed and will be referenced by M2/M3/M5.
- [ ] `git status` is clean and intentional, with no secrets newly tracked.

➡️ **Next:** run **`/df3ndr:breakout-epics`** on **M0** to expand M0-E1 and M0-E2 into their own epic-overview docs (the input to `/create-prd`).
