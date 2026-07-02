# Epic 1 — README Correctness (M3-E1)

> **Parent milestone:** [Milestone 4 — Docs & README Audit (M3)](../../overview/milestone-04-docs-readme-audit.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M3-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Low (docs only; outward-facing) · **Estimated effort:** M (~2–3h) · **Status:** 📋 Ready for `/create-prd` · **Priority:** ⭐ the explicit deliverable

---

## 2. Objective

Make `README.md` accurate to the **DiamondsLab / `@diamondslab`** reality and the current API surface so the first-run experience works verbatim. Today the install command, npm badge, imports, org links, and version prerequisites are all wrong or stale, and the new M2 entry points aren't documented.

## 3. Acceptance criteria

- [x] Install/usage use the scoped names `@diamondslab/hardhat-diamonds` + peer `@diamondslab/diamonds`; all imports scoped.
- [x] npm badge → scoped shields.io (`@diamondslab/hardhat-diamonds`).
- [x] All **GeniusVentures** links replaced with **DiamondsLab**.
- [x] Prerequisites refreshed (Node ≥18, TS 5.x, Hardhat ^2.26, Yarn ≥4); Dev Dependencies updated; dev commands `npm`→`yarn`.
- [x] "Project Structure" rewritten to the real `src/` tree.
- [x] Entry points documented (`.`/`./utils`/`./lib` + `/dist/*` back-compat); `signer?: Signer` noted.
- [x] `docs/VERSIONING.md` + `CHANGELOG.md` links added (Documentation section).
- [x] Grep sweep clean — no unscoped name, no GeniusVentures, no stale versions.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Fix install + all import statements to the scoped package names | Eng | grep finds no unscoped `hardhat-diamonds` import/install |
| 2 | Fix the npm badge URL (or drop pending publish) | Eng | badge resolves to the scoped package |
| 3 | Replace every GeniusVentures link with DiamondsLab | Eng | grep `GeniusVentures` → 0 |
| 4 | Refresh Prerequisites + Dev Dependencies (Node ≥18, TS 5.x, Hardhat ^2.26) | Eng | versions match `package.json`/`engines` |
| 5 | Rewrite "Project Structure" to the real `src/` layout | Eng | matches `find src` |
| 6 | Add/refresh the entry-points docs (`.`, `./utils`, `./lib`, `/dist/utils`, `/dist/lib`); note `signer: Signer` | Eng | matches the M2-E2 `exports` map |
| 7 | Add links to `docs/VERSIONING.md` + `CHANGELOG.md` | Eng | links present + resolve |
| 8 | Full top-to-bottom read + grep sweep for residual inaccuracies | Eng | sweep clean |

## 5. Dependencies & owner gates

- **Upstream:** M1 (CHANGELOG/VERSIONING to link) + M2 (final names, `exports`, `signer`) — all done.
- **Owner gates:** none.
- **Downstream:** M3-E2 (`CONTRIBUTING` links the README), M5 (release notes reference it).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| A corrected snippet still doesn't resolve | Cross-check import paths against the M2-E2 `exports` map (`./utils`/`/dist/utils` both valid). |
| Missed inaccuracies in a long README | Full read + grep sweep (`hardhat-diamonds` unscoped, `GeniusVentures`, version strings) as task 8. |
| npm badge 404s pre-publish | If `v1.2.0` isn't published yet, use a shields.io scoped badge or omit until M5. |

## 7. Notes

- Reversible: single-file doc edit; `git revert`.
- Stays untouched: source, `package.json` (M2 already fixed the links the README mirrors).
- The README is shipped in the tarball (M2-E3 `files`), so accuracy directly affects consumers.
