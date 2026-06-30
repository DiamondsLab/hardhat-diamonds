# Change Plan (PRD) — Release Runbook (M5-E1)

> **Epic overview:** [`overview/e1-release-runbook.md`](overview/e1-release-runbook.md)
> **Parent milestone:** [Milestone 6 — Release Runbook & Cut (M5)](../overview/milestone-06-release-runbook-cut.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

There is no documented release process. With the package now publish-ready (M0–M4), a maintainer needs a precise, safeguarded procedure to cut a release — including the **irreversible-publish** handling — so releases are repeatable and low-risk. This is the **originally-requested** `notes/RELEASE_RUNBOOK.md` deliverable (`notes/` was un-ignored in M0).

**Goal:** Author a complete, self-contained `notes/RELEASE_RUNBOOK.md` that walks a maintainer from preflight to a verified, provenanced `v1.2.0` on npm, with rollback/recovery.

## 2. Goals

1. `notes/RELEASE_RUNBOOK.md` exists, is self-contained, and uses the project's **real** commands/workflows.
2. It covers, in order: **Preflight → Version bump → Changelog finalize → Build + pack audit → Merge to `main` → Tag/push (publish) → Verify → Rollback/recovery → Post-release**.
3. Every **owner-gated** step is explicitly marked (M4-E3 secrets, approve merge, push tag).
4. The irreversible-publish recovery is documented (npm no-re-publish → forward fix).

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `notes/RELEASE_RUNBOOK.md` | **Create** — the only file added |

Doc-only. References (not edits): `package.json`, `CHANGELOG.md`, `docs/VERSIONING.md`, `.github/workflows/{ci,release}.yml`, the M2-E3 pack manifest.

## 4. Stakeholders & Impact

- **Maintainers (primary):** a repeatable, safe release procedure.
- **Owner:** the gated steps (secrets, merge, tag) are theirs and clearly marked.
- **Downstream consumers / production:** none from the doc itself; the *release* it describes (M5-E3) is the high-impact event.

## 5. Operational Requirements

1. **Preflight** section: clean working tree; CI green; **M4-E3 confirmed** (NPM_TOKEN/OIDC + branch protection); integration branch up to date; dry-run (M5-E2) green.
2. **Version bump**: `npm version` / edit `package.json` to the target (`1.2.0`) per `docs/VERSIONING.md` (state the minor rationale: M2 `exports` map + M2-E4 `signer` change; `loadDiamondContract` shipped in `1.1.15`).
3. **Changelog finalize**: rename `[Unreleased]` → `## [1.2.0] - YYYY-MM-DD`; add a fresh empty `[Unreleased]`; update the compare links.
4. **Build + pack audit**: `yarn build`; `npm pack --dry-run` and confirm the manifest (≈39 files / ~174.6 kB; `dist/` + `LICENSE` + `README.md` + `CHANGELOG.md` + `docs/VERSIONING.md` + `package.json`; **no** `TESTING*`/`src`/cruft).
4. **Merge to `main`**: merge the integration branch (CI green) — **owner-approved** (ends the release-only-`main` policy).
5. **Tag + publish**: `git tag v1.2.0 && git push origin v1.2.0` → `release.yml` runs `npm publish --provenance` — **owner pushes the tag** (irreversible).
6. **Verify**: `npm view @diamondslab/hardhat-diamonds@1.2.0` (version present); provenance attestation shown on npm; a clean `npm install` resolves `.`/`/dist/utils`/`/dist/lib`.
7. **Rollback/recovery**: npm forbids re-publishing a version → **forward fix**: `1.2.1` patch + `npm deprecate '@diamondslab/hardhat-diamonds@1.2.0' '<reason>'`; correct the `latest` dist-tag if needed; revert the `main` merge via a follow-up commit.
8. **Post-release**: update/verify the consuming monorepo against `1.2.0` (`yarn workspace:build`/`yarn compile`).
9. Each step labels its **actor** (Eng vs **Owner**); owner-gated steps are unmistakable.

## 6. Security & Compliance Considerations

- The runbook **references** secrets (`NPM_TOKEN`) but contains **no secret values**; it points to M4-E3 for provisioning.
- It documents that the publish is **owner-gated and irreversible** — never automate around the owner approval.
- Provenance/OIDC is the supply-chain control; the runbook notes verifying the attestation post-publish.

## 7. Non-Goals (Out of Scope)

- Performing the bump/merge/publish → **M5-E3** (this only documents them).
- The dry-run rehearsal → **M5-E2**.
- M4-E3 owner provisioning → **M4** (a referenced prerequisite).
- Automating version bumps (changesets) → out of scope.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — a single additive doc in `notes/`; reversible via `git revert`.
- **Rollback (the doc):** trivial. The *release* it describes has its own forward-only recovery (documented in §5.7).

| Risk | Mitigation |
|------|------------|
| Runbook is inaccurate / drifts | Reference real scripts/workflows/manifest; the M5-E2 dry-run executes it and feeds back corrections. |
| Owner vs agent steps ambiguous | Every step labels its actor; publish/merge/tag are clearly owner-gated. |
| Missing recovery path | Dedicated §5.7 (forward fix + deprecate + dist-tag). |

## 9. Validation / Success Metrics

- `test -f notes/RELEASE_RUNBOOK.md`.
- Contains all sections (Preflight, Version bump, Changelog, Build+Pack, Merge, Tag/Publish, Verify, Rollback, Post-release) with the **real** commands.
- Owner-gated steps are explicitly marked; the rollback section covers npm's no-re-publish rule.
- Links to `docs/VERSIONING.md`, `CHANGELOG.md`, the workflows resolve.
- `git diff --stat` shows only `notes/RELEASE_RUNBOOK.md` + record docs.

## 10. Open Questions

- **Bump mechanism:** `npm version 1.2.0` (creates a commit+tag) vs manual `package.json` edit + separate tag. The runbook should pick one; default to a **manual bump + explicit tag** so the owner controls the tag push (and to avoid `npm version`'s auto-tag firing the publish prematurely).
- **GitHub Release notes:** optional — the runbook can include copying the `[1.2.0]` changelog section into a GitHub Release; mark optional.
