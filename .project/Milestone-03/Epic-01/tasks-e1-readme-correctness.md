# Tasks — README Correctness (M3-E1)

> Execution checklist for [`prd-e1-readme-correctness.md`](prd-e1-readme-correctness.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-03/Epic-01/prd-e1-readme-correctness.md` — The Change Plan this executes.
- `…/Milestone-03/Epic-01/overview/e1-readme-correctness.md` — The epic overview.
- `packages/hardhat-diamonds/README.md` — **Edited** (the only file changed).
- `packages/hardhat-diamonds/package.json` — Read only (source of truth for names/versions/engines).
- `packages/hardhat-diamonds/src/` — Read only (real tree for "Project Structure").
- `…/Milestone-03/Epic-01/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Single reversible `README.md` edit — **no backup needed**; branch is the snapshot.
- Match the README to the **already-correct** `package.json` (M2-E1) and `exports` map (M2-E2); don't invent.
- Validation is read-only (`grep`, gate exit codes).
- Don't widen scope: no CONTRIBUTING/SECURITY (M3-E2), no `package.json` edits, no publish (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch, clean tree. — **On branch ✓.**
  - [x] 0.2 Baseline. — **5 unscoped install/import lines, 3 GeniusVentures, 1 badge.fury, 2 stale-version lines; captured real 18-file `src/` tree.**

- [x] 1.0 Fix names, badge, and org links
  - [x] 1.1 Scope install commands (npm + yarn). — **`@diamondslab/hardhat-diamonds` + `@diamondslab/diamonds`.**
  - [x] 1.2 Scope all imports. — **3× `import "…"` (replace_all) + the `from "…"` named import + the package-name prose.**
  - [x] 1.3 Fix npm badge → scoped shields.io. — **Done; links to npmjs.com page.**
  - [x] 1.4 Replace GeniusVentures → DiamondsLab. — **All 3 (diamonds link, Related Projects, Support issues).**

- [x] 2.0 Refresh stale sections
  - [x] 2.1 Prerequisites → Node ≥18, TS 5.x, Hardhat ^2.26 (+ Yarn ≥4). — **Done; dev commands switched npm→yarn.**
  - [x] 2.2 Dev Dependencies → current (TS 5.x, Mocha+Chai, eslint flat). — **Done.**
  - [x] 2.3 Project Structure → real `src/` tree (lib/tasks/interfaces/utils + docs/CHANGELOG/LICENSE). — **Done.**

- [x] 3.0 Document the current API surface
  - [x] 3.1 Entry points: added a "Package Entry Points" table (`.`, `./utils`, `./lib` + `/dist/*` back-compat note). — **Matches M2-E2 exports map.**
  - [x] 3.2 Note `signer: Signer`. — **Added `signer?: Signer` to the config + a note (M2-E4).**
  - [x] 3.3 Links to `docs/VERSIONING.md` + `CHANGELOG.md`. — **Added a "Documentation" section.**

- [x] 4.0 Validate the change
  - [x] 4.1 Grep sweep. — **CLEAN — zero residual inaccuracies.**
  - [x] 4.2 Positive checks. — **`@diamondslab/hardhat-diamonds` ×19; `/utils`+`/lib` documented; VERSIONING+CHANGELOG links; signer note; Node≥18.**
  - [x] 4.3 Gates + diff scope. — **lint 0 ✓, build 0 ✓; only `README.md` changed.**

- [x] 5.0 Record the change
  - [x] 5.1 Create/append `…/Milestone-03/Epic-01/CHANGELOG.md`. — **Done.**
  - [x] 5.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked.**
  - [x] 5.3 Commit; **no push/merge**. — **See commit below.**
