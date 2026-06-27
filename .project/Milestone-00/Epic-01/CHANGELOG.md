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
