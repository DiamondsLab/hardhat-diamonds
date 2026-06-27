# Epic 1 — Gitignore & Cruft Removal (M0-E1)

> **Parent milestone:** [Milestone 1 — Repository Hygiene & Baseline (M0)](../../overview/milestone-01-repo-hygiene-baseline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M0-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (no blocking owner gate; one light Owner secret-review)
> **Impact / blast radius:** Low — local repo hygiene only; no published artifact, no consumers, no runtime. Fully `git`-reversible.
> **Estimated effort:** S (~2–3h)
> **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Make the repository honest and contributor-clean so the rest of the productization work has a sound foundation. Concretely: correct `.gitignore` so the requested release-runbook location (`notes/`) and this `.project/` planning tree are **tracked**; stop tracking/surfacing build & test cruft; delete legacy CI/lint tooling (`.travis.yml`, `tslint.json`); and collapse the **duplicate eslint config** down to the single config that actually resolves — all while keeping `yarn lint` and `yarn build` green.

This unblocks every later milestone: M5's runbook and the whole `.project/` tree cannot be committed until the `notes` ignore is removed, and the M4 CI pipeline shouldn't be authored alongside a dead `.travis.yml` and an ambiguous lint setup.

## 3. Acceptance criteria

- [x] `.gitignore` no longer contains the `notes` ignore line; `git check-ignore notes` returns nothing and `notes/` is trackable.
- [x] `.project/` is confirmed **not** ignored by any pattern.
- [x] `coverage.json` (root file) and `test-output/` are added to `.gitignore`; `*.tgz`, `.nyc_output`, and `coverage` remain covered. `git status` shows no stray build/test cruft as untracked.
- [x] `.travis.yml` deleted.
- [x] `tslint.json` deleted.
- [x] Exactly **one** eslint config file remains (`eslint.config.mjs`); the one removed (`.eslintrc.json`) is the one eslint `^8.57` does **not** resolve.
- [~] `yarn lint` exits 0 — **AMENDED to "no worse than baseline": 225 prettier errors are PRE-EXISTING (not caused here) → M0-E3.**
- [~] `yarn build` (`tsc`) exits 0 — **AMENDED to "no worse than baseline": TS2740 in `LocalDiamondDeployer.ts` is PRE-EXISTING → M2-E4 (release blocker).**
- [x] Final `git status` is clean and intentional, with no secrets newly tracked under `notes/`.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Remove the `notes` line (under `# random notes`) from `.gitignore` | Eng | `git check-ignore notes` returns empty |
| 2 | Confirm `.project/` is not matched by any ignore pattern | Eng | `git check-ignore .project` returns empty |
| 3 | Add `coverage.json` and `test-output/` to `.gitignore`; verify `*.tgz` / `.nyc_output` / `coverage` still cover their targets | Eng | `git status` lists no build/test cruft as untracked |
| 4 | Delete `.travis.yml` (legacy Travis CI; replaced by M4 GitHub Actions) | Eng | file absent |
| 5 | Delete `tslint.json` (TSLint deprecated 2019; eslint is the active linter) | Eng | file absent |
| 6 | Determine which eslint config eslint `^8.57` actually loads (e.g. `yarn exec eslint --print-config src/index.ts`; default resolves `.eslintrc.json`, flat `eslint.config.mjs` needs eslint 9 / `ESLINT_USE_FLAT_CONFIG`) | Eng | the resolved config is documented in the commit/PR |
| 7 | Delete the non-resolving eslint config, keep the active one. If keeping `eslint.config.mjs`, confirm its `globals` dependency is installed | Eng | one eslint config remains |
| 8 | Run `yarn lint` against the remaining config | Eng | exits 0 (only pre-existing warnings) |
| 9 | Run `yarn build` to confirm removals didn't affect compilation | Eng | `tsc` exits 0 |
| 10 | Review the working tree (especially newly-trackable `notes/`) for secrets/scratch, then commit with a Conventional Commit message | Eng (+ Owner review) | clean intentional `git status`; commit made |

## 5. Dependencies & owner gates

- **Upstream:** none. M0-E1 can start immediately.
- **Sibling:** prefer running **M0-E2 (baseline inventory) first or concurrently** so the `yarn pack` / API / test snapshot reflects the pre-cleanup state. Not a hard blocker — cleanup doesn't change the shipped tarball (cruft files aren't in the `files` whitelist).
- **Owner gates:** **none blocking.** One light, non-blocking review — **OP-0 (review):** before `notes/` is committed for the first time, Eng flags any local scratch files; Owner confirms none contain secrets. Eng can stage everything else without waiting.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Deleting the *active* eslint config silently disables linting | Run `eslint --print-config` to identify the resolved config **before** deleting; keep that one; re-run `yarn lint` to confirm green (task 6→8). |
| Un-ignoring `notes/` stages stale or secret-bearing local files | Review the working tree before commit (OP-0); only commit intended release/planning notes. |
| A consumer or script relied on the deleted `.travis.yml`/`tslint.json` | Neither is referenced by `package.json` scripts or the monorepo; M4 supersedes Travis. Confirm via grep before deletion. |
| Removing `eslint.config.mjs` loses the richer `@typescript-eslint` ruleset | If the flat config is the better ruleset, prefer migrating *to* it — but that may require the eslint-9 bump deferred to M2; for M0 keep whatever resolves and lints green, and note the follow-up. |

## 7. Notes

- **Reversibility:** everything here is pure git history — `git revert` or restore deleted files from history. No npm, no infra, no consumers touched.
- **Stays untouched in this epic:** `package.json` metadata, `.npmignore`/`files`, `exports`, and tarball contents (all → M2); LICENSE/CHANGELOG/README/runbook (→ M1/M3/M5).
- **Baseline cross-check:** `package.tgz` and `coverage.json` were confirmed **untracked** during baseline checks, so no `git rm --cached` is needed for them — adding the ignore entries is sufficient. Re-verify at execution time in case state changed.
- **Conventional Commits:** since the project adopts Conventional Commits (M1-E3), use messages like `chore: remove legacy travis/tslint config` and `chore(gitignore): track notes and project planning dirs`.
