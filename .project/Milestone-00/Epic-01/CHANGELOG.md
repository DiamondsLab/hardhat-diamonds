# Changelog — M0-E1 Gitignore & Cruft Removal

All changes made while executing [`tasks-e1-gitignore-and-cruft.md`](tasks-e1-gitignore-and-cruft.md).
Branch: `chore/m0-repo-hygiene-baseline` (shared with M0-E2). Format loosely follows Keep a Changelog.

## [Unreleased]

### Task 0.0 — Prepare & safeguard (2026-06-27)

- Created working branch `chore/m0-repo-hygiene-baseline` off `main` (branch = the snapshot; `main` untouched).
- Captured pre-change baseline to scratch: `git status --ignored`, top-level `ls -a`, and the resolved eslint config.
- **Finding (feeds Task 2.x + M2):** eslint `8.57.1` resolves the **flat** config `eslint.config.mjs` (`Using flat config? true`), not `.eslintrc.json`. The `.eslintrc.json` is dead → will be deleted, `eslint.config.mjs` kept. `globals` dep confirmed installed. The M2 "eslint-9/flat migration" follow-up is effectively already done.
- Established the `.project/` productization planning tree (plan, M0 milestone overview, M0-E1/E2 epic overviews, M0-E1 PRD + task list) under version control.
- Corrected an erroneously-staged `coverage.json` (unstaged; it is build cruft to be ignored in Task 1.0).

### Task 1.0 — Correct `.gitignore` (2026-06-27)

- Removed the `notes` ignore (and its `# random notes` comment) so `notes/` (future M5 release runbook home) is tracked.
- Added `coverage.json` and `test-output/` to `.gitignore`; existing `*.tgz`, `.nyc_output`, `coverage`, `dist/`, `*.tsbuildinfo` patterns left intact.
- Verified: `git check-ignore` reports `notes`/`.project` NOT ignored and `coverage.json`/`test-output`/`coverage`/`package.tgz` ignored.

### Task 2.0 — Remove legacy cruft & consolidate eslint (2026-06-27)

- Deleted legacy `.travis.yml` (Travis CI, Node 8/10/11) and `tslint.json` (TSLint, deprecated 2019). Confirmed unreferenced by any tooling first.
- Deleted the **dead** `.eslintrc.json`; kept `eslint.config.mjs` — empirically verified (eslint `--debug`) as the config eslint 8.57.1 actually resolves. `globals@13.24.0` confirmed installed.

### Task 3.0 — Verify lint & build (2026-06-27)

- ⚠️ **Discovered two PRE-EXISTING baseline failures, NOT caused by M0-E1** (this branch changed only `.gitignore` + `.project/`):
  - `yarn lint` → exit 1, **225 `prettier/prettier` errors** across untouched `src/` files. The repo source was never prettier-clean against the (already-active) flat config. → **Deferred to new epic M0-E3 (prettier formatting pass).**
  - `yarn build` (`tsc`) → exit 2, `LocalDiamondDeployer.ts(164,5): error TS2740` (`Signer` vs `HardhatEthersSigner`). → **Deferred to new epic M2-E4 (fix tsc build); flagged as a v1.2.0 RELEASE BLOCKER.**
- Decision (user): defer both, record in baseline, keep M0-E1 scope tight. M0-E1 gate relaxed to "no worse than baseline" — confirmed no regression.

### Task 4.0 / 5.0 / 6.0 — Review, validate, record (2026-06-27)

- **OP-0 secret review:** `notes/` empty; `.project/` holds only planning docs; secret-pattern scan found no real credentials. Satisfied.
- **Validation (read-only):** `git check-ignore` confirms `notes`/`.project` trackable and `coverage.json`/`test-output` ignored; `.travis.yml`/`tslint.json` absent; single eslint config `eslint.config.mjs`; working tree clean.
- **Eslint config kept:** `eslint.config.mjs` (flat) — input to M2; the planned M2 eslint-9/flat migration is effectively already in place.
- **Local commits complete** on `chore/m0-repo-hygiene-baseline`. ⏸ **Push + PR into `main` paused pending user confirmation** (outward-facing action to the DiamondsLab remote).

**M0-E1 status:** all in-scope work complete and validated locally; remaining step is the outward push/PR (Task 4.4).
