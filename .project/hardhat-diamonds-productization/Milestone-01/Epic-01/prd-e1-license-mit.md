# Change Plan (PRD) — MIT License File (M1-E1)

> **Epic overview:** [`overview/e1-license-mit.md`](overview/e1-license-mit.md)
> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../overview/milestone-02-licensing-changelog.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E1](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only — not yet implemented) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`, plan principle #9)

**Decision folded in:** OP-1 resolved — copyright holder is **`DiamondsLab`** ("fine for now"); year range **`2025–2026`** (first release 2025, ongoing 2026).

---

## 1. Overview & Problem

`package.json` declares `"license": "MIT"` and lists `LICENSE` in its `files` whitelist, but **no `LICENSE` file exists on disk** — so the license text is silently omitted from the published tarball (confirmed in the [M0-E2 baseline](../../Milestone-00/baseline-inventory.md): 41 files, no LICENSE). The package is therefore distributed without its license terms, which is legally ambiguous and unprofessional.

**Goal:** Add a canonical MIT `LICENSE` at the package root, copyright `2025–2026 DiamondsLab`, and confirm it ships in the tarball.

## 2. Goals

1. A root `LICENSE` file exists containing verbatim, SPDX-correct **MIT** text.
2. Its copyright line reads `Copyright (c) 2025–2026 DiamondsLab`.
3. The published tarball (`npm pack` / `yarn pack`) **includes** `LICENSE`.
4. No change to `package.json` license metadata (it is already correct: `"MIT"`).
5. No source/runtime/behavioral change; green gates (lint/build/test) unaffected.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `LICENSE` (package root) | **Create** — canonical MIT text + `Copyright (c) 2025–2026 DiamondsLab` |
| `package.json` | **Verify only** — `"license": "MIT"` and `files` includes `"LICENSE"` (both already present; no edit expected) |

Single additive file. No `src/`, no other config, no README (README already links `LICENSE`; README accuracy is M3-E1).

## 4. Stakeholders & Impact

- **Downstream npm consumers:** gain the actual license terms in the package they install (legal clarity). Positive, non-breaking.
- **Owner / DiamondsLab:** named copyright holder.
- **Consuming monorepo:** unaffected (no code/metadata change).
- **User-facing / production impact:** none (documentation/legal file only).

## 5. Operational Requirements

1. `LICENSE` must contain the **unmodified OSI MIT template**; only the copyright line is variable.
2. The copyright line must be exactly `Copyright (c) 2025–2026 DiamondsLab`.
3. `package.json` `"license"` must remain `"MIT"` (SPDX identifier) — verify, do not edit.
4. `package.json` `files` must continue to include `"LICENSE"` — verify (already present).
5. After creation, `npm pack --dry-run` (or `yarn pack`) must list `LICENSE` among the tarball entries.
6. The change is committed on the integration branch using a Conventional Commit (`docs(license): add MIT LICENSE …`); not merged to `main`.

## 6. Security & Compliance Considerations

- **No secrets, credentials, keys, or sensitive resources** are involved. No elevated privileges required.
- **Legal note (not a blocker):** "DiamondsLab" is used as the copyright holder per Owner direction "for now." If a formal legal entity (LLC/company) is later registered, the copyright line should be revisited — tracked in Open Questions, not blocking this epic.
- MIT is the declared, intended license — this change makes the repo *consistent* with its existing declaration, not a license change.

## 7. Non-Goals (Out of Scope)

- Changing the license type or `package.json` SPDX value.
- `CHANGELOG.md` → **M1-E2**; versioning policy → **M1-E3**.
- `CONTRIBUTING.md` / `SECURITY.md` / `CODE_OF_CONDUCT.md` → **M3-E2**.
- Reconciling `.npmignore` vs `files` strategy / excluding internal docs → **M2-E3**.
- Editing README license references → **M3-E1**.
- Bumping the version / tagging → **M5**.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — the integration branch is the snapshot; `main` is untouched (principle #9). Single additive file.
- **Rollback:** `git rm LICENSE` + revert the commit. Fully reversible, zero runtime impact.

| Risk | Mitigation |
|------|------------|
| Non-canonical / altered MIT text | Use the verbatim OSI MIT template; only the copyright line varies. |
| `LICENSE` still excluded from tarball (e.g. `.npmignore` override) | Requirement 5 re-runs `npm pack --dry-run` to prove inclusion; `files` whitelist already lists it. |
| Wrong holder/year | Holder confirmed (`DiamondsLab`); year `2025–2026` from first-release/current; revisit only if a legal entity is registered. |

## 9. Validation / Success Metrics

- `test -f LICENSE` → present at package root.
- `LICENSE` first line matches `MIT License` and contains `Copyright (c) 2025–2026 DiamondsLab`; body matches the canonical MIT template (diff against OSI text — only the copyright line differs).
- `npm pack --dry-run --json` file list **includes** `LICENSE` (was absent in the M0-E2 baseline of 41 files).
- `node -p "require('./package.json').license"` → `MIT` (unchanged).
- `yarn build` / `yarn test` / `yarn lint` still green (no regression — none expected).

## 10. Open Questions

- **Future legal entity:** "DiamondsLab" is provisional ("for now"). If a registered company/individual should hold the copyright, the LICENSE line is updated in a later, trivial change — not blocking `v1.2.0`.
- **Year convention:** using a `2025–2026` range; if the Owner prefers a single year or "2025–present," adjust at execution (cosmetic).

---

➡️ **Next:** run **`/df3ndr:generate-tasks`** against this Change Plan to produce the safety-gated task list.
