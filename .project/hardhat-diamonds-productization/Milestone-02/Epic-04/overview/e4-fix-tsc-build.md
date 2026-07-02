# Epic 4 — Fix `tsc` Build (M2-E4)

> **Parent milestone:** M2 `packaging-metadata` *(not yet broken out — this epic was **pulled forward** from M2 during M0-E1 because it is a release blocker).*
> **Maps to:** [`hardhat-diamonds-productization-project-plan.md` → §5 M2-E4](../../../hardhat-diamonds-productization-project-plan.md)
> **Discovered by:** [M0-E2 baseline inventory §5](../../../Milestone-00/baseline-inventory.md)
> **Owner:** Eng · **Impact / blast radius:** High (release blocker) · **Status:** ✅ **Done (local)** on `chore/m0-repo-hygiene-baseline` · **Date:** 2026-06-27

---

## 2. Objective

Restore `yarn build` (`tsc`) to exit 0 so a clean `v1.2.0` can be built and published from source. The package shipped a stale `dist/` while the source no longer compiled — a hard release blocker.

## 3. Root cause

Commit `c9e2e07` ("impersonate Signer first, fund second") changed the fork-upgrade path to assign the deployer signer from `impersonateAndFundSigner(...)`, which returns a plain **ethers `Signer`** (`@diamondslab/diamonds/dist/utils/signer.d.ts`: `Promise<Signer>`). But `LocalDiamondDeployerConfig.signer` and the private field were typed `SignerWithAddress` (`HardhatEthersSigner`), a narrower type — so the assignment failed:

```
src/lib/LocalDiamondDeployer.ts(164,5): error TS2740:
  Type 'Signer' is missing the following properties from type 'HardhatEthersSigner':
  _accounts, _cachedPrivateKey, address, toJSON, and 3 more.
```

## 4. Fix applied

**Widen** the signer type to the base ethers `Signer` rather than cast. The field holds either a Hardhat signer (`hre.ethers.getSigners()`) **or** an impersonated ethers `Signer`; the only downstream use is `this.diamond.setSigner(this.signer as any)` (line 73, already `any`), so no `HardhatEthersSigner`-specific surface is needed. Widening is type-honest; an `as SignerWithAddress` cast would have falsely asserted an impersonated signer is a full Hardhat signer.

`src/lib/LocalDiamondDeployer.ts` (3 lines):
- `import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'` → `import { Signer } from 'ethers'`
- `signer?: SignerWithAddress` → `signer?: Signer` (in the **public** `LocalDiamondDeployerConfig`)
- `private signer: SignerWithAddress` → `private signer: Signer`

## 5. Acceptance criteria

- [x] `yarn build` (`tsc`) exits 0.
- [x] `yarn test` unchanged: **120 passing, 12 pending, 0 failing** (no regression).
- [x] Fix is type-honest (widen, not unsafe cast).
- [x] Public API type change recorded for M2-E2 / API surface.

## 6. Notes & follow-ups

- **Public type change (minor, non-breaking for typical use):** `LocalDiamondDeployerConfig.signer` is now `Signer` instead of `SignerWithAddress`. This is a *widening* on an optional input field — callers who *pass* a signer are unaffected (a Hardhat signer is still a `Signer`); only code that *read back* `config.signer` expecting `.address` would notice. README examples don't set `signer`. Reflect this in **M2-E2** (exports/API surface) and the `v1.2.0` CHANGELOG.
- `dist/` is gitignored and rebuilt at publish; only the `src/` change is committed.
- Lint remains red (225 prettier errors) — separate concern, **M0-E3**.
- When **M2** is broken out (`/breakout-milestone` → `/breakout-epics`), this epic already has its `Epic-04/overview/` home; the milestone overview should mark M2-E4 as already complete.
