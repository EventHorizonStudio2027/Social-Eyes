# Social Eyes — Development & Verification

## Project structure
- `index.html` — application markup and page layout
- `assets/app.css` — responsive styles and avatar studio styling
- `assets/app.js` — demo navigation, social interactions, and avatar creator
- `tests/smoke.test.cjs` — dependency-free source checks

## Run
Open `index.html` from a local web server or the configured GitHub Pages site. For example, `python3 -m http.server 8000` from the repository root and visit `http://localhost:8000`. JavaScript and CSS are now external files.

Run `node tests/smoke.test.cjs` for static smoke tests.

## Avatar features implemented
- 3 presentation choices and 15 categories with 10 choices per category
- distinct SVG hair, eye, head, clothing and complexion variants
- avatar presets, randomization, undo/redo, local autosave
- 3 local lookbook slots with save/load/delete
- validated JSON backup/restore for current character and lookbook
- SVG and transparent PNG export, shareable look codes
- responsive UI and reduced-motion styling

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
