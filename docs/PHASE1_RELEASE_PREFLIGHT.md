# Phase 1 release preflight — 2026-11-18

This branch adds `npm run preflight:release`, an offline, fail-closed check of:
- referenced iOS, Android, and shared app icons (plus optional splash/notification images);
- package/manifest version agreement;
- committed npm lockfile;
- TypeScript and Expo Router entry files;
- accidental presence of a local `.env` file.

Use `npm run preflight:release -- --json` for a machine-readable report.

## Evidence limitations
The script was added through GitHub source editing. It has **not** been executed in a checked-out repository or native build environment in this iteration. A passing preflight would not establish working iOS or Android builds, auth, database RLS, accessibility, or live radar safety.

At source inspection, `app.json` references `assets/images/social-eyes-icon.png` and `assets/images/social-eyes-adaptive-foreground.png`. Verify that both files exist and are valid images before attempting release. The previously reported missing lockfile also requires resolution through a real dependency installation, not a fabricated lockfile.

## Phase gate
**OPEN**. Do not approve Phase 2 until install, typecheck, Expo Doctor, iOS/Android launch, privacy persistence, offline recovery, backend authorization tests, and accessibility smoke tests have passed with recorded evidence.
