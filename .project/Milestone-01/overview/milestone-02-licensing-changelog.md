# Milestone 2 — Licensing & Changelog (M1)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a*
> **Status:** ✅ COMPLETE (2026-06-28) — all 3 epics done on the integration branch
> **Prod/impact:** Low risk · adds legal + historical record-keeping · no runtime/code change
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-27
> **Branch:** lands on the integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main` policy, plan principle #9)
> **Epic breakouts:** [M1-E1 `e1-license-mit`](../Epic-01/overview/e1-license-mit.md) · [M1-E2 `e2-changelog-backfill`](../Epic-02/overview/e2-changelog-backfill.md) · [M1-E3 `e3-versioning-policy`](../Epic-03/overview/e3-versioning-policy.md)

---

## 1. Why this milestone exists

A package that declares `"license": "MIT"` but ships **no `LICENSE` file** (confirmed in [M0-E2 baseline](../Milestone-00/baseline-inventory.md) — it is listed in `package.json: files` but absent on disk, so it is silently omitted from the tarball) is legally ambiguous and unprofessional. There is also **no `CHANGELOG`**, and the git history has inconsistent release commits (`v1.0.11` was even tagged *after* `v1.1.7`). Before publishing `v1.2.0`, the package needs: a real LICENSE, a trustworthy change history, and a written versioning policy so future releases are mechanical. These are the cheapest, lowest-risk professionalization wins and they underpin the M5 release story.

This milestone sits early on the critical path: it runs in parallel with M3 (docs) off the now-complete M0 foundation, and feeds M5 (the release narrative).

## 2. Goal & exit criteria

**Goal:** Establish legal clarity (LICENSE), a traceable change history (CHANGELOG), and an explicit versioning policy — all consistent with the canonical **DiamondsLab / `@diamondslab`** identity and the **`1.2.0`** target.

**Exit criteria:**

- [ ] A root `LICENSE` (MIT) exists, names the confirmed DiamondsLab copyright holder + year, and **appears in the `yarn pack` tarball**.
- [ ] `CHANGELOG.md` (Keep a Changelog format) exists with a backfilled history (`v1.0.11 → v1.1.15`) and a seeded `[Unreleased]` / `[1.2.0]` section.
- [ ] The `[Unreleased]` section documents the **true** post-`v1.1.15` deltas: the fork-upgrade signer fix and the **M2-E4 `signer` type widening** (`SignerWithAddress` → `Signer`). *(Corrected M1-E2: `loadDiamondContract`, the peer-dep export, and the circular-dep fix were already released in `v1.1.12`–`v1.1.15` and are backfilled into those sections, not `[Unreleased]`.)*
- [ ] A SemVer + Conventional Commits policy is documented (CONTRIBUTING-level), matching the convention already used on this branch.
- [ ] No code/runtime behavior changes; `yarn build`/`yarn test`/`yarn lint` remain green.

## 3. Scope

**In scope:**
- Root `LICENSE` file (MIT).
- Root `CHANGELOG.md` (Keep a Changelog).
- A versioning/commit policy doc (a `CONTRIBUTING.md` section or short standalone policy).
- Confirming `LICENSE` ships in the tarball (verify `files` whitelist already lists it).

**Out of scope (deferred):**
- Full `CONTRIBUTING.md` community guide (PR flow, code of conduct) → **M3-E2**.
- `package.json` metadata fixes (`author`, `engines`, `publishConfig`, repository casing) → **M2-E1**.
- Actually **bumping** the version to `1.2.0` and tagging → **M5** (this milestone only seeds the changelog section).
- commitlint/Husky wiring/enforcement → noted for **M4** (CI), not built here.
- README edits → **M3-E1**.

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** | Author LICENSE/CHANGELOG/policy docs; backfill history from tags + git log; verify tarball + green gates. |
| **Owner** | **OP-1 (blocking, M1-E1):** confirm the exact MIT copyright holder string — legal entity name (e.g. "DiamondsLab" vs a registered company/individual) and year range. The LICENSE cannot be finalized without it. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M1-E1 | `license-mit` | Eng + Owner (confirm) | Low | [e1-license-mit](../Epic-01/overview/e1-license-mit.md) |
| M1-E2 | `changelog-backfill` | Eng | Low | [e2-changelog-backfill](../Epic-02/overview/e2-changelog-backfill.md) |
| M1-E3 | `versioning-policy` | Eng | Low | [e3-versioning-policy](../Epic-03/overview/e3-versioning-policy.md) |

### M1-E1 — `license-mit`
Add a root `LICENSE` with the standard MIT text, the confirmed DiamondsLab copyright line (year `2025–2026`), matching `package.json: "license": "MIT"`. Verify it lands in the tarball (the `files` whitelist already lists `LICENSE`; M0-E2 showed it was missing only because the file didn't exist). **Owner gate OP-1:** confirm the exact copyright holder string. Acceptance: file present, MIT SPDX-correct, in `yarn pack` output.

### M1-E2 — `changelog-backfill`
Create `CHANGELOG.md` in Keep a Changelog format. Backfill released versions `v1.0.11 → v1.1.15` from git tags/log (summarize older patches; detail recent ones), noting the inconsistent historical tagging. Seed `[Unreleased]`/`[1.2.0]` with the user-facing changes known so far (new `loadDiamondContract`, `LocalDiamondDeployer` export + circular-dep fix, M2-E4 `signer` type widening). Later milestones (M2/M3) append to `[Unreleased]`. Acceptance: valid Keep-a-Changelog structure, SemVer headings, links/dates where derivable.

### M1-E3 — `versioning-policy`
Document the adopted policy: **SemVer** (with the `1.2.0` minor rationale — new public export) + **Conventional Commits** (already in use on this branch) + Keep a Changelog. Keep it short (a `CONTRIBUTING.md` "Versioning & Commits" section or a standalone `docs/VERSIONING.md`). Note commitlint enforcement is wired in **M4**, not here. Acceptance: a committed policy doc referenced by the CHANGELOG and the M5 runbook.

## 6. Dependencies & sequencing

- **Upstream:** M0 (complete) — clean repo + baseline inventory (tag/version facts feed M1-E2).
- **Internal:** the three epics are largely independent and can be done in any order; M1-E3 (policy) should be settled before/with M1-E2 so the changelog format matches the stated policy. M1-E1 is gated on **OP-1** (owner confirms copyright entity) but the rest of M1 proceeds without it.
- **Parallelism:** M1 ∥ M3 (both docs/legal, off M0).
- **Downstream:** M5 (release runbook + the actual `1.2.0` cut consumes the CHANGELOG `[1.2.0]` section and the versioning policy); M2-E3 (tarball verification) checks the LICENSE is shipped.

## 7. Rollback posture

Pure additive documentation on the integration branch — `git revert` the M1 commits removes the LICENSE/CHANGELOG/policy with zero runtime impact. Nothing is published or merged to `main` (principle #9), so rollback is trivial.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Wrong/ambiguous MIT copyright entity | OP-1 owner confirmation before M1-E1 is finalized; use `DiamondsLab` as placeholder only until confirmed. |
| Changelog backfill misstates history (messy tags) | Derive strictly from `git tag`/`git log`; mark uncertain older entries as summarized, not invented. |
| `[1.2.0]` section drifts as M2/M3 add changes | Treat `[Unreleased]` as the live accumulator; M5 finalizes/renames it to `[1.2.0]` at cut time. |
| Versioning policy contradicts existing commit style | Policy documents the convention **already used** on this branch (Conventional Commits), so no retrofit needed. |

## 9. Definition of Done for Milestone 2 (M1) — ✅ COMPLETE (2026-06-28)

- [x] All §2 exit criteria checked (with the M1-E2 version-rationale correction).
- [x] `LICENSE`, `CHANGELOG.md`, and `docs/VERSIONING.md` committed on the integration branch.
- [x] `npm pack` shows `LICENSE` in the tarball (42 files; was 41).
- [x] Green gates unchanged (lint/build exit 0; tests 120 passing).
- [x] OP-1 resolved — copyright holder `DiamondsLab` ("for now"; revisit if a legal entity is registered).

➡️ **Next:** run **`/df3ndr:create-prd`** per epic (start with `e1-license-mit.md`).
