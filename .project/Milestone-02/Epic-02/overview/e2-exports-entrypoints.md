# Epic 2 — Exports & Entry Points (M2-E2)

> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../../overview/milestone-03-packaging-metadata.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med-High (consumer-visible entry-point contract) · **Estimated effort:** M (~2–4h incl. install-test) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Formalize the package's public entry points with an `exports` map — `.` (main), and the two circular-dep-safe subpaths the README + monorepo `CLAUDE.md` mandate (`./dist/utils`, `./dist/lib`). This makes the entry-point surface an explicit, type-resolvable contract (part of the `1.2.0` minor rationale) **without breaking** any existing import. Today there is no `exports` map; subpaths work only by raw `dist/*` access.

## 3. Acceptance criteria

- [x] `package.json` has an `exports` map with `"."`, `"./dist/utils"`, `"./dist/lib"`, `"./dist/*"`, and `"./package.json"`.
- [x] Each entry has `types` + `default` resolving under `module: NodeNext` (verified via `tsc --noEmit`).
- [x] **Back-compat preserved:** `…/dist/utils` and `/dist/lib` still resolve; `./dist/*` wildcard covers other dist paths (e.g. `DiamondsConfig`).
- [x] Cleaner aliases `"./utils"` / `"./lib"` added (for the M3 README).
- [x] The **consuming monorepo** `yarn compile` passes (plugin loads, no HH9); `/dist/lib`/`/dist/utils` resolve consumer-side.
- [x] Install-test of the packed tarball resolves all entry points + types. Gates green (120 passing).

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Enumerate the entry points to expose from the [baseline §2 API surface](../../Milestone-00/baseline-inventory.md) (`.`, `./dist/utils`, `./dist/lib`) | Eng | list confirmed |
| 2 | Author the `exports` map (`types`+`default` per entry; `"./package.json"`; back-compat `./dist/*`) | Eng | map present |
| 3 | Keep top-level `main`/`types` for old resolvers; ensure consistency with `exports` | Eng | both resolve |
| 4 | Verify type resolution under NodeNext (`tsc` against a sample import of each entry) | Eng | types resolve |
| 5 | `npm pack` → install the tarball into a throwaway consumer; import `.`, `/dist/utils`, `/dist/lib` | Eng | all imports succeed |
| 6 | Build the consuming monorepo root to confirm no break | Eng | `yarn workspace:build`+`compile` green |

## 5. Dependencies & owner gates

- **Upstream:** M2-E1 (metadata in the same file — sequence after to avoid edit churn); M2-E4 (green build — done).
- **Owner gates:** none.
- **Downstream:** M2-E3 (tarball audit includes the new entry points); M3-E1 (README documents `./utils`/`./lib`); M5 (publish).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Adding `exports` silently breaks `/dist/utils` (it restricts subpaths to declared ones) | Explicitly declare `./dist/utils`, `./dist/lib`, and a `./dist/*` wildcard; install-test every documented import before commit. |
| NodeNext type resolution fails (missing `types` condition) | Provide `types` first in each conditional; verify with a `tsc` sample importing each entry. |
| Monorepo (consumer) breaks on the new map | Build the monorepo root as a gate (task 6); revert is trivial (unpublished). |
| Adding `./utils`/`./lib` aliases creates two ways to import the same thing | Treat aliases as additive/optional; README (M3) documents the canonical one. |

## 7. Notes

- Reversible: `package.json`-only; `git revert` + monorepo rebuild.
- **Hard constraint:** `@diamondslab/hardhat-diamonds/dist/utils` is mandated by the README and the monorepo `CLAUDE.md` to avoid HH9 — it must keep working.
- The M2-E4 `signer` type widening is part of this entry point's public type surface — note it for the `1.2.0` changelog/README.
- Full public-API redesign (collapsing `/dist/*` into clean roots as the *only* path) is a **breaking** change → deferred to a future `v2`, not here.
