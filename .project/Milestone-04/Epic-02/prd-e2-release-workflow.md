# Change Plan (PRD) — Release Workflow (M4-E2)

> **Epic overview:** [`overview/e2-release-workflow.md`](overview/e2-release-workflow.md)
> **Parent milestone:** [Milestone 5 — CI/CD Pipeline (M4)](../overview/milestone-05-cicd-pipeline.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4-E2](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (workflow) · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

There is no automated release path — publishing would be a manual, error-prone hand process. A scoped `@diamondslab` package should publish with **provenance** (supply-chain attestation) on a version tag.

**Goal:** Add `.github/workflows/release.yml` that, **on a `vX.Y.Z` tag only**, builds and runs `npm publish --provenance --access public` — making the M5 `v1.2.0` cut a "push a tag" operation. The workflow is authored here; the secrets/OIDC it relies on are provisioned by the Owner (M4-E3), and the first real run is the owner-approved M5-E3.

## 2. Goals

1. A valid `.github/workflows/release.yml`.
2. Trigger is **tags only** (`v*`) — no publish on PR/branch.
3. Job has `id-token: write` (OIDC) + `contents: read`; publishes with `--provenance --access public` using `NPM_TOKEN`.
4. Relies on the M2 packaging (`prepack` clean build, `publishConfig.access: public`, `files`).
5. YAML valid; inert until merged + a tag pushed.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `.github/workflows/release.yml` | **Create** — the only file added |

`.github/` exists (M3-E2). No `src/`/`package.json` change (M2 already set `publishConfig`/`prepack`/`files`).

## 4. Stakeholders & Impact

- **Downstream consumers:** receive a provenanced, attested package on each release.
- **Maintainers:** release becomes `git tag vX.Y.Z && git push --tags`.
- **Runtime / production:** none until a tag is pushed (M5); **publishing is irreversible** when it runs (npm versions can't be re-published) — hence tag-only + owner approval.

## 5. Operational Requirements

1. Trigger **only** on tag push: `on: push: tags: ['v*']`. No other trigger; no publish step reachable on PR/branch.
2. `permissions: { contents: read, id-token: write }` (OIDC for provenance).
3. Steps: `actions/checkout@v4` → `actions/setup-node@v4` (`node-version: 20`, `registry-url: https://registry.npmjs.org`) → `corepack enable` → `yarn install` → `yarn build` (fail fast) → `npm publish --provenance --access public`.
4. `npm publish` auth via `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` (set up by `setup-node`'s `registry-url`); the secret is provisioned in **M4-E3**.
5. `prepack: tsc --build --force` (M2-E3) ensures a clean `dist`; `--access public` is explicit (matches `publishConfig`).
6. Use plain `yarn install` (no committed `yarn.lock`, consistent with M4-E1).
7. YAML must parse (js-yaml/python); committed on the integration branch; **not** merged (inert).

## 6. Security & Compliance Considerations

- **This is the privileged/irreversible path.** Publishing is owner-gated (M5-E3) and depends on owner-provisioned secrets (M4-E3) — the agent authors the workflow only.
- `NPM_TOKEN` is referenced via `secrets.*` and **never** echoed/logged. Prefer npm **Trusted Publisher**/OIDC (no stored token) if the Owner sets it up (M4-E3).
- `id-token: write` is the minimal extra permission for provenance; `contents: read` otherwise. No other scopes.
- Tag-only trigger + human-pushed tag (M5) prevents accidental/automated publishes.

## 7. Non-Goals (Out of Scope)

- Secrets, OIDC/Trusted-Publisher setup, branch protection → **M4-E3** (owner).
- The actual `v1.2.0` tag/publish → **M5-E3** (owner-approved).
- GitHub Release creation / changelog extraction automation → optional future enhancement (the runbook can do it manually).
- Version bumping automation (changesets) → out of scope; bump is manual per `docs/VERSIONING.md`.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — single additive workflow file; inert until merged + tagged.
- **Rollback (pre-publish):** `git rm .github/workflows/release.yml` / revert. **Post-publish is irreversible** (npm) — recover forward with a patch + `npm deprecate` (documented in the M5 runbook).

| Risk | Mitigation |
|------|------------|
| Accidental publish (wrong trigger) | Tag-only `on: push: tags: ['v*']`; no publish step on any other event; verify the parsed trigger. |
| Provenance fails (no `id-token: write` / OIDC) | Permissions set explicitly; M4-E3 enables OIDC; first run verified at M5. |
| Publishes stale `dist` | `prepack: tsc --build --force` + explicit `yarn build` before publish. |
| Token leak | `secrets.NPM_TOKEN` only; prefer Trusted Publisher/OIDC; never log the token. |

## 9. Validation / Success Metrics

- `test -f .github/workflows/release.yml`; `js-yaml`/python parses it.
- Parsed workflow: trigger is exactly `push.tags: ['v*']` (no `pull_request`/branch push); `permissions.id-token == write`; a `npm publish --provenance --access public` step exists with `NODE_AUTH_TOKEN` from `secrets.NPM_TOKEN`.
- No publish step is reachable on non-tag events.
- `git diff --stat` shows only the new workflow file + record docs.
- (Deferred to M5) the first real publish run is green and the package appears on npm with a provenance badge.

## 10. Open Questions

- **Auth method:** `NPM_TOKEN` automation token (assumed here) vs npm **Trusted Publisher**/OIDC (no token). If the Owner chooses OIDC in M4-E3, drop `NODE_AUTH_TOKEN`/`registry-url` token wiring and rely on OIDC. The workflow notes both.
- **`yarn build` vs prepack redundancy:** `npm publish` re-runs `prepack` (`tsc --build --force`); the explicit `yarn build` is kept for fail-fast — acceptable.
