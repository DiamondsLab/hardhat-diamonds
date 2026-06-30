# Tasks — Exports & Entry Points (M2-E2)

> Execution checklist for [`prd-e2-exports-entrypoints.md`](prd-e2-exports-entrypoints.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-02/Epic-02/prd-e2-exports-entrypoints.md` — The Change Plan this executes.
- `…/Milestone-02/Epic-02/overview/e2-exports-entrypoints.md` — The epic overview.
- `packages/hardhat-diamonds/package.json` — **Edited** (add `exports`; keep `main`/`types`).
- `packages/hardhat-diamonds/dist/` — entry-point targets (clean-built so `index.d.ts` exists).
- Consuming monorepo root (`/workspaces/diamonds_dev_env`) — imports `.`, `/dist/lib`, `/dist/utils`; must still build.
- `…/Milestone-02/Epic-02/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Single reversible `package.json` edit — **no backup needed**; branch is the snapshot. **But this is the highest-breakage M2 change** (adding `exports` restricts subpaths), so the monorepo-build + install-test gates are mandatory before commit.
- Clean build first (`rm -rf dist tsconfig.tsbuildinfo && yarn build`) so `dist/index.d.ts` exists (incremental cache can mask it).
- Don't widen scope: no `files`/`.npmignore` (M2-E3), no README (M3), no version (M5).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline`, clean tree. — **On branch ✓.**
  - [x] 0.2 Clean build so all `types` targets exist. — **`rm -rf dist tsconfig.tsbuildinfo && yarn build`; `index.d.ts`/`utils.d.ts`/`lib/index.d.ts` all present.**
  - [x] 0.3 Baseline: documented imports resolve today. — **`.`, `/dist/utils`, `/dist/lib` all resolve pre-change.**

- [x] 1.0 Add the `exports` map
  - [x] 1.1 Add the `exports` object (PRD §3). — **Added: `.`, `./utils`, `./lib`, `./dist/utils`, `./dist/lib`, `./dist/*`, `./package.json`.**
  - [x] 1.2 Keep `main` + `types`; valid JSON. — **Kept; +27 lines; parses.**

- [x] 2.0 Verify entry-point resolution (local)
  - [x] 2.1 Runtime resolution. — **All 7 resolve: `.`→index.js, `/utils`→utils.js, `/lib`→lib/index.js, `/dist/utils`, `/dist/lib`, `/dist/DiamondsConfig` (wildcard), `/package.json`.**
  - [x] 2.2 Types under NodeNext. — **Scratch consumer importing `.`/`/dist/utils`/`/dist/lib`/`/utils`/`/lib` → `tsc --noEmit` exit 0 (cleaned up).**

- [x] 3.0 Validate against the consumer + install-test
  - [x] 3.1 **Monorepo gate.** — **Consumer-side resolve ✓; `yarn compile` exit 0 (plugin loads via hardhat.config, no HH9, ABI/TypeChain generated).**
  - [x] 3.2 `npm pack` + install-test. — **Install exit 0; all 5 exports entries resolve in the installed artifact; LICENSE ships (CHANGELOG doesn't — M2-E3).**
  - [x] 3.3 Gates + diff scope. — **lint 0 ✓, build 0 ✓, test 120 passing ✓; only `package.json` (+27) changed.**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-02/Epic-02/CHANGELOG.md`. — **Done (noted new entry points for M3/changelog).**
  - [x] 4.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked.**
  - [x] 4.3 Commit; **no push/merge**. — **See commit below.**
