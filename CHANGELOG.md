# Changelog

All notable changes to `@diamondslab/hardhat-diamonds` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). See
the [versioning policy](docs/VERSIONING.md) for the bump rules.

> **Historical note.** Early tags were applied inconsistently and are reconstructed here
> from git tags + history. Notably, `v1.0.11` was tagged **2025-12-16 — after `v1.1.7`
> (2025-11-01)** — during the `LocalDiamondDeployer` migration on a feature branch, and
> several patch numbers (e.g. `1.1.3`–`1.1.4`, `1.1.8`–`1.1.11`, `1.1.13`) were never
> tagged. Older patches are summarized; recent releases are detailed.

## [Unreleased]

## [1.2.0] - 2026-06-29

### Added
- An **`exports` map** formalizing the public entry points: `.`, plus new aliases
  **`./utils`** and **`./lib`** (with backward-compatible `./dist/utils`, `./dist/lib`,
  and `./dist/*`).
- **`LICENSE`** file (MIT) — now present and shipped in the published package.
- **`docs/VERSIONING.md`** — versioning & commit policy (SemVer + Conventional Commits).

### Changed
- `@diamondslab/diamonds` dependency updated to `1.4.0`.
- `LocalDiamondDeployerConfig.signer` type widened from `SignerWithAddress`
  (`HardhatEthersSigner`) to ethers `Signer` — accepts an impersonated signer and the
  package compiles cleanly from source (`tsc` TS2740 resolved). Widening of an optional
  input field; non-breaking for typical use.
- `package.json` metadata corrected for publishing: added `engines` (node ≥ 18, yarn ≥ 4),
  `publishConfig` (`access: public`), `author`, and object-form `repository`/`bugs`/`homepage`;
  `prepack` now produces a clean `dist`.
- Published file manifest tightened — ships `dist/`, `LICENSE`, `README.md`, `CHANGELOG.md`,
  and `docs/VERSIONING.md`; excludes internal test docs and source.
- README corrected — scoped package names (`@diamondslab/…`), DiamondsLab links, accurate
  prerequisites, and the documented entry points.

### Fixed
- Fork-based Diamond **upgrades**: the deployer signer is now impersonated and funded
  *before* use, fixing `invalid account` errors for non-test deployer addresses.
- **`chalk` pinned to `^4.1.2`** (was `^5`): chalk 5 is pure ESM and threw
  `ERR_REQUIRE_ESM` when this CommonJS package `require()`d it in a consumer project.

## [1.1.15] - 2025-12-31
### Added
- `loadDiamondContract` exported from `@diamondslab/hardhat-diamonds/dist/utils`
  (the `LoadDiamondArtifact` helper) for type-safe loading of deployed Diamonds.

## [1.1.14] - 2025-12-31
### Added
- `LoadDiamondArtifact` library module.

## [1.1.12] - 2025-12-18
### Added
- `LocalDiamondDeployer` and `LocalDiamondDeployerConfig` exported for use as a peer
  dependency.
### Fixed
- Resolved the HH9 circular-dependency error by adding a dedicated `lib` entry point.
- Restored `hardhat` as a dependency needed for testing.

## [1.0.11] - 2025-12-16
> Mis-versioned tag (applied after `v1.1.7`, on `feature/migrate-localdiamonddeployer`).
> Marks the migration of `LocalDiamondDeployer` into this package.
### Added
- `LocalDiamondDeployer` migrated into `hardhat-diamonds`, with API documentation.
### Fixed
- Removed `hardhat` from `devDependencies` and used `import type` for the
  `HardhatRuntimeEnvironment` to avoid type conflicts.

## [1.1.7] - 2025-11-01
### Fixed
- Module resolution switched to `nodenext`; resolve `diamonds` from the consuming
  project's `node_modules` rather than the plugin's.

## [1.1.6] - 2025-11-01
### Added
- `erc-2535` added to the npm keywords.

## [1.1.5] - 2025-11-01
### Fixed
- `tsc` composite build issue and `tsconfig` cleanups.

## [1.1.2] - 2025-10-30
### Fixed
- `diamonds` dependency reference pointed at the `@diamondslab` scope.

## [1.1.1] - 2025-10-29
### Changed
- Package metadata / info updates.

## [1.1.0] - 2025-09-17
### Added
- Initial `@diamondslab/hardhat-diamonds` release in the monorepo structure: Diamond
  configuration management (`hre.diamonds`), Diamond ABI generation, and TypeChain
  integration tasks.

[Unreleased]: https://github.com/DiamondsLab/hardhat-diamonds/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/DiamondsLab/hardhat-diamonds/compare/v1.1.15...v1.2.0
[1.1.15]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.15
[1.1.14]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.14
[1.1.12]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.12
[1.0.11]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.0.11
[1.1.7]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.7
[1.1.6]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.6
[1.1.5]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.5
[1.1.2]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.2
[1.1.1]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.1
[1.1.0]: https://github.com/DiamondsLab/hardhat-diamonds/releases/tag/v1.1.0
