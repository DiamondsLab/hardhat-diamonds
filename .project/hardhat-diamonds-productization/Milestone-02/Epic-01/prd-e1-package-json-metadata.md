# Change Plan (PRD) — package.json Metadata (M2-E1)

> **Epic overview:** [`overview/e1-package-json-metadata.md`](overview/e1-package-json-metadata.md)
> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../overview/milestone-03-packaging-metadata.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

`package.json` is not publish-ready. It has a non-standard `authors` array (no `author`), **no `engines`**, **no `publishConfig`** (a scoped `@diamondslab` package cannot publish public without `access: public`), a wrong-case string `repository` (`github:diamondslab/…`), a lowercase `bugs` URL, and no `homepage`. Its publish lifecycle (`prepublishOnly: "npm run build"`) also won't fire under `yarn npm publish`, risking a stale `dist/`.

**Goal:** Correct and complete `package.json` metadata + the build-on-publish lifecycle so the package is standards-compliant and publish-ready — with **no code or API change**.

## 2. Goals

1. Standard `author` field replaces the non-standard `authors` array.
2. `engines` declares supported `node` (`>=18`) and `yarn` (`>=4`).
3. `publishConfig.access = "public"` (so the scoped package can publish).
4. `repository` is object form with the **canonical DiamondsLab** URL.
5. `bugs.url` is DiamondsLab-cased; `homepage` is present.
6. The build-on-publish hook works under **yarn** (a `prepack` that builds `dist/`), so no stale build ships.
7. Gates stay green; the consuming monorepo still resolves the package.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `package.json` | **Edit** — `author`, `engines`, `publishConfig`, `repository`, `bugs`, `homepage`, build lifecycle |

Concrete target values:
- `"author": "Am0rfu5"` (remove `"authors"`)
- `"engines": { "node": ">=18", "yarn": ">=4" }`
- `"publishConfig": { "access": "public" }`
- `"repository": { "type": "git", "url": "git+https://github.com/DiamondsLab/hardhat-diamonds.git" }`
- `"bugs": { "url": "https://github.com/DiamondsLab/hardhat-diamonds/issues" }`
- `"homepage": "https://github.com/DiamondsLab/hardhat-diamonds#readme"`
- `"scripts": { "prepack": "tsc", … }` (build before pack/publish); keep or drop `prepublishOnly`.

Single-file edit. No source, no `exports` (M2-E2), no `files`/`.npmignore` (M2-E3).

## 4. Stakeholders & Impact

- **npm / registry tooling:** can now publish the scoped package publicly with correct metadata.
- **Consumers:** correct repo/bugs/homepage links; `engines` advises supported Node.
- **Consuming monorepo:** unaffected at runtime (metadata only); re-verified by a resolve/build check.
- **User-facing / production impact:** none.

## 5. Operational Requirements

1. `package.json` must contain `author` (string) and must **not** contain `authors`.
2. `engines` must declare `node >= 18` and `yarn >= 4` (aligned with `packageManager: yarn@4.10.3`).
3. `publishConfig` must contain `access: "public"`. It must **not** set `provenance` yet (requires CI/OIDC — M4).
4. `repository` must be the object form with `type: "git"` and the canonical `git+https://github.com/DiamondsLab/hardhat-diamonds.git`.
5. `bugs.url` and `homepage` must use the **DiamondsLab** (correct-case) GitHub URLs.
6. A `prepack` script must build `dist/` (`tsc`) so `yarn pack` / `yarn npm publish` ship a fresh build; `prepublishOnly` may remain (npm) or be removed.
7. `package.json` must remain valid JSON and parse; `yarn build`/`test`/`lint` stay green; the monorepo still resolves the package.
8. Committed on the integration branch via Conventional Commit; no push/merge.

## 6. Security & Compliance Considerations

- **No secrets/credentials** in scope. `publishConfig.access: "public"` is an intended publication setting (the package is meant to be public), not a secret.
- **No elevated privileges.** The actual npm publish token / provenance OIDC is an **M4-E3 owner gate**, explicitly out of scope here — this epic only writes metadata.
- No sensitive resources touched.

## 7. Non-Goals (Out of Scope)

- `exports` map → **M2-E2**.
- `.npmignore` / `files` / tarball contents → **M2-E3**.
- npm credentials, provenance OIDC, the actual publish → **M4 / M5**.
- README/links content → **M3** (this only fixes `package.json` URLs).
- Version bump / tag → **M5**.
- Adding the author's email/contact (PII) — not added unless the Owner requests it.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — single reversible `package.json` edit on the integration branch; `main` untouched.
- **Rollback:** `git revert` the commit; rebuild the monorepo to confirm restoration.

| Risk | Mitigation |
|------|------------|
| Invalid JSON breaks every tool | Edit surgically; `node -e "require('./package.json')"` parses; gates re-run. |
| `engines` floor too strict → consumer install warnings | `>=18` matches the devcontainer + Hardhat 2.26; Owner can relax. |
| `prepack: tsc` changes pack timing / doubles build | Intended — guarantees fresh `dist/`; verify `yarn pack` still emits the expected files (cross-check in M2-E3). |
| `repository` URL format rejected | Use canonical `git+https://…​.git`; `npm pkg get repository` confirms. |

## 9. Validation / Success Metrics

- `npm pkg get author engines publishConfig repository bugs homepage` returns all the target values; `npm pkg get authors` is empty.
- `node -e "require('./package.json')"` exits 0 (valid JSON).
- `yarn build` / `yarn test` / `yarn lint` exit 0.
- `yarn pack --dry-run` succeeds and (via `prepack`) reflects a fresh build.
- Consuming-monorepo resolve check: `yarn workspace:build` (or a `require.resolve`) still finds the package.
- `git diff --stat` shows only `package.json` (+ record docs).

## 10. Open Questions

- **`engines.node` floor:** default `>=18`; confirm if a higher floor (e.g. `>=20`) is preferred.
- **`prepublishOnly`:** keep (npm-path safety) or remove now that `prepack` covers the yarn path? Default: keep both; harmless.
- **`author` contact:** handle-only (`Am0rfu5`) unless the Owner wants an email/URL added.

---

➡️ **Next:** run **`/df3ndr:generate-tasks`** against this Change Plan.
