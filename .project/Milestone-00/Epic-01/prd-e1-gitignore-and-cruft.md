# Change Plan (PRD) — Gitignore & Cruft Removal (M0-E1)

> **Epic overview:** [`overview/e1-gitignore-and-cruft.md`](overview/e1-gitignore-and-cruft.md)
> **Parent milestone:** [Milestone 1 — Repository Hygiene & Baseline (M0)](../overview/milestone-01-repo-hygiene-baseline.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M0-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only — not yet implemented) · **Date:** 2026-06-27
> **Repo:** `packages/hardhat-diamonds` submodule (separate git repo, origin `git@github.com:DiamondsLab/hardhat-diamonds.git`, currently on `main`)

**Decisions folded in (from clarification):**
- **eslint:** keep whichever config eslint `^8.57` resolves **lint-green**; delete the other. No eslint-9/flat migration in M0 (deferred to M2).
- **Branch:** all of **M0 (E1 + E2)** lands on a **single feature branch** (suggested `chore/m0-repo-hygiene-baseline`) → PR into `main`.
- **Artifacts:** **ignore-only** — do not physically delete untracked on-disk build artifacts.

**Amendment (during execution, 2026-06-27):** `yarn lint` (225 pre-existing prettier errors) and `yarn build` (pre-existing `tsc` TS2740) are **both red at baseline**, unrelated to this epic. Requirements 7–8 are amended from "exit 0" to **"no worse than baseline"**; the failures are deferred to **M0-E3** (formatting) and **M2-E4** (build fix — release blocker).

---

## 1. Overview & Problem

The `hardhat-diamonds` submodule carries repository cruft that blocks clean productization. The requested release-runbook location (`notes/`) and this `.project/` planning tree are affected by `.gitignore` (the `notes` line ignores `notes/`), so release/planning artifacts can't be tracked. Legacy CI/lint tooling remains — `.travis.yml` (Travis, Node 8/10/11) and `tslint.json` (TSLint, deprecated since 2019) — alongside a **duplicate eslint config** (`.eslintrc.json` *and* `eslint.config.mjs`) that creates ambiguity about which rules actually run.

**Goal:** Correct `.gitignore` so planning/release artifacts are trackable, remove dead CI/lint tooling, and collapse to the single eslint config that resolves lint-green — keeping `yarn lint` and `yarn build` passing.

## 2. Goals

1. `notes/` and `.project/` are **trackable** (no longer ignored).
2. Build/test cruft (`coverage.json`, `test-output/`, `*.tgz`, `.nyc_output`, `coverage`, `dist/`, `*.tsbuildinfo`) is **ignored** so it never lands in commits.
3. `.travis.yml` and `tslint.json` are **removed**.
4. Exactly **one** eslint config remains, and `yarn lint` exits `0`.
5. `yarn build` (`tsc`) still exits `0` after all removals.
6. Final `git status` is clean and intentional, with **no secrets** newly tracked.

## 3. Scope — Components & Services

In-scope files in `packages/hardhat-diamonds/`:

| Path | Action |
|------|--------|
| `.gitignore` | Edit — remove the `notes` line (under `# random notes`); add `coverage.json` and `test-output/`; keep existing cruft patterns |
| `.travis.yml` | Delete |
| `tslint.json` | Delete |
| `.eslintrc.json` *or* `eslint.config.mjs` | Delete the one eslint `^8.57` does **not** resolve (keep the lint-green one) |
| `notes/` | Becomes tracked (currently empty except future runbook) |
| `.project/` | Confirm trackable (already not ignored) — the planning tree |

**Branch:** single submodule feature branch `chore/m0-repo-hygiene-baseline` (shared with M0-E2), PR'd into `main`.

Nothing else is touched. No `src/`, no `package.json`, no published artifact.

## 4. Stakeholders & Impact

- **Maintainer / Owner (Am0rfu5, DiamondsLab):** one light review of newly-trackable `notes/`/`.project/` for secrets before commit (OP-0).
- **Contributors:** clearer single lint config and no dead CI file.
- **Downstream npm consumers:** **none** — nothing published; the removed files were never in the `files` tarball whitelist.
- **Consuming monorepo:** unaffected — no `package.json`/`exports`/`dist` change. (`yarn build` re-verified as a guard.)
- **User-facing / production impact:** **none.**

## 5. Operational Requirements

1. `.gitignore` must no longer ignore `notes/` — verified by `git check-ignore notes` returning empty.
2. `.gitignore` must ignore `coverage.json` (root file — the existing `coverage` pattern matches the dir, not this file) and `test-output/`, and must continue to cover `*.tgz`, `.nyc_output`, `coverage`, `dist/`, `*.tsbuildinfo`.
3. `.project/` must be confirmed trackable (`git check-ignore .project` empty).
4. `.travis.yml` must be deleted from the working tree.
5. `tslint.json` must be deleted from the working tree.
6. The active eslint config must be identified via `yarn exec eslint --print-config src/index.ts` **before** deletion; the non-resolving config is deleted; exactly one remains. If `eslint.config.mjs` is the survivor, its `globals` dependency must be confirmed installed. **No** eslint major bump or flat-config forcing in M0.
7. `yarn lint` must exit `0` (only pre-existing, unchanged warnings permitted).
8. `yarn build` must exit `0`.
9. All changes must be committed on the `chore/m0-repo-hygiene-baseline` branch (shared with M0-E2) using Conventional Commit messages, then PR'd into `main`.
10. On-disk untracked artifacts (`package.tgz`, root `coverage.json`, `tsconfig.tsbuildinfo`) must be **ignored, not physically deleted**.

## 6. Security & Compliance Considerations

- **Secret-exposure gate (OP-0 — requires human approval):** un-ignoring `notes/` and tracking `.project/` could sweep previously-ignored local scratch files into git. Before the first commit, Eng enumerates any pre-existing files under `notes/` and `.project/`; **Owner explicitly approves** that none contain secrets/keys/tokens. Do not commit these paths until that approval is given.
- **No elevated privileges:** no credentials, keys, certificates, production data, or infrastructure config are touched. No npm publish, no registry tokens, no repo secrets (those live in M4/M5).
- **Audit:** changes are ordinary git history on a reviewable PR.

## 7. Non-Goals (Out of Scope)

- `package.json` metadata, `exports`, `.npmignore`/`files`, or tarball contents → **M2**.
- Full **eslint 9 / flat-config migration** (eslint major bump, dep changes) → **M2**.
- Authoring GitHub Actions to replace the deleted `.travis.yml` → **M4**.
- LICENSE, CHANGELOG, README, release runbook → **M1 / M3 / M5**.
- **Physically deleting** on-disk build artifacts (ignore-only this epic).
- Fixing any failing/flaky tests — M0-E2 only *records* the baseline; no test changes here.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** the **feature branch is the snapshot** — `main` is untouched until the PR merges, so no separate backup is required. All actions are pure git history.
- **Rollback path:** `git revert` the M0 commits, restore deleted files from history (`git checkout main -- <path>`), or re-add the `notes` ignore line. Reversible end-to-end.

| Risk | Rollback / Mitigation |
|------|------------------------|
| Deleting the *active* eslint config disables linting | Run `eslint --print-config` first (Req 6); keep the resolving one; re-run `yarn lint` (Req 7). Restore from git if wrong. |
| Secrets swept in via newly-tracked `notes/`/`.project/` | OP-0 human approval before commit; `git rm --cached` + history scrub if one slips through. |
| `yarn build` breaks after removals | Build is a hard gate (Req 8); if it fails, revert the offending deletion — none of the removed files are compiled. |
| A script/consumer referenced `.travis.yml`/`tslint.json` | Grep `package.json` scripts + monorepo before deletion; both are confirmed unreferenced. |

## 9. Validation / Success Metrics

- `git check-ignore notes` → **empty**; `git check-ignore .project` → **empty**.
- `git status --ignored` shows `coverage.json`, `test-output/`, `*.tgz`, `.nyc_output` as ignored (not untracked, not staged).
- `ls .travis.yml tslint.json` → **both absent**.
- Exactly one of `.eslintrc.json` / `eslint.config.mjs` present.
- `yarn lint` → exit `0`.
- `yarn build` → exit `0`.
- PR opened against `main` from `chore/m0-repo-hygiene-baseline`; final `git status` clean and intentional.

## 10. Open Questions

- **Which eslint config resolves** under the installed eslint `^8.57.1` is determined empirically at execution (`--print-config`). Expectation: `.eslintrc.json` (eslintrc is eslint 8's default); the PRD covers either outcome.
- **Exact branch name** — suggested `chore/m0-repo-hygiene-baseline`; confirm at execution if a different convention is preferred.
- Whether `.project/` should ship in the npm tarball is a **M2** concern (`files`/`.npmignore`), explicitly out of scope here.

---

➡️ **Next:** run **`/df3ndr:generate-tasks`** against this Change Plan to produce the safety-gated, step-by-step task list for execution.
