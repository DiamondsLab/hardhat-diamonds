# Changelog — M5-E2 Release Dry-Run

Branch: `chore/m0-repo-hygiene-baseline`. Executed directly (streamlined verification epic — no separate PRD/task-list ceremony).

## [Unreleased]

### M5-E2 — Release dry-run rehearsal (2026-06-28)

- Rehearsed the runbook's publish path **without publishing**: staged a `1.2.0` bump (uncommitted), ran `yarn build`, `npm pack --dry-run` (**39 files**, version `1.2.0`), and `npm publish --dry-run` → **exit 0** (lifecycle `prepublishOnly`+`prepack` fired → fresh `dist`; `diamondslab-hardhat-diamonds-1.2.0.tgz`; no upload). Reverted the bump to `1.1.15`; tree clean.
- Confirms the package publishes cleanly as `@diamondslab/hardhat-diamonds@1.2.0` and the runbook §3/§6 steps are accurate. (Earlier M2-E3 install-test already validated the installed tarball + entry points; the consuming monorepo build was validated in M2-E2 via `yarn compile`.)
- **Owner-side / pending M4-E3:** the *full CI rehearsal* (actually running `ci.yml`/`release.yml`) needs the workflows merged + the npm secret/OIDC — deferred to the owner.
- ✅ **M5-E2 local rehearsal complete.** Next: M5-E3 (owner-gated `v1.2.0` cut).
