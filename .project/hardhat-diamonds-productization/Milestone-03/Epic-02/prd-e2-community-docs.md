# Change Plan (PRD) — Community & Governance Docs (M3-E2)

> **Epic overview:** [`overview/e2-community-docs.md`](overview/e2-community-docs.md)
> **Parent milestone:** [Milestone 4 — Docs & README Audit (M3)](../overview/milestone-04-docs-readme-audit.md)
> **Project plan:** [`hardhat-diamonds-productization-project-plan.md` → §5 M3-E2](../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Status:** 📋 Planned (planning only) · **Date:** 2026-06-28
> **Repo / branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`)

---

## 1. Overview & Problem

The package lacks the standard community/governance docs expected of a professional open-source project — no `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and no issue/PR templates. Contributors have no documented flow, no way to report vulnerabilities responsibly, and no behavior baseline.

**Goal:** Add the community health files + GitHub templates, cross-link them from the README, and reconcile the `docs/TESTING*` references — completing the M3 docs milestone.

## 2. Goals

1. `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` exist at the repo root.
2. `.github/ISSUE_TEMPLATE/` (bug + feature) and `.github/PULL_REQUEST_TEMPLATE.md` exist.
3. README cross-links Contributing + Security; `docs/TESTING*` references are coherent.
4. Community docs are **repo-only** (not in the npm tarball) — confirmed by a pack check.
5. No code/runtime change; gates green.

## 3. Scope — Components & Services

| Path | Action |
|------|--------|
| `CONTRIBUTING.md` | **Create** — fork→branch→PR flow; links `docs/VERSIONING.md` (Conventional Commits/SemVer); `yarn build`/`lint`/`test` commands |
| `SECURITY.md` | **Create** — supported versions + reporting (GitHub private vulnerability reporting + DiamondsLab issues URL) |
| `CODE_OF_CONDUCT.md` | **Create** — Contributor Covenant v2.1 |
| `.github/ISSUE_TEMPLATE/bug_report.md` | **Create** |
| `.github/ISSUE_TEMPLATE/feature_request.md` | **Create** |
| `.github/PULL_REQUEST_TEMPLATE.md` | **Create** |
| `README.md` | **Edit** — cross-link Contributing + Security; reconcile `docs/TESTING*` references |

Docs-only. No `src/`, no `package.json` (M2-E1/E3 already set names/`files`).

## 4. Stakeholders & Impact

- **Contributors:** clear contribution flow + behavior baseline.
- **Security researchers:** a defined responsible-disclosure path.
- **Downstream npm consumers:** unaffected (these files are repo-only, not shipped — M2-E3 `files`).
- **User-facing / production impact:** none.

## 5. Operational Requirements

1. `CONTRIBUTING.md` must describe the contribution flow, reference **Conventional Commits + SemVer via `docs/VERSIONING.md`** (not restate it), and list the `yarn` build/lint/test commands.
2. `SECURITY.md` must state supported versions and the reporting channel: **GitHub private vulnerability reporting** (Security tab) with the **DiamondsLab issues URL** as fallback; no private email is invented.
3. `CODE_OF_CONDUCT.md` must be the Contributor Covenant (v2.1), with the contact pointing at the same reporting channel.
4. `.github/ISSUE_TEMPLATE/` must contain a bug-report and a feature-request template; `.github/PULL_REQUEST_TEMPLATE.md` must include a checklist (tests, lint, changelog, Conventional Commit).
5. README must link `CONTRIBUTING.md` (Contributing section) and add a **Security** link; `docs/TESTING*` references must resolve (link the testing guide; note repo-only).
6. A pack check must confirm the community docs are **not** in the tarball (M2-E3 `files` ships only dist/LICENSE/README/CHANGELOG/VERSIONING).
7. Committed on the integration branch; no push/merge.

## 6. Security & Compliance Considerations

- No secrets/credentials/elevated privileges. `SECURITY.md` uses GitHub's built-in private reporting — **no contact email is fabricated** (owner-gate resolved to the default).
- Positive: establishes a responsible-disclosure path (a security *control*, documentation form).

## 7. Non-Goals (Out of Scope)

- CI workflows / commitlint enforcement under `.github/workflows/` → **M4** (this only adds templates; M4 adds workflows to the same `.github/`).
- Editing `docs/TESTING.md` *content* (only its references/links).
- Shipping these files in the npm tarball (they stay repo-only).
- README correctness/freshness (M3-E1, done) — this only adds the cross-links.
- Version bump / publish → **M5**.

## 8. Risk, Rollback & Recovery

- **Backup/snapshot:** none needed — additive docs + a small README edit on the integration branch; `main` untouched.
- **Rollback:** `git rm` the new files + revert the README edit. Fully reversible.

| Risk | Mitigation |
|------|------------|
| `SECURITY.md` lacks a real contact | Use GitHub private vulnerability reporting + issues URL (the agreed default); no fabricated email. |
| `CONTRIBUTING` duplicates the versioning policy | Link `docs/VERSIONING.md`, don't restate. |
| Community docs accidentally shipped in the tarball | Req 6 pack check confirms `files` excludes them. |
| Broken README cross-links | Verify the relative links resolve (files exist). |

## 9. Validation / Success Metrics

- `test -f CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md` (all present); `.github/ISSUE_TEMPLATE/*` + `.github/PULL_REQUEST_TEMPLATE.md` present.
- `CONTRIBUTING.md` contains a link to `docs/VERSIONING.md`; `SECURITY.md` names the reporting channel; `CODE_OF_CONDUCT.md` is Contributor Covenant.
- README contains links to `CONTRIBUTING.md` + `SECURITY.md`; `docs/TESTING.md` reference resolves.
- `npm pack --dry-run` file list does **not** include `CONTRIBUTING.md`/`SECURITY.md`/`CODE_OF_CONDUCT.md`/`.github/`.
- `yarn lint`/`yarn build`/`yarn test` exit 0; `git status` shows only the new docs + README.

## 10. Open Questions

- **CoC contact:** uses the same channel as `SECURITY.md` (GitHub reporting + issues). If a moderation email is later established, update the contact line — cosmetic.
- **Templates format:** Markdown issue templates (simple) vs GitHub form schema (`.yml`). Default to Markdown for portability; can upgrade in M4.
