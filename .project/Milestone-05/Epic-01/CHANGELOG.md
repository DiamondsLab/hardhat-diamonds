# Changelog — M5-E1 Release Runbook

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M5-E1 — Add release runbook (2026-06-28)

- Added `notes/RELEASE_RUNBOOK.md` (the originally-requested deliverable; `notes/` was un-ignored in M0).
- Sections: Preflight (clean/CI/M4-E3 secrets/dry-run) → Version bump (manual, not `npm version`) → Changelog finalize → Build + pack audit (≈39 files/174.6kB) → Merge to `main` + Tag/publish → Verify (npm + provenance + clean install) → Dry-run rehearsal → Rollback/recovery (no-re-publish → `npm deprecate` + patch + dist-tag) → Post-release monorepo check.
- Every step labelled by actor; **6 `[Owner]`** gates marked (M4-E3 secrets, approve merge, push tag — the irreversible publish).
- **Validated:** all sections present; owner gates + rollback + tag-only publish documented; links to VERSIONING/CHANGELOG/workflows resolve; only `notes/RELEASE_RUNBOOK.md` added.
- ✅ **M5-E1 complete (local).** No push/merge. Next: M5-E2 (dry-run rehearsal), then M5-E3 (owner-gated cut).
