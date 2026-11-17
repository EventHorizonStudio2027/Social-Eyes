# Social Eyes

Private development repository for the Social Eyes mobile application.

## Project status

**Phase 1 — foundation verification in progress.** Phase 2 development is frozen until Phase 1 passes reproducible build, authentication, privacy, and native-device verification.

The complete React Native / Expo / TypeScript project is maintained separately as a multi-file source archive. **This initial commit is repository setup only; the application source has not yet been transferred.**

## Release gates

- Install dependencies with a committed, reproducible lockfile.
- Run full TypeScript compilation and Expo compatibility checks.
- Validate Supabase authentication and profile row-level security with real test accounts.
- Verify mobile startup and account-switching behavior on devices.
- Review repository files and CI logs for credentials and other secrets.

Never commit `.env` files, service-role keys, access tokens, or test-user passwords.
