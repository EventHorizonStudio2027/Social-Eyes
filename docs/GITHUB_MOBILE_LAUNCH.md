# Launch Social Eyes through GitHub

## Current status
The GitHub workflow is configured but is **not** proof of a working build. It intentionally refuses to build while source files, a lockfile, Expo account linkage, or credentials are missing.

## One-time setup
1. Upload the **complete** Social Eyes source tree to this private repository, preserving folder paths and binary assets. Never upload .env, service-role keys, or credentials.
2. In a local clone, run `npm install`, `npm run verify:phase1`, `npm run typecheck`, and `npm run doctor`. Commit the generated `package-lock.json` once dependencies are resolved.
3. Sign in to your Expo account using `npx eas-cli login`. Run `npx eas-cli init` to associate the app with an EAS project. Commit the updated `app.json` containing `expo.extra.eas.projectId`.
4. Create an Expo access token from your Expo account security settings. Add it to GitHub repository **Settings → Secrets and variables → Actions** as the secret `EXPO_TOKEN`. Do not put it in source control.
5. For Supabase sign-in, set the app's **public** `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the EAS environment or project configuration. Never put a service-role key in the mobile client.
6. Open **Actions → Build Social Eyes mobile preview → Run workflow**, choose **android**, and start. Once EAS reports a successful build, open its install link on an Android device.
7. For iOS device installation, configure Apple signing and device provisioning with Expo/EAS first; Apple may require a paid developer account.

## Important
The Android preview profile produces an installable APK. An iOS preview build needs valid Apple signing and provisioning. GitHub Actions starts the cloud build; the resulting app is installed on the phone rather than executed inside GitHub.

Do not mark Phase 1 complete until the full repository passes CI and a real-device launch is verified.
