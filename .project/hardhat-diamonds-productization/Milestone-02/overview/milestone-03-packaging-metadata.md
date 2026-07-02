# Milestone 3 — Packaging & Metadata (M2)

> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2](../../hardhat-diamonds-productization-project-plan.md) · architecture phase: *n/a*
> **Status:** ✅ COMPLETE (2026-06-28) — all 4 epics done (E1 metadata, E2 exports, E3 tarball, E4 build fix)
> **Prod/impact:** Medium · touches the **publish surface** (`package.json`, `exports`, tarball) — must not break existing `/dist/utils` & `/dist/lib` consumers
> **Author:** Am0rfu5 (DiamondsLab) · **Date:** 2026-06-28
> **Branch:** integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)
> **Epic breakouts:** [M2-E1 `e1-package-json-metadata`](../Epic-01/overview/e1-package-json-metadata.md) · [M2-E2 `e2-exports-entrypoints`](../Epic-02/overview/e2-exports-entrypoints.md) · [M2-E3 `e3-tarball-verification`](../Epic-03/overview/e3-tarball-verification.md) · [M2-E4 `e4-fix-tsc-build` ✅ DONE](../Epic-04/overview/e4-fix-tsc-build.md)

---

## 1. Why this milestone exists

The package can now build, lint, and test cleanly (M0 + M2-E4), and it has a LICENSE, CHANGELOG, and versioning policy (M1). But its **publish surface is still unprofessional and partly broken**:

- `package.json` has a non-standard `authors` array (no `author`), **no `engines`**, **no `publishConfig`** (a scoped `@diamondslab` package needs `access: public` to publish), a string `repository` with wrong-case `diamondslab`, lowercase `bugs` URL, and **no `homepage`**.
- There is **no `exports` map** — the three real entry points (`.`, `./dist/utils`, `./dist/lib`) work only by raw `dist/*` path access, which is fragile and undocumented as a contract.
- The tarball ships **internal testing docs** (`docs/TESTING*.md`) to consumers, and the package maintains **both** `.npmignore` and a `files` whitelist (redundant, conflict-prone).

This milestone makes the published artifact correct and the entry points formal — the prerequisite for the M4 automated publish and the M5 `v1.2.0` cut. The **`exports` map (M2-E2) is itself part of the `1.2.0` minor-bump rationale** (new supported entry points). It sits on the critical path: `M0 → M2 → M4 → M5`.

## 2. Goal & exit criteria

**Goal:** Make `package.json` metadata correct and standards-compliant, formalize the public entry points via an `exports` map **without breaking** existing `/dist/utils` and `/dist/lib` imports, and produce a verified, clean publishable tarball.

**Exit criteria:**

- [ ] `package.json` has: `author` (not `authors`), `engines` (node/yarn), `publishConfig` (`access: public` + provenance-ready), object-form `repository` with correct **DiamondsLab** casing + `directory`, corrected `bugs`, and a `homepage`.
- [ ] An `exports` map exposes `.`, and preserves `./dist/utils` + `./dist/lib` (back-compat) — optionally adding cleaner `./utils` / `./lib` aliases — with types resolving under `NodeNext`.
- [ ] `npm pack` tarball is audited: includes `dist/` + `README.md` + `LICENSE` + intended docs; **excludes** internal/test cruft; `.npmignore`-vs-`files` strategy reconciled to one.
- [ ] The **consuming monorepo still builds** (`yarn workspace:build`, `yarn compile`) against the changed package; a clean install-test of the packed tarball succeeds.
- [ ] `yarn build` / `yarn test` / `yarn lint` stay green. **(M2-E4 ✅ already satisfied this.)**

## 3. Scope

**In scope:**
- `package.json` metadata fields (`author`, `engines`, `publishConfig`, `repository`, `bugs`, `homepage`, keywords sanity).
- The `exports` map + entry-point verification (with `/dist/*` back-compat).
- `.npmignore` / `files` reconciliation + tarball content audit + clean-install test.
- The already-completed `tsc` build fix (**M2-E4**).

**Out of scope (deferred):**
- The actual `npm publish` / registry tokens / provenance OIDC → **M4/M5** (M2 only sets `publishConfig` metadata).
- CI workflows → **M4**.
- README / community docs → **M3**.
- Version bump / tag → **M5**.
- Full public-API redesign / deprecations → a future `v2` (per the plan's architecture-doc deferral).

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Eng** | All of M2 — metadata edits, `exports` map, tarball audit, consumer build/install verification. |
| **Owner** | **None blocking.** `publishConfig.access: public` is metadata Eng writes; the actual publish credential/OIDC is an M4-E3 owner gate, not here. Optional: confirm the `engines` Node floor (default: `>=18`, matching the devcontainer). |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M2-E1 | `package-json-metadata` | Eng | Med | [e1-package-json-metadata](../Epic-01/overview/e1-package-json-metadata.md) |
| M2-E2 | `exports-entrypoints` | Eng | Med | [e2-exports-entrypoints](../Epic-02/overview/e2-exports-entrypoints.md) |
| M2-E3 | `tarball-verification` | Eng | Med | [e3-tarball-verification](../Epic-03/overview/e3-tarball-verification.md) |
| M2-E4 ✅ | `fix-tsc-build` (DONE) | Eng | High | [e4-fix-tsc-build](../Epic-04/overview/e4-fix-tsc-build.md) |

### M2-E1 — `package-json-metadata` *(top priority — foundational, low-risk)*
Fix the metadata: replace `authors:["Am0rfu5"]` with `author`; add `engines` (`node >=18`, `yarn >=4`); add `publishConfig` (`access: public`, provenance-ready); convert `repository` to object form (`type: git`, correct **DiamondsLab** URL, `directory`); fix the lowercase `bugs` URL; add `homepage`. Verify-and-keep `prepublishOnly`/lifecycle uses the right manager (note: `prepublishOnly: "npm run build"` — confirm acceptable or switch to `prepack`). Acceptance: `npm pkg get` shows all fields correct; `yarn`/`npm` still resolve; no behavior change. **Lowest risk; prerequisite for publish — do first.**

### M2-E2 — `exports-entrypoints`
Add an `exports` map: `"."` → `dist/index.js`/`.d.ts`; **preserve** `"./dist/utils"` and `"./dist/lib"` (the README + monorepo `CLAUDE.md` mandate these — see [baseline §2/§6](../Milestone-00/baseline-inventory.md)); optionally add `"./utils"`/`"./lib"` aliases. Critical risk: adding `exports` *restricts* subpath access, so any path not declared breaks — declare `./dist/*` for back-compat. Verify types resolve under `NodeNext` and the consuming monorepo still imports `LocalDiamondDeployer` from `/dist/utils`. Acceptance: install-test resolves all three entry points + types; monorepo builds.

### M2-E3 — `tarball-verification`
Reconcile `.npmignore` vs the `files` whitelist (pick **one** — recommend `files`); ensure the tarball includes `dist/` + `README.md` + `LICENSE` + `CHANGELOG.md` + intended docs (`VERSIONING.md`) and **excludes** internal `docs/TESTING*.md` and any cruft; `npm pack` then install the tarball into a throwaway consumer to confirm it works. Acceptance: audited file list matches intent; clean-install consumer imports succeed. **Runs last — verifies E1+E2.**

### M2-E4 — `fix-tsc-build` ✅ DONE
Resolved `LocalDiamondDeployer.ts` TS2740 by widening `signer` to ethers `Signer`; build green, tests unchanged. Complete — see the [epic overview](../Epic-04/overview/e4-fix-tsc-build.md). The signer type change feeds M2-E2's API-surface notes and the `1.2.0` changelog.

## 6. Dependencies & sequencing

- **Upstream:** M0 (baseline, green gates) + M2-E4 (green build) — both done.
- **Internal order:** **E1 → E2 → E3.** E1 (metadata) is foundational and lowest-risk; E2 (exports) builds on a correct `package.json`; E3 (tarball audit + install-test) verifies the result of E1+E2 and must run last. E4 is already done and unblocked E2/E3.
- **Owner gates:** none blocking in M2 (the publish credential is M4-E3).
- **Downstream:** M4 (CI/publish uses `publishConfig`/`engines`), M5 (the `v1.2.0` cut publishes the verified tarball), M3 (README documents the new `exports` entry points).

## 7. Rollback posture

All changes are to `package.json` + ignore/config files on the integration branch; nothing is published. Rollback = `git revert` the M2 commits and rebuild the monorepo to confirm restoration. The `exports` map is the one change with consumer-visible effect — gated behind the install-test + monorepo build (E2/E3) before it can cause harm, and trivially revertible since unpublished.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| `exports` map breaks `/dist/utils` / `/dist/lib` imports (monorepo + README guidance) | Declare `./dist/*` for back-compat; install-test all entry points; build the monorepo root before committing (E2). |
| `engines` Node floor too strict/loose for consumers | Default `>=18` (devcontainer floor); keep `yarn >=4` aligned with `packageManager`; Owner can adjust. |
| Reconciling `.npmignore`/`files` accidentally drops a needed file or ships cruft | Audit `npm pack --dry-run` before/after; assert LICENSE/README/CHANGELOG/dist present and TESTING docs excluded (E3). |
| `publishConfig`/provenance metadata interacts badly with the M4 publish | M2 only sets metadata; M4 validates the actual publish in a dry-run before going live. |

## 9. Definition of Done for Milestone 3 (M2) — ✅ COMPLETE (2026-06-28)

- [x] All §2 exit criteria checked.
- [x] `package.json` metadata correct (M2-E1); `exports` map verified with `/dist/*` back-compat (M2-E2).
- [x] Tarball audited (39 files / 174.6kB) + clean-install tested; `.npmignore` removed, `files` reconciled; `prepack` hardened to a clean build (M2-E3).
- [x] Consuming monorepo builds green (`yarn compile` passed against the `exports` change).
- [x] M2-E4 ✅ (build fix). Gates (lint/build/test 120 passing) green.

➡️ **Next:** run **`/df3ndr:breakout-epics`** on M2 to expand E1/E2/E3 (E4 already has its overview).
