# Epic 1 — Release Runbook (M5-E1)

> **Parent milestone:** [Milestone 6 — Release Runbook & Cut (M5)](../../overview/milestone-06-release-runbook-cut.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med (process doc; no live action) · **Estimated effort:** M (~2–3h) · **Status:** 📋 Ready for `/create-prd` · **Priority:** ⭐ the originally-requested deliverable

---

## 2. Objective

Author `notes/RELEASE_RUNBOOK.md` — the requested step-by-step release procedure (the `notes/` dir was un-ignored in M0). It must let any maintainer cut a release without re-deriving the process, and it documents the irreversible-publish safeguards and recovery.

## 3. Acceptance criteria

- [ ] `notes/RELEASE_RUNBOOK.md` exists and is self-contained.
- [ ] **Preflight:** clean tree, green CI, M4-E3 secrets confirmed, integration branch up to date.
- [ ] **Version bump:** `package.json` → the target version per `docs/VERSIONING.md` (`1.2.0` for this release).
- [ ] **Changelog finalize:** `[Unreleased]` → `[x.y.z] - YYYY-MM-DD`, new empty `[Unreleased]`.
- [ ] **Build + pack audit:** `yarn build`; `npm pack --dry-run` matches the expected manifest (≈39 files / 174.6 kB; dist + LICENSE + README + CHANGELOG + VERSIONING; no TESTING/src).
- [ ] **Merge + tag:** merge the integration branch to `main`; `git tag vX.Y.Z && git push --tags` → `release.yml` publishes with provenance.
- [ ] **Verify:** version live on npm; provenance attestation present; clean install resolves entry points.
- [ ] **Rollback/recovery:** npm no-re-publish rule → forward fix (`x.y.z+1` + `npm deprecate`), dist-tag correction.
- [ ] **Post-release:** update/verify the consuming monorepo against the published version.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Draft the runbook skeleton (Preflight → Bump → Changelog → Build/Pack → Merge → Tag/Publish → Verify → Rollback → Post-release) | Eng | sections present |
| 2 | Fill concrete commands referencing the real setup (`yarn build`, `npm pack --dry-run`, `release.yml`, `npm deprecate`) | Eng | commands accurate |
| 3 | Document the **owner gates** inline (M4-E3 secrets; approve merge; push tag) | Eng | gates explicit |
| 4 | Document the irreversible-publish recovery (forward patch + deprecate + dist-tag) | Eng | recovery section complete |
| 5 | Cross-link `docs/VERSIONING.md`, `CHANGELOG.md`, the M2-E3 manifest, the workflows | Eng | links resolve |

## 5. Dependencies & owner gates

- **Upstream:** M1 (VERSIONING/CHANGELOG), M2 (pack manifest), M4 (workflows) — all done/authored.
- **Owner gates:** none to *author* the runbook; it *documents* the M4-E3 + M5-E3 owner gates.
- **Downstream:** M5-E2 (rehearses this runbook), M5-E3 (executes it).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Runbook drifts from the real setup | Reference actual scripts/workflows/manifest; validate in the M5-E2 dry-run. |
| Missing the rollback path | Dedicated recovery section (npm forbids re-publish → forward fix). |
| Ambiguous owner vs agent steps | Mark each step's actor; the publish/tag steps are clearly owner-gated. |

## 7. Notes

- Reversible: a single doc in `notes/`; `git revert`.
- `notes/` is tracked (un-ignored in M0) — the runbook is committable.
- Stays untouched: no version bump / publish here (that's E3); the runbook only *describes* them.
