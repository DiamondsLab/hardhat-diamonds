# Tasks — package.json Metadata (M2-E1)

> Execution checklist for [`prd-e1-package-json-metadata.md`](prd-e1-package-json-metadata.md). Driven by `/df3ndr:process-task-list`.
>
> **Repo/branch:** `packages/hardhat-diamonds` submodule, integration branch `chore/m0-repo-hygiene-baseline` (release-only-`main`). **Owner:** Eng.

## Relevant Files & Resources

- `…/Milestone-02/Epic-01/prd-e1-package-json-metadata.md` — The Change Plan this executes.
- `…/Milestone-02/Epic-01/overview/e1-package-json-metadata.md` — The epic overview.
- `packages/hardhat-diamonds/package.json` — **Edited** (metadata + `prepack` lifecycle).
- `…/Milestone-02/Epic-01/CHANGELOG.md` — Epic change log to create/append.

### Notes

- Single reversible `package.json` edit — **no backup needed**; integration branch is the snapshot.
- **No code/API change.** `publishConfig.access: public` is intended (public package), not a secret. **Do NOT** set `provenance` or any token here — that's M4.
- Don't widen scope: no `exports` (M2-E2), no `files`/`.npmignore` (M2-E3), no version bump (M5).
- Validation is read-only (`npm pkg get`, JSON parse, gate exit codes).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on `chore/m0-repo-hygiene-baseline`, clean tree. — **On branch ✓.**
  - [x] 0.2 No backup needed; baseline captured (authors:["Am0rfu5"], string repository, lowercase bugs, no engines/publishConfig/homepage). — **Done.**

- [x] 1.0 Fix metadata fields in `package.json`
  - [x] 1.1 `authors` → `author: "Am0rfu5"`. — **Done; `npm pkg get authors` empty.**
  - [x] 1.2 `engines: { node >=18, yarn >=4 }`. — **Done.**
  - [x] 1.3 `publishConfig: { access: public }` (no provenance). — **Done.**
  - [x] 1.4 `repository` object form, DiamondsLab casing. — **Done.**
  - [x] 1.5 `bugs.url` DiamondsLab; add `homepage`. — **Done.**

- [x] 2.0 Fix the build-on-publish lifecycle
  - [x] 2.1 Add `prepack: "tsc"`. — **Done; `yarn pack --dry-run` exit 0.**
  - [x] 2.2 Keep `prepublishOnly`. — **Kept (harmless npm-path safety).**

- [x] 3.0 Validate the change
  - [x] 3.1 JSON valid + field values + `authors` empty. — **All confirmed (node v22 ≥ 18).**
  - [x] 3.2 `yarn lint` + `yarn build` + `yarn test`. — **lint 0 ✓, build 0 ✓, test 120 passing ✓.**
  - [x] 3.3 `yarn pack --dry-run` + monorepo resolve. — **pack exit 0 ✓; monorepo resolves the package ✓.**
  - [x] 3.4 Diff scope. — **Only `package.json` modified.**

- [x] 4.0 Record the change
  - [x] 4.1 Create/append `…/Milestone-02/Epic-01/CHANGELOG.md`. — **Done.**
  - [x] 4.2 Tick acceptance criteria in the PRD/epic overview. — **Epic overview §3 ticked.**
  - [x] 4.3 Commit; **no push/merge**. — **See commit below.**
