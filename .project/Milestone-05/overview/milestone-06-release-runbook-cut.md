# Milestone 6 — Release Runbook & Cut (M5)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a*
> **Status:** 📋 Planned — ready for `/breakout-epics`
> **Prod/impact:** **High** — the milestone that **merges to `main` and publishes `v1.2.0`** (irreversible)
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-28
> **Branch:** integration branch `chore/m0-repo-hygiene-baseline` — **M5 is where this branch finally merges to `main`** (per plan principle #9)
> **Epic breakouts:** [M5-E1 `e1-release-runbook`](../Epic-01/overview/e1-release-runbook.md) · [M5-E2 `e2-release-dry-run`](../Epic-02/overview/e2-release-dry-run.md) · [M5-E3 `e3-cut-v1.2.0`](../Epic-03/overview/e3-cut-v1.2.0.md)

---

## 1. Why this milestone exists

Everything is now publish-ready: clean repo (M0), LICENSE/CHANGELOG/policy (M1), correct packaging + `exports` + verified tarball (M2), accurate docs (M3), and CI/release workflows (M4). M5 turns that into an actual, repeatable release: it documents the process (the requested **`notes/RELEASE_RUNBOOK.md`**), **rehearses** it safely, then **cuts `v1.2.0`** — the terminal step of the whole productization effort. It's the last node on the critical path and the only milestone that touches `main` and npm.

## 2. Goal & exit criteria

**Goal:** A trustworthy, rehearsed release runbook, then a clean `v1.2.0` published to npm with provenance, with the consuming monorepo verified against it.

**Exit criteria:**

- [ ] `notes/RELEASE_RUNBOOK.md` exists and is complete: preflight → version bump → changelog finalize → build → pack audit → merge → tag/push → pipeline/npm verification → **rollback/deprecate** → post-release monorepo check.
- [ ] A **dry-run rehearsal** passes (local `npm publish --dry-run`, pack audit, monorepo build against a packed prerelease).
- [ ] **Owner (M5-E3, gated on M4-E3):** `v1.2.0` finalized (version bumped, CHANGELOG dated), integration branch merged to `main`, `v1.2.0` tag pushed → release workflow publishes with provenance.
- [ ] `v1.2.0` is **live on npm** (`@diamondslab/hardhat-diamonds`), installable clean, with a provenance attestation; the monorepo builds against it.

## 3. Scope

**In scope:**
- `notes/RELEASE_RUNBOOK.md` (the process doc).
- Dry-run rehearsal (local, non-publishing).
- The `v1.2.0` cut: version bump, CHANGELOG finalize, merge to `main`, tag/push, publish, verification.

**Out of scope (deferred):**
- Future releases beyond `v1.2.0` (the runbook makes them repeatable).
- Changesets/automated version tooling.
- The M4-E3 owner provisioning itself (a prerequisite, tracked in M4).
- Post-`v1.2.0` follow-ups (the `yarn.lock` for reproducible CI, a future `v2` API redesign).

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** | Author the runbook (E1); run the **local, non-publishing** dry-run (E2 parts); prepare the version bump/changelog/merge PR (up to the publish gate). |
| **Owner** | **OP-1 (blocking, M5-E3):** confirm M4-E3 is done (secrets/protection); approve the merge to `main`; **push the `v1.2.0` tag** (triggers the irreversible publish); confirm the npm result. The agent prepares everything and **stops at the publish gate**. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M5-E1 | `release-runbook` | Eng | Med | [e1-release-runbook](../Epic-01/overview/e1-release-runbook.md) |
| M5-E2 | `release-dry-run` | Eng (+ Owner for CI) | Med | [e2-release-dry-run](../Epic-02/overview/e2-release-dry-run.md) |
| M5-E3 | `cut-v1.2.0` | **Owner** (publish gate) | High (irreversible) | [e3-cut-v1.2.0](../Epic-03/overview/e3-cut-v1.2.0.md) |

### M5-E1 — `release-runbook` *(the requested deliverable — do first; fully Eng-doable)*
Author `notes/RELEASE_RUNBOOK.md` (the location requested; `notes/` was un-ignored in M0). Steps: preflight checklist (green CI, clean tree, M4-E3 secrets confirmed); bump `package.json` to `1.2.0` per `docs/VERSIONING.md`; finalize `CHANGELOG.md` (`[Unreleased]` → `[1.2.0] - <date>`); `yarn build`; `npm pack --dry-run` audit (expect 39 files / 174.6 kB; LICENSE/CHANGELOG/VERSIONING present, no TESTING/src); merge the integration branch to `main`; `git tag v1.2.0 && git push --tags` → `release.yml` publishes with provenance; verify on npm (version + provenance badge); **rollback/recovery** (npm forbids re-publish → patch `1.2.1` + `npm deprecate` the bad version; dist-tag fixes); post-release: update/verify the consuming monorepo. Acceptance: complete, accurate, self-contained.

### M5-E2 — `release-dry-run`
Rehearse the runbook **without publishing**: `npm publish --dry-run`, `npm pack` + install-test (already proven in M2-E3 — re-confirm at release state), build the consuming monorepo against the packed prerelease. The **full CI rehearsal** (workflows actually running) requires the workflows merged + M4-E3 secrets → owner-side. Acceptance: local dry-run is green; any owner-side rehearsal noted.

### M5-E3 — `cut-v1.2.0` *(OWNER-gated, irreversible)*
The real release: finalize version/changelog, merge to `main`, push the `v1.2.0` tag (publishes), verify on npm, update monorepo consumers. **Publishing is irreversible** and **gated on M4-E3**; the agent prepares the bump/changelog/merge but **stops before the tag push / publish** for owner approval. Acceptance: `v1.2.0` live + verified.

## 6. Dependencies & sequencing

- **Upstream:** M0–M3 (done) + **M4** (workflows authored; **M4-E3 owner secrets are a hard prerequisite for M5-E3**).
- **Internal order:** **E1 → E2 → E3.** Runbook first; dry-run validates it; the cut executes it.
- **Owner gates:** M4-E3 (secrets) **and** M5-E3 (merge approval + tag push). Both blocking; agent stops at them.
- **Downstream:** none — this is the terminal milestone. The consuming monorepo updates to the published `v1.2.0`.

## 7. Rollback posture

- **Runbook + dry-run (E1/E2):** pure docs / non-publishing — `git revert`.
- **The cut (E3):** **pre-tag** — abort by not pushing the tag (nothing published). **Post-publish (irreversible)** — npm forbids re-publishing a version; recover **forward** with `1.2.1` and `npm deprecate @diamondslab/hardhat-diamonds@1.2.0`, and/or move the `latest` dist-tag. The merge to `main` is revertible via a follow-up commit. **All of this is documented in the runbook itself.**

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Publishing a broken `v1.2.0` (irreversible) | Dry-run rehearsal (E2) + the M2-E3 verified tarball + green CI gate; owner approves before the tag push. |
| M4-E3 not done → publish fails / no provenance | M5-E3 preflight explicitly checks M4-E3; the agent stops if secrets aren't confirmed. |
| Wrong version/changelog date | Runbook bakes in the bump + `[Unreleased]`→`[1.2.0] - <date>` step; verified in the dry-run. |
| Merge to `main` breaks the consuming monorepo | Post-merge build check of the monorepo (already green against the branch via M2-E2); revert the merge if needed. |
| `npm publish` re-run/duplication | Tag-only workflow + single tag push; runbook documents the no-re-publish rule. |

## 9. Definition of Done for Milestone 6 (M5)

- [ ] `notes/RELEASE_RUNBOOK.md` complete and rehearsed.
- [ ] Dry-run (local, non-publishing) green.
- [ ] **Owner:** M4-E3 confirmed; integration branch merged to `main`; `v1.2.0` tag pushed.
- [ ] `v1.2.0` live on npm with provenance; clean install works; monorepo builds against it.
- [ ] ➡️ Project COMPLETE — the package is productized and released.

➡️ **Next:** run **`/df3ndr:breakout-epics`** on M5 to expand E1/E2/E3.
