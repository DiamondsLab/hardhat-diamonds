# Epic 3 — Versioning & Commit Policy (M1-E3)

> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../../overview/milestone-02-licensing-changelog.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E3](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Low (doc only) · **Estimated effort:** XS (~30–45 min) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Write down the versioning and commit conventions the project has already adopted, so future releases and changelog entries are mechanical and contributors have a clear rule. This is the policy the M5 runbook and the CHANGELOG (M1-E2) both reference.

## 3. Acceptance criteria

- [x] A concise policy doc exists — standalone `docs/VERSIONING.md`.
- [x] States **SemVer** with the `v1.1.15 → 1.2.0` example. *(Corrected: minor is justified by the M2 `exports` map + M2-E4 `signer` widening; `loadDiamondContract` shipped in `v1.1.15`.)*
- [x] States **Conventional Commits** (with a type→SemVer mapping table), matching the branch convention.
- [x] States **Keep a Changelog** + the `[Unreleased]` → versioned-release flow.
- [x] Notes **commitlint/Husky enforcement is wired in M4**, not here.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Decide the doc home: `CONTRIBUTING.md` section vs `docs/VERSIONING.md` (default: a short `docs/VERSIONING.md`, folded into `CONTRIBUTING.md` in M3-E2) | Eng | Location chosen |
| 2 | Write the SemVer rules + the `1.2.0` minor-bump rationale | Eng | SemVer section written |
| 3 | Write the Conventional Commits + Keep a Changelog conventions | Eng | Commit/changelog section written |
| 4 | Cross-link from `CHANGELOG.md` (M1-E2) and note M4 enforcement | Eng | Links resolve; M4 note present |

## 5. Dependencies & owner gates

- **Upstream:** none (formalizes existing practice).
- **Owner gates:** none.
- **Downstream:** M1-E2 (changelog references it); M4 (commitlint enforces it); M5 (runbook follows the bump rules).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Policy diverges from actual commit history on the branch | Document the convention already in use (Conventional Commits) — descriptive, not a retrofit. |
| Doc duplicates a future full `CONTRIBUTING.md` (M3-E2) | Keep it a small focused section/file; M3-E2 absorbs or links it rather than duplicating. |

## 7. Notes

- Reversible doc-only change.
- Should be settled before/with M1-E2 so the changelog format matches the stated policy.
- No tooling installed here — enforcement (commitlint/Husky) is explicitly M4's job.
