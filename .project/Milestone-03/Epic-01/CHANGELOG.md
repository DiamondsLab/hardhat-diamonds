# Changelog — M3-E1 README Correctness

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M3-E1 — Correct the README (2026-06-28)

- Scoped all install commands + imports to `@diamondslab/hardhat-diamonds` (+ peer `@diamondslab/diamonds`); fixed the npm badge to the scoped shields.io URL; scoped the title.
- Replaced all GeniusVentures links with DiamondsLab (the `diamonds` link, Related Projects, Support).
- Refreshed Prerequisites (Node ≥18, TS 5.x, Hardhat ^2.26, Yarn ≥4) and Dev Dependencies; switched dev commands `npm`→`yarn`; rewrote "Project Structure" to the real `src/` tree.
- Added a **Package Entry Points** table documenting `.`, `./utils`, `./lib` (+ `/dist/*` back-compat) — matching the M2-E2 `exports` map.
- Documented `LocalDiamondDeployerConfig.signer?: Signer` (M2-E4); added a **Documentation** section linking `CHANGELOG.md` + `docs/VERSIONING.md`.
- **Validated:** grep sweep clean (zero residual inaccuracies); `@diamondslab/hardhat-diamonds` used 19×; lint/build exit 0; only `README.md` changed.
- ✅ **M3-E1 complete (local).** No push/merge. Next: M3-E2 (community/governance docs).
