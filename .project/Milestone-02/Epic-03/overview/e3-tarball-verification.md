# Epic 3 — Tarball Verification (M2-E3)

> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../../overview/milestone-03-packaging-metadata.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E3](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med (defines exactly what consumers receive) · **Estimated effort:** S–M (~2–3h) · **Status:** 📋 Ready for `/create-prd` · **Order:** runs **last** in M2 (verifies E1+E2)

---

## 2. Objective

Make the published tarball correct and intentional: reconcile the redundant `.npmignore` + `files` strategies to one, ensure the right files ship (and cruft/internal docs don't), and prove it by installing the packed tarball into a throwaway consumer. This is the final gate before the package is publish-ready.

## 3. Acceptance criteria

- [ ] A **single** packaging strategy is chosen (recommend the `files` whitelist) and the redundant `.npmignore` removed or reconciled so they can't conflict.
- [ ] The tarball **includes**: `dist/`, `README.md`, `LICENSE`, **`CHANGELOG.md`** (currently NOT in `files` — npm does not auto-include it), and intended docs (`docs/VERSIONING.md`).
- [ ] The tarball **excludes** internal/test docs (`docs/TESTING.md`, `docs/TESTING_SUMMARY.md`) and any cruft (source, tests, coverage, `*.tgz`, tsconfig).
- [ ] `npm pack --dry-run` file list is audited and matches the intended manifest (diffed against the M0-E2 baseline + M1/M2 additions).
- [ ] The packed tarball **installs cleanly** into a throwaway project and its documented imports (`.`, `/dist/utils`, `/dist/lib`) resolve.
- [ ] Gates green; the result is recorded for the M5 runbook.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Decide the strategy: keep `files`, drop/repurpose `.npmignore` (they currently overlap) | Eng | one source of truth |
| 2 | Add `CHANGELOG.md` to `files`; scope `docs` so `VERSIONING.md` ships but `TESTING*.md` don't (list specific docs or relocate TESTING) | Eng | manifest correct |
| 3 | `npm pack --dry-run` → audit the file list against intent; assert includes/excludes | Eng | list matches manifest |
| 4 | `npm pack` → `npm install ./<tarball>` in a temp project; import `.`, `/dist/utils`, `/dist/lib` | Eng | imports resolve at runtime |
| 5 | Record the final tarball manifest + size for the M5 release runbook | Eng | recorded |

## 5. Dependencies & owner gates

- **Upstream:** **M2-E1 + M2-E2** (metadata + `exports` must be final before the tarball is audited).
- **Owner gates:** none.
- **Downstream:** M5 (the runbook's pre-publish audit reuses this); M4 (CI may run a pack-audit check).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| `CHANGELOG.md` silently not shipped (not in `files`, not npm-auto-included) | Task 2 adds it explicitly; task 3 asserts it in the pack list. |
| Excluding `docs/` wholesale also drops `VERSIONING.md` | Use specific doc entries or relocate `TESTING*` out of the shipped path; verify both outcomes in the pack list. |
| `.npmignore`/`files` interaction drops a needed file | Pick **one** strategy (task 1); audit before/after with `npm pack --dry-run`. |
| Install-test passes but real consumer differs (yarn vs npm) | Test with the project's manager (`yarn`) and note any npm differences. |

## 7. Notes

- Reversible: config-only (`package.json` `files`, `.npmignore`); `git revert`.
- **Finding (M2 breakout):** `files` is `["dist/","docs/","LICENSE","README.md"]` — **no `CHANGELOG.md`**, and `docs/` ships internal `TESTING*.md`. Both addressed here.
- Stays untouched: source, `exports`/metadata (done in E1/E2), version (M5).
- The clean-install test is the strongest signal the package is publish-ready — keep its evidence for M5.
