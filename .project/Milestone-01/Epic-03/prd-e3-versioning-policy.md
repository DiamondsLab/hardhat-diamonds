# Change Plan (PRD) — Versioning & Commit Policy (M1-E3)

> **Epic overview:** [`overview/e3-versioning-policy.md`](overview/e3-versioning-policy.md)
> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../overview/milestone-02-licensing-changelog.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E3](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The project has *adopted* SemVer + Conventional Commits + Keep a Changelog (used on this branch and assumed by [M1-E2](../Epic-02/prd-e2-changelog-backfill.md)), but the conventions are **undocumented**. The `CHANGELOG.md` already links a versioning policy marked "(added in M1-E3)" — a dangling reference until this lands. Contributors and the M5 release runbook need an explicit, written rule for version bumps and commit format.

**Goal:** Add a concise `docs/VERSIONING.md` documenting SemVer, Conventional Commits, and the Keep a Changelog release flow, and resolve the CHANGELOG's reference to it.

## 2. Goals

1. A `docs/VERSIONING.md` exists stating the SemVer bump rules, the Conventional Commits format, and the Keep a Changelog `[Unreleased]` → versioned-release flow.
2. The doc records the **corrected `1.2.0` rationale** (minor justified by the M2 `exports` map + M2-E4 `signer` type change; `loadDiamondContract` shipped in `v1.1.15`).
3. The `CHANGELOG.md` reference to the policy resolves (drop the "(added in M1-E3)" marker).
4. No code/runtime change; gates stay green.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `docs/VERSIONING.md` | **Create** — the policy doc |
| `CHANGELOG.md` | **Edit (1 line)** — make the versioning-policy reference resolve (remove the "(added in M1-E3)" marker) |

Doc-only. No source, no `package.json`, no tooling install.

## 4. Stakeholders & Impact

- **Contributors:** clear rule for commit format and version bumps.
- **M5 release:** the runbook follows the documented bump rules.
- **M4 (CI):** will enforce the documented commit convention (commitlint) — references this doc.
- **Downstream consumers / production:** none (internal/dev documentation).

## 5. Operational Requirements

1. `docs/VERSIONING.md` must state **SemVer** rules: MAJOR (breaking public API), MINOR (backward-compatible additions — e.g. new `exports` entry points, widened input types), PATCH (backward-compatible fixes), with the concrete `v1.1.15 → 1.2.0` example.
2. It must state the **Conventional Commits** format (`type(scope): summary`) and the types in use (`feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `test`, …) and how they map to SemVer bumps.
3. It must state the **Keep a Changelog** flow: changes land under `[Unreleased]`; at release, `[Unreleased]` is renamed to the version with a date (M5).
4. It must note that **commitlint/Husky enforcement is wired in M4**, not here (documentation only).
5. The `CHANGELOG.md` policy reference must resolve to this doc (remove the temporary "(added in M1-E3)" marker).
6. Committed on the integration branch via Conventional Commit; no push/merge.

## 6. Security & Compliance Considerations

- No secrets, credentials, or sensitive resources. No elevated privileges.
- Documentation only — no exposed surface change.

## 7. Non-Goals (Out of Scope)

- Installing/configuring **commitlint, Husky, or any git hooks** → **M4** (this doc only describes the policy).
- A full `CONTRIBUTING.md` (PR flow, code of conduct) → **M3-E2** (which may absorb/link this doc).
- Changing any version number or tagging → **M5**.
- Editing source, `package.json`, or README.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — additive doc (+ a one-line CHANGELOG edit) on the integration branch; `main` untouched.
- **Rollback:** `git rm docs/VERSIONING.md` + revert; restore the CHANGELOG marker. Fully reversible.

| Risk | Mitigation |
|------|------------|
| Policy contradicts the commit style already used | Document the convention **already in use** (descriptive, not a retrofit). |
| Duplicates a future `CONTRIBUTING.md` (M3-E2) | Keep it a small focused doc; M3-E2 links/absorbs rather than duplicating. |
| Dangling/edited CHANGELOG link breaks format | Single-line edit; re-run the M1-E2 structure check after. |

## 9. Validation / Success Metrics

- `test -f docs/VERSIONING.md` → present.
- Contains sections for **SemVer**, **Conventional Commits**, and **Keep a Changelog**; names the `1.2.0` rationale; mentions M4 enforcement.
- `grep -n "added in M1-E3" CHANGELOG.md` → **no match** (marker removed); the policy reference resolves.
- `yarn lint` / `yarn build` still exit 0.
- `git diff --stat` shows only `docs/VERSIONING.md` + `CHANGELOG.md` (+ record docs).

## 10. Open Questions

- **Doc home:** default `docs/VERSIONING.md` (standalone). If the Owner prefers a `## Versioning & Commits` section inside a future `CONTRIBUTING.md`, M3-E2 can relocate/merge it — cosmetic.

---

➡️ **Next:** run **`/df3ndr:generate-tasks`** against this Change Plan.
