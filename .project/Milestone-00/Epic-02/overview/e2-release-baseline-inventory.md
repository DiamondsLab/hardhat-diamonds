# Epic 2 — Release Baseline Inventory (M0-E2)

> **Parent milestone:** [Milestone 1 — Repository Hygiene & Baseline (M0)](../../overview/milestone-01-repo-hygiene-baseline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M0-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (no owner gate)
> **Impact / blast radius:** Low — read-only capture plus one committed doc; no code or config changes.
> **Estimated effort:** S (~2–3h, dominated by the test run)
> **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Record a measurable, committed snapshot of the package's **current** state so every later milestone can prove its changes rather than assert them. Four captures: the **public-API surface** (the contract M2's `exports` map must preserve), the **`yarn pack` file list** (what M2-E3 verifies), the **version/tag reconciliation** (HEAD vs `v1.1.15`, feeding M1's CHANGELOG backfill and M5's version bump), and the **test/coverage baseline**. The deliverable is a single tracked document, `baseline-inventory.md`, referenced by M2, M3, and M5.

## 3. Acceptance criteria

- [ ] Public-API surface is enumerated: exports from `src/index.ts`, `src/lib/index.ts`, `src/tasks/index.ts`, `src/utils.ts`, plus the documented subpaths `@diamondslab/hardhat-diamonds/dist/utils` and `/dist/lib`.
- [ ] `yarn pack` (dry-run) file list is captured verbatim, with the **missing-`LICENSE`** discrepancy explicitly flagged (it is listed in `package.json: files` but absent on disk — fixed in M1-E1).
- [ ] Version/tag state is recorded: `package.json` `1.1.15`, latest tag `v1.1.15`, HEAD = `v1.1.15` +2 (`c9e2e07`, `c497fab`), and the historically inconsistent `release:`/`chore: release` commit messages noted.
- [ ] Test/coverage baseline is recorded: pass/fail counts from `yarn test` and the coverage % (with any known-flaky tests called out).
- [ ] `.project/Milestone-00/baseline-inventory.md` is written and committed.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Enumerate the public exports across `index.ts`, `lib/index.ts`, `tasks/index.ts`, `utils.ts`, and the `/dist/utils` & `/dist/lib` subpaths | Eng | API-surface section drafted in the baseline doc |
| 2 | Run `yarn pack` (or `--dry-run`) and capture the exact shipped file list; flag the missing `LICENSE` and confirm `dist/`/`docs/`/`README.md` inclusion | Eng | pack file list recorded; discrepancies flagged |
| 3 | Record version/tag reconciliation (`package.json` version, `git tag` latest, `git describe`, commits since tag, messy historical release commits) | Eng | version/tag section recorded |
| 4 | Run `yarn test` (and `yarn` coverage if available); record pass/fail and coverage %, noting flaky/slow tests | Eng | test/coverage section recorded |
| 5 | Assemble and commit `.project/Milestone-00/baseline-inventory.md` | Eng | file committed and cross-referenced by M2/M3/M5 |

## 5. Dependencies & owner gates

- **Upstream:** none.
- **Sequencing:** ideally **before or concurrent with M0-E1** so the snapshot reflects the pre-cleanup state (snapshot-before-risk). Cleanup doesn't alter the API surface or tarball, so a small overlap is acceptable.
- **Owner gates:** none.
- **Downstream consumers:** M2-E2 (`exports` must preserve the captured API surface), M2-E3 (tarball verified against the captured pack list), M1-E2 (CHANGELOG backfill uses the tag history), M5-E3 (version bump starts from the recorded state).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| The full test suite is slow or environment-flaky and stalls the epic | The goal is an honest *snapshot* — record results as-is (including failures); do **not** fix tests here. Cap the run and note any timeouts. |
| API surface captured incompletely (subpath exports missed) | Cross-check `package.json` `main`/`types` and the README's documented `/dist/utils` import; enumerate each `index.ts` barrel explicitly. |
| `yarn pack` contents differ at release time after M2 changes | This is the *baseline* by design; M2-E3 re-runs the pack and diffs against this record. |

## 7. Notes

- **Reversibility:** read-only except for adding one tracked doc; trivially reversible.
- **Stays untouched in this epic:** no source, config, or `package.json` changes — those live in M1/M2/M3.
- **Why it leads:** a baseline taken *after* cleanup would bake in the changes it's meant to measure; capturing first keeps M2/M3/M5 diffs honest.
- The `baseline-inventory.md` lands under `.project/Milestone-00/`, which only becomes trackable once M0-E1 removes the `notes`/ensures `.project/` isn't ignored — `.project/` is already un-ignored, so this doc is committable independently of E1.
