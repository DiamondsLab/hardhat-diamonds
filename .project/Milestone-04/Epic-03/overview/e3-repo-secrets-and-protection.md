# Epic 3 — Repo Secrets & Branch Protection (M4-E3)

> **Parent milestone:** [Milestone 5 — CI/CD Pipeline (M4)](../../overview/milestone-05-cicd-pipeline.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M4-E3](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** **Owner (maintainer) — OWNER-ONLY** · **Impact / blast radius:** High (controls the live publish) · **Estimated effort:** Owner ~30–60 min · **Status:** 📋 Blocking owner task

---

## 2. Objective

Provision the **privileged** pieces the CI/release workflows depend on — npm publish auth, the repo secret, branch protection, and Actions permissions. **None of this can be done by the agent**; it requires DiamondsLab GitHub org admin + npm `@diamondslab` access. The agent prepares the workflows (M4-E1/E2) and documents exactly what the Owner must do here.

## 3. Acceptance criteria

- [ ] npm publish auth exists for `@diamondslab/hardhat-diamonds`: **either** an npm **automation** access token, **or** (preferred) an npm **Trusted Publisher**/OIDC link to `DiamondsLab/hardhat-diamonds` (no long-lived token).
- [ ] If using a token: the `NPM_TOKEN` **repo secret** is set on `DiamondsLab/hardhat-diamonds`.
- [ ] **Branch protection** on `main`: require the CI status check to pass (and ≥1 review) before merge.
- [ ] Repo **Actions settings** allow `id-token: write` (provenance) and running workflows.
- [ ] A test/dummy Actions run can authenticate to npm (dry-run) — confirms the wiring before M5.

## 4. Tasks (OWNER-only — blocking gates)

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| OP-1a | Create an npm **automation** token for `@diamondslab` **or** configure npm **Trusted Publisher** (OIDC) for `DiamondsLab/hardhat-diamonds` | **Owner** | auth method chosen + created |
| OP-1b | Add `NPM_TOKEN` as a repo secret (if token-based) | **Owner** | secret present |
| OP-1c | Enable branch protection on `main` requiring the CI check (+ review) | **Owner** | protection active |
| OP-1d | Confirm Actions permissions allow `id-token: write` + workflow runs | **Owner** | settings confirmed |
| OP-1e | Validate with a dry-run Actions run (`npm publish --dry-run` / OIDC mint) | **Owner** | dry-run authenticates |

## 5. Dependencies & owner gates

- **Upstream:** M4-E1 + M4-E2 (the workflows reference the CI check name + `NPM_TOKEN`/OIDC) — authored first.
- **This epic IS the owner gate (OP-1).** It is **blocking for M5-E3** (the live `v1.2.0` publish). The agent cannot perform any of it.
- **Downstream:** M5-E3 (the cut relies on these being in place).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Long-lived npm token leaks | Prefer npm **Trusted Publisher**/OIDC (no stored token); if token-based, use a scoped **automation** token + rotate. |
| Branch protection blocks the maintainer's own release | Configure to allow the release flow (tag pushes aren't gated by PR protection; protect `main` merges, not tags). |
| OIDC not enabled → provenance fails | OP-1d confirms `id-token: write` is permitted org-wide/repo-wide. |
| Provisioned before workflows exist | Sequence after M4-E1/E2 so the secret/check names match. |

## 7. Notes

- **Agent boundary:** this epic is documented for the Owner; the agent will **not** attempt to create tokens, set secrets, or change protection. When reached, the agent STOPs and hands off this checklist.
- All actions are reversible in GitHub/npm settings (revoke token, remove secret, relax protection).
- Preferred path: **npm Trusted Publisher (OIDC)** — eliminates the stored `NPM_TOKEN` entirely.
