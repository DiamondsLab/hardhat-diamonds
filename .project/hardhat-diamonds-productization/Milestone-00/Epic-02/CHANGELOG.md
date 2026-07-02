# Changelog — M0-E2 Release Baseline Inventory

Branch: `chore/m0-repo-hygiene-baseline` (shared with M0-E1). Executed directly from the epic overview (read-only inventory; no PRD/task-list ceremony needed).

## [Unreleased]

### M0-E2 — Release baseline inventory (2026-06-27)

- Wrote [`baseline-inventory.md`](../baseline-inventory.md) capturing:
  - **Package metadata** — `@diamondslab/hardhat-diamonds@1.1.15`, MIT (no LICENSE file), no `exports`/`engines`, non-standard `authors`.
  - **Public API surface** — the contract across `.` (main), `./dist/utils`, `./dist/lib` that M2-E2's `exports` map must preserve.
  - **Tarball** — `npm pack --dry-run`: 41 files / 302.8 kB; **no LICENSE**; ships internal `docs/TESTING*.md`.
  - **Version/tag** — `1.1.15` / tag `v1.1.15` / origin/main +2; new `loadDiamondContract` export justifies the **1.2.0** minor.
  - **Health** — `yarn test` ✅ 120 passing / 12 pending / 0 failing; `yarn build` ❌ TS2740 (→ M2-E4 blocker); `yarn lint` ❌ 225 prettier errors (→ M0-E3).
- ✅ **M0-E2 complete.** All work local on the M0 branch (no push/merge per the release-only-`main` policy).
