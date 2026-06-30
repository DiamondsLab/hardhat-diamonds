# Changelog — M2-E2 Exports & Entry Points

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M2-E2 — Add package.json exports map (2026-06-28)

- Added an `exports` map formalizing the public entry points: `.`, new aliases `./utils` + `./lib`, the back-compat `./dist/utils` + `./dist/lib`, a `./dist/*` wildcard, and `./package.json`. Kept top-level `main`/`types` as a fallback.
- **Back-compat preserved (the headline risk):** every existing import still resolves — verified at runtime, under NodeNext types, and in the installed (`npm pack`) artifact.
- **Consumer gate:** the consuming monorepo `yarn compile` passes (plugin loads via `hardhat.config.ts`, no HH9); its `/dist/lib` test imports still resolve.
- **Validated:** all 7 entry points resolve; `tsc --noEmit` NodeNext exit 0; install-test exit 0; lint/build/test green (120 passing); only `package.json` changed (+27 lines).
- **For M3/changelog:** new `./utils` + `./lib` entry points to document; the M2-E4 `signer` type widening is part of this public surface.
- ✅ **M2-E2 complete (local).** No push/merge. Next: M2-E3 (tarball verification — incl. the CHANGELOG-not-shipping + clean-build-on-publish findings).
