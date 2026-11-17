# Social Eyes — Mobile Foundation

Version: `0.3.0`  
Status: Phase 1 foundation + Phase 2 account/profile implementation (not production-verified)

Social Eyes is a real-world social discovery app. Users discover participating venues, opt into venue presence, view approximate zone-based radar positions, and create private mutual-interest connections.

## Technology baseline

- Expo SDK 58 / React Native 0.88
- React 19 + TypeScript
- Expo Router + Expo development client
- Supabase client prepared, but not connected until project credentials are supplied

## Requirements

- Node.js 22.13+ (or a supported newer Node release)
- npm
- iOS Simulator / Xcode for iOS simulator builds, or Android Studio for Android emulator builds
- A physical iPhone can be used with an Expo development build

## Start locally

```bash
npm install
npx expo install --fix
cp .env.example .env
npm run start
```

Then scan the QR code using a compatible Expo development client, or launch an emulator. For SDK 58, use a development build for a reliable native development workflow. The project is pinned to the current SDK 58 family; `npx expo install --fix` aligns Expo-managed packages before the first native build.

## Backend setup

1. Create a Supabase project.
2. Copy the project URL and public anon/publishable key into `.env`.
3. Never put a Supabase `service_role` key in this app.
4. Do not treat the app as live until database schema, row-level security, auth flows and server-side authorization are implemented and tested.

The app currently detects whether Supabase credentials exist. No live accounts, venue records, user positions or connection data are being fabricated.

## Project structure

```text
app/                  Expo Router screens and tabs
src/components/       Shared UI components
src/constants/        Design tokens
src/lib/              Backend client and shared services
supabase/migrations/  Versioned database migrations (to be added)
```

## Phase 1 checklist

- [x] Establish Expo + React Native + TypeScript project
- [x] Establish tab navigation and route structure
- [x] Establish shared dark visual system and reusable components
- [x] Add first-run welcome flow with persisted completion preference
- [x] Add Supabase client configuration boundary
- [x] Add environment template and secret-handling guidance
- [x] Add truthful empty states (no fake live activity)
- [ ] Install dependencies and run Expo Doctor
- [ ] Run TypeScript checks against installed SDK packages
- [ ] Configure actual Supabase project
- [ ] Expand persistent app preferences and add authenticated session handling
- [ ] Add loading, offline and recoverable error states
- [ ] Produce and test iOS/Android development builds

## Important product rules

- Never invent live venue counts or live people.
- Venue presence is opt-in and expires.
- Public radar positions are approximate, initially zone-based.
- One-sided interest is private; only mutual interest creates a connection.
- Location and social intention data require strict server-side access controls.

## Account setup (v0.3.0)

1. Create a Supabase project and add its public URL and anon/publishable key to `.env`.
2. Run `supabase/migrations/202611160001_profiles.sql` in Supabase SQL Editor.
3. Enable Email authentication in Supabase Auth settings; configure confirmation email delivery.
4. Install dependencies, run `npm run typecheck`, then test registration, email confirmation, sign-in, profile save, sign-out and session restoration on a device.
5. Test that account A cannot select, insert, update or delete account B's profile.

No account is auto-created in offline mode. A profile is owner-only and never implies venue check-in.

### Phase 1 validation note (v0.3.0p)
Run `npm run test:foundation` and `npm run audit:static` for dependency-free checks. These do not replace `npm install`, `npm run typecheck`, `npm run doctor`, and iOS/Android device tests. React Strict Mode effect replay and accessibility source guards were updated; native behavior remains unverified.

Phase 1 v0.3.0s: provider settings replay/write race guards added. Offline checks: `npm run test:foundation` and `npm run audit:static`. Full typechecking requires installing the Expo dependencies first.

### Privacy storage integrity
Missing settings on a first launch use conservative defaults. Corrupt or incomplete stored settings instead surface an error and lock editing until storage can be verified. This local behavior is **not** server-side presence enforcement.

### Offline syntax check
Run `npm run audit:syntax` when TypeScript is installed globally but project dependencies cannot be downloaded. This parses source files and detects syntax errors, **not** TypeScript type errors or missing dependencies. Do not use it as a replacement for `npm run typecheck`.


## v0.3.0x — privacy input hardening (2026-11-16)
- Required privacy fields must be **own properties** on write inputs; inherited values cannot masquerade as user preferences.
- Reject symbol-bearing privacy patches instead of silently dropping hidden fields.
- Added three executable storage regression tests (74/74 pass).
- Static source audit: 11/11 pass. TypeScript syntax: 23/23 parsed with zero syntax errors.
- No dependency installation, full typechecking, Expo Doctor, device build, or live backend test was completed. Phase 1 remains open; Phase 2 remains frozen.

### Backend configuration safety (Phase 1)
The mobile client refuses HTTP URLs, URL credentials, URL paths/query/fragment, empty keys, and `sb_secret_` secret keys. Only a public Supabase anon/publishable key may be placed in `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The application cannot independently prove an arbitrary key is nonprivileged: confirm key permissions before distribution. Live backend readiness and RLS must be tested separately.

### Packaging and CI
Run `python3 scripts/package-project.py /path/to/Social_Eyes.zip` to package the complete source project without local environment secrets, dependencies, or build outputs. The archive retains the project folder structure and must be verified before distribution. `.github/workflows/phase1-checks.yml` runs offline checks separately from a strict `npm ci` / TypeScript / Expo Doctor job. Until `package-lock.json` is generated from a successful dependency install, the full-build job is expected to fail and Phase 1 cannot be approved.


## Phase 1 follow-up — v0.3.0ac (packaging verification)
- Added deterministic full-source ZIP creation, SHA-256 manifest and independent package verifier. ZIP contents now have stable metadata for reproducible output.
- Packaging fails closed when a private environment file, private-key file, secret-like content or symbolic link is found; excluded build directories remain excluded.
- Added three executable tests for package integrity, reproducibility and tampering detection.
- CI offline stage now verifies the complete ZIP; the full-build stage explicitly fails when the required lockfile is absent.
- Verified locally: 88/88 foundation tests; 11/11 static checks; 23/23 TypeScript syntax parses; package/security audit passed; ZIP manifest and archive integrity passed.
- Still blocked: dependency lockfile, npm install, full TypeScript typecheck, Expo Doctor, mounted React Native tests, device builds and live backend checks. Phase 1 OPEN; Phase 2 FROZEN.

### Phase 1 build gate (v0.3.0ad)
The full-build CI job checks for `package-lock.json` before enabling npm caching. Generate the lockfile only with a successful real npm dependency resolution. The app rejects secret-prefixed Supabase credentials; use only a public publishable or legacy anon key in `EXPO_PUBLIC_*` variables.

### Phase 1 account safety (v0.3.0ae)
The account UI serializes submissions and guards stale results. Profile writes validate an allowlisted payload and verify the current Supabase user ID; the database owner-only RLS policies are still the authoritative security boundary. Apply both SQL migrations in order in a development Supabase project before testing profiles. This release has **not** been tested with a live backend or compiled mobile client.

### Account reliability (v0.3.0af)
Profile reads and writes check the authenticated identity, and reads reject malformed or mismatched records. The account editor requires an explicit retry if profile loading fails. Stale sign-out completions cannot modify a newer session. These are source-level protections; deployment must also apply the included RLS migrations and complete real-device authentication tests.

### Offline account service testing (v0.3.0ag)
`npm run test:foundation` now includes `tests/profile-service.integration.test.mjs`, which executes transpiled production profile-service code with a simulated Supabase boundary. These tests do **not** establish live RLS or device correctness. A live Supabase development project and an installed, locked dependency tree are required before Phase 1 sign-off.

### Database migrations
Apply all three migrations in filename order in a development Supabase project. The third migration narrows authenticated profile INSERT/UPDATE privileges to editable columns so clients cannot set `created_at` or `updated_at`. This protection is **not verified on a live database** until SQL migrations and cross-account tests are run.

### Live backend security audit
After applying all profile migrations to a development Supabase project, run `supabase/verification/phase1_profiles_audit.sql` in the SQL editor and follow `docs/LIVE_BACKEND_VERIFICATION.md`. These checks are not yet executed; passing offline source tests does not establish live RLS behavior.

### Live two-account security probe
With a disposable development Supabase project and two seeded test profiles, follow `docs/LIVE_BACKEND_VERIFICATION.md` and run `npm run verify:live-profiles`. This command uses GET requests only and requires explicit environment variables; it is not part of the offline test suite.

**v0.3.0ak:** `npm run test:foundation` now exercises the real two-user verification probe with simulated HTTP responses, including intentional privacy failures. Run `npm run verify:live-profiles` only with disposable development-project credentials; it performs read-only requests and does not establish write-policy security. Phase 1 is not signed off.

### One-command Phase 1 verification (v0.3.0al)
Run `npm run verify:phase1` for all dependency-free offline checks, or `npm run verify:phase1 -- --json` for machine-readable results. Run `npm run verify:phase1:full` only after generating a real package-lock.json and installing dependencies. Full mode fails closed (exit code 2) if either prerequisite is missing; it does not pretend a device build or live database test occurred. No credentials are required for offline checks.

### Phase 1 verification reports
Run `npm run verify:phase1` for offline checks or `node scripts/phase1-verify.mjs --json` for a machine-readable report. `npm run verify:phase1:full` additionally attempts TypeScript and Expo checks **only if** the lockfile and local dependencies exist; otherwise each is marked blocked. Neither command performs native builds or live Supabase tests. The `phase1SignedOff` field remains `false` until external acceptance gates are independently verified.

### Phase 1 CI and live-probe safety (v0.3.0an)
The only canonical GitHub Actions workflow is `.github/workflows/phase1.yml`. The read-only two-user probe validates its URL and credentials before sending requests. Never include account passwords, test access tokens, or private keys in the source ZIP; supply live-test credentials through a protected runtime environment only.

### Development machine preflight (v0.3.0ao)

Run `npm run diagnose:toolchain` on a development machine to check installed Node.js, npm, Git, lockfile and dependency prerequisites. Use `node scripts/local-toolchain.mjs --json` for a machine-readable report. The diagnostic is read-only, never installs dependencies, and never prints environment variable values. Once network access is available, generate a genuine `package-lock.json` with `npm install --package-lock-only`, review it, and run `npm ci`; then execute `npm run verify:phase1:full`. iOS validation additionally requires macOS/Xcode or an appropriate remote build environment. These are preparation steps, not evidence of successful native builds.

### Network-enabled installation handoff
Run `npm run bootstrap:dependencies` once to generate a real npm lockfile and verify dependencies on a network-enabled machine. Commit the reviewed lockfile. Subsequent setups use `npm run install:locked`. See `docs/BUILD_VALIDATION_RUNBOOK.md`. This environment cannot resolve the npm registry; build validation is still pending.


### v0.3.0aq packaging hardening
Source packaging and security audit now reject npm auth files, signing keys, mobile credentials and a reserved manifest collision. Independent verifier rejects malformed manifest paths/digests. Offline tests are not native or live-backend validation. Dependency lockfile and real builds remain pending. Phase 2 stays frozen.

### Account form validation (v0.3.0ar)
`src/lib/authInput.ts` performs local email-format and password-length checks before invoking Supabase authentication. It does not trim or alter passwords, and does not replace provider-side validation. Account editing and sign-in/sign-up mode switching are disabled while a request is pending.

### Account profile editing
The account editor indicates unsaved changes, avoids redundant saves, and requests confirmation before signing out with unsaved profile edits. First-time profiles receive a setup prompt. These flows have offline regression coverage but still require live React Native and Supabase testing.

### Error recovery (v0.3.0at)
The root React tree is wrapped in `AppErrorBoundary`. If a render-time exception occurs, the UI displays a neutral recovery message and a Try again action. The fallback intentionally does not expose raw exception content or user data. This boundary does not catch asynchronous errors, native crashes, or all event-handler exceptions; those need separate device testing and safe telemetry design.

### Password recovery (Phase 1)

The sign-in screen supports requesting a Supabase password-reset email. Configure the Supabase Auth **Site URL** to an approved recovery destination before live testing. This release does **not** yet provide a native in-app recovery-link callback or password-update screen; the email-request step must not be mistaken for a verified complete reset journey. Test delivery, link destination, expiration, and password update using a dedicated development account. Never place recovery tokens in project files or logs.

Password recovery: the app now supports changing a password after Supabase delivers a `PASSWORD_RECOVERY` auth event. Configure and test an approved native recovery redirect before enabling end-to-end claims; email delivery alone does not establish a working native reset flow.

### Password reset links (v0.3.0aw)
The app now handles native recovery callbacks using the strict `socialeyes://auth/recover` token-hash format. **The Supabase redirect allowlist and email template must be configured separately**, and real-device tests remain mandatory. See `docs/PASSWORD_RECOVERY_SETUP.md`. This is not yet a verified production recovery flow.


### v0.3.0ax — Recovery password confirmation
Recovery completion now requires a matching second password entry, with both fields cleared after attempts and account transitions. Passwords are compared exactly without trimming. This is source-level implementation; live native recovery and TypeScript compilation remain blocked until dependencies and a configured backend are available.

#### Recovery-session safety (v0.3.0ay)
A user can cancel password recovery, which attempts to sign out the OTP-created authenticated session. If sign-out fails, recovery remains active and an error is shown. Recovery URLs must match the dedicated callback exactly; malformed or path-normalized links are rejected. Verify this behavior against a configured Supabase project on iOS and Android before releasing.

### Signup email confirmation
When Supabase requires email confirmation, the account screen offers a resend action for the pending registration email, with a 60-second client-side cooldown. Configure the Supabase Auth email template, SMTP and server-side rate limits separately; the cooldown is not a security control. Email delivery and end-to-end verification have not yet been tested against a live project.

### v0.3.0ba — Profile editor consistency (2026-11-16)
- Reused shared Unicode-aware profile validation in the account editor instead of a separate JavaScript UTF-16 length check.
- Locked editable profile controls while the profile is loading; added a Unicode-aware bio character counter.
- After a successful save, reconciled displayed name/bio with the canonical values actually persisted.
- Added three source-contract regressions and updated the existing account-input test to cover the new loading guard.
- Offline: 182/182 foundation tests, 11/11 static checks, 29/29 syntax parses. Package-security audit passes, but npm lockfile is still absent.
- Full TypeScript compilation, live backend, and iOS/Android device tests remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

**Recovery navigation isolation (v0.3.0bb):** During an active password recovery session, the tab layout shows only the account recovery panel. Profile reads are suspended until recovery ends. This behavior is covered by source regression guards but still requires testing on iOS/Android with real Supabase recovery links.

#### Password recovery completion (v0.3.0bc)
After updating a password through the recovery callback, the client attempts to revoke the temporary recovery session and requires the user to sign in again. If revocation fails, the restricted recovery UI remains in place and asks the user to retry sign-out. Test both successful and failed sign-out against a live Supabase project before shipping.

### v0.3.0bd — Recovery auth-event ordering
- Added a pure recovery auth-event policy and regression tests: SIGNED_IN emitted during OTP verification and USER_UPDATED during password replacement must not prematurely unlock normal app navigation. SIGNED_OUT still clears the gate.
- If recovery password update succeeds but sign-out fails or throws, the recovery gate remains active.
- Offline tests and source audits only; no native build, full typecheck or live backend verification. Phase 1 OPEN; Phase 2 FROZEN.

### Recovery navigation protection (v0.3.0be)
The app blocks the tab navigator while inspecting a cold-start URL or verifying an incoming recovery token. This is a source-level safeguard, not proof of native linking or live Supabase operation. Test both cold and warm launches on iOS and Android before releasing.

**v0.3.0bf:** Recovery OTP links arriving during verification are serialized rather than dropped. Native and backend behavior remains unverified.

### v0.3.0bg — cold-start recovery gate ordering
The initial-link inspection now owns its own pending flag. A concurrent warm-link verification cannot release the navigation gate until cold-start URL inspection settles. Added a regression contract for the ordering and updated cleanup coverage. Source tests are not live-device validation; Phase 1 remains open and Phase 2 frozen.

### Connected backend (v0.3.0bh)
The Phase 1 backend is deployed in the `Social Eyes` Supabase project under `Event Horizon Studios` (region `us-east-1`). A separate private configuration directory has an `.env` with the project URL and a **publishable** client key. This file is kept outside the project tree and excluded from ZIP releases. To check it externally, set `SOCIAL_EYES_ENV_FILE` to its absolute path. For a fresh checkout, copy `.env.example` to `.env`, then obtain the project's publishable key from Supabase Project Settings → API Keys. Run `npm run check:backend-config` before installing dependencies. Never embed a Supabase secret/service-role key in a mobile build.

## Event Horizon Studios / live backend

The development Supabase project is `ojfehfvvdsekaqehwxuz` in `us-east-1`. The app uses the project URL `https://ojfehfvvdsekaqehwxuz.supabase.co` and a publishable key in a local `.env` (excluded from ZIP). For the current evidence boundary and remaining release gates, see `docs/LIVE_BACKEND_VERIFICATION.md`.

### v0.3.0bk — verified profile persistence
- Profile save now performs an authenticated read-after-write and compares all editable fields before confirming success.
- Database migration 004 enforces canonical trimmed profile fields for clients that bypass local validation.
- Added focused regression tests; live device and two-user authentication testing remain outstanding.

### Profile validation regression tests
`npm run test:foundation` now executes `tests/profile-validation.runtime.test.mjs`, which runs the real transpiled profile validation module against valid and invalid values. It does not require Supabase credentials or claim a native app build.

**Phase 1 anonymous access check:** `npm run verify:anonymous-boundary` requires
only public Expo Supabase environment variables and outbound network access.
It does not authenticate or modify data. A network failure is a blocked result,
not a pass. See `docs/LIVE_BACKEND_VERIFICATION.md`.

### GitHub-hosted dependency bootstrap (v0.3.0bp)
1. Push the source to a **private** GitHub repository (do not commit `.env` or signing credentials).
2. Under **Actions**, manually run **Bootstrap dependency lockfile (manual)**.
3. Download the `social-eyes-package-lock` artifact. It is uploaded even if compilation fails, so dependency-resolution evidence is not lost.
4. Review `package-lock.json` and commit it to the repository; the ordinary Phase 1 workflow can then use `npm ci`.
5. Inspect and resolve any TypeScript/Expo Doctor failures. A workflow file existing locally is not proof that it ran.

The lockfile verifier accepts HTTPS packages from the npm and Yarn registries and rejects unexpected hosts. A dependency with a legitimate different distribution host requires explicit review before changing the allowlist.

### Profile save concurrency (v0.3.0bv)
The profile service rejects a second simultaneous save for the same profile within one JavaScript runtime and releases the guard after either success or failure. This avoids accidental overlapping writes in a single app instance; it does not resolve edits from multiple devices. Server-side RLS remains mandatory.
