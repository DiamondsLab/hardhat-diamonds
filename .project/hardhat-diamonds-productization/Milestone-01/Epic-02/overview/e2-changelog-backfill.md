# Epic 2 — Changelog Backfill (M1-E2)

> **Parent milestone:** [Milestone 2 — Licensing & Changelog (M1)](../../overview/milestone-02-licensing-changelog.md)
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M1-E2](../../../hardhat-diamonds-productization-project-plan.md)
> **Owner:** Eng · **Impact / blast radius:** Low (additive doc) · **Estimated effort:** S (~2–3h) · **Status:** 📋 Ready for `/create-prd`

---

## 2. Objective

Create a root `CHANGELOG.md` (Keep a Changelog format) giving consumers a trustworthy version history and a live `[Unreleased]`/`[1.2.0]` section that the rest of the productization work appends to and M5 finalizes at release.

## 3. Acceptance criteria

- [x] `CHANGELOG.md` at package root follows [Keep a Changelog](https://keepachangelog.com/) structure with a SemVer-ordered history.
- [x] Released versions `v1.1.0 → v1.1.15` are represented (older summarized, recent detailed), derived from `git tag` + `git log`.
- [x] **CORRECTED:** `loadDiamondContract` / peer-dep export / circular-dep fix were found **already released** (`v1.1.12`–`v1.1.15`) and are backfilled there — **not** `[Unreleased]`. `[Unreleased]` correctly holds the true post-`v1.1.15` deltas: **Fixed** fork-upgrade signer; **Changed** `signer` type widened to ethers `Signer` (M2-E4).
- [x] The inconsistent historical tagging (`v1.0.11` after `v1.1.7`; skipped patches) is acknowledged, not silently "corrected."
- [x] A reference to the M1-E3 versioning policy (marked "added in M1-E3" until it lands).

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
