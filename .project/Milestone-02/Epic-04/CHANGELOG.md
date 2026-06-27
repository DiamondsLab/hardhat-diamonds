# Changelog — M2-E4 Fix `tsc` Build

Branch: `chore/m0-repo-hygiene-baseline`. Epic pulled forward from M2 (release blocker); executed directly from the M0-E2 finding.

## [Unreleased]

### M2-E4 — Fix tsc build / TS2740 (2026-06-27)

- **Fixed** `src/lib/LocalDiamondDeployer.ts` TS2740: widened the `signer` type (public `LocalDiamondDeployerConfig.signer` and the private field) from `SignerWithAddress` (`HardhatEthersSigner`) to ethers `Signer`, matching `impersonateAndFundSigner`'s `Promise<Signer>` return. Swapped the unused `@nomicfoundation/hardhat-ethers/signers` import for `ethers`.
- **Verified:** `yarn build` → exit 0 (was exit 2); `yarn test` → 120 passing / 12 pending / 0 failing (no regression).
- **Public type change (minor):** `LocalDiamondDeployerConfig.signer` is now `Signer` — widening on an optional input; non-breaking for typical use. To be reflected in M2-E2 and the v1.2.0 CHANGELOG.
- ✅ **M2-E4 complete (local).** Release blocker cleared.
