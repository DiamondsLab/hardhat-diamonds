# Tasks — Gitignore & Cruft Removal (M0-E1)

> Execution checklist for [`prd-e1-gitignore-and-cruft.md`](prd-e1-gitignore-and-cruft.md). Driven by `/df3ndr:process-task-list` (enforces the backup / confirm / verify / record protocol). **Planning artifact — nothing is implemented until the task list is executed.**
>
> **Repo:** `packages/hardhat-diamonds` submodule · **Branch:** `chore/m0-repo-hygiene-baseline` (shared with M0-E2) · **Owner:** Eng · **Date:** 2026-06-27

## Relevant Files & Resources

- `…/Milestone-00/Epic-01/prd-e1-gitignore-and-cruft.md` — The Change Plan this task list executes.
- `…/Milestone-00/Epic-01/overview/e1-gitignore-and-cruft.md` — The epic overview both docs expand.
- `…/Milestone-00/overview/milestone-01-repo-hygiene-baseline.md` — Parent milestone overview.
- `packages/hardhat-diamonds/.gitignore` — Edited: remove the `notes` ignore; add `coverage.json` + `test-output/`.
- `packages/hardhat-diamonds/.travis.yml` — Deleted (legacy Travis CI; replaced by M4 GitHub Actions).
- `packages/hardhat-diamonds/tslint.json` — Deleted (TSLint deprecated 2019).
- `packages/hardhat-diamonds/.eslintrc.json` **or** `eslint.config.mjs` — One deleted (keep the lint-green resolver).
- `packages/hardhat-diamonds/notes/` — Becomes tracked (future home of the M5 release runbook).
- `packages/hardhat-diamonds/.project/` — Becomes tracked (this planning tree).
- `packages/hardhat-diamonds/package.json` — Read-only here (provides `lint`/`build` scripts); **not** modified.
- Submodule git repo + branch `chore/m0-repo-hygiene-baseline` — where all M0 changes land.
- `…/Milestone-00/Epic-01/CHANGELOG.md` — Epic change log to create/append on completion.

### Notes

- **The branch is the snapshot.** `main` stays untouched until the PR merges, so no separate backup is needed; every step is reversible via `git`.
- All actions are **local repo hygiene** — no npm publish, no credentials, no infrastructure, no production. The one approval gate is **OP-0** (secret review before tracking `notes/`/`.project/`).
- Validation commands are **read-only** health checks (`git check-ignore`, `ls`, `yarn lint`/`yarn build` exit codes) — the exact command is listed per check.
- **Do not widen scope:** no `package.json`/`exports`/`.npmignore` changes (M2), no eslint-9/flat migration (M2), no GitHub Actions (M4), no test fixes (M0-E2 only records).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 In `packages/hardhat-diamonds`, confirm the submodule is on `main`, clean, and up to date: `git fetch && git status` (expect clean tree, `main` even with `origin/main`). — **On `main`, even with `origin/main`. Working tree had pre-staged `.project/` planning docs (ours — carried to the branch) + a staged `coverage.json` (cruft → unstaged in 1.0).**
  - [x] 0.2 Create and checkout the shared M0 branch: `git checkout -b chore/m0-repo-hygiene-baseline`. (No separate backup — the branch is the snapshot.) — **Switched to `chore/m0-repo-hygiene-baseline`; staged planning docs carried over.**
  - [x] 0.3 Capture a pre-change baseline to compare against later: save `git status --ignored`, a top-level `ls -a`, and the **active eslint config** via `yarn exec eslint --print-config src/index.ts` to a scratch file (this also feeds M0-E2's inventory). — **FINDING: eslint 8.57.1 resolves the FLAT config (`eslint.config.mjs`) — debug: `Using flat config? true`, `Loading config from …/eslint.config.mjs`; `.eslintrc.json` is dead. So 2.x keeps `eslint.config.mjs`, deletes `.eslintrc.json`. `globals` confirmed installed (print-config exit 0). M2 flat-migration follow-up is now moot.**

- [x] 1.0 Correct `.gitignore`
  - [x] 1.1 Remove the `notes` entry (and its `# random notes` comment) from `.gitignore`. — **Removed lines 66-67.**
  - [x] 1.2 Add `coverage.json` and `test-output/` under a clear comment; confirm `*.tgz`, `.nyc_output`, `coverage`, `dist/`, and `*.tsbuildinfo` patterns remain intact. — **Added `coverage.json` to coverage section + `test-output/`; existing patterns intact.**
  - [x] 1.3 Verify: `git check-ignore notes` → empty; `git check-ignore .project` → empty; `git check-ignore coverage.json test-output` → both reported as ignored. — **All confirmed: notes/.project NOT ignored; coverage.json/test-output/coverage/package.tgz ignored.**

- [x] 2.0 Remove legacy cruft & consolidate the eslint config
  - [x] 2.1 Confirm `.travis.yml` and `tslint.json` are unreferenced: grep `package.json` scripts and the monorepo for `travis` / `tslint` (expect no hits). — **Only inert hits: `.ignore` search-list, generated `typechain-types/*` `/* tslint:disable */` headers, one double-commented test line. No tooling consumes either file; `.eslintrc.json` has zero refs.**
  - [x] 2.2 Delete `.travis.yml` and `tslint.json` (`git rm`). — **Done.**
  - [x] 2.3 Identify the eslint config that eslint `^8.57` actually resolves — **Done in 0.3: FLAT `eslint.config.mjs` resolves (debug confirmed), NOT `.eslintrc.json`. (Note: opposite of the usual eslint-8 default — verified empirically.)**
  - [x] 2.4 Delete the **non-resolving** eslint config; keep the lint-green one. Confirm `globals` is installed. — **Deleted dead `.eslintrc.json`; kept `eslint.config.mjs`; `globals@13.24.0` confirmed installed.**
  - [x] 2.5 Confirm exactly one eslint config remains. — **Only `eslint.config.mjs` remains. No eslint bump / no flat-forcing (correct — flat already active).**

- [x] 3.0 Verify the package still lints & builds — ✅ **Gate relaxed to "no worse than baseline" (user decision). Both failures are PRE-EXISTING and DEFERRED; M0-E1 introduces no regression.**
  - [x] 3.1 Run `yarn lint`. — **RESULT: exit 1, 225 `prettier/prettier` errors, ALL in untouched `src/` files. PRE-EXISTING on `main` (this branch changed only `.gitignore` + `.project/`; `src/utils.ts` byte-identical to main). Flat config was already the resolver, so the eslintrc deletion did not change lint. NOT caused by M0-E1. → DEFERRED to new follow-up epic M0-E3 (prettier formatting pass).**
  - [x] 3.2 Run `yarn build`. — **RESULT: exit 2 — `src/lib/LocalDiamondDeployer.ts(164,5): error TS2740` (`Signer` vs `HardhatEthersSigner`). File untouched by this branch → PRE-EXISTING build break on `main`. NOT caused by M0-E1. → DEFERRED to new epic M2-E4 (fix tsc build); flagged as a v1.2.0 RELEASE BLOCKER in the project plan risk register.**

- [ ] 4.0 Secret review (OP-0) & commit / open PR
  - [ ] 4.1 **STOP — OP-0 (human approval required):** enumerate any pre-existing files under `notes/` and `.project/` (`git status --porcelain notes .project`; list directory contents). Confirm with the Owner that none contain secrets/keys/tokens **before** tracking them. Do not proceed until approved.
  - [ ] 4.2 Stage the intended changes only: the `.gitignore` edit, the two deletions, the removed eslint config, and the new `notes/` + `.project/` trees.
  - [ ] 4.3 Commit using Conventional Commits — e.g. `chore(gitignore): track notes and project planning dirs`, `chore: remove legacy travis and tslint config`, `chore(eslint): consolidate to single resolving config` (one or several commits).
  - [ ] 4.4 Push the branch and open a PR into `main` (`gh pr create`). Note in the PR that M4 CI is not yet present, so review is manual.

- [ ] 5.0 Validate the change
  - [ ] 5.1 Run the PRD §9 read-only checks and record results: `git check-ignore notes` empty · `git check-ignore .project` empty · `git status --ignored` shows `coverage.json`/`test-output/`/`*.tgz`/`.nyc_output` as ignored · `ls .travis.yml tslint.json` both absent · exactly one eslint config present.
  - [ ] 5.2 Re-run `yarn lint` and `yarn build` on the branch tip; confirm both exit `0`.
  - [ ] 5.3 Confirm the PR is open against `main` and final `git status` is clean and intentional (no stray/secret files tracked).

- [ ] 6.0 Record the change
  - [ ] 6.1 Create/append `…/Milestone-00/Epic-01/CHANGELOG.md`: what changed (gitignore fix, removed `.travis.yml`/`tslint.json`, eslint consolidated to `<kept-config>`), date, and the 5.x validation results.
  - [ ] 6.2 Tick the satisfied acceptance-criteria checkboxes in the PRD and epic overview; record **which eslint config was kept** (input to the M2 eslint-9/flat decision).
  - [ ] 6.3 If keeping the legacy `.eslintrc.json` confirms a future migration is wanted, note the follow-up against M2 in the milestone overview / project plan.
