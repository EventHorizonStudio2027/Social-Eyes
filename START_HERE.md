# Social Eyes — Launch on your Mac

This is a **Phase 1 development build**, not an App Store-ready release.

1. Install Node.js LTS from https://nodejs.org if not already installed.
2. Install **Expo Go** from the iPhone App Store or Google Play.
3. Unzip the project, then double-click `LAUNCH_ON_MAC.command` on your Mac. If macOS blocks it, open Terminal, drag the script into the Terminal window, and press Return; or run `bash LAUNCH_ON_MAC.command` from the project folder.
4. The script installs dependencies and starts Expo. Scan the QR code with your phone (iPhone Camera / Android Expo Go).
5. For real authentication, open the `.env` file created by the script and set:
   - `EXPO_PUBLIC_SUPABASE_URL=https://ojfehfvvdsekaqehwxuz.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=` to the **publishable** `sb_publishable_...` key from your Social Eyes Supabase dashboard → Project Settings → API Keys.
   Restart Expo after changing `.env`.

Do **not** use a secret or service-role key. Without valid configuration, the app may display its unconfigured-backend state and authentication will not work.

If the project requires native modules unavailable in Expo Go, use a development build; Expo Go compatibility has not yet been confirmed. If npm fails to resolve dependencies, the package versions need correction before launch. Full TypeScript compilation, device startup, and live authentication remain unverified.

Troubleshooting: run `npm run typecheck` and `npm run doctor` in Terminal to see compilation and Expo compatibility errors. On first run, network access is required.
