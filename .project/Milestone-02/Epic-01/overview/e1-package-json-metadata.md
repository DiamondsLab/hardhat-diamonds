# Epic 1 — package.json Metadata (M2-E1)

> **Parent milestone:** [Milestone 3 — Packaging & Metadata (M2)](../../overview/milestone-03-packaging-metadata.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Med (publish metadata; no runtime/API change) · **Estimated effort:** S (~1–2h) · **Status:** 📋 Ready for `/create-prd` · **Priority:** ⭐ top of M2 (foundational, lowest-risk)

---

## 2. Objective

Make `package.json` standards-compliant and publish-ready. Today it has a non-standard `authors` array, **no `engines`**, **no `publishConfig`** (a scoped `@diamondslab` package can't publish public without it), a wrong-case string `repository`, a lowercase `bugs` URL, and no `homepage`. This epic fixes the metadata — the prerequisite for the M4 automated publish and the M5 cut — with **no code or API change**.

## 3. Acceptance criteria

- [x] `author` field present (replacing the non-standard `authors` array).
- [x] `engines` present: `node >= 18` and `yarn >= 4`.
- [x] `publishConfig` present with `access: "public"` (provenance left to the M4 workflow).
- [x] `repository` in object form with correct **DiamondsLab** casing.
- [x] `bugs.url` corrected; `homepage` added.
- [x] Lifecycle: added `prepack: "tsc"` (yarn-native) so pack/publish build a fresh `dist/`; kept `prepublishOnly`.
- [x] Gates green (lint/build/test 120 passing); `npm pkg get` confirms each value; monorepo still resolves the package.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Replace `authors:["Am0rfu5"]` with `author: "Am0rfu5"` | Eng | `npm pkg get author` correct; `authors` gone |
| 2 | Add `engines` (`node >=18`, `yarn >=4`) | Eng | field present, matches `packageManager` |
| 3 | Add `publishConfig` (`access: public`) | Eng | field present |
| 4 | Convert `repository` to object form with correct DiamondsLab casing | Eng | `npm pkg get repository` is the object |
| 5 | Fix `bugs.url` casing; add `homepage` | Eng | both DiamondsLab-cased |
| 6 | Review the publish lifecycle (`prepublishOnly` vs `prepack`); pick the yarn-correct hook | Eng | `yarn pack` produces a freshly-built `dist/` |
| 7 | Re-run gates + a monorepo resolve check | Eng | lint/build/test green; monorepo builds |

## 5. Dependencies & owner gates

- **Upstream:** none blocking (M0 + M2-E4 done).
- **Owner gates:** **none blocking.** `publishConfig.access: public` is metadata Eng writes; the npm credential/OIDC is the **M4-E3** owner gate. *Optional confirm:* the `engines` Node floor (default `>=18`).
- **Downstream:** M2-E2 (`exports` added to the same file), M4 (uses `publishConfig`/`engines`), M5 (publish).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| `engines` floor too strict → install warnings for consumers | Default `>=18` (matches the devcontainer + modern Hardhat); Owner can relax. |
| Switching `prepublishOnly`→`prepack` changes pack behavior | Verify `yarn pack` still builds + emits the expected `dist/`; keep the build step. |
| `repository` URL format rejected by tooling | Use the canonical `git+https://…​.git` form; `npm pkg get` to confirm. |
| JSON edit breaks `package.json` | Edit surgically; `node -e require('./package.json')` parses; gates re-run. |

## 7. Notes

- Reversible: pure `package.json` metadata; `git revert`.
- Stays untouched: source, `exports` (M2-E2), `.npmignore`/`files` (M2-E3), version (M5).
- Do **not** set `provenance` in `publishConfig` yet — it requires CI/OIDC and would break a local publish; M4 enables it in the workflow.
- `author` uses the handle only (no email) unless the Owner wants contact info added.
