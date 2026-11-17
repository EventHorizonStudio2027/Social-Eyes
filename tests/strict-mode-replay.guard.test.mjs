import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/providers/AppProvider.tsx', import.meta.url), 'utf8');
// Source contracts, not mounted React tests.
test('settings reload happens inside replayable effect setup', () => {
  assert.match(source, /mounted\.current = true;[\s\S]*?void retrySettings\(\);/);
  assert.doesNotMatch(source, /useEffect\(\(\) => \{ void retrySettings\(\); \}, \[retrySettings\]\)/);
});
test('cleanup invalidates previous mount and pending settings load', () => {
  assert.match(source, /mounted\.current = false;\s*\+\+mountGeneration\.current;/);
  assert.match(source, /\+\+settingsLoadSequence\.current;/);
});
test('late settings writes cannot update replayed mount', () => {
  assert.match(source, /const writeGeneration = mountGeneration\.current;/);
  assert.match(source, /mounted\.current && writeGeneration === mountGeneration\.current/);
});
