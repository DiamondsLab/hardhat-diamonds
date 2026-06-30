# Versioning & Commit Policy

`@diamondslab/hardhat-diamonds` follows **[Semantic Versioning 2.0.0](https://semver.org/)**,
**[Conventional Commits](https://www.conventionalcommits.org/)**, and
**[Keep a Changelog](https://keepachangelog.com/)**. This document records the
conventions the project already uses; enforcement tooling (commitlint/Husky) is added in
the CI milestone (M4).

## Semantic Versioning

Given a version `MAJOR.MINOR.PATCH`:

- **MAJOR** — a backward-**incompatible** change to the public API (a removed/renamed
  export, a narrowed type, a changed function signature, a dropped subpath entry point).
- **MINOR** — a backward-**compatible** addition: a new export, a new supported
  `exports` entry point, a new optional parameter, or a **widened** input type.
- **PATCH** — a backward-compatible bug fix with no API surface change.

The **public API** is: the package's documented entry points — `.` (main),
`./dist/utils`, `./dist/lib` — and the exported types/values from each (see the
[release baseline inventory](../.project/Milestone-00/baseline-inventory.md) §2).

### Worked example — `v1.1.15 → 1.2.0` (minor)

`1.2.0` is a **minor** bump because it adds **new supported `exports` entry points**
(M2) and **widens** the `LocalDiamondDeployerConfig.signer` input type from
`SignerWithAddress` to ethers `Signer` (M2-E4) — both backward-compatible.

> Note: `loadDiamondContract` is **not** part of the `1.2.0` rationale — it shipped in
> `v1.1.15`. The post-`v1.1.15` code changes on their own are PATCH-level fixes; the
> MINOR is earned by the additive `exports` surface. The final number is set at release
> time (M5).

## Conventional Commits

Commit messages use `type(scope): summary`, e.g. `fix(deployer): widen signer type`.

| Type | Use | Typical SemVer effect |
|------|-----|-----------------------|
| `feat` | a new feature / public addition | MINOR |
| `fix` | a bug fix | PATCH |
| `docs` | documentation only | none |
| `style` | formatting, no code change | none |
| `refactor` | internal change, no API/behavior change | none / PATCH |
| `test` | tests only | none |
| `chore` | tooling, deps, repo housekeeping | none / PATCH |
| `build` / `ci` | build system / CI | none |

A commit that introduces a breaking change appends `!` (e.g. `feat!:`) or a
`BREAKING CHANGE:` footer → **MAJOR**.

## Keep a Changelog

All notable changes are recorded in [`CHANGELOG.md`](../CHANGELOG.md):

- New changes land under the top **`## [Unreleased]`** section, grouped as
  `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security`.
- At **release** (M5), `[Unreleased]` is renamed to `## [x.y.z] - YYYY-MM-DD`, the
  version is bumped in `package.json`, and a `vx.y.z` tag is pushed (which triggers the
  M4 publish workflow). A fresh empty `[Unreleased]` is started.

## Enforcement

This document describes the policy. **Automated enforcement** — commitlint + Husky
`commit-msg` hooks, and a CI check — is added in **M4 (CI pipeline)**, not here.
