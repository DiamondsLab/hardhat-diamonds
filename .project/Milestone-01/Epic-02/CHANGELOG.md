# Changelog — M1-E2 Changelog Backfill

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M1-E2 — Add root CHANGELOG.md (2026-06-28)

- Added root `CHANGELOG.md` (Keep a Changelog + SemVer), backfilled `v1.1.0 → v1.1.15` from git tags/log, with compare/release links and a note on the inconsistent historical tagging (`v1.0.11` tagged after `v1.1.7`; skipped patch numbers).
- `[Unreleased]` seeded with the **true** post-`v1.1.15` deltas: fork-upgrade signer fix (`c9e2e07`) + the M2-E4 `signer` type widening. Versioning-policy link marked "(added in M1-E3)".
- **Validated:** structure/attribution checks pass; `loadDiamondContract` correctly placed in `[1.1.15]`; no `1.2.0` date; lint/build exit 0.

### ⚠️ Finding & upward correction (version rationale)

- Git history revealed `loadDiamondContract`/`LoadDiamondArtifact` shipped **in `v1.1.14`/`v1.1.15`**, and the `LocalDiamondDeployer` peer-dep export + circular-dep fix **in `v1.1.12`** — all **already released**, contradicting the "new export justifies `1.2.0` minor" premise in the plan/baseline/M1 docs.
- **Deviation from PRD Req 3:** those items were placed in their real released sections, not `[Unreleased]`.
- **Corrected upward** in: project-plan header, baseline-inventory §4, M1 milestone-overview exit criteria. The `1.2.0` minor now rests on the **M2 `exports` map + M2-E4 `signer` type change**; post-`v1.1.15` code alone is fix-level. **Final version is an M5 decision.**

✅ **M1-E2 complete (local).** No push/merge (release-only-`main`).
