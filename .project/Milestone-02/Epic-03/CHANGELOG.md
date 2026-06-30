# Changelog — M2-E3 Tarball Verification

Branch: `chore/m0-repo-hygiene-baseline`.

## [Unreleased]

### M2-E3 — Finalize publish manifest + clean-build prepack (2026-06-28)

- Reduced to a **single** packaging strategy: deleted the redundant `.npmignore` (a blocklist already overridden by `files`); `files` is now the only source of truth.
- Made `files` precise: `["dist/", "LICENSE", "README.md", "CHANGELOG.md", "docs/VERSIONING.md"]` — so **`CHANGELOG.md` now ships** (it previously did not) and internal `docs/TESTING.md` / `docs/TESTING_SUMMARY.md` are excluded.
- Hardened `scripts.prepack` → `tsc --build --force` so publishes always emit a complete `dist/` (incremental `tsbuildinfo` could otherwise drop `dist/index.d.ts`). Proven: deleting `index.d.ts` then running prepack restores it.
- **Validated:** pack list 39 files / 174.6kB; includes dist + LICENSE + README + CHANGELOG + VERSIONING; excludes TESTING*; no src/test/coverage/tsbuildinfo leaks. Install-test resolves `.`/`/dist/utils`/`/dist/lib`; LICENSE+CHANGELOG present. lint/build/test green (120 passing).

**Final publish manifest (for M5 runbook):** 39 files, 174.6 kB unpacked. Non-`dist/` payload: `CHANGELOG.md`, `LICENSE`, `README.md`, `docs/VERSIONING.md`, `package.json`.

- ✅ **M2-E3 complete (local).** No push/merge.

---

### 🏁 M2 milestone (Packaging & Metadata) COMPLETE

All four epics done on the integration branch: **M2-E1** (package.json metadata) · **M2-E2** (exports map) · **M2-E3** (tarball verification) · **M2-E4** (tsc build fix). The package is now publish-ready: correct metadata, formal entry points with back-compat, a clean verified tarball, and a green build/test/lint. Remaining before release: M3 (README/docs), M4 (CI), M5 (runbook + cut).
