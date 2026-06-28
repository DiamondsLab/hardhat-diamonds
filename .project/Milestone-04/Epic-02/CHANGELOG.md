# Changelog — M4-E2 Release Workflow

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M4-E2 — Add release workflow (2026-06-28)

- Added `.github/workflows/release.yml`: **tag-only** trigger (`push.tags: ['v*']`); `permissions: contents:read + id-token:write` (OIDC provenance); checkout → setup-node (node 20, npm registry) → corepack → `yarn install` → `yarn build` → `npm publish --provenance --access public` with `NODE_AUTH_TOKEN` from `secrets.NPM_TOKEN`.
- Relies on M2: `prepack: tsc --build --force` (clean dist) + `publishConfig.access: public`.
- **Validated:** YAML parses; trigger is tag-only (no PR/branch path → no accidental publish); provenance permission + token wiring correct.
- ✅ **M4-E2 complete (local).** **Inert** until merged + a `v*` tag pushed. The first real run is the **owner-approved `v1.2.0` cut (M5-E3)** and depends on **M4-E3** (npm token/OIDC secret).
