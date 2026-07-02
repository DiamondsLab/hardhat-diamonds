# Change Plan (PRD) — Exports & Entry Points (M2-E2)

> **Epic overview:** [`overview/e2-exports-entrypoints.md`](overview/e2-exports-entrypoints.md)
> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../overview/milestone-03-packaging-metadata.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E2](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The package has **no `exports` map** — its three real entry points (`.`, `./dist/utils`, `./dist/lib`) work only by raw `dist/*` file access. This is an undocumented, fragile contract. Formalizing it (part of the `1.2.0` minor) is valuable, **but adding `exports` is dangerous**: it *restricts* importable subpaths to exactly what's declared, so any undeclared path **breaks**. Verified consumers that must keep working: the README + monorepo `CLAUDE.md` mandate `@diamondslab/hardhat-diamonds/dist/utils` (HH9 avoidance), and the **consuming monorepo imports `/dist/lib` in many test files** plus the main entry.

**Goal:** Add a complete `exports` map that formalizes the entry points (with clean `./utils`/`./lib` aliases) while **preserving** every existing import path, verified by a clean install-test and a monorepo build.

## 2. Goals

1. `exports` map present, exposing `.`, `./utils`, `./lib`, **and** the back-compat `./dist/utils`, `./dist/lib`, a `./dist/*` wildcard, and `./package.json`.
2. Every entry resolves both **runtime** (`default`) and **types** (`types`) under `module: NodeNext`.
3. **Zero break:** all currently-working imports (`.`, `/dist/utils`, `/dist/lib`, other `/dist/*`) still resolve; the consuming monorepo builds.
4. No source/behavior change; gates green.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `package.json` | **Edit** — add `exports`; keep `main`/`types` as fallback for old resolvers |

**Verified target map** (all paths confirmed to exist after a clean build):

```jsonc
"exports": {
  ".":            { "types": "./dist/index.d.ts",    "default": "./dist/index.js" },
  "./utils":      { "types": "./dist/utils.d.ts",    "default": "./dist/utils.js" },
  "./lib":        { "types": "./dist/lib/index.d.ts","default": "./dist/lib/index.js" },
  "./dist/utils": { "types": "./dist/utils.d.ts",    "default": "./dist/utils.js" },
  "./dist/lib":   { "types": "./dist/lib/index.d.ts","default": "./dist/lib/index.js" },
  "./dist/*":     { "types": "./dist/*.d.ts",        "default": "./dist/*.js" },
  "./package.json": "./package.json"
}
```

Single-file edit. No `src/`, no `files`/`.npmignore` (M2-E3), no version (M5).

## 4. Stakeholders & Impact

- **Consuming monorepo (highest stakes):** imports `@diamondslab/hardhat-diamonds` (main), `/dist/lib` (many tests), and per docs `/dist/utils` — all must keep resolving. Verified by a monorepo build.
- **Downstream npm consumers:** gain clean `./utils`/`./lib` entry points; existing `/dist/*` imports preserved.
- **User-facing / production impact:** none directly; **breakage risk is the headline** — mitigated by install-test + monorepo build gates.

## 5. Operational Requirements

1. Add the `exports` map exactly as in §3 (explicit `./dist/utils` + `./dist/lib` **before** the `./dist/*` wildcard so the directory-index cases resolve correctly).
2. Keep top-level `main` + `types` so non-`exports`-aware resolvers still work.
3. Every `types` target must be a real emitted file (note: `dist/index.d.ts` only emits on a **clean** build — incremental `tsbuildinfo` can mask it; ensure a clean build before verifying).
4. After the change, **all** of these must resolve (runtime + types): `@diamondslab/hardhat-diamonds`, `…/utils`, `…/lib`, `…/dist/utils`, `…/dist/lib`, and a sample other `…/dist/DiamondsConfig`.
5. The **consuming monorepo must build** (`yarn workspace:build` + `yarn compile`) and its `/dist/lib` test imports must still resolve.
6. An `npm pack` + clean-install-test in a throwaway project resolves `.`, `/dist/utils`, `/dist/lib`.
7. Committed on the integration branch; no push/merge.

## 6. Security & Compliance Considerations

- No secrets/credentials/elevated privileges. Pure `package.json` metadata.
- The `exports` map changes the **public import surface** — a compatibility (not security) concern; gated behind the install-test + monorepo build before it can affect anyone, and unpublished (revertible).

## 7. Non-Goals (Out of Scope)

- `.npmignore`/`files`/tarball audit → **M2-E3** (which also enforces a clean build before publish).
- Collapsing `/dist/*` into clean roots as the **only** path (a breaking change) → future `v2`.
- README documenting the new `./utils`/`./lib` entry points → **M3-E1**.
- npm publish / version bump → **M4 / M5**.
- Changing `main`/`types` values or source.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — single reversible `package.json` edit; `main` untouched.
- **Rollback:** `git revert` + rebuild the monorepo to confirm restoration. Because it's unpublished, a wrong map harms only this branch.

| Risk | Mitigation |
|------|------------|
| `exports` breaks `/dist/lib` (heavily used by the monorepo tests) or `/dist/utils` | Declare both explicitly + a `./dist/*` wildcard; Req 4/5 verify every path + a monorepo build **before** commit. |
| `dist/index.d.ts` missing (incremental staleness) → `"."` types broken | Req 3: clean build (`rm -rf dist tsconfig.tsbuildinfo && tsc`) before verifying; flag clean-build-on-publish for M2-E3. |
| NodeNext fails to pick up types | `types` listed first in each condition; verify with a `tsc` sample importing each entry. |
| Wildcard `./dist/*` shadows the explicit dir entries | Explicit entries take precedence in Node resolution; place them first for clarity; install-test confirms. |

## 9. Validation / Success Metrics

- `node -e "require('./package.json').exports"` shows the full map; JSON valid.
- Resolution check (Node): `require.resolve` / `import` succeeds for `.`, `./utils`, `./lib`, `./dist/utils`, `./dist/lib`, `./dist/DiamondsConfig`.
- Type check: a sample `.ts` importing `.`, `/dist/utils`, `/dist/lib` type-checks under NodeNext (no TS2307).
- **Monorepo build green:** `yarn workspace:build` + `yarn compile` from the root; `/dist/lib` test imports resolve.
- `npm pack` → install tarball in a temp project → the three documented imports resolve at runtime.
- `yarn lint`/`yarn build`/`yarn test` exit 0; `git diff --stat` shows only `package.json`.

## 10. Open Questions

- **`./dist/*` wildcard breadth:** included for maximum back-compat; if the team prefers a strict surface (only `.`/`utils`/`lib` + explicit `./dist/utils`/`./dist/lib`), drop the wildcard — but that risks breaking any unlisted `/dist/*` import. Default: keep the wildcard.
- **Clean-build-on-publish:** the `dist/index.d.ts` staleness suggests `prepack` should force a clean build (`rm -rf dist && tsc`); proposed as an M2-E3 hardening, not done here.
