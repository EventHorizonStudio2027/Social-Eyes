# Social Eyes repository handoff

## Verified repository

- Owner: `FatesPassage`
- Repository: `Social-Eyes`
- Visibility: private (verified through the connected GitHub integration)

## Source of truth

The complete application is currently preserved in a separate multi-file Phase 1 ZIP, latest locally inspected version `v0.3.0bv`. This repository does **not** yet contain the app source. Do not treat repository-only checks as application build verification.

## Required transfer steps

1. Extract the versioned ZIP and confirm its manifest and archive integrity.
2. Transfer the project files, preserving nested paths, including Expo routes, components, tests, migrations and workflows.
3. Exclude `.env` values, secrets, local dependencies and build artifacts.
4. Generate and commit a reproducible `package-lock.json` using the correct package manifest.
5. Run `npm ci`, `npm run verify:phase1`, `npm run typecheck` and `npm run doctor` in CI.
6. Validate actual mobile startup, sign-in, sign-out, password recovery, account switching and profile ownership with test users.

Phase 2 is frozen until these Phase 1 gates pass. Never claim a successful native build based solely on syntax tests.
