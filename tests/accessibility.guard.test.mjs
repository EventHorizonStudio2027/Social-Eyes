import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const profile = fs.readFileSync(path.join(root, 'app/(tabs)/profile.tsx'), 'utf8');
const welcome = fs.readFileSync(path.join(root, 'app/welcome.tsx'), 'utf8');
// Source-level accessibility contracts, not screen-reader or native component tests.
test('privacy switches expose checked and disabled state', () => {
  assert.match(profile, /accessibilityRole="switch"/);
  assert.match(profile, /accessibilityState=\{\{ disabled, checked: value \}\}/);
});
test('privacy storage errors are announced', () => assert.match(profile, /accessibilityRole="alert" style=\{styles.error\}>\{settingsError\}/));
test('connection refresh has explicit label and is disabled during checks or pause', () => {
  assert.match(profile, /accessibilityLabel="Check service connection again"/);
  assert.match(profile, /disabled=\{backendStatus === 'checking' \|\| backendStatus === 'paused'\}/);
});
test('welcome save errors have alert role', () => assert.match(welcome, /accessibilityRole="alert"/));
test('privacy preferences reload has a descriptive label', () => assert.match(profile, /accessibilityLabel="Reload saved privacy preferences"/));
