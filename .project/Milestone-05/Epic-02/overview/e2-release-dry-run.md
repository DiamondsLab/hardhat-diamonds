# Epic 2 — Release Dry-Run (M5-E2)

> **Parent milestone:** [Milestone 6 — Release Runbook & Cut (M5)](../../overview/milestone-06-release-runbook-cut.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M5-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng (local) + Owner (CI rehearsal) · **Impact / blast radius:** Low (non-publishing) · **Estimated effort:** S (~1–2h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Rehearse the runbook **without publishing** to prove it works and catch issues before the irreversible cut. The local steps are fully Eng-doable; the full CI rehearsal (workflows actually running) needs the workflows merged + M4-E3 secrets (owner-side).

## 3. Acceptance criteria

- [ ] `npm publish --dry-run` (with the `1.2.0` bump staged locally) succeeds and reports the intended files/version.
- [ ] `npm pack` + install-test in a throwaway project resolves `.`/`/dist/utils`/`/dist/lib` and includes LICENSE/CHANGELOG (re-confirm the M2-E3 result at release state).
- [ ] The consuming monorepo builds against the packed prerelease (`yarn compile` / resolve check).
- [ ] Any **owner-side** rehearsal (running `ci.yml`/`release.yml` on a branch/pre-release tag) is noted as pending M4-E3, not blocking the local dry-run.
- [ ] Findings (if any) fed back into the runbook (M5-E1).

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Stage a local `1.2.0` bump + changelog date (on a scratch/temp basis or the release branch) | Eng | bump staged |
| 2 | `npm publish --dry-run` — confirm version + file list | Eng | dry-run green |
| 3 | `npm pack` + install-test (entry points + LICENSE/CHANGELOG) | Eng | install-test green |
| 4 | Build the consuming monorepo against the packed prerelease | Eng | monorepo green |
| 5 | (Owner, optional) push a throwaway pre-release tag to rehearse `release.yml` once M4-E3 is done | **Owner** | CI run observed (or deferred) |
| 6 | Update the runbook with any rehearsal findings | Eng | runbook updated |

## 5. Dependencies & owner gates

- **Upstream:** M5-E1 (the runbook to rehearse); M2-E3 (pack already verified); M4 (workflows).
- **Owner gate (non-blocking for the local dry-run):** running the actual workflows requires M4-E3 secrets + merged workflows — owner-side; the local dry-run proceeds without it.
- **Downstream:** M5-E3 (the real cut, after a green rehearsal).

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Dry-run diverges from the real publish | Use the same commands the runbook/`release.yml` use (`npm publish --dry-run`, `npm pack`); same `prepack` clean build. |
| Local bump pollutes the branch | Stage the bump on a scratch basis or a dedicated release branch; don't commit the bump until E3. |
| CI rehearsal blocked by M4-E3 | Note as owner-side/pending; local dry-run is sufficient to validate the runbook's package steps. |

## 7. Notes

- **Non-publishing** — `--dry-run`/`pack` only; nothing reaches npm. Reversible.
- Re-uses the M2-E3 install-test approach at the actual release state.
- Don't commit the `1.2.0` version bump here — that's M5-E3.
