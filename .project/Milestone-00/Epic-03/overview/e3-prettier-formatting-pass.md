# Epic 3 — Prettier Formatting Pass (M0-E3)

> **Parent milestone:** [Milestone 1 — Repository Hygiene & Baseline (M0)](../../overview/milestone-01-repo-hygiene-baseline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M0-E3](../../../hardhat-diamonds-productization-project-plan.md)
> **Origin:** Spawned by [M0-E1 Task 3.0](../../Epic-01/tasks-e1-gitignore-and-cruft.md) — 225 pre-existing `prettier/prettier` errors discovered.
> **Owner:** Eng · **Impact / blast radius:** Low (formatting only; reversible) · **Status:** ✅ **Done (local)** on `chore/m0-repo-hygiene-baseline` · **Date:** 2026-06-27

---

## 2. Objective

Bring `yarn lint` to exit 0 by applying the repo's own prettier config to the source files that were never formatted — clearing the 225 `prettier/prettier` errors recorded in the baseline. Formatting only; no behavioral change.

## 3. What was done

Ran `yarn lint:fix` (`prettier --write 'src/**/*.{js,ts}' 'test/**/*.{js,ts}'` then `eslint --fix`). Only **6 `src/` files** needed reformatting (all `test/` files were already prettier-clean):

- `src/lib/LocalDiamondDeployer.ts`
- `src/lib/TypeChainIntegration.ts`
- `src/lib/index.ts`
- `src/tasks/index.ts`
- `src/type-extensions.ts`
- `src/utils.ts`

Changes are purely stylistic per `.prettierrc` — tabs → 2-space indent, single → double quotes, wrapping. (`+277 / −249` lines.)

## 4. Acceptance criteria

- [x] `yarn lint` exits 0 (was 225 `prettier/prettier` errors).
- [x] `yarn build` (`tsc`) still exits 0 (no regression).
- [x] `yarn test` unchanged: **120 passing, 12 pending, 0 failing**.
- [x] Formatting isolated in its own `style:` commit, separate from records.

## 5. Notes

- Reversible: pure formatting on the integration branch; `git revert` restores prior style.
- No `src/index.ts` change needed (already clean). No `test/` changes.
- This makes the eslint flat config fully green, reinforcing M0-E1's finding that the M2 eslint-9/flat-migration follow-up is effectively already in place.
- A `format`/`prettier --check` CI gate should be added in **M4** to prevent regression.
