# Milestone 4 — Docs & README Audit (M3)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M3](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a*
> **Status:** 📋 Planned — ready for `/breakout-epics`
> **Prod/impact:** Low risk · outward-facing docs only · no runtime/code change
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-28
> **Branch:** integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)
> **Epic breakouts:** [M3-E1 `e1-readme-correctness`](../Epic-01/overview/e1-readme-correctness.md) · [M3-E2 `e2-community-docs`](../Epic-02/overview/e2-community-docs.md)

---

## 1. Why this milestone exists

The README — the package's front door — is **factually wrong** in ways that break the first-run experience and misrepresent the project's identity:

- The **install command is unscoped** (`npm install --save-dev hardhat-diamonds diamonds`, README:31/37) — it installs the wrong (or non-existent) packages. The real names are `@diamondslab/hardhat-diamonds` + `@diamondslab/diamonds`.
- The **npm badge** points at `badge.fury.io/js/hardhat-diamonds` (README:3) — wrong package.
- **`import "hardhat-diamonds"`** appears throughout (README:45/56/398) — should be scoped.
- **GeniusVentures** links remain (README:14/566/585) despite DiamondsLab being canonical.
- **Prerequisites/Dev-Dependencies are stale** (Node ≥14, TS ≥4.0; README:528/529/560) vs reality (Node ≥18, TS 5.x, Hardhat ^2.26).
- The **Project Structure** section is stale (omits `src/lib`, `src/tasks`, `src/interfaces`).

It also doesn't reflect M1/M2 work: the new **`./utils` / `./lib` `exports` entry points** (M2-E2), the **`signer` type widening** (M2-E4), or the **`docs/VERSIONING.md`** policy (M1-E3). The package is now technically publish-ready (M0–M2); this milestone makes its documentation honest before release. It runs in parallel with the release prep and feeds M5.

## 2. Goal & exit criteria

**Goal:** Make every outward-facing doc accurate to the **DiamondsLab / `@diamondslab`** reality and the current API surface, and add the community/governance docs expected of a professional package.

**Exit criteria:**

- [ ] README has **zero** incorrect package names, badges, peer-dep names, or org links; install + usage snippets work **verbatim** against the current package.
- [ ] README Prerequisites / Project Structure / Dev Dependencies reflect reality (Node ≥18, TS 5.x, Hardhat ^2.26, real `src/` layout).
- [ ] README documents the entry points incl. the new `./utils` / `./lib` aliases, and notes the `LocalDiamondDeployerConfig.signer: Signer` type; links `docs/VERSIONING.md`.
- [ ] `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and issue/PR templates exist (under `.github/` where appropriate).
- [ ] `docs/TESTING*.md` references reconciled with the README (no dangling/duplicate guidance).
- [ ] No code/runtime change; gates stay green.

## 3. Scope

**In scope:**
- `README.md` correctness + freshness + new entry-point/`signer` documentation.
- `CONTRIBUTING.md` (linking the M1-E3 versioning policy), `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- `.github/` issue + PR templates.
- Reconciling `docs/TESTING*.md` references.

**Out of scope (deferred):**
- `package.json` metadata/links (done in M2-E1) — README just matches them.
- CI workflows / commitlint enforcement → **M4**.
- The actual release / version bump → **M5**.
- Shipping `CONTRIBUTING`/`SECURITY` in the npm tarball — they stay repo-side (the M2-E3 `files` whitelist ships only README/LICENSE/CHANGELOG/VERSIONING); revisit only if desired.

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** | All of M3 — README rewrite/audit, community docs, template authoring, gate checks. |
| **Owner** | **None blocking.** Optional: confirm `SECURITY.md` contact (a security email/handle); default to GitHub private vulnerability reporting + the issues URL if none provided. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M3-E1 | `readme-correctness` | Eng | Low | [e1-readme-correctness](../Epic-01/overview/e1-readme-correctness.md) |
| M3-E2 | `community-docs` | Eng | Low | [e2-community-docs](../Epic-02/overview/e2-community-docs.md) |

### M3-E1 — `readme-correctness` *(do first — the explicit deliverable)*
Audit and fix `README.md`: scope the install/import names (`@diamondslab/hardhat-diamonds` + `@diamondslab/diamonds`); fix the npm badge; replace all GeniusVentures links with DiamondsLab; refresh Prerequisites (Node ≥18, TS 5.x, Hardhat ^2.26), Project Structure (real `src/` tree), and Dev Dependencies; add the new `./utils` / `./lib` entry points and note `LocalDiamondDeployerConfig.signer: Signer`; link `docs/VERSIONING.md` + `CHANGELOG.md`. Acceptance: zero wrong names/links; snippets valid; a link/anchor check passes. Known references to fix: README lines 3, 14, 31, 37, 45, 56, 398, 528, 529, 560, 566, 585 (and any others found in a full pass).

### M3-E2 — `community-docs`
Add `CONTRIBUTING.md` (contribution flow + link to `docs/VERSIONING.md` / Conventional Commits), `SECURITY.md` (reporting policy), `CODE_OF_CONDUCT.md` (e.g. Contributor Covenant), and `.github/` issue + PR templates. Reconcile `docs/TESTING.md` / `TESTING_SUMMARY.md` references so the README points to them correctly (and note they're repo-only, not shipped). Acceptance: all files present, internally linked, no broken references; owner-contact placeholder resolved or defaulted.

## 6. Dependencies & sequencing

- **Upstream:** M1 (LICENSE/CHANGELOG/VERSIONING to link) + M2 (final names, `exports` entry points, `signer` type) — all complete, so README can state final facts.
- **Internal order:** **E1 → E2** (README first; `CONTRIBUTING` then links the README/policy). They're largely independent and low-risk; can overlap.
- **Owner gates:** none blocking (optional SECURITY contact).
- **Downstream:** M5 (release notes/runbook reference the README + community docs); a professional README supports the public `v1.2.0`.

## 7. Rollback posture

Pure additive/edited documentation on the integration branch — `git revert` the M3 commits restores prior docs with zero runtime impact. Nothing published or merged to `main`.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| A "fixed" snippet still doesn't work (e.g. wrong import path) | Validate key snippets against the actual package (resolve the import paths; cross-check with M2-E2 entry points). |
| Missed inaccuracies in a large README | Do a full top-to-bottom pass + a grep sweep for `hardhat-diamonds` (unscoped), `GeniusVentures`, `diamonds]` links, version numbers. |
| `SECURITY.md` lacks a real contact | Default to GitHub private vulnerability reporting + issues URL; flag for Owner. |
| Community docs duplicate the versioning policy (M1-E3) | `CONTRIBUTING.md` **links** `docs/VERSIONING.md` rather than restating it. |

## 9. Definition of Done for Milestone 4 (M3)

- [ ] All §2 exit criteria checked.
- [ ] README accurate + fresh; community docs + templates present and linked.
- [ ] Grep sweep clean (no unscoped `hardhat-diamonds`, no `GeniusVentures`, no stale versions).
- [ ] Gates green (lint/build/test); nothing merged to `main`.

➡️ **Next:** run **`/df3ndr:breakout-epics`** on M3 to expand E1 and E2.
