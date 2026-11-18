# Social Eyes — Development & Verification

## Project structure
- `index.html` — application markup and page layout
- `assets/app.css` — responsive styles and avatar studio styling
- `assets/app.js` — demo navigation, social interactions, and avatar creator
- `tests/smoke.test.cjs` — dependency-free source checks
- `tests/browser.test.cjs` — Playwright Chromium interaction tests
- `assets/avatar-heads.js`, `avatar-eyes.js`, `avatar-face-parts.js`, `avatar-hair.js` — original reusable SVG character geometry
- `.github/workflows/phase1-smoke.yml` — GitHub Actions syntax, smoke, and browser test jobs

## Run
Open `index.html` from a local web server or the configured GitHub Pages site. For example, `python3 -m http.server 8000` from the repository root and visit `http://localhost:8000`. JavaScript and CSS are now external files.

Run `node tests/smoke.test.cjs` for static smoke tests. To run browser tests locally, install Playwright (`npm install --no-save playwright`), install Chromium (`npx playwright install chromium`), then run `node tests/browser.test.cjs`. GitHub Actions is configured to run these on pushes and pull requests. **A configured CI workflow does not mean the jobs have passed.**

## Avatar features implemented
- 3 presentation choices and 15 categories with 10 choices per category
- modular SVG head, eye, brow, nose, mouth, and hair variants; existing clothing and complexion renderers
- avatar presets, randomization, undo/redo, local autosave
- 3 local lookbook slots with save/load/delete
- validated JSON backup/restore for current character and lookbook
- SVG and transparent PNG export, shareable look codes
- responsive UI and reduced-motion styling

## Phase 1 verification audit
- [x] Implemented: reusable head, eye, brow, nose, mouth, and hair modules (10 variants each)
- [x] Implemented: original geometry integrated with the existing character editor
- [x] Checked: unique SVG output for 60 options using isolated JavaScript evaluation
- [x] Checked: module and application syntax by JavaScript parser
- [x] Implemented: static and Playwright test scripts, CI configuration
- [ ] Verified: full static test suite executed successfully in repository checkout
- [ ] Verified: Playwright browser test suite passed on mobile and desktop
- [ ] Verified: GitHub Actions jobs passed
- [ ] Verified: visual quality matches the approved cartoon reference
- [ ] Signed off: Phase 1 completion (not yet approved)

## Manual browser QA — not yet verified
- [ ] Open Home, Discover, Radar, Connect, Profile on desktop and mobile
- [ ] Confirm avatar rendering for all 10 choices in each category
- [ ] Confirm presets and undo/redo restore expected values
- [ ] Confirm Save, Wear, Replace, Delete in each lookbook slot
- [ ] Confirm saved looks persist after reload
- [ ] Confirm JSON backup can be restored and rejects invalid files
- [ ] Confirm SVG/PNG exports open and show transparent backgrounds
- [ ] Confirm color swatches and focus indicators on touch and keyboard
- [ ] Confirm no console errors and no layout overflow on 320px screens

## Product boundaries
This is a **visual prototype** with fictional venue and profile data. Real accounts, real venue presence, location tracking, messaging, and backend moderation have not been implemented. Browser tests, mobile-device tests, and deployment checks remain outstanding.
