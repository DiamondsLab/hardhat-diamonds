# Epic 2 — Changelog Backfill (M1-E2)

> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../../overview/milestone-02-licensing-changelog.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Low (additive doc) · **Estimated effort:** S (~2–3h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Create a root `CHANGELOG.md` (Keep a Changelog format) giving consumers a trustworthy version history and a live `[Unreleased]`/`[1.2.0]` section that the rest of the productization work appends to and M5 finalizes at release.

## 3. Acceptance criteria

- [ ] `CHANGELOG.md` at package root follows [Keep a Changelog](https://keepachangelog.com/) structure (`## [x.y.z] - date`, `Added/Changed/Fixed/Removed` groups) with a SemVer-ordered history.
- [ ] Released versions `v1.0.11 → v1.1.15` are represented (older patches may be summarized; recent ones detailed), derived from `git tag` + `git log`.
- [ ] An `[Unreleased]` (→ `[1.2.0]`) section captures the user-facing changes known so far:
  - **Added:** `loadDiamondContract` export (`LoadDiamondArtifact`); `LocalDiamondDeployer`/`LocalDiamondDeployerConfig` exported for peer-dependency use.
  - **Fixed:** circular-dependency / `lib` entry point; fork-upgrade signer (impersonate-first) bug.
  - **Changed:** `LocalDiamondDeployerConfig.signer` type widened `SignerWithAddress` → ethers `Signer` (M2-E4) — minor, non-breaking for typical use.
- [ ] The inconsistent historical tagging (e.g. `v1.0.11` tagged after `v1.1.7`) is acknowledged, not silently "corrected."
- [ ] A link/reference to the M1-E3 versioning policy.

## 4. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Extract the release history: `git tag --sort=creatordate` + `git log` between tags; map each tag to its notable commits | Eng | Per-version note list assembled |
| 2 | Scaffold `CHANGELOG.md` with Keep a Changelog header + SemVer sections (newest first) | Eng | Skeleton present |
| 3 | Backfill `v1.0.11 → v1.1.15` (summarize trivial patches; detail `LocalDiamondDeployer` migration, peer-dep export, circular-dep fix) | Eng | Released sections written |
| 4 | Seed `[Unreleased]`/`[1.2.0]` with the known user-facing changes (see §3), incl. the M2-E4 signer change | Eng | Unreleased section complete |
| 5 | Cross-link the versioning policy (M1-E3) and confirm dates/format | Eng | Links resolve; format valid |

## 5. Dependencies & owner gates

- **Upstream:** M0-E2 baseline (tag/version facts); M1-E3 (format/policy should be agreed first or concurrently).
- **Owner gates:** none.
- **Downstream:** M2/M3 append to `[Unreleased]`; **M5** renames `[Unreleased]` → `[1.2.0]` with the release date and cuts the version.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Backfilled history is inaccurate (messy tags) | Derive strictly from git; summarize rather than invent; flag uncertain entries. |
| `[1.2.0]` content goes stale as later milestones add changes | `[Unreleased]` is the live accumulator; M5 finalizes it — don't hard-date `1.2.0` here. |
| Over-detailing ancient patches | Summarize `≤ v1.1.x` minor patches in one line each; spend detail on the 1.1.x→1.2.0 deltas that matter to users. |

## 7. Notes

- Reversible additive doc. This is the **package-root** `CHANGELOG.md` (consumer-facing), distinct from the per-epic `.project/**/CHANGELOG.md` execution logs.
- Source of truth for the `[1.2.0]` deltas: M0-E2 baseline inventory + the M2-E4 epic overview.
- Don't bump `package.json` version here (that's M5).
