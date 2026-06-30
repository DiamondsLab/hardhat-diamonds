# Epic 1 — MIT License File (M1-E1)

> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../../overview/milestone-02-licensing-changelog.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E1](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng + Owner (OP-1 confirm) · **Impact / blast radius:** Low (additive file; affects published tarball legal clarity)
> **Estimated effort:** XS (~30 min once OP-1 confirmed) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Add a root `LICENSE` file with the standard MIT text so the package's declared `"license": "MIT"` is legally backed and the license ships to consumers. [M0-E2](../../../Milestone-00/baseline-inventory.md) confirmed the file is **absent on disk** yet listed in `package.json: files` — so it is silently dropped from the tarball today.

## 3. Acceptance criteria

- [x] `LICENSE` exists at the package root with verbatim, SPDX-correct MIT text.
- [x] Copyright line uses the **owner-confirmed** holder string (OP-1: `DiamondsLab`) and year `2025-2026`.
- [x] `package.json: "license": "MIT"` is unchanged and consistent (no SPDX edit needed).
- [x] `npm pack --dry-run` lists `LICENSE` in the tarball (42 files; was missing in the 41-file M0-E2 baseline).
- [x] No other file changes; gates remain green (lint/build exit 0).

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | **OP-1:** obtain the exact MIT copyright holder string (legal entity vs "DiamondsLab" vs individual) + year | Owner | Holder string confirmed in writing |
| 2 | Create root `LICENSE` with standard MIT text + the confirmed `Copyright (c) 2025–2026 <holder>` line | Eng | File present, text matches canonical MIT |
| 3 | Confirm `package.json` `license`/`files` already reference MIT/`LICENSE` (no edit expected) | Eng | Verified consistent |
| 4 | Re-run `npm pack --dry-run` and confirm `LICENSE` now appears | Eng | LICENSE in tarball file list |

## 5. Dependencies & owner gates

- **Upstream:** none (M0 complete).
- **Owner gate — OP-1 (blocking this epic's finalization):** Owner confirms the exact copyright holder. Use `DiamondsLab` as a placeholder for drafting, but the epic is not *done* until the real string is set. Do not guess a legal entity.
- **Downstream:** M2-E3 (tarball verification) asserts LICENSE ships; M5 references it.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Wrong copyright entity (individual vs org vs LLC) | Block on OP-1; placeholder clearly marked until confirmed. |
| MIT text altered/non-canonical | Use the verbatim OSI MIT template; only the year + holder line is variable. |
| `files` whitelist or `.npmignore` still excludes it | Task 4 re-runs pack to prove inclusion (the `files` array already lists `LICENSE`). |

## 7. Notes

- Reversible: single additive file; `git rm` to undo.
- SPDX identifier for reference: `MIT`. Standard template — only the copyright line varies.
- Stays untouched: source, other config, README (README already links `LICENSE`; M3 audits README separately).
