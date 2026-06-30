# Release Runbook — `@diamondslab/hardhat-diamonds`

Step-by-step procedure to cut a release. Follow it top to bottom. Steps are labelled by
actor: **[Eng]** = any maintainer/contributor, **[Owner]** = requires DiamondsLab org
admin + npm `@diamondslab` access (privileged, **do not** automate around).

> **Versioning:** follow [`docs/VERSIONING.md`](../docs/VERSIONING.md) (SemVer +
> Conventional Commits + Keep a Changelog). The first release cut with this runbook is
> **`1.2.0`** (minor — new `exports` entry points + the `LocalDiamondDeployerConfig.signer`
> type widening; note `loadDiamondContract` already shipped in `1.1.15`).
>
> **Publishing is irreversible** — npm does not allow re-publishing a version. Rehearse
> (M5-E2 / §0) and verify the tarball before the tag push. Recovery is **forward-only** (§7).

Replace `X.Y.Z` with the target version (e.g. `1.2.0`) throughout.

---

## 0. Preflight — [Eng], gated by [Owner]

- [ ] Working tree clean on the release/integration branch (`git status`).
- [ ] `yarn build && yarn lint && yarn test` all green locally.
- [ ] CI is green (the `ci.yml` checks on the latest commit / PR).
- [ ] A dry-run rehearsal passed (see §6 / M5-E2: `npm publish --dry-run` + pack audit + monorepo build).
- [ ] **[Owner] M4-E3 is done:** the npm publish auth is in place — an `NPM_TOKEN` repo
      secret **or** an npm **Trusted Publisher (OIDC)** link to `DiamondsLab/hardhat-diamonds` —
      and Actions has `id-token: write` for provenance. **Do not proceed without this.**

## 1. Version bump — [Eng]

Bump **manually** (do not use `npm version`, which auto-creates a tag and could fire the
publish prematurely — we push the tag deliberately in §4):

```bash
# edit package.json "version" -> X.Y.Z   (e.g. 1.2.0)
npm pkg set version=X.Y.Z
node -p "require('./package.json').version"   # confirm X.Y.Z
```

Choose the bump per [`docs/VERSIONING.md`](../docs/VERSIONING.md): MAJOR (breaking),
MINOR (additive/new exports/widened input), PATCH (fix).

## 2. Finalize the changelog — [Eng]

In [`CHANGELOG.md`](../CHANGELOG.md):

- [ ] Rename `## [Unreleased]` → `## [X.Y.Z] - YYYY-MM-DD` (today's date).
- [ ] Add a fresh empty `## [Unreleased]` above it.
- [ ] Update the compare/link references at the bottom (`[Unreleased]: …/compare/vX.Y.Z...HEAD`, add `[X.Y.Z]: …/releases/tag/vX.Y.Z`).

## 3. Build + pack audit — [Eng]

```bash
yarn build
npm pack --dry-run
```

Confirm the tarball matches the expected manifest (M2-E3 baseline ≈ **39 files / ~174.6 kB**):

- [ ] **Includes:** `dist/**` (incl. `dist/index.d.ts`), `LICENSE`, `README.md`, `CHANGELOG.md`, `docs/VERSIONING.md`, `package.json`.
- [ ] **Excludes:** `docs/TESTING.md` / `TESTING_SUMMARY.md`, `src/`, `test/`, `*.tsbuildinfo`, coverage, `.github/`, community docs.
- [ ] Optionally `npm pack` + install the tarball into a throwaway project and import `.`, `/dist/utils`, `/dist/lib` (see §6).

Commit the bump + changelog (Conventional Commit), e.g.:

```bash
git add package.json CHANGELOG.md
git commit -m "release: vX.Y.Z"
```

## 4. Merge to `main` + tag — [Owner]

This ends the release-only-`main` policy for this cut.

- [ ] **[Owner]** Open/approve the PR merging the integration branch into `main`; confirm CI is green; merge.
- [ ] **[Owner]** From `main` (updated), push the tag — **this triggers the irreversible publish**:

```bash
git checkout main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z       # -> .github/workflows/release.yml runs npm publish --provenance
```

> The release workflow is **tag-only** (`on: push: tags: ['v*']`). No publish happens on
> branches/PRs. Pushing the tag is the deliberate, owner-controlled publish action.

## 5. Verify the publish — [Owner/Eng]

- [ ] The `Release` workflow run is green (Actions tab).
- [ ] `npm view @diamondslab/hardhat-diamonds version` → `X.Y.Z`.
- [ ] The npm package page shows a **provenance** attestation (the green "Built and signed" badge).
- [ ] Clean install resolves entry points:

```bash
mkdir /tmp/verify && cd /tmp/verify && npm init -y >/dev/null
npm install @diamondslab/hardhat-diamonds@X.Y.Z
node -e "require.resolve('@diamondslab/hardhat-diamonds');
         require.resolve('@diamondslab/hardhat-diamonds/dist/utils');
         require.resolve('@diamondslab/hardhat-diamonds/dist/lib');
         console.log('entry points resolve ✓')"
```

## 6. Dry-run (rehearsal — run BEFORE §4) — [Eng]

Non-publishing rehearsal to validate the package steps:

```bash
# with the X.Y.Z bump staged locally
npm publish --dry-run            # reports the version + file list (no upload)
npm pack                         # produces the tarball; inspect / install-test it
```

Also build the consuming monorepo against the packed prerelease (`yarn workspace:build`
/ `yarn compile` from the repo root). If anything is off, fix it and update this runbook.

## 7. Rollback / recovery

**Before the tag push:** nothing is published — just don't push the tag (or delete a
local tag: `git tag -d vX.Y.Z`). The `main` merge is revertible via a follow-up commit.

**After publish (irreversible — npm forbids re-publishing a version):** recover **forward**:

```bash
# 1) Mark the bad version deprecated with a reason
npm deprecate '@diamondslab/hardhat-diamonds@X.Y.Z' 'Broken release — use X.Y.(Z+1)'

# 2) Cut a fixed patch (repeat §1–§5 with X.Y.(Z+1))

# 3) If `latest` points at the bad version, move it to the good one
npm dist-tag add @diamondslab/hardhat-diamonds@X.Y.(Z+1) latest
```

Never attempt to re-publish the same version number.

## 8. Post-release — [Eng]

- [ ] Update the consuming monorepo to `X.Y.Z` and confirm it builds (`yarn workspace:build`, `yarn compile`).
- [ ] (Optional) Create a GitHub Release for `vX.Y.Z`, pasting the `[X.Y.Z]` changelog section.
- [ ] Open a fresh `[Unreleased]` is already done in §2; resume normal development.

---

### References
- [`docs/VERSIONING.md`](../docs/VERSIONING.md) — bump rules + commit policy
- [`CHANGELOG.md`](../CHANGELOG.md) — release history
- `.github/workflows/ci.yml` — quality gate (build/lint/test)
- `.github/workflows/release.yml` — tag-triggered provenance publish
- M2-E3 pack manifest (`.project/Milestone-02/Epic-03/`) — expected tarball contents
