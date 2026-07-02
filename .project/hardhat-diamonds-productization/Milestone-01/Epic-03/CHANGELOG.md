# Changelog — M1-E3 Versioning & Commit Policy

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M1-E3 — Add versioning policy (2026-06-28)

- Added `docs/VERSIONING.md`: SemVer rules (with the public-API definition + the `v1.1.15 → 1.2.0` worked example), Conventional Commits format + SemVer-mapping table, the Keep a Changelog release flow, and a note that commitlint/Husky enforcement is added in M4.
- Resolved the `CHANGELOG.md` dangling reference: now `[versioning policy](docs/VERSIONING.md)` (the "added in M1-E3" marker removed).
- **Validated:** all sections present; `added in M1-E3` → 0 matches; lint/build exit 0.
- ✅ **M1-E3 complete (local).** No push/merge (release-only-`main`).

---

### 🏁 M1 milestone (Licensing & Changelog) COMPLETE

All three epics done on the integration branch: **M1-E1** (MIT LICENSE) · **M1-E2** (CHANGELOG backfill) · **M1-E3** (versioning policy). `LICENSE` ships in the tarball, `CHANGELOG.md` + `docs/VERSIONING.md` are in place, and the `1.2.0` version rationale is corrected and documented. Gates green.
