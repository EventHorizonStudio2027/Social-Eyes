# Social Eyes — Phase 1 foundation audit (2026-11-16)

**Gate: OPEN — not approved to advance.** Source review is not equivalent to a successful native build or device validation.

## Evidence-based findings
- Present: Expo Router application structure, React Native + TypeScript setup, dark theme, onboarding, local preferences, Supabase client scaffolding, backend reachability check.
- Fixed in this audit iteration: `app.json` version now matches `package.json` (0.3.0); onboarding no longer navigates forward when its completion flag fails to persist; the user sees an error and can retry; duplicate taps are disabled while saving.
- Remaining risk: backend reachability is not proof of auth, database access, row-level security or realtime correctness.
- Remaining risk: local privacy preferences must be tested across cold starts, storage failures, concurrent updates and app lifecycle transitions.
- Remaining risk: Expo SDK and React Native dependency compatibility is not verified; package installation did not complete within the available execution window.
- Remaining risk: no automated test suite or verified native iOS/Android builds are present in the reviewed archive.
- Remaining risk: no evidence of configured Supabase credentials, applied migrations or backend integration tests.

## Mandatory Phase 1 completion gate
- [ ] `npm install` succeeds and a lockfile is committed.
- [ ] `npm run typecheck` succeeds.
- [ ] `npm run doctor` succeeds with no unresolved material warnings.
- [ ] App launches in a real iOS or iOS simulator environment.
- [ ] App launches in an Android emulator or physical Android device.
- [ ] Navigation and onboarding work on both platforms, including storage-failure recovery.
- [ ] Privacy preferences persist across restarts; error states are tested; no visibility is enabled by default.
- [ ] Offline/online and foreground/background recovery are verified.
- [ ] Supabase development configuration and safe credentials are validated, without embedding service-role secrets.
- [ ] Automated unit/integration checks are present and passing.
- [ ] Accessibility and responsive-layout smoke tests pass.
- [ ] Critical issues are fixed and documented before explicit Phase 1 sign-off.

## Test execution this iteration
- Archive/source inspection: completed.
- `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=12000`: timed out; **not a pass**.
- TypeScript, Expo Doctor, iOS/Android launch, backend integration: **not run / not verified**.

Phase 2 additions already in v0.3.0 remain frozen pending Phase 1 approval.

## Follow-up iteration — reliability corrections
- Serialized local preference writes in the provider: a second switch interaction while a write is in flight is ignored, preventing competing writes from overwriting one another. A follow-up improvement is to expose a saving indicator and disable switches during persistence.
- Backend health requests now use a monotonically increasing request ID, so an older slow response cannot overwrite the result of a newer check.
- These are **source-level fixes only**. No dependency installation, compilation, emulator/device run, or backend validation has passed yet.

## Follow-up iteration — preference save feedback
- Added `settingsSaving` to the application provider and wired it to preference storage writes.
- Privacy switches are disabled while a write is pending; the screen announces “Saving preferences…” to avoid misleading repeated interactions.
- Retry-loading is disabled while a save is pending.
- **Not yet validated:** dependency installation, TypeScript compilation, iOS/Android runtime behavior, accessibility announcements, and failure recovery.
- Remaining design risk: retry-loading after a failed save is a reload of the last persisted settings, not a retry of the rejected change. Copy and UI should make this distinction explicit.

## Follow-up iteration — preference reload/write race and recovery wording
- Invalidate in-flight preference loads when a write starts, preventing a stale load response from replacing a newly saved preference.
- Block reloads during a pending write; use sequence checks to ignore outdated load responses.
- Corrected failed-save messaging: the prior preference remains active, and the user must repeat the switch action to retry.
- Relabeled the recovery action to “Reload saved preferences” so it does not falsely promise to retry a failed write.
- **Source-level review only:** native execution, compiler, dependency compatibility and device behavior remain unverified.

## Follow-up iteration — dependency validation and reproducible static checks
- Retried dependency installation; execution timed out without a successful installation. No lockfile was generated. This remains a blocker, not a passing test.
- Added `npm run audit:static` (Node built-ins only) to check nine structural/privacy invariants without installing packages. All nine checks passed in this environment.
- Static checks are intentionally limited: they cannot establish TypeScript compilation, dependency compatibility, UI behavior, backend security, or device readiness.
- Next gate: obtain a successful dependency installation and lockfile, then run `npm run typecheck` and `npm run doctor`; do not advance phases.

## Follow-up iteration — executable foundation checks (v0.3.0f)
- Retried dependency installation using npm with bounded fetch settings; did not finish before timeout. No successful install, lockfile, TypeScript compile, or Expo Doctor result. **Installation remains blocked.**
- Added a dependency-free `node:test` suite (`npm run test:foundation`) with six passing checks: manifest/version, router entry, no local secrets, privacy-safe defaults, backend health limitation, and settings concurrency guards.
- Re-ran the existing static audit: 9/9 passed.
- These are structural tests, **not** runtime tests of storage, auth, UI, network behavior, or native builds.
- Next: establish npm registry access and reproducible dependency install, then run TypeScript and Expo Doctor; Phase 1 stays OPEN.

## Follow-up iteration — storage failure fail-closed guard (v0.3.0g)
- Found a privacy-state reliability gap: a failed settings read previously exposed editable switches with fallback values, allowing attempts to overwrite preferences whose persisted state was unknown.
- Added `settingsStorageAvailable` to the provider. A successful read enables editing; a failed read forces safe defaults and disables all preference switches until a successful reload.
- Added visible explanation to the Profile screen. This is a source-level guard, not a substitute for real AsyncStorage failure testing.
- Executed `npm run audit:static`: 9/9 passed. Executed `npm run test:foundation`: 6/6 passed.
- Dependency install, TypeScript compilation, Expo Doctor, actual storage-failure simulation, and iOS/Android runtime validation remain unverified. Phase 1 remains OPEN.

## Follow-up iteration — ambiguous write failure (v0.3.0h)
- Identified a correctness issue: a rejected AsyncStorage write does not prove the previous persisted value is intact. Prior messaging incorrectly claimed the previous preference remained active and permitted more edits.
- Changed write-error handling to fail closed: show privacy-safe defaults, mark storage unavailable, block further edits until a successful explicit reload, and explain that the commit outcome is uncertain.
- This is a source-level correction. The project still requires dependency installation, TypeScript compilation, and device-level fault-injection tests before Phase 1 sign-off.

## Follow-up iteration — dependency installation root-cause diagnosis (v0.3.0i)
- Direct `npm ping` to `https://registry.npmjs.org/` failed with `EAI_AGAIN` (DNS resolution failure). This establishes a current network/environment blocker, **not** an Expo dependency compatibility result.
- Added `npm run diagnose:install`, a bounded Node/npm/DNS preflight that can be run before further install attempts; exits nonzero when DNS is unavailable.
- Do not infer that dependency versions are compatible or incompatible from this DNS failure. No TypeScript compile, Expo Doctor, or native device tests have passed.

## Follow-up iteration — offline storage behavior tests (v0.3.0j)
- Added `tests/storage.behavior.test.mjs`: six tests executing the actual settings and onboarding functions in a Node VM with simulated AsyncStorage. TypeScript-only syntax is stripped for the harness; no React Native or Supabase dependencies are installed.
- Confirmed safe first-run defaults, persistence across module instances, malformed data fallback, read/write error propagation, onboarding persistence/reset, and onboarding write rejection.
- Executed `npm run test:foundation`: **13/13 passed**; `npm run audit:static`: **9/9 passed**.
- Scope limitation: these are unit tests against a mocked storage adapter, not mounted React component tests, native AsyncStorage tests, device tests, or a compiler check. DNS/network installation blocker remains unresolved. Phase 1 remains OPEN.

## Follow-up iteration — backend health behavioral tests (v0.3.0k)
- Added `tests/backend-health.behavior.test.mjs` with six tests executing the existing backend health-check function in a Node VM with controlled fetch and timers.
- Covers missing configuration, HTTP success and failure, offline rejection, timeout cancellation, and public-key/URL request construction.
- Executed `npm run test:foundation`: **19/19 passed**; `npm run audit:static`: **9/9 passed**.
- These are offline unit tests. They do not establish actual Supabase connectivity, TypeScript compilation, Expo compatibility, or iOS/Android runtime behavior.
- Dependency installation remains blocked by npm registry DNS; Phase 1 OPEN and Phase 2 FROZEN.

## Follow-up iteration — health-check hard deadline (v0.3.0l)
- Found a reliability gap: aborting a fetch does not guarantee the fetch promise settles in every runtime, so the backend status could remain `checking` indefinitely.
- Updated `checkBackendHealth` to race the HTTP request against a six-second deadline. On expiry it aborts the request and returns `unreachable` even when fetch ignores cancellation; the timer is cleaned up.
- Added a behavioral regression test using a fetch promise that never resolves and ignores abort.
- Executed `npm run test:foundation`: **20/20 passed** and `npm run audit:static`: **9/9 passed**.
- These are offline checks, not full TypeScript typechecking or native execution. npm registry DNS, Expo Doctor, device testing, and real backend verification remain blocked/pending. Phase 1 OPEN; Phase 2 FROZEN.


## v0.3.0m — Latest-request lifecycle hardening (2026-11-16)
- Added `LatestRequest` generation tracker and integrated it with backend status refresh. Old responses cannot overwrite newer results; invalidation on effect cleanup prevents stale responses after unmount and remains compatible with React Strict Mode effect replays.
- Provider now maps unexpected health-check rejection to `unreachable`, rather than leaving the indicator at `checking`.
- Added six executable tracker behavior tests, including out-of-order promise completion and late completion after invalidation/disposal. Updated the static audit to check the new guard.
- Local validation: 26/26 Node foundation tests passed; 9/9 static checks passed. These are not React component integration tests.
- Still blocked: npm registry access, dependency install, full TypeScript typecheck, Expo Doctor, iOS/Android builds, live backend checks. Phase 1 is NOT complete.

## v0.3.0n — Foreground/background connectivity correctness (2026-11-16)
- Added a small lifecycle decision function. `active` triggers a fresh health check; inactive/background states invalidate pending results so late HTTP success cannot overwrite the state.
- Introduced an explicit `paused` backend status instead of falsely reporting a network failure when the app simply goes inactive. The Profile screen explains the paused state.
- Added five executable offline tests, including a delayed response after background invalidation, and a static audit assertion for the provider integration.
- These checks do not mount React Native components. Package installation, TypeScript compilation, Expo Doctor, native device checks and Supabase integration are still outstanding. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0o — provider lifecycle hardening (source validation only)
- Provider tracks mount state and prevents stale settings or backend promises from updating UI after teardown.
- Backend refresh refuses new work while backgrounded; results must still belong to the latest request and active lifecycle.
- AppState startup treats only explicitly inactive/background states as paused, avoiding an indefinite initial `checking` when the platform reports an unknown startup state.
- Added 10 source-contract tests for provider lifecycle and privacy UI wording. These are **not** React Native component tests.
- Validation: 41/41 Node tests and 10/10 static checks passed. Native builds, typecheck, Expo Doctor, real backend and UI integration remain unverified.

## v0.3.0p — Strict Mode lifecycle and accessibility source audit
- Fixed a development Strict Mode effect-replay issue: provider cleanup previously called `LatestRequest.dispose()`, permanently disabling subsequent checks after replay; cleanup now invalidates pending work without permanently disposing the reusable tracker. The effect setup restores `mounted.current = true` after replay.
- Added accessibility semantics for privacy switches (checked/disabled state), announced preference storage errors, and disabled redundant/paused connection-refresh controls with descriptive labels.
- Added five accessibility source-contract tests and a Strict Mode source audit assertion. These are NOT native screen-reader or mounted React component tests.
- Remaining blockers: dependency installation/lockfile, full TypeScript check, Expo Doctor, native builds, actual screen-reader checks and backend integration. Phase 1 OPEN; Phase 2 FROZEN.

## v0.3.0q lifecycle and privacy messaging review
- Treat unknown/null initial AppState as inactive, rather than assuming connectivity.
- Avoid duplicated initial backend checks and duplicate active events.
- Recheck connection on Strict Mode setup after cleanup invalidates previous requests.
- Make explicit that local fallback defaults do not revoke existing server-side presence; server visibility is not implemented or verified.
- Expanded source-contract checks. These do not replace mounted component/device tests.
- Dependency installation, TypeScript typecheck, Expo Doctor, and native builds remain unverified. Phase 1 is not signed off.

## v0.3.0r — Strict Mode settings replay guards
- Moved settings reload into the effect setup that restores mounted state, so a Strict Mode replay starts a fresh read after cleanup invalidates the old one.
- Added mount-generation checks for asynchronous settings writes, preventing results from an earlier mount lifecycle from changing a later mount UI.
- Added three source-contract regression tests; these do not mount React components or verify native behavior.
- Phase 1 OPEN; Phase 2 FROZEN. Dependency installation, full TypeScript, Expo Doctor, native and backend validation remain pending.

## v0.3.0s — settings write/replay reconciliation
- Fixed a cross-generation race: an old mount's failed save must not invalidate the new mount's settings read.
- If Strict Mode replays provider setup during an in-flight write, defer the skipped storage reload until that write settles. Do not treat a replay's previous settings or saving indicator as verified state.
- Added three regression source-contract tests and updated an outdated assertion to match the guarded completion block.
- `node --test tests/*.test.mjs`: **56/56 pass**; static audit **11/11 pass**.
- Attempted globally available `tsc --noEmit`: **failed because project dependencies and Expo's inherited TypeScript configuration are absent** (e.g. missing `expo-router`, React Native types and JSX settings). This is **not** a valid app compilation pass, nor evidence of a code-specific TypeScript failure.
- React component behavior, actual device storage, Expo Doctor, iOS/Android and Supabase remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

## v0.3.0t — Privacy storage integrity (2026-11-16)
- Changed `loadSettings` so a missing key is treated as a new installation, but malformed JSON, an unexpected record shape, or missing/nonboolean privacy fields are treated as *unverified storage*, not a successful load.
- Existing provider error handling locks editing and displays conservative defaults until the user successfully reloads storage. This does not change server-side visibility.
- Added regression tests for invalid records, an empty record, and valid explicit choices.
- Verified locally: `npm run test:foundation` 58/58; `npm run audit:static` 11/11.
- Still blocked: dependency installation, complete TypeScript checking, Expo Doctor, native builds, component tests, live Supabase checks.

## v0.3.0u — Runtime privacy write validation and recovery
- Added `validateSettings` and `validateSettingsPatch` to reject malformed runtime values, unexpected patch keys, and empty patches before a storage write. Types alone do not enforce runtime integrity.
- Persist only the three known boolean privacy fields; do not copy unknown metadata into saved records.
- Provider validates a patch before entering its saving state. This is a source-level safeguard, not proof of UI behavior on devices.
- Expanded executable storage tests: malformed writes, no mutation of previous records, invalid patches, recovery after corrupt records, forward-compatible extra read metadata, and propagated write errors.
- Verified locally: `npm run test:foundation` **66/66 passed**; `npm run audit:static` **11/11 passed**.
- The test harness uses a limited TypeScript-to-JavaScript text transformation to exercise selected real storage functions; it is not a full TS compiler or mounted React test.
- Still pending: dependency installation, TypeScript, Expo Doctor, React component tests, native builds, real Supabase. Phase 1 OPEN; Phase 2 FROZEN.


## v0.3.0v — Offline storage edge cases and build gate
- Patch validation now returns an independent allowlisted object rather than a caller-owned object.
- Added behavioral tests for patch mutation, inherited properties, ambiguous write-then-reject outcomes, and read recovery.
- Added `npm run diagnose:build` to explicitly report missing lockfile/dependencies/local compiler and Expo CLI; this does not attempt network installation.
- Full React Native build, Expo Doctor, component tests, native devices, and Supabase remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0w — Offline parser and installation gate (2026-11-16)
- Added `npm run audit:syntax`, which uses the available TypeScript parser to parse the actual `.ts` and `.tsx` app files without requiring Expo packages. This checks syntax **only**, not types, module resolution, bundling or runtime behavior.
- Added a regression test executing the syntax audit, rather than merely checking that the audit script exists.
- Reconfirmed `npm ping --fetch-retries=0 --fetch-timeout=6000` fails with `EAI_AGAIN` for `registry.npmjs.org`; this is an environmental DNS/network blocker, not proof of dependency incompatibility.
- Remaining mandatory gates: reproducible dependency installation and lockfile; full `tsc --noEmit`; Expo Doctor; mounted component tests; iOS/Android runs; real Supabase integration. Phase 1 **NOT** signed off.


## v0.3.0x — privacy input hardening (2026-11-16)
- Required privacy fields must be **own properties** on write inputs; inherited values cannot masquerade as user preferences.
- Reject symbol-bearing privacy patches instead of silently dropping hidden fields.
- Added three executable storage regression tests (74/74 pass).
- Static source audit: 11/11 pass. TypeScript syntax: 23/23 parsed with zero syntax errors.
- No dependency installation, full typechecking, Expo Doctor, device build, or live backend test was completed. Phase 1 remains open; Phase 2 remains frozen.


## v0.3.0y — backend endpoint configuration guard (2026-11-16)

- Added HTTPS-only URL validation before sending the public Supabase key to the backend health endpoint; malformed URLs, credentials, query parameters and fragments are rejected. Secure custom domains remain supported.
- Added two executable behavior tests covering invalid endpoints and secure custom-domain requests.
- Offline tests: 76/76 passed; static audit: 11/11 passed; syntax parser: 23/23 files passed.
- **Not validated:** dependency installation, full TypeScript typechecking, Expo Doctor, mounted component behavior, iOS/Android builds, and live Supabase integration. Phase 1 remains open; Phase 2 frozen.

## Follow-up iteration — Supabase client configuration guard (v0.3.0z)
- Identified a mismatch: the health-check endpoint was validated, but the Supabase client could be initialized from an unsafe or malformed URL.
- Added `isSafePublicBackendConfig` to the Supabase client setup: requires HTTPS root URL without credentials, query or fragment; rejects missing keys and keys beginning `sb_secret_`.
- Reused the configuration guard in the health check, preventing it from claiming readiness when the client configuration is invalid.
- Added four executable configuration tests and updated the existing health-check harness for the changed import.
- Verified: 80/80 offline foundation tests, 11/11 static checks, 23/23 TS/TSX syntax parses. No dependency installation, full typechecking, Expo Doctor, native launch, or live Supabase verification has passed.
- Limit: the prefix guard cannot prove an arbitrary key is public; deployment must independently verify the key's privilege and that no service-role/secret credential enters a mobile bundle.
- Phase 1 OPEN; Phase 2 FROZEN.

## v0.3.0aa — Packaging and release gate
- Added package/security audit and executable regression test, plus a device/build-validation runbook.
- No lockfile was invented; reproducible installation and native validation remain blocked until registry access is restored.
- Phase 1 OPEN; Phase 2 FROZEN.

## Follow-up iteration — secure source packaging and CI (v0.3.0ab)
- Fixed package audit blind spot for nested `.env` files and blocked symlinks that could expose outside files. Legitimate nested `.env.example` templates remain allowed.
- Added four executable regression tests for nested environment files, templates, symlinks and private-key files.
- Added `scripts/package-project.py` for a complete, versioned source ZIP, excluding secrets, dependencies, build artifacts and logs; it rejects symlinks.
- Added `.github/workflows/phase1-checks.yml` with separate offline checks and a strict full-build job (`npm ci`, TypeScript, Expo Doctor). Full-build CI is expected to fail until a real lockfile is generated and verified; do not bypass that gate.
- Offline results: **85/85 tests**, **11/11 static checks**, **23/23 TS/TSX syntax parsed**, package-security audit passed. Source ZIP integrity checked.
- **Not verified:** dependency installation, full typechecking, Expo Doctor, native builds, component/device tests, live Supabase. Phase 1 OPEN; Phase 2 FROZEN.


## Phase 1 follow-up — v0.3.0ac (packaging verification)
- Added deterministic full-source ZIP creation, SHA-256 manifest and independent package verifier. ZIP contents now have stable metadata for reproducible output.
- Packaging fails closed when a private environment file, private-key file, secret-like content or symbolic link is found; excluded build directories remain excluded.
- Added three executable tests for package integrity, reproducibility and tampering detection.
- CI offline stage now verifies the complete ZIP; the full-build stage explicitly fails when the required lockfile is absent.
- Verified locally: 88/88 foundation tests; 11/11 static checks; 23/23 TypeScript syntax parses; package/security audit passed; ZIP manifest and archive integrity passed.
- Still blocked: dependency lockfile, npm install, full TypeScript typecheck, Expo Doctor, mounted React Native tests, device builds and live backend checks. Phase 1 OPEN; Phase 2 FROZEN.

## v0.3.0ad — credential and CI lockfile safeguards (2026-11-16)
- Reject surrounding whitespace in public credentials and unsupported `sb_` key prefixes, including secret-key variants; legacy anon/JWT and publishable keys remain supported.
- Retain defense-in-depth endpoint checks in the health monitor alongside the shared client validator.
- Move the CI lockfile gate ahead of npm cache initialization; add an executable ordering regression test.
- npm registry access remains blocked by EAI_AGAIN; no dependency installation or native build claimed. Phase 1 OPEN, Phase 2 FROZEN.

## v0.3.0ae — Identity and profile safety
- Profile writes now validate and allowlist editable fields, check the current authenticated user using `auth.getUser()`, and construct the database payload using the verified user ID rather than trusting a caller-provided ID. Server RLS remains essential.
- Account screen prevents duplicate in-flight submissions, ignores stale profile save responses across account changes, clears password on session change and after auth attempts, and reports unsuccessful sign-out.
- Auth provider protects against an older initial session read replacing a newer auth event, handles rejected auth requests, and explicitly manages auto-refresh on app lifecycle and cleanup.
- Added server-side `updated_at` trigger migration. Migration not executed against live Supabase.
- Offline source/behavior tests do not prove React runtime, native builds, network behavior, or Supabase RLS enforcement.

## v0.3.0af — Profile-read integrity and account-session race controls
- Profile reads now request the current authenticated user and refuse mismatched requested IDs before querying. The server's RLS remains authoritative.
- Database response fields and owner ID are validated before being returned to the editor; malformed records fail closed.
- Failed profile loading disables the editor and offers an explicit retry, avoiding accidental overwrites of a previously existing profile.
- Sign-out completion is session-generation guarded so a stale request cannot modify a newer session's UI state.
- Added profile-response behavioral and account lifecycle regression checks. Offline tests do not constitute real Supabase, mounted React, or device verification.

## v0.3.0ag — Executed profile-service integration and authentication race guards
- Added `tests/profile-service.integration.test.mjs` to transpile and execute the real TypeScript profile service against mocked Supabase methods. Validated owner enforcement, profile allowlisting, malformed responses, and auth/database failure propagation.
- Guarded delayed session-restore errors against newer auth events in `AuthProvider`.
- Blocked profile retry while account requests are active, and disabled save during profile errors.
- Added `tests/auth-restore-race.guard.test.mjs` for source-level regression checks.
- Offline verification: 109/109 foundation tests; 11/11 static checks; 24/24 TypeScript syntax parsed; package/security audit passed. No npm lockfile or installed dependencies; compilation, Expo Doctor, device testing, and live Supabase remain unverified.

## v0.3.0ah — Profile timestamp permissions
- Added `202611160003_profile_timestamp_permissions.sql`: limits authenticated INSERT/UPDATE column privileges to editable profile fields, leaving `created_at` and `updated_at` server-controlled. Existing owner-only RLS remains in force.
- Added offline migration contract tests. These are not live PostgreSQL privilege tests: verify migrations against a development Supabase project before sign-off.

## v0.3.0ai
Added a read-only live PostgreSQL catalog verification script and a two-user RLS/device testing runbook. The SQL script is unexecuted against a live database. Offline checks: 112/112 foundation, 11/11 static, 24/24 syntax. No dependency lockfile; full-build and device validation remain blocked. Phase 2 remains frozen.

### v0.3.0aj — Read-only live identity probe and strict policy inventory
- Added `scripts/verify-two-user-profiles.mjs`, a read-only two-user API test requiring separate seeded accounts and short-lived access tokens.
- Hardened SQL catalog audit to reject extra profile policies and API-role execution of the timestamp function.
- Added regression tests and live-test setup instructions.
- Offline foundation tests: 115/115 passed; static checks: 11/11 passed; syntax parsing: 24/24 passed.
- Live API and SQL catalog probes remain **unexecuted**; package installation, full typecheck and mobile builds remain **unverified**.

## v0.3.0ak — executable live-probe regression coverage

- Refactored read-only two-account verification into importable functions with injected HTTP client and logger; command-line behavior retained.
- Corrected anonymous probe to omit the bearer Authorization header (supports public publishable keys).
- Added redirect rejection and prevented upstream error response bodies from being printed.
- Added eight executable simulated-HTTP regression tests, including deliberate cross-user and anonymous leaks, duplicate identity, absent seeded profile, failed authentication, safe error reporting and credential validation.
- Foundation suite: 123/123 passed. Live database, dependency installation, TypeScript compilation, Expo Doctor and mobile device checks remain unverified.

### v0.3.0al — Verification orchestration
Implemented a single offline validation command with explicit full-mode opt-in and machine-readable JSON output. The runner invokes npm directly without a shell and distinguishes blocked prerequisites from failing tests. Offline suite: 125/125 tests; static 11/11; syntax 24/24; package audit passed. No live Supabase or native validation performed.

## v0.3.0am — Evidence runner and CI hardening
- Unified verifier now reports blocked TypeScript and Expo checks separately; it never conflates these with native builds or live Supabase checks.
- JSON output intentionally omits raw subprocess stderr to reduce accidental disclosure of credentials in CI artifacts.
- Three runtime tests exercise actual offline/full JSON behavior and duplicate CLI flags; CI security tests cover read-only workflow token, no persistent checkout credentials, job timeouts, concurrency, and lockfile-first install.
- CI offline job runs the unified verifier. Full build still requires a real npm lockfile and dependency installation.
- Full app build, Expo Doctor, device testing, and live database verification remain unperformed. Phase 1 is not signed off; Phase 2 remains frozen.

### v0.3.0an — canonical CI and live-probe input validation
- Removed duplicate `.github/workflows/phase1-checks.yml`, retaining hardened `phase1.yml` as the single CI workflow. The lockfile-order regression now targets the canonical workflow and asserts there is only one YAML workflow.
- The live two-user probe now handles malformed URLs without leaking raw input, rejects credential control characters/whitespace, and rejects case-insensitive Supabase secret key prefixes. New runtime tests assert invalid input causes zero network requests.
- Offline checks are not a substitute for live RLS enforcement, dependency installation, TypeScript compilation, or native builds. Phase 1 remains open and Phase 2 frozen.

### v0.3.0ao — Local toolchain preflight
- Added `scripts/local-toolchain.mjs` with read-only Node/npm/Git, lockfile, local dependency, and macOS Xcode checks, plus JSON output.
- Added two executable regression tests and `diagnose:toolchain` npm script.
- Offline verification: 135/135 foundation tests, 11/11 static checks, 24/24 TS/TSX files parsed. Full typechecking, dependency installation, device builds and live backend tests remain unverified.

## v0.3.0ap — Network-enabled dependency bootstrap
Added `scripts/bootstrap-dependencies.mjs` to generate a genuine npm lockfile only when requested, verify root package metadata, perform `npm ci`, and optionally run TypeScript and Expo Doctor. Four regression tests cover invalid flags, duplicate flags, absent lockfile, and locked-installation source contract. This environment still cannot resolve `registry.npmjs.org` (EAI_AGAIN), so installation and compilation are NOT verified. Offline foundation: 139/139; static: 11/11; syntax: 24/24. Phase 1 open; Phase 2 frozen.


### v0.3.0aq audit
Source packaging and security audit now reject npm auth files, signing keys, mobile credentials and a reserved manifest collision. Independent verifier rejects malformed manifest paths/digests. Offline tests are not native or live-backend validation. Dependency lockfile and real builds remain pending. Phase 2 stays frozen.

## v0.3.0ar — Account form safety
- Added `src/lib/authInput.ts` for conservative client-side email format and password length validation; Supabase remains authoritative.
- Account screen now disables mode switching and text editing during in-flight operations, preventing conflicting user input while a request is pending.
- Five new behavioral regression tests cover normalization, malformed input, password bounds, mode validation and form locking.
- Offline foundation suite: 148/148 passing. Full compilation, device execution and live backend remain unverified.

## v0.3.0as — Account profile draft safeguards
- Added `src/lib/profileDraft.ts` for normalized dirty-state comparison and validated save snapshots.
- Account editor now distinguishes first-time profile setup from existing profiles, indicates unsaved changes, avoids redundant saves, and warns before signing out with unsaved edits.
- Added five regression tests for draft comparison, canonicalization, and sign-out warning wiring.
- Verified offline: 153/153 foundation tests, 11/11 static source checks, 26/26 TS/TSX syntax parses; source package audit passes with missing lockfile explicitly blocked.
- Still unverified: actual React Native rendering, complete TypeScript typechecking, npm installation, iOS/Android builds, and live Supabase integration.

## v0.3.0at — Application resilience and account accessibility
- Added `AppErrorBoundary` at the root to contain React render errors and provide an explicit remount action. Raw exception details are deliberately not shown or logged.
- Improved account inputs with bounded email/password lengths, email autocorrection disabled, and assistive-technology disabled states.
- Added four regression tests for boundary wiring, recovery, credential input configuration and accessibility state.
- Offline foundation tests: 157/157 passed; static checks: 11/11 passed; TS/TSX syntax: 27/27 parsed.
- NOT VERIFIED: React Native runtime error-boundary behavior on device, full TypeScript typecheck, native builds, live Supabase permissions. Dependency lockfile remains missing.

### v0.3.0au — Account recovery and archive-test reliability

- Added email-only password recovery request in the sign-in UI, with request locking, generic account-existence messaging, and bounded email validation.
- Added Supabase Auth password reset request handler with non-sensitive error messaging; relies on configured Supabase Auth Site URL.
- Added four recovery regression tests and repaired the older auth-input test harness to accommodate the new validator.
- Corrected ZIP corruption regression to damage the local-file header deterministically rather than a random middle byte.
- Offline checks: 161/161 foundation tests, 11/11 static checks, 27/27 syntax parsed. No full TypeScript compilation or device/live backend verification.
- The password reset completion/deep-link flow is not implemented or verified. Phase 1 remains open; Phase 2 remains frozen.

## v0.3.0av — Password recovery completion UI
- Added a recovery-session-gated password update form, using Supabase `PASSWORD_RECOVERY` and `updateUser`.
- Clears new-password entry after attempts; rejects invalid lengths and avoids exposing backend error details.
- Recovery deep-link routing and project URL configuration remain **unimplemented/unverified**; the form is only usable once Supabase emits the recovery event in the app.
- Offline source-contract tests do not substitute for native end-to-end recovery testing.

### v0.3.0aw recovery callback audit
- IMPLEMENTED (source): strict custom-scheme callback parsing, warm/cold URL listeners, recovery token verification, redirect configuration in reset request, regression tests, and setup runbook.
- VERIFIED (offline): 167 foundation tests, 11 static checks, 28 syntax parses.
- BLOCKED / UNVERIFIED: live backend, email templates, actual device deep linking, compiled builds, verified HTTPS universal/app links. Do not sign off Phase 1.


### v0.3.0ax — Recovery password confirmation
Recovery completion now requires a matching second password entry, with both fields cleared after attempts and account transitions. Passwords are compared exactly without trimming. This is source-level implementation; live native recovery and TypeScript compilation remain blocked until dependencies and a configured backend are available.

### v0.3.0ay security and validation
- Recovery cancellation signs out the temporary authenticated session, without treating failed sign-out as success.
- Dedicated recovery callback rejects normalized/encoded path and ambiguous authority variants.
- Account-generation guard protects new password input from stale request cleanup.
- Offline foundation tests 175/175 passed; static checks 11/11 passed; TS/TSX syntax 29/29 parsed. Live Supabase and native device verification still BLOCKED.

### v0.3.0az verification
Signup confirmation resend added and covered by four new source regression checks. 179 foundation tests passed, 11 static checks passed, 29 TS/TSX syntax parses passed. Live Supabase resend, email delivery, lockfile-based installation, compilation, and device validation are still blocked/unverified. Phase 1 NOT signed off; Phase 2 frozen.

### v0.3.0ba — Profile editor consistency (2026-11-16)
- Reused shared Unicode-aware profile validation in the account editor instead of a separate JavaScript UTF-16 length check.
- Locked editable profile controls while the profile is loading; added a Unicode-aware bio character counter.
- After a successful save, reconciled displayed name/bio with the canonical values actually persisted.
- Added three source-contract regressions and updated the existing account-input test to cover the new loading guard.
- Offline: 182/182 foundation tests, 11/11 static checks, 29/29 syntax parses. Package-security audit passes, but npm lockfile is still absent.
- Full TypeScript compilation, live backend, and iOS/Android device tests remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0bb — Recovery-session navigation isolation
- The tab layout now replaces normal navigation with the dedicated recovery account panel while `recoverySession` is true.
- Profile loading is suspended during recovery and restarted when recovery state changes.
- Added two navigation/profile isolation regression guards. Foundation suite: 184/184 passing; static 11/11; TS/TSX syntax 29/29.
- **Unverified:** TypeScript typecheck, native navigation behavior, actual Supabase recovery lifecycle and builds. These remain Phase 1 blockers.

### v0.3.0bc security gate
- Implemented recovery-password update followed by mandatory recovery-session sign-out; fail closed if sign-out fails.
- Recovery sign-out behavior requires live Supabase verification, including network failure after password update and session persistence across app restart.
- Phase 1 remains OPEN. Phase 2 remains FROZEN. No real-device build, live backend verification, or full TypeScript compilation has been established.

### v0.3.0bd — Recovery auth-event ordering
- Added a pure recovery auth-event policy and regression tests: SIGNED_IN emitted during OTP verification and USER_UPDATED during password replacement must not prematurely unlock normal app navigation. SIGNED_OUT still clears the gate.
- If recovery password update succeeds but sign-out fails or throws, the recovery gate remains active.
- Offline tests and source audits only; no native build, full typecheck or live backend verification. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0be: Deep-link startup and verification gate
- Implemented initial URL inspection and active-link verification navigation gating.
- Offline foundation tests 193/193 passed; static source audit 11/11; TypeScript syntax parse 30/30.
- Native cold-start race and actual link delivery remain **unverified** until device testing.
- Phase 1 remains OPEN; Phase 2 FROZEN.

### v0.3.0bf recovery-link concurrency
- Implemented serialized recovery OTP verification with latest-pending-link queue and continuous navigation gate.
- Remaining gate: actual Supabase backend, real native deep links, full TypeScript compilation, iOS/Android builds, and user sign-off.

### v0.3.0bg — cold-start recovery gate ordering
The initial-link inspection now owns its own pending flag. A concurrent warm-link verification cannot release the navigation gate until cold-start URL inspection settles. Added a regression contract for the ordering and updated cleanup coverage. Source tests are not live-device validation; Phase 1 remains open and Phase 2 frozen.

### v0.3.0bk — verified profile persistence
- Profile save now performs an authenticated read-after-write and compares all editable fields before confirming success.
- Database migration 004 enforces canonical trimmed profile fields for clients that bypass local validation.
- Added focused regression tests; live device and two-user authentication testing remain outstanding.

## v0.3.0bm: executable validation tests
- Added `tests/profile-validation.runtime.test.mjs`, which transpiles the actual TypeScript validation module using the available TypeScript compiler and executes its exported functions. This is behavioral testing, not a text-pattern assertion or a substitute for project typechecking.
- Tested normalized drafts, malformed fields, disallowed control characters, preserved biography newlines, Unicode code-point length limits, owner checks, and noncanonical server records.
- Live read-only SQL validation checked ten profile input cases against the deployed PostgreSQL constraint expressions: all ten outcomes matched expectations. This does not test authenticated client writes or RLS end-to-end.
- No schema changes in this batch; Phase 2 remains frozen.

### v0.3.0bn evidence
- Anonymous Data API probe added and unit tested (five scenarios).
- SQL grant/RLS check: anon SELECT false, RLS true, four policies.
- Live REST probe still requires outbound network access.
- npm dependency registry and native builds remain unverified.

### v0.3.0bp — build reproducibility
Added a dedicated lockfile verifier and GitHub bootstrap workflow with fail-safe artifact retention. Local offline foundation, static, syntax, and package-security checks pass. GitHub execution, npm installation, typecheck, Expo Doctor, real-account authentication, and native builds remain unverified.

## v0.3.0bt security checkpoint
Profile read-back now performs a second authenticated identity check after the network response. Added coverage for account switches, sign-outs, and save verification. Offline tests are not a substitute for native or live-backend verification.

### v0.3.0bv evidence
- Local process profile-write concurrency guard and two executable regression cases: verified offline.
- Offline phase-1 verification: 234 foundation tests passed, static, syntax, and package checks passed.
- Concurrent editing across devices, hosted TypeScript compilation, Expo Doctor, native devices and live two-user RLS: **not verified**.
