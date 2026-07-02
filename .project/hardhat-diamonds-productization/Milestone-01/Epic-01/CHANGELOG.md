# Changelog — M1-E1 MIT License File

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M1-E1 — Add MIT LICENSE (2026-06-28)

- Added root `LICENSE` with canonical OSI MIT text and `Copyright (c) 2025-2026 DiamondsLab` (OP-1 resolved: holder = DiamondsLab "for now").
- **Verified:** tarball grew 41 → **42 files** with `LICENSE` now included (`npm pack --dry-run`); `package.json` `license` still `MIT` and `files` still lists `LICENSE` (no edit). `yarn lint`/`yarn build` exit 0 (no source change).
- The package now distributes its license terms — resolves the M0-E2 finding that `LICENSE` was declared in `files` but missing on disk.
- ✅ **M1-E1 complete (local).** No push/merge (release-only-`main`).
