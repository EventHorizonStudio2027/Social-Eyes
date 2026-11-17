# Social Eyes — v0.3.0 development status

## Implemented in source
- Phase 1 Expo Router shell, dark theme, local privacy preferences and backend health checks.
- Phase 2 account foundation: Supabase email/password sign-in, sign-up, persisted auth session, sign-out, and session refresh lifecycle.
- Authenticated profile editor: display name, bio and social intent with validation.
- Owner-only `profiles` table SQL migration with row-level security and no public profile read policy.
- Truthful disconnected state when Supabase credentials are absent.

## Not yet verified / not complete
- npm install, TypeScript compilation, Expo Doctor, native builds, emulator tests.
- Supabase project configuration and SQL migration execution.
- Email confirmation and production email deliverability tests.
- Password recovery, account deletion, moderation and production security audit.
- Venue discovery, check-ins, live presence, radar, mutual Eyes, messages and notifications.

## Security note
Local preference toggles do not grant venue presence. No public profile discovery is enabled. Before launch, validate row-level security against multiple accounts and design server-side venue authorization.

Phase 1 v0.3.0m: backend request lifecycle guard and 6 additional behavior tests; 26/26 foundation tests, 9/9 static checks passed. Native/typecheck/backend remain unverified.

Latest: v0.3.0n, backend lifecycle invalidation and paused state. Phase 1 still open; no native/typecheck verification.

v0.3.0o: Provider lifecycle hardening and 10 additional source-contract checks. 41/41 Node tests and 10/10 static checks passed; full dependency/type/native validation still blocked.

## v0.3.0p Phase 1 validation update
- Corrected provider effect-replay lifecycle issue: invalidate pending requests rather than permanently disposing the tracker in effect cleanup; restore mounted state on effect setup.
- Improved privacy switch accessibility state, error announcements, and connection-refresh disabled state.
- Offline foundation suite: 47/47 passed; static source audit: 11/11 passed.
- No npm install, TypeScript compilation, Expo Doctor, native app test, or Supabase integration has been verified. Phase 1 remains open; Phase 2 frozen.

Phase 1 v0.3.0q: lifecycle startup and duplicate-event safeguards; explicit local-versus-server privacy warning. Native validation remains blocked.

### v0.3.0r
Strict Mode settings reload and mount-generation protections added; source-level tests only. Phase 1 remains open.

### v0.3.0s checkpoint
Strict Mode storage reconciliation and stale-write invalidation safeguards added. 56/56 offline tests and 11/11 static checks passed. Full compilation still blocked by unavailable dependencies; Phase 1 OPEN, Phase 2 FROZEN.

### v0.3.0t privacy integrity
Invalid stored privacy records now raise a recoverable error instead of being treated as confirmed defaults. Offline foundation tests 58/58 and static audit 11/11 pass. Native/TypeScript/backend verification remains blocked or pending. Phase 1 is not approved.

### Phase 1 v0.3.0u
- Runtime validation added for privacy settings writes and patches; 66/66 offline foundation tests and 11/11 static checks passed.
- Full compilation, Expo/native checks and real backend testing remain blocked/unverified. Phase 1 is not complete.


## v0.3.0v — Offline storage edge cases and build gate
- Patch validation now returns an independent allowlisted object rather than a caller-owned object.
- Added behavioral tests for patch mutation, inherited properties, ambiguous write-then-reject outcomes, and read recovery.
- Added `npm run diagnose:build` to explicitly report missing lockfile/dependencies/local compiler and Expo CLI; this does not attempt network installation.
- Full React Native build, Expo Doctor, component tests, native devices, and Supabase remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0w
Offline TS/TSX parser check added and executed (syntax only). npm registry DNS still unavailable (`EAI_AGAIN`). Full typechecking and mobile validation remain blocked. Phase 2 frozen.


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

### v0.3.0z — Supabase configuration guard
- Client and health check now share HTTPS/public-key configuration validation.
- Offline foundation suite: 80/80 passing; static audit: 11/11; syntax: 23/23.
- Full install, typecheck, Expo Doctor, device and live backend validation remain outstanding.

## v0.3.0aa — Packaging and release gate
- Added package/security audit and executable regression test, plus a device/build-validation runbook.
- No lockfile was invented; reproducible installation and native validation remain blocked until registry access is restored.
- Phase 1 OPEN; Phase 2 FROZEN.

## v0.3.0ab — Phase 1 packaging/security checkpoint
- Nested private environment files and symlinks rejected by security audit; four regression tests added.
- Complete source ZIP packaging script and CI workflow added. CI full-build gate requires a real lockfile and network-enabled dependency installation.
- Offline: 85/85 tests; 11/11 static checks; 23/23 syntax parses. No native build or full typecheck verified.
- Phase 1 OPEN; Phase 2 FROZEN.


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

### v0.3.0ae — Profile ownership and account lifecycle
- Implemented defensive client-side profile validation and authenticated ownership verification.
- Strengthened account form request serialization and stale-response handling, auth lifecycle refresh and error handling.
- Added a second SQL migration for server-maintained profile modification timestamps.
- Phase 1 remains open; Phase 2 frozen. Live backend and native builds still unverified.

### v0.3.0af
Profile read integrity, explicit profile reload on failure, and stale sign-out UI protection implemented. Phase 1 remains open; Phase 2 remains frozen. No dependency lockfile, live backend test, full TypeScript check, or native build has been verified.

### v0.3.0ag
Added executed profile-service tests and tightened session restoration/profile reload race handling. Foundation 109/109; static 11/11; TS parsing 24/24. Phase 1 open; Phase 2 frozen. Dependency lockfile, full compile, Expo Doctor, native and live backend testing pending.

### v0.3.0ah
Profile database timestamp permissions tightened by an additive migration. Live SQL execution and account-based RLS tests remain mandatory before Phase 1 sign-off.

## v0.3.0ai — live backend verification groundwork
- Added read-only `supabase/verification/phase1_profiles_audit.sql` for live schema/RLS/privilege/trigger checks; NOT yet executed against Supabase.
- Added `docs/LIVE_BACKEND_VERIFICATION.md` with two-user API and device acceptance steps.
- Added offline SQL audit contract test. Foundation tests 112/112, static 11/11, syntax 24/24 passed.
- Missing lockfile, full compilation, live SQL audit and device checks remain blockers. Phase 1 open; Phase 2 frozen.

### v0.3.0aj
Read-only two-user Supabase profile isolation probe added; SQL policy inventory audit strengthened. Offline checks passed (115 tests, 11 static checks, 24 TS/TSX syntax parses). Live database checks not executed. Phase 1 open; Phase 2 frozen.

### v0.3.0ak

The read-only two-user security probe is executable under simulated HTTP with fail-closed regression coverage; anonymous requests omit bearer headers, and backend error bodies are redacted by omission. 123/123 offline foundation tests pass. No live Supabase verification or full mobile build has been completed. Phase 1 remains open; Phase 2 frozen.

### v0.3.0al — Unified verification entrypoint
Added `scripts/phase1-verify.mjs`, two orchestration tests, package scripts and documentation. Offline verification passed 125/125 tests, 11/11 static checks, 24/24 TS/TSX syntax checks and package audit. Dependency lockfile, full typecheck, Expo Doctor, native builds and live Supabase checks remain outstanding. Phase 2 remains frozen.

### v0.3.0am
Evidence-oriented verification reports distinguish passed/failed/blocked checks from unperformed native/live gates. CI hardened with read-only permissions, no persisted checkout credentials, job timeouts, and concurrency cancellation. No production credentials or secrets added. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0an
Consolidated duplicate CI workflows and hardened live probe credential validation. Offline foundation suite: 133/133 passed. Live database, full build, and native device tests remain outstanding. Phase 2 frozen.

**v0.3.0ao:** Added executable, read-only development toolchain preflight and JSON reporting. Offline suite 135/135; static audit 11/11; syntax parser 24/24. Phase 1 remains OPEN; Phase 2 remains FROZEN. Dependency lockfile and native/live verification remain outstanding.

### v0.3.0ap
Dependency bootstrap handoff added. Genuine lockfile, npm ci, full TypeScript/Expo validation, native builds, and live Supabase remain outstanding. Offline tests 139/139 passed; Phase 1 not signed off.


### v0.3.0aq progress
Source packaging and security audit now reject npm auth files, signing keys, mobile credentials and a reserved manifest collision. Independent verifier rejects malformed manifest paths/digests. Offline tests are not native or live-backend validation. Dependency lockfile and real builds remain pending. Phase 2 stays frozen.

### v0.3.0ar
Account form input validation and in-flight editing safeguards added. Offline tests 148/148 passed. Phase 1 remains open; Phase 2 frozen. No live build claim.

### v0.3.0as
Profile draft state and unsaved-change protection added to account editor. Offline tests 153/153; static checks 11/11; syntax 26/26. Phase 1 OPEN; Phase 2 FROZEN. Lockfile and runtime/device/live backend checks remain pending.

### v0.3.0at
Root-level render-error containment and retry UI added; account form accessibility and input bounds improved. Offline tests 157/157, static 11/11, syntax 27/27. This is not a production or device validation. Phase 1 open; Phase 2 frozen.

### v0.3.0au status

Password recovery email requests are now available from sign-in, with conservative email validation and anti-enumeration messaging. A complete password-reset flow still requires a configured and tested recovery destination. Offline tests: 161/161 passed; static: 11/11; syntax: 27/27. Full compile, native build, and live Supabase checks remain outstanding. Phase 2 frozen.

v0.3.0av: Recovery password update UI and provider method implemented, but recovery link/deep-link integration and live Supabase testing are pending. Phase 1 open, Phase 2 frozen.

## v0.3.0aw — Native recovery callback foundation (2026-11-16)
- Added strict `socialeyes://auth/recover` callback parser accepting a token hash only, with tests rejecting untrusted origins, duplicate query parameters, fragments, and unrelated link types.
- Auth provider listens for cold-start and foreground links, calls `verifyOtp` for recovery tokens, and releases listeners on unmount.
- Reset email now requests the app-specific callback URL; added `docs/PASSWORD_RECOVERY_SETUP.md` for required Supabase allowlist and email template setup.
- Offline foundation tests: 167 passed; static checks: 11 passed; syntax parse: 28 files passed.
- **Not yet validated:** actual email link delivery, iOS/Android opening, Supabase live token exchange, native builds, or full TypeScript compilation. Production verified HTTPS app/universal links remain an open hardening item. Phase 1 remains open; Phase 2 frozen.


### v0.3.0ax — Recovery password confirmation
Recovery completion now requires a matching second password entry, with both fields cleared after attempts and account transitions. Passwords are compared exactly without trimming. This is source-level implementation; live native recovery and TypeScript compilation remain blocked until dependencies and a configured backend are available.

### v0.3.0ay — Recovery session exit and callback hardening
- Added explicit recovery cancellation that signs out the OTP-created session; failure keeps recovery mode active.
- Rejects recovery callbacks with path-normalization tricks, encoded paths, whitespace/control characters, or backslashes.
- Guards recovery password cleanup against account-generation changes.
- Added four regression tests and updated two earlier assertions to match the safer cleanup logic.
- Foundation tests: 175/175; static checks: 11/11; syntax parsing: 29 files. No full compilation or native/live testing yet.

## v0.3.0az — signup confirmation resend
- Added Supabase `auth.resend({ type: 'signup' })` with non-disclosing failure text.
- Added pending-confirmation UI, a 60-second local cooldown, timer-based re-enable, and account/email-change cleanup.
- Four new source regression tests; 179/179 foundation tests, 11/11 static checks, 29/29 syntax parses passed.
- This is NOT live-verified: email delivery, server rate limits, full TypeScript typecheck and native builds remain pending.

### v0.3.0ba — Profile editor consistency (2026-11-16)
- Reused shared Unicode-aware profile validation in the account editor instead of a separate JavaScript UTF-16 length check.
- Locked editable profile controls while the profile is loading; added a Unicode-aware bio character counter.
- After a successful save, reconciled displayed name/bio with the canonical values actually persisted.
- Added three source-contract regressions and updated the existing account-input test to cover the new loading guard.
- Offline: 182/182 foundation tests, 11/11 static checks, 29/29 syntax parses. Package-security audit passes, but npm lockfile is still absent.
- Full TypeScript compilation, live backend, and iOS/Android device tests remain unverified. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0bb
Recovery sessions now isolate the recovery UI from the regular tab navigator, and profile loading is suspended while recovering. 184 foundation tests pass, 11 static checks pass, and 29 TS/TSX files parse. Full compilation, live backend verification, and native device testing are still blocked/unverified. Phase 2 remains frozen.

### v0.3.0bc — Recovery session termination
- Successful password recovery now signs out the temporary recovery-authenticated session before reporting success, requiring a fresh ordinary sign-in.
- If sign-out fails after the password update, recovery remains restricted and a specific retry instruction is displayed; the operation is not reported as fully successful.
- Added regression checks for operation ordering and user messaging. Source checks are not native or live-backend verification.

### v0.3.0bd — Recovery auth-event ordering
- Added a pure recovery auth-event policy and regression tests: SIGNED_IN emitted during OTP verification and USER_UPDATED during password replacement must not prematurely unlock normal app navigation. SIGNED_OUT still clears the gate.
- If recovery password update succeeds but sign-out fails or throws, the recovery gate remains active.
- Offline tests and source audits only; no native build, full typecheck or live backend verification. Phase 1 OPEN; Phase 2 FROZEN.

### v0.3.0be — Recovery deep-link navigation gate
- Initial native URL inspection blocks normal tab navigation until complete.
- Valid incoming recovery links block tabs during asynchronous OTP verification, including while the app is already running.
- Added three contract regressions; foundation tests 193/193, static 11/11, syntax 30/30.
- **Not verified:** native deep-link delivery, actual Supabase OTP verification, TypeScript compilation, or device builds.

### v0.3.0bf — Serialized recovery links
- Incoming valid recovery links received during an ongoing OTP verification are queued (latest wins) instead of silently discarded.
- The navigation gate remains closed across sequential OTP verifications; queued URLs are discarded on provider cleanup.
- Three new contract tests added. This is offline source-level verification, not proof of native deep-link behavior.

### v0.3.0bg — cold-start recovery gate ordering
The initial-link inspection now owns its own pending flag. A concurrent warm-link verification cannot release the navigation gate until cold-start URL inspection settles. Added a regression contract for the ordering and updated cleanup coverage. Source tests are not live-device validation; Phase 1 remains open and Phase 2 frozen.

### v0.3.0bh — Live Supabase project connection
- Live project `Social Eyes` under `Event Horizon Studios` (US East) is ACTIVE_HEALTHY.
- Applied three existing profile migrations to the live backend; verified RLS enabled, four owner policies, anon SELECT blocked, authenticated SELECT allowed, updated_at UPDATE denied, and trigger installed.
- Supabase security advisors reported no findings at time of setup.
- A private external `.env` is configured with the **publishable** key and project URL, kept outside the source tree and excluded from the source ZIP. `.env.example` remains the portable template.
- `npm run check:backend-config` verifies local configuration structure, but is **not** a backend login or device test.
- Real account tests, dependency installation, TypeScript compilation, and native builds remain outstanding.


### v0.3.0bi — Public backend origin/key hardening
- Client initialization now accepts only an HTTPS `*.supabase.co` project root and modern `sb_publishable_` key. This prevents accidental transmission of a public credential or authentication requests to an arbitrary origin.
- Configuration validation script matches the runtime restriction.
- Regression tests cover lookalike hostnames, custom ports, legacy keys, whitespace, and secret keys.
- Live SQL security audit passed in Supabase project `ojfehfvvdsekaqehwxuz`; native builds and live account tests remain outstanding.

### v0.3.0bj — verified live project baseline
- Confirmed the live project and profile schema via the connected Supabase service; documented verified checks separately from pending two-user and device checks.
- Corrected the app connection status wording: auth and profile code exists, but runtime validation is pending.
- npm registry remains unavailable (`EAI_AGAIN`); no lockfile, full compilation, or native build claim.

### v0.3.0bk — verified profile persistence
- Profile save now performs an authenticated read-after-write and compares all editable fields before confirming success.
- Database migration 004 enforces canonical trimmed profile fields for clients that bypass local validation.
- Added focused regression tests; live device and two-user authentication testing remain outstanding.

### v0.3.0bm
Actual TypeScript profile validation is now executed in offline behavioral tests, rather than relying only on source-code pattern checks. Ten live PostgreSQL expression cases matched their expected results. Full app compilation and real-device authentication remain blocked/pending.

### v0.3.0bn — Anonymous API access verification
Added a read-only black-box REST probe using only the Supabase publishable key,
plus five mocked behavioral tests. A denied anonymous read passes; a 200 response
fails even if empty; network errors remain blocked. This probe has not passed
against the live REST endpoint from this environment. SQL checks independently
confirmed anonymous SELECT remains revoked, RLS enabled, and four policies exist.

### v0.3.0bo — network-enabled lockfile handoff
Added manually triggered GitHub Actions workflow `bootstrap-lockfile.yml` to resolve a genuine
npm lockfile on a network-enabled runner, run `npm ci`, TypeScript, and Expo Doctor, and
upload the lockfile as a reviewable artifact. Workflow is read-only and cannot push.
This is **not yet executed** on GitHub; all network-dependent and device gates remain open.

## v0.3.0bp — GitHub lockfile bootstrap hardening
- Manual GitHub Actions workflow now runs offline checks before contacting npm, validates generated lockfile metadata and registry sources, and uploads the lockfile even if TypeScript/Expo checks fail.
- Added `scripts/verify-lockfile.mjs` and seven behavioral tests covering project identity, dependency mismatches, and untrusted/insecure registries.
- Dependency bootstrap now delegates lockfile verification to the shared validator.
- All local Phase 1 offline gates passed. The GitHub workflow, `npm ci`, full typecheck, Expo Doctor, and device builds have **not** run successfully yet; a repository and network-enabled runner are required.
\n## v0.3.0bq GitHub handoff\nAdded read-only private-repository transfer preflight; repository visibility and hosted builds remain unverified.\n
## v0.3.0bt — session-switch profile isolation
- Revalidate authenticated identity after every profile fetch, preventing late responses from an earlier account from being returned after a switch or sign-out.
- Save verification inherits the same post-request owner guard.
- Added three executable account-switch regression cases; full compilation/native testing still outstanding.
- Phase 1 remains OPEN and Phase 2 FROZEN.

## v0.3.0bv — profile write concurrency guard
- Added a process-local per-profile in-flight mutation guard to prevent overlapping profile saves from the same runtime. A rejected or completed save releases the guard for retry.
- Added executable regression coverage for overlapping saves and failure/retry behavior; offline foundation suite: 234/234 passed.
- This does not provide distributed optimistic concurrency across devices. Supabase RLS remains the authorization boundary. Full TypeScript compilation, Expo Doctor, native builds, and two-user live checks remain unverified.
