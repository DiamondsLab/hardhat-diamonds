# Change Plan (PRD) — Changelog Backfill (M1-E2)

> **Epic overview:** [`overview/e2-changelog-backfill.md`](overview/e2-changelog-backfill.md)
> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../overview/milestone-02-licensing-changelog.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E2](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The package has **no `CHANGELOG`**, and its git history has inconsistent release tagging (`v1.0.11` was tagged *after* `v1.1.7`; mixed `release:`/`chore: release` commit messages — see [M0-E2 baseline §4](../../Milestone-00/baseline-inventory.md)). Consumers have no way to see what changed between versions, and the upcoming `v1.2.0` has no place to record its (already-implemented) user-facing changes.

**Goal:** Add a root `CHANGELOG.md` in *Keep a Changelog* format with a backfilled history (`v1.0.11 → v1.1.15`) and a live `[Unreleased]` (→ `[1.2.0]`) section that later milestones append to and M5 finalizes.

## 2. Goals

1. A root `CHANGELOG.md` exists, valid [Keep a Changelog](https://keepachangelog.com/) structure, SemVer-ordered newest-first.
2. Released versions `v1.0.11 → v1.1.15` are represented, derived strictly from `git tag` + `git log` (older patches summarized; recent ones detailed).
3. An `[Unreleased]` section captures the known `1.2.0` user-facing changes (see Req 4).
4. The messy historical tagging is acknowledged in a note, not silently "fixed."
5. No code/runtime change; gates stay green.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `CHANGELOG.md` (package root) | **Create** — Keep a Changelog; backfilled history + `[Unreleased]`/`[1.2.0]` |
| `package.json` | **Read only** — `version` (`1.1.15`) for the latest released heading; not edited |
| git tags / log | **Read only** — source of the backfill |

This is the **consumer-facing** root changelog — distinct from the per-epic `.project/**/CHANGELOG.md` execution logs.

## 4. Stakeholders & Impact

- **Downstream consumers:** gain a readable version history and visibility into `1.2.0` changes. Positive, non-breaking.
- **Maintainers / M5 release:** `[Unreleased]` becomes the release-notes source for the `1.2.0` cut.
- **Consuming monorepo:** unaffected (doc only).
- **User-facing / production impact:** none.

## 5. Operational Requirements

1. `CHANGELOG.md` must use Keep a Changelog headings: `## [x.y.z] - YYYY-MM-DD` with `Added` / `Changed` / `Fixed` / `Removed` groups, newest version first, and a top `## [Unreleased]`.
2. Released history must cover the tags `v1.0.11, v1.1.0, v1.1.1, v1.1.2, v1.1.5, v1.1.6, v1.1.7, v1.1.12, v1.1.14, v1.1.15`, each with at least a one-line summary derived from git; the `LocalDiamondDeployer` migration / peer-dep export / circular-dep-fix arc (recent commits) is detailed.
3. The `[Unreleased]` (→ `[1.2.0]`) section must list the user-facing changes:
   - **Added** — `loadDiamondContract` (`LoadDiamondArtifact`); `LocalDiamondDeployer` / `LocalDiamondDeployerConfig` exported for peer-dependency use.
   - **Fixed** — circular-dependency resolution + `lib` entry point; fork-upgrade signer (impersonate-first) bug.
   - **Changed** — `LocalDiamondDeployerConfig.signer` type widened `SignerWithAddress` → ethers `Signer` (M2-E4; minor, non-breaking for typical use).
4. A short note must acknowledge the inconsistent historical tagging (`v1.0.11` after `v1.1.7`).
5. A reference/link to the versioning policy (M1-E3) must be included (the link target is created in M1-E3, run immediately after).
6. The changelog must **not** state a release date for `1.2.0` (it isn't released — M5 dates it at cut time).
7. Committed on the integration branch via Conventional Commit; no push/merge.

## 6. Security & Compliance Considerations

- **No secrets/credentials** involved. The changelog is **public-facing** — Req: do not include private addresses, internal infra details, or contributor PII; describe changes at the API/behavior level only.
- No elevated privileges; read-only git access.

## 7. Non-Goals (Out of Scope)

- `LICENSE` (M1-E1, done) and the versioning **policy doc** itself (M1-E3 — this epic only *links* to it).
- Bumping `package.json` version / renaming `[Unreleased]` → `[1.2.0]` with a date / tagging → **M5**.
- Rewriting or re-tagging git history (the messy tags are documented, not altered).
- `package.json` metadata, README, CONTRIBUTING → M2 / M3.
- Appending M2/M3 changes that don't exist yet (later milestones add their own `[Unreleased]` entries).

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — additive doc on the integration branch; `main` untouched.
- **Rollback:** `git rm CHANGELOG.md` + revert the commit. Fully reversible.

| Risk | Mitigation |
|------|------------|
| Backfilled entries inaccurate (messy tags) | Derive strictly from `git tag --sort` + `git log <tag>..<tag>`; summarize uncertain older entries rather than invent specifics. |
| `[1.2.0]` content drifts as M2/M3 add changes | `[Unreleased]` is the live accumulator; M5 finalizes — no `1.2.0` date here (Req 6). |
| Dangling link to the versioning policy (M1-E3 not yet done) | M1-E3 runs immediately after; if needed, mark the link "(added in M1-E3)" until it lands. |
| Over-detailing ancient patches | One-line summaries for `≤ v1.1.x` minor patches; detail the 1.1.x→1.2.0 deltas. |

## 9. Validation / Success Metrics

- `test -f CHANGELOG.md` → present at root.
- Structure check: contains `## [Unreleased]`, a `## [1.1.15]` (latest released) heading, `Keep a Changelog` reference, and `Added`/`Changed`/`Fixed` groups.
- The `[Unreleased]` section names `loadDiamondContract`, the `LocalDiamondDeployer` export, and the `signer` type change.
- No `1.2.0` date present (only `[Unreleased]` or `[1.2.0]` without a date).
- `yarn lint` / `yarn build` still exit 0 (no source change).
- `git diff --stat` shows only `CHANGELOG.md` (+ task/record docs).

## 10. Open Questions

- **Depth of ancient history:** default is one-line summaries for old patches; expand only if a specific version is consumer-relevant.
- **`[Unreleased]` vs `[1.2.0]` heading now:** use `## [Unreleased]` (undated) and let M5 rename to `## [1.2.0] - <date>` at cut; acceptable to also add a `### [1.2.0]` placeholder under Unreleased.

---

➡️ **Next:** run **`/df3ndr:generate-tasks`** against this Change Plan.
