# Change Plan (PRD) — Tarball Verification (M2-E3)

> **Epic overview:** [`overview/e3-tarball-verification.md`](overview/e3-tarball-verification.md)
> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../overview/milestone-03-packaging-metadata.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E3](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28 · **Order:** final M2 epic (verifies E1+E2)
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The published tarball is imprecise and has two confirmed defects (surfaced in M0-E2 + M2-E2): (a) it ships **internal testing docs** (`docs/TESTING.md`, `docs/TESTING_SUMMARY.md`) to consumers; (b) **`CHANGELOG.md` does not ship** (it's absent from the `files` whitelist and npm doesn't auto-include it). The package also keeps **both** a `files` whitelist and a redundant `.npmignore` (the `.npmignore` is already ineffective — `files` wins, which is why `TESTING*` shipped). Finally, `dist/index.d.ts` only emits on a **clean** `tsc` build, so an incremental `prepack` could publish a `dist/` missing the main-entry types.

**Goal:** Reduce to one packaging strategy (`files`), make the manifest exact (ship `CHANGELOG.md` + `VERSIONING.md`, exclude `TESTING*`), harden `prepack` to a clean build, and prove the result with a tarball audit + clean-install-test — making the package publish-ready.

## 2. Goals

1. A **single** packaging strategy: remove `.npmignore`; rely on the `files` whitelist.
2. The tarball **includes** `dist/`, `LICENSE`, `README.md`, `CHANGELOG.md`, `docs/VERSIONING.md`, `package.json`; and **excludes** `docs/TESTING.md`, `docs/TESTING_SUMMARY.md`, and all source/test/cruft.
3. `prepack` produces a **clean** build (no stale incremental output) → `dist/index.d.ts` is always present in the tarball.
4. The packed tarball **installs cleanly** and its documented entry points resolve.
5. No source/behavior change; gates green; the final manifest is recorded for the M5 runbook.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `package.json` `files` | **Edit** → `["dist/", "LICENSE", "README.md", "CHANGELOG.md", "docs/VERSIONING.md"]` |
| `package.json` `scripts.prepack` | **Edit** → force a clean build (candidate: `tsc --build --force`, verified in execution) |
| `.npmignore` | **Delete** (redundant; `files` is the single source of truth) |

No `src/`, no `exports`/metadata (done in E1/E2), no version (M5).

## 4. Stakeholders & Impact

- **Downstream consumers:** receive a clean, complete package (license + changelog + versioning policy; no internal test docs). Positive.
- **M5 release:** the audited manifest + clean-install evidence is the pre-publish gate.
- **Consuming monorepo:** unaffected (workspace symlink ignores `files`); re-verified by gates.
- **User-facing / production impact:** none.

## 5. Operational Requirements

1. Delete `.npmignore`; the `files` whitelist is the only packaging control.
2. Set `files` to exactly `["dist/", "LICENSE", "README.md", "CHANGELOG.md", "docs/VERSIONING.md"]`.
3. `prepack` must force a **clean** build so `dist/index.d.ts` (and all `.d.ts`) are present — verify the chosen command (`tsc --build --force` or a `dist` clean + `tsc`) reliably emits `index.d.ts` from a dirty incremental state.
4. `npm pack --dry-run` file list must be audited: assert **present** = `dist/**`, `LICENSE`, `README.md`, `CHANGELOG.md`, `docs/VERSIONING.md`, `package.json`; assert **absent** = `docs/TESTING.md`, `docs/TESTING_SUMMARY.md`, `src/**`, `test/**`, `*.tsbuildinfo`, `coverage*`.
5. `npm pack` → install the tarball into a throwaway project; `.`, `/dist/utils`, `/dist/lib` resolve; `LICENSE` + `CHANGELOG.md` are present in the installed package.
6. Record the final manifest (file list + size) for the M5 runbook.
7. Committed on the integration branch; no push/merge.

## 6. Security & Compliance Considerations

- No secrets/credentials/elevated privileges.
- **Positive security effect:** tightening the manifest reduces the published surface (no stray source/config). Re-confirm no `.env`, key, or token-bearing file is in the pack list (it isn't — `files` is an allowlist).

## 7. Non-Goals (Out of Scope)

- `exports`/metadata (M2-E1/E2, done).
- The actual `npm publish` / version bump / tag → **M4 / M5**.
- README content (M3); relocating/deleting the `TESTING*` docs from the repo (they stay in-repo, just not shipped).
- CI pack-audit automation → **M4** (this establishes the manual audit M4 can encode).

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — `package.json` + `.npmignore` deletion on the integration branch; `main` untouched.
- **Rollback:** `git revert` (restores `.npmignore` + prior `files`/`prepack`). Reversible.

| Risk | Mitigation |
|------|------------|
| `files` change drops a needed file (e.g. a `dist` subdir) | `files: ["dist/"]` includes all of `dist/**`; audit the pack list (Req 4) before/after. |
| `docs/VERSIONING.md` path typo → not shipped | Assert it's present in the pack list (Req 4); install-test checks. |
| `prepack` clean-build command doesn't actually force-clean | Test from a dirty incremental state: `rm dist/index.d.ts` then `prepack` must restore it (Req 3). |
| Removing `.npmignore` changes what ships unexpectedly | `.npmignore` is already overridden by `files`; pack-list diff before/after confirms parity except the intended changes. |

## 9. Validation / Success Metrics

- `test ! -f .npmignore` (removed); `npm pkg get files` is the exact 5-entry list.
- `npm pack --dry-run --json` file list: **includes** `CHANGELOG.md`, `docs/VERSIONING.md`, `LICENSE`, `README.md`, `dist/index.d.ts`; **excludes** `docs/TESTING.md`, `docs/TESTING_SUMMARY.md`, `src/`, `test/`.
- Clean-build proof: from a state with `dist/index.d.ts` deleted, running `prepack` (or `npm pack`) restores it in the tarball.
- Install-test: tarball installs; `.`/`/dist/utils`/`/dist/lib` resolve; `LICENSE` + `CHANGELOG.md` present in `node_modules/...`.
- `yarn lint`/`yarn build`/`yarn test` exit 0; `git diff --stat` shows only `package.json` + `.npmignore` deletion.

## 10. Open Questions

- **`prepack` command:** `tsc --build --force` (uses composite project build) vs an explicit `dist` clean + `tsc`. Decide at execution by whichever reliably emits `index.d.ts` from a dirty state; default to `tsc --build --force`.
- **Ship `docs/` at all?** Shipping only `docs/VERSIONING.md` (not the whole `docs/`) is the chosen middle ground; if the team prefers zero docs in the package, drop it and rely on the repo — cosmetic.
