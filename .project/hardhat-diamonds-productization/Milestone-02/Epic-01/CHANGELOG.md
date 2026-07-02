# Changelog — M2-E1 package.json Metadata

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M2-E1 — Correct package.json metadata (2026-06-28)

- `authors:["Am0rfu5"]` → standard `author: "Am0rfu5"`.
- Added `engines` (`node >=18`, `yarn >=4`) and `publishConfig` (`access: public`; provenance deferred to M4).
- `repository` → object form `git+https://github.com/DiamondsLab/hardhat-diamonds.git`; fixed `bugs.url` casing; added `homepage`.
- Added `prepack: "tsc"` so `yarn pack` / `yarn npm publish` build a fresh `dist/` (yarn does not run `prepublishOnly`); kept `prepublishOnly`.
- **Validated:** valid JSON; all fields via `npm pkg get`; `authors` empty; lint/build/test green (120 passing); `yarn pack --dry-run` exit 0; monorepo still resolves the package; only `package.json` changed.
- ✅ **M2-E1 complete (local).** No push/merge (release-only-`main`). Next: M2-E2 (`exports` map).
