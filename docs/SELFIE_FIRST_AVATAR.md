# Social Eyes avatar onboarding — selfie-first product specification

Status: **approved product direction, not implemented or verified**. Phase 1 gate remains in force: do not move to Phase 2 or claim selfie conversion is functional until compiled, tested, and signed off.

## Experience
1. Default onboarding CTA: **Take a selfie**. Secondary: **Choose a photo**. Tertiary: **Create manually**. No photo required to participate.
2. Before camera/gallery access, explain that the image is used to propose a stylized avatar, not to verify identity. Ask OS permission only on explicit tap.
3. Review/crop portrait; show private preview, retake and cancel. Avoid auto-upload on selection.
4. On explicit **Create my avatar**, transform the photo into Social Eyes' existing 2D illustration system, not a photorealistic face or an arbitrary generative art style.
5. Show generated result and editable features: face shape, hair/style/color, eye shape/color, skin tone, expression, and accessories. Regenerate and **Start over** available.
6. Save the *avatar configuration* and rendered avatar only after confirmation; offer manual creation throughout. Never use the selfie as a public profile picture automatically.

## Architecture and data boundaries
- Prefer mapping extracted visual attributes to the existing deterministic, layered avatar renderer. Avoid generating an uneditable flat image as the only output.
- Define versioned `AvatarConfig` with allowed categorical values and palette IDs, a renderer version, optional user-edited overrides, and a safe fallback. The output should reproduce on iOS, Android, and web.
- Keep image capture/cropping separate from conversion, avatar config validation, rendering, and persistence.
- If cloud inference is necessary, require a consented one-time upload, short-lived processing, server-side credentials, per-user authorization, strict file limits, and deletion of temporary originals. No provider keys in the app.
- Never infer sensitive attributes (race, ethnicity, gender identity, age, personality) or claim biometric verification. Appearance approximations are editable suggestions.
- Do not enroll facial embeddings, identify people, match faces across users, or use photos for model training without a distinct explicit opt-in. Default to no retained selfie and no analytics image payloads.
- Block public exposure of original selfies; handle EXIF/location metadata safely; protect upload and output with authenticated ownership rules.
- Plan for image rejection/poor lighting, multiple faces, offline mode, conversion timeouts, rate limits, cancellation, deletion and accessibility.

## Phase 1 sequencing
- **Current Phase 1**: retain existing avatar editor and source architecture; this document records product direction only.
- **Before implementing selfie conversion**: finish existing Phase 1 CI, native build and Supabase privacy verification; obtain owner sign-off or explicit agreement to include this feature within Phase 1.
- **Acceptance criteria for a future selfie-first implementation**: consent and permissions; camera/gallery/manual alternatives; accurate editable deterministic output; no accidental public photo exposure; original-image deletion; two-user isolation; cancel/error/offline fallback; real iOS and Android tests; accessibility and performance checks.
