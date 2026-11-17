import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/providers/AppProvider.tsx', import.meta.url), 'utf8');

test('a stale write failure does not invalidate the new mount load', () => {
  assert.match(src, /if \(mounted\.current && writeGeneration === mountGeneration\.current\) \{\s*\+\+settingsLoadSequence\.current;/);
});
test('a write crossing a replay triggers a fresh storage reconciliation', () => {
  assert.match(src, /settingsWriteInFlight\.current = false;[\s\S]*?else if \(mounted\.current\) \{[\s\S]*?void retrySettings\(\);/);
});
test('replayed mount does not present stale settings as verified', () => {
  assert.match(src, /\+\+mountGeneration\.current;[\s\S]*?setSettingsReady\(false\);\s*setSettingsSaving\(false\);\s*setSettingsStorageAvailable\(false\);\s*setSettings\(\{ \.\.\.defaultSettings \}\);/);
});
