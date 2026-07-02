# Epic 3 — Cut v1.2.0 (M5-E3)

> **Parent milestone:** [Milestone 6 — Release Runbook & Cut (M5)](../../overview/milestone-06-release-runbook-cut.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5-E3](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (prepare) + **Owner (publish gate — OWNER-ONLY for the irreversible steps)** · **Impact / blast radius:** High — **irreversible npm publish + merge to `main`** · **Estimated effort:** ~1h (mostly owner approval) · **Status:** 📋 Blocking owner gate

---

## 2. Objective

Execute the runbook to ship `v1.2.0`: finalize the version + changelog, merge the integration branch to `main`, push the `v1.2.0` tag (triggering the provenance publish), and verify. **The agent prepares everything up to the publish; the merge approval, tag push, and publish are OWNER actions** (irreversible) and depend on **M4-E3** secrets being in place.

## 3. Acceptance criteria

- [ ] **Preflight (agent-checkable):** dry-run green (M5-E2); tree clean; CI green; **M4-E3 confirmed** (NPM_TOKEN/OIDC + branch protection).
- [ ] `package.json` bumped to `1.2.0`; `CHANGELOG.md` `[Unreleased]` → `[1.2.0] - <date>` (+ new empty `[Unreleased]`).
- [ ] **Owner:** integration branch merged to `main` (release-only-`main` policy ends here).
- [ ] **Owner:** `git tag v1.2.0 && git push origin v1.2.0` → `release.yml` publishes with provenance.
- [ ] `@diamondslab/hardhat-diamonds@1.2.0` is **live on npm**, installable clean, with a provenance attestation.
- [ ] Consuming monorepo updated/verified against `1.2.0`.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Bump `package.json` → `1.2.0`; finalize `CHANGELOG.md` `[1.2.0] - <date>` | Eng (prepare) | bump + changelog committed on the release branch |
| 2 | Open/prepare the merge PR to `main`; confirm CI green | Eng (prepare) | PR ready, CI green |
| OP-1 | **Confirm M4-E3 done** (secrets/OIDC + branch protection) | **Owner** | confirmed |
| OP-2 | **Approve + merge** the integration branch to `main` | **Owner** | merged |
| OP-3 | **Push `v1.2.0` tag** → triggers the publish | **Owner** | tag pushed, workflow runs |
| OP-4 | Verify on npm (version + provenance) + clean install | **Owner/Eng** | verified live |
| 3 | Update/verify the consuming monorepo against `1.2.0` | Eng | monorepo green on `1.2.0` |

## 5. Dependencies & owner gates

- **Upstream:** M5-E1 (runbook), M5-E2 (dry-run green), **M4-E3 (owner secrets/protection — hard prerequisite)**.
- **Owner gates (all blocking, OWNER-ONLY):** OP-1 confirm secrets, OP-2 merge to `main`, OP-3 push the tag (the irreversible publish), OP-4 verify. **The agent stops before OP-2/OP-3** and hands off.
- **Downstream:** none — terminal. Project complete on success.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Irreversible bad publish | M5-E2 dry-run + M2-E3 verified tarball + green CI; owner approves; runbook's forward-fix (`1.2.1` + `npm deprecate`) if needed. |
| Publish without M4-E3 → fails / no provenance | OP-1 preflight check; agent stops if not confirmed. |
| Merge to `main` regresses the monorepo | Monorepo already builds against the branch (M2-E2); post-merge build check; revert merge if needed. |
| Tag/version mismatch | Bump + tag derived from the same `1.2.0`; runbook checklist. |

## 7. Notes

- **Agent boundary:** the agent prepares the version bump, changelog finalize, and merge PR, then **STOPS** — it will **not** merge to `main`, push the tag, or publish. Those are owner actions.
- **Irreversible:** npm forbids re-publishing a version; recovery is forward-only (documented in the runbook).
- This is the **terminal epic** — completing it productizes and releases the package.
