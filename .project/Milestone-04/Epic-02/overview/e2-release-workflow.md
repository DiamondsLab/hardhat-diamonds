# Epic 2 — Release Workflow (M4-E2)

> **Parent milestone:** [Milestone 5 — CI/CD Pipeline (M4)](../../overview/milestone-05-cicd-pipeline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (workflow) · **Impact / blast radius:** Med-High (it's the real publish path) · **Estimated effort:** S (~1–2h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Add `.github/workflows/release.yml` — a tag-triggered job that builds and **publishes `@diamondslab/hardhat-diamonds` to npm with provenance** when a `vX.Y.Z` tag is pushed. This makes the M5 release a "push a tag" operation. The workflow file is authored here; the secrets/permissions it relies on are provisioned by the Owner in M4-E3.

## 3. Acceptance criteria

- [ ] `.github/workflows/release.yml` exists and is **valid YAML**.
- [ ] Trigger is **tags only**: `on: push: tags: ['v*']` (no publish on PR/branch).
- [ ] Job `permissions: { contents: read, id-token: write }` (OIDC for provenance).
- [ ] Steps: checkout → setup-node (corepack) → `yarn install --immutable` → `yarn build` → `npm publish --provenance --access public` with `NODE_AUTH_TOKEN=${{ secrets.NPM_TOKEN }}` and the npm registry configured.
- [ ] Relies on `prepack: tsc --build --force` (M2-E3) for a clean `dist`; `files`/`publishConfig` already correct (M2).
- [ ] Inert until merged + a tag pushed (real publish is **M5-E3**, owner-approved).

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Author `release.yml` (tag trigger, permissions, build, publish) | Eng | file present |
| 2 | Configure npm auth: `setup-node` `registry-url` + `NODE_AUTH_TOKEN` from `NPM_TOKEN` | Eng | auth wired |
| 3 | Use `npm publish --provenance --access public` (provenance via OIDC) | Eng | publish step set |
| 4 | Guard: ensure no publish path on non-tag events | Eng | tag-only verified |
| 5 | Validate YAML; document that the live publish is gated on M4-E3 + M5-E3 | Eng | parses; gating noted |

## 5. Dependencies & owner gates

- **Upstream:** M2 (`publishConfig.access: public`, `prepack` clean build, `files`) — done.
- **Owner gate — references M4-E3 (blocking for a live run):** the `NPM_TOKEN` secret (or npm Trusted Publisher/OIDC) and `id-token: write` Actions permission must exist before the workflow can actually publish. The agent authors the workflow; it cannot create secrets.
- **Downstream:** M5-E3 (pushing the `v1.2.0` tag triggers this).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Accidental publish on a branch/PR | Tag-only trigger; no `publish` step elsewhere; verify with the event guard. |
| Provenance fails (missing `id-token: write` or OIDC) | Set permissions explicitly; M4-E3 enables OIDC; verify in a dry-run / first M5 run. |
| Stale `dist` published | `prepack: tsc --build --force` rebuilds; CI build step also runs first. |
| Token leakage | Use `secrets.NPM_TOKEN` (never echoed); prefer npm **Trusted Publisher**/OIDC (no long-lived token) if the Owner sets it up. |

## 7. Notes

- Reversible: workflow file only; `git rm`/revert. No publish without a pushed tag.
- **`npm publish` (not `yarn npm publish`)** is used for the well-supported provenance+OIDC path; the build still uses yarn.
- The first real execution is the **M5 `v1.2.0` cut**, owner-approved.
