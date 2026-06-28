# Epic 1 — Release Runbook (M5-E1)

> **Parent milestone:** [Milestone 6 — Release Runbook & Cut (M5)](../../overview/milestone-06-release-runbook-cut.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med (process doc; no live action) · **Estimated effort:** M (~2–3h) · **Status:** 📋 Ready for `/create-prd` · **Priority:** ⭐ the originally-requested deliverable

---

## 2. Objective

Author `notes/RELEASE_RUNBOOK.md` — the requested step-by-step release procedure (the `notes/` dir was un-ignored in M0). It must let any maintainer cut a release without re-deriving the process, and it documents the irreversible-publish safeguards and recovery.

## 3. Acceptance criteria

- [x] `notes/RELEASE_RUNBOOK.md` exists and is self-contained.
- [x] **Preflight** (§0): clean tree, green CI, M4-E3 secrets confirmed, dry-run green.
- [x] **Version bump** (§1): manual `npm pkg set version` → target per `docs/VERSIONING.md`.
- [x] **Changelog finalize** (§2): `[Unreleased]` → `[x.y.z] - YYYY-MM-DD` + new empty `[Unreleased]`.
- [x] **Build + pack audit** (§3): `yarn build` + `npm pack --dry-run` ≈39 files / 174.6 kB with the includes/excludes.
- [x] **Merge + tag** (§4): merge to `main` [Owner]; `git tag vX.Y.Z && git push origin vX.Y.Z` → `release.yml` provenance publish.
- [x] **Verify** (§5): `npm view …version`; provenance badge; clean install resolves entry points.
- [x] **Rollback/recovery** (§7): no-re-publish → `npm deprecate` + patch + dist-tag.
- [x] **Post-release** (§8): update/verify the consuming monorepo. *(Plus a Dry-run §6.)*

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
