import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const ui = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');

test('profile save uses shared server-equivalent validation, not UTF-16 length', () => {
  assert.match(ui, /validateProfileDraft\(\{ display_name: displayName, bio, intent \}\)/);
  assert.doesNotMatch(ui, /name\.length < 2 \|\| name\.length > 40 \|\| bio\.length > 280/);
});
test('successful save synchronizes canonical displayed values and saved snapshot', () => {
  assert.match(ui, /setSavedProfile\(snapshot\); setDisplayName\(snapshot\.display_name\); setBio\(snapshot\.bio\)/);
});
test('profile editor prevents input while loading and displays Unicode-aware bio length', () => {
  assert.match(ui, /accessibilityLabel="Display name" editable=\{!busy && !profileLoading\}/);
  assert.match(ui, /accessibilityLabel="Bio" editable=\{!busy && !profileLoading\}/);
  assert.match(ui, /Array\.from\(bio\)\.length\}\/280 characters/);
});
