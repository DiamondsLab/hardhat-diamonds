# Release Baseline Inventory — `@diamondslab/hardhat-diamonds`

> **Epic:** [M0-E2 `release-baseline-inventory`](Epic-02/overview/e2-release-baseline-inventory.md) · **Captured:** 2026-06-27 · **Branch:** `chore/m0-repo-hygiene-baseline`
> **Purpose:** A measured snapshot of the package's current state so M1/M2/M3/M5 changes are provable, not asserted. Referenced by M2-E2 (exports), M2-E3 (tarball), M2-E4 (build), M1-E2 (changelog), M5 (version).
> **State captured at:** `git describe` = `v1.1.15-8-g73402ed` (tag `v1.1.15` + 2 upstream commits + 6 local M0 commits). API/source state reflects `origin/main` (the upstream code is untouched by M0).

## 1. Package identity & metadata

| Field | Value |
|-------|-------|
| `name` | `@diamondslab/hardhat-diamonds` |
| `version` | `1.1.15` |
| `license` | `MIT` (declared) — ⚠️ **no `LICENSE` file on disk** (M1-E1) |
| `main` / `types` | `dist/index.js` / `dist/index.d.ts` |
| `files` | `["dist/", "docs/", "LICENSE", "README.md"]` |
| `exports` | **none** — subpath imports rely on raw `dist/*` paths (M2-E2) |
| `engines` | **none declared** (M2-E1) |
| `author(s)` | non-standard `authors: ["Am0rfu5"]` (should be `author`) (M2-E1) |
| `packageManager` | `yarn@4.10.3` |
| peer deps | `@diamondslab/diamonds ^1.0.0`, `ethers ^6.0.0`, `hardhat ^2.0.0` |
| runtime dep | `chalk ^5.6.2` |

## 2. Public API surface (the contract M2-E2 must preserve)

Three consumer entry points are in use today:

### `.` — main (`dist/index.js`, from `src/index.ts`)
- **Side effects:** `extendConfig` (adds `config.diamonds`), `extendEnvironment` (adds `hre.diamonds` → `DiamondsConfig`), and registers the `diamond:generate-abi` / `diamond:generate-abi-typechain` tasks.
- **Named:** `DiamondsConfig`; plus everything re-exported from `./tasks`:
  - **Types:** `DiamondAbiGenerationOptions`, `DiamondAbiGenerationResult`, `DiamondAbiTaskArgs`, `DiamondAbiTypechainTaskArgs`, `TypeChainGenerationOptions`, `TypeChainGenerationResult`
  - **Values:** `ProgressIndicator`, `TaskHelpers`, `TaskValidation`, `HardhatDiamondAbiGenerator`, `generateDiamondAbi`, `HardhatTypeChainIntegration`, `generateTypeChainTypes`, `HARDHAT_DIAMONDS_TASKS`, `getDiamondTasks`, `isDiamondTask`, `getDiamondTasksHelp`
- **Runtime API:** `hre.diamonds.getDiamondConfig(name)` (documented in README).

### `./dist/utils` (`dist/utils.js`, from `src/utils.ts`) — circular-dep-safe entry
- `loadDiamondContract`, `LocalDiamondDeployer`, `LocalDiamondDeployerConfig`
- *This is the import path the README + monorepo `CLAUDE.md` mandate to avoid the HH9 error — M2-E2's `exports` map must keep it working.*

### `./dist/lib` (`dist/lib/index.js`, from `src/lib/index.ts`) — programmatic, no task registration
- `LocalDiamondDeployer`, `LocalDiamondDeployerConfig`, `generateDiamondAbi`, `HardhatDiamondAbiGenerator`, `generateTypeChainTypes`, `HardhatTypeChainIntegration`, `loadDiamondContract`

## 3. Published tarball (`npm pack --dry-run`)

| Metric | Value |
|--------|-------|
| Files in tarball | **41** |
| Unpacked size | **302.8 kB** |
| Top-level breakdown | `dist/` (37), `docs/` (2), `README.md` (1), `package.json` (1) |
| Non-dist payload | `README.md`, `docs/TESTING.md`, `docs/TESTING_SUMMARY.md`, `package.json` |
| `LICENSE` in tarball | ❌ **NO** (declared in `files` but absent on disk) → M1-E1 |

**Observations for M2-E3:**
- Ships **internal testing docs** (`docs/TESTING.md`, `TESTING_SUMMARY.md`) to consumers — likely should be excluded from the published package.
- `.npmignore` exists **and** a `files` whitelist exists — redundant strategies to reconcile.

## 4. Version & tag reconciliation

- `package.json` version: **`1.1.15`** · latest git tag: **`v1.1.15`**.
- `origin/main` is **2 commits ahead** of `v1.1.15`:
  - `c9e2e07` fix(gnus-ai): impersonate Signer first, fund second
  - `c497fab` style: update formatting in LoadDiamondArtifact.ts
  - (plus the earlier untagged `LoadDiamondArtifact` feature commits that introduced the **new public export `loadDiamondContract`** → justifies a **minor** bump to **`1.2.0`**.)
- Historical commit messages are inconsistent (`release: vX`, `chore: release vX`) — M1-E2 normalizes the changelog narrative; M5 adopts a single release-commit convention.
- The 6 local M0 commits live only on `chore/m0-repo-hygiene-baseline` (not pushed, per the release-only-`main` policy).

## 5. Health baseline (build / lint / test / eslint)

| Check | Result | Tracked by |
|-------|--------|------------|
| `yarn test` (hardhat/mocha) | ✅ **120 passing, 12 pending, 0 failing** (~0.9s) | — (healthy) |
| `yarn build` (`tsc`) | ❌ **FAILED at baseline** — `LocalDiamondDeployer.ts(164,5): TS2740` → ✅ **RESOLVED 2026-06-27 by M2-E4** | **M2-E4** (done) |
| `yarn lint` (eslint flat) | ❌ **FAILED at baseline** — 225 `prettier/prettier` errors across `src/` → ✅ **RESOLVED 2026-06-27 by M0-E3** | **M0-E3** (done) |
| eslint resolution | flat `eslint.config.mjs` (eslint `8.57.1`, `globals 13.24.0`); `.eslintrc.json` was dead → removed in M0-E1 | — |
| coverage | no `coverage` script in this package; stale `coverage/` + `coverage.json` + `.nyc_output/` from prior runs (now gitignored) | M2/M5 (optional) |

**Key contradiction to flag:** tests pass but `tsc` does not — the published `dist/` was built from an earlier toolchain/type state. A clean `v1.2.0` cannot be built from source until **M2-E4** resolves TS2740.

## 6. Consumers to re-validate after M2 changes

- This monorepo root consumes the package via `workspace:*` and imports `LocalDiamondDeployer` from `@diamondslab/hardhat-diamonds/dist/utils` — must keep resolving after any `exports` map (M2-E2).
- README + monorepo `CLAUDE.md` both document the `/dist/utils` import path — treat as a hard compatibility constraint.

## 7. Productization gaps surfaced (cross-reference)

| Gap | Milestone/Epic |
|-----|----------------|
| Missing `LICENSE` file | M1-E1 |
| No `CHANGELOG`; messy release history | M1-E2 |
| `package.json`: `author`, `engines`, `publishConfig`, `repository` casing | M2-E1 |
| No `exports` map (raw `dist/*` subpaths) | M2-E2 |
| Tarball ships internal docs; `.npmignore` vs `files` redundancy | M2-E3 |
| **`tsc` build broken (TS2740)** | **M2-E4 (blocker)** |
| 225 prettier lint errors | M0-E3 |
| README name/badge/link inaccuracies (GeniusVentures vs DiamondsLab) | M3-E1 |
| No CI/release workflows | M4 |
