# Epic 2 — Community & Governance Docs (M3-E2)

> **Parent milestone:** [Milestone 4 — Docs & README Audit (M3)](../../overview/milestone-04-docs-readme-audit.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M3-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (+ optional Owner OP for SECURITY contact) · **Impact / blast radius:** Low (additive docs) · **Estimated effort:** S–M (~2h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Add the community/governance docs a professional open-source package is expected to have — contribution guide, security policy, code of conduct, and issue/PR templates — and reconcile the existing `docs/TESTING*.md` references so the docs set is coherent.

## 3. Acceptance criteria

- [x] `CONTRIBUTING.md` — flow (fork→branch→PR) + **links** `docs/VERSIONING.md` + Conventional Commits + yarn commands.
- [x] `SECURITY.md` — supported versions + GitHub private vulnerability reporting (+ issues fallback). No fabricated email.
- [x] `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1.
- [x] `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md` + `.github/PULL_REQUEST_TEMPLATE.md`.
- [x] `docs/TESTING.md` reference resolves (README Documentation section); repo-only confirmed by pack check.
- [x] README links CONTRIBUTING + SECURITY; no broken references; gates green.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Write `CONTRIBUTING.md` (flow + link to `docs/VERSIONING.md`, lint/test/build commands) | Eng | file present, links resolve |
| 2 | Write `SECURITY.md` (supported versions + reporting); resolve the contact (OP) | Eng + Owner | reporting channel stated |
| 3 | Add `CODE_OF_CONDUCT.md` (Contributor Covenant) | Eng | file present |
| 4 | Add `.github/ISSUE_TEMPLATE/*` + `.github/PULL_REQUEST_TEMPLATE.md` | Eng | templates present |
| 5 | Reconcile `docs/TESTING*.md` references with README; note repo-only status | Eng | references coherent |
| 6 | Cross-link from README ("Contributing", "Security"); verify no broken links | Eng | links resolve |

## 5. Dependencies & owner gates

- **Upstream:** M1-E3 (`docs/VERSIONING.md` to link); M3-E1 (README to cross-link).
- **Owner gate — OP (non-blocking):** confirm the `SECURITY.md` reporting contact (security email/handle). Default if none: GitHub private vulnerability reporting + the issues URL.
- **Downstream:** M4 (issue/PR templates + CONTRIBUTING align with the CI/commitlint added there); M5.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| `SECURITY.md` has no real contact | Default to GitHub private vulnerability reporting + issues URL; flag for Owner (OP). |
| `CONTRIBUTING` duplicates the versioning policy | Link `docs/VERSIONING.md`, don't restate. |
| Community docs accidentally shipped in the tarball | M2-E3 `files` whitelist ships only README/LICENSE/CHANGELOG/VERSIONING — these stay repo-only by default; confirm in a pack check. |

## 7. Notes

- Reversible: additive docs; `git revert`.
- These live repo-side (not in the npm tarball) unless the team decides otherwise.
- Keep templates lightweight; M4 may extend them with CI status expectations.
