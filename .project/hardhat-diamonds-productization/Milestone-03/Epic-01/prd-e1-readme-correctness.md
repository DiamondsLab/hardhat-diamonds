# Change Plan (PRD) — README Correctness (M3-E1)

> **Epic overview:** [`overview/e1-readme-correctness.md`](overview/e1-readme-correctness.md)
> **Parent milestone:** [Milestone 4 — Docs & README Audit (M3)](../overview/milestone-04-docs-readme-audit.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M3-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

`README.md` (shipped in the npm tarball) is factually wrong: the install command and imports are **unscoped** (`hardhat-diamonds`, README:31/37/45/56/398), the npm badge points at the wrong package (README:3), **GeniusVentures** links persist (README:14/566/585), and Prerequisites/Dev-Dependencies/Project-Structure are stale (README:528/529/560 + structure). It also predates M1/M2, so it omits the new `./utils`/`./lib` entry points, the `signer` type change, and the new `CHANGELOG`/`VERSIONING` docs.

**Goal:** Bring `README.md` to 100% accuracy against the **DiamondsLab / `@diamondslab`** reality and the current API surface, so install + usage work verbatim.

## 2. Goals

1. Zero unscoped `hardhat-diamonds` install/import strings; peer dep shown as `@diamondslab/diamonds`.
2. Zero `GeniusVentures` references; all links point to DiamondsLab.
3. npm badge resolves to the scoped package (shields.io `@diamondslab/hardhat-diamonds`).
4. Prerequisites/Dev-Dependencies/Project-Structure match reality (Node ≥18, TS 5.x, Hardhat ^2.26, real `src/` tree).
5. Entry points documented incl. `./utils`/`./lib` aliases + `/dist/utils`/`/dist/lib`; `LocalDiamondDeployerConfig.signer: Signer` noted; `docs/VERSIONING.md` + `CHANGELOG.md` linked.
6. No code/runtime change; gates green.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `README.md` | **Edit** — the only file changed |

Specific edit targets (verified line numbers; full pass will catch others):
- **3** npm badge → shields.io scoped (`https://img.shields.io/npm/v/@diamondslab/hardhat-diamonds`).
- **14, 566** `diamonds` link → `@diamondslab/diamonds` (DiamondsLab); **585** Support/issues → DiamondsLab.
- **31, 37** install → `@diamondslab/hardhat-diamonds @diamondslab/diamonds` (npm + yarn).
- **45, 56, 398** `import "hardhat-diamonds"` → `@diamondslab/hardhat-diamonds`.
- **528, 529, 560** Prerequisites/Dev-Dependencies versions.
- **Project Structure** block → real `src/` tree.
- **Entry-points / LocalDiamondDeployer** sections → add `./utils`/`./lib`, note `signer: Signer`.
- Add links to `docs/VERSIONING.md` + `CHANGELOG.md`.

## 4. Stakeholders & Impact

- **Downstream consumers (primary):** the README ships in the tarball (M2-E3) — a wrong install line is the worst first-run failure; this fixes it. Positive.
- **Project identity:** consistent DiamondsLab branding.
- **Consuming monorepo / production:** none (doc only).

## 5. Operational Requirements

1. All install/import strings must use `@diamondslab/hardhat-diamonds` (and peer `@diamondslab/diamonds`); **no** bare `hardhat-diamonds`/`diamonds` package refs remain.
2. All repository/issue/related-project links must point to `github.com/DiamondsLab/...`; **no** `GeniusVentures` remains.
3. The npm badge must use the scoped shields.io URL (renders "not found" until the M5 publish, then populates — acceptable).
4. Prerequisites: Node ≥18, TypeScript 5.x, Hardhat ^2.26 (consistent with `engines`/devDeps); Dev-Dependencies section updated.
5. "Project Structure" must match `find src` (include `src/lib`, `src/tasks`, `src/interfaces`, `src/DiamondsConfig.ts`, `src/type-extensions.ts`, `src/utils.ts`).
6. Entry-points documentation must match the M2-E2 `exports` map (`.`, `./utils`, `./lib`, `./dist/utils`, `./dist/lib`); note `LocalDiamondDeployerConfig.signer` is ethers `Signer`.
7. Add resolvable links to `docs/VERSIONING.md` and `CHANGELOG.md`.
8. A final grep sweep must be clean (no unscoped name, no GeniusVentures, no `Node.js >= 14` / `TypeScript >= 4`).
9. Committed on the integration branch; no push/merge.

## 6. Security & Compliance Considerations

- No secrets/credentials/elevated privileges. Documentation only; no exposed surface change.
- Accuracy has a mild **trust/security** benefit (correct install avoids users pulling a wrong/typosquatted package name).

## 7. Non-Goals (Out of Scope)

- `CONTRIBUTING`/`SECURITY`/`CODE_OF_CONDUCT`/templates → **M3-E2**.
- `package.json` links/metadata → already fixed in M2-E1 (README just matches them).
- Publishing / version bump / making the badge live → **M5**.
- Rewriting tasks/usage semantics — only correctness/freshness, not new features.
- Editing `docs/TESTING*.md` content → M3-E2 reconciles references.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — single reversible `README.md` edit on the integration branch; `main` untouched.
- **Rollback:** `git revert` / `git checkout` the README. Fully reversible.

| Risk | Mitigation |
|------|------------|
| A corrected snippet is still wrong (bad import path) | Resolve the documented import paths against the M2-E2 `exports` map; `./utils` and `/dist/utils` both valid. |
| Missed inaccuracies | Full top-to-bottom read + grep sweep (Req 8) as the gate. |
| Badge 404 looks broken pre-publish | Scoped shields.io badge degrades gracefully ("not found"); goes live at M5 publish. |
| Project-structure drift from reality | Generate from `find src -type f`, don't hand-wave. |

## 9. Validation / Success Metrics

- `grep -nE "badge.fury.io/js/hardhat-diamonds|install .* hardhat-diamonds |GeniusVentures|Node.js >= 14|TypeScript >= 4|import \"hardhat-diamonds\"" README.md` → **no matches**.
- `grep -c "@diamondslab/hardhat-diamonds" README.md` → > 0 (scoped name used).
- README "Project Structure" lists the real `src/` subdirs; entry points match the `exports` map.
- `docs/VERSIONING.md` + `CHANGELOG.md` links present.
- Markdown link/anchor sanity (no obviously broken relative links).
- `yarn lint`/`yarn build`/`yarn test` exit 0 (README change is inert to them); `git diff --stat` shows only `README.md`.

## 10. Open Questions

- **Badge pre-publish:** scoped shields.io badge (default) vs omitting the badge until `v1.2.0` is live. Default keeps it (graceful "not found").
- **`diamonds` repo URL:** assumed `github.com/DiamondsLab/diamonds`; if the `@diamondslab/diamonds` source lives elsewhere, adjust the link at execution.
