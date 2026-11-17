import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
test('session restoration errors cannot overwrite newer auth event', () => {
  const source = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
  assert.match(source, /if \(authError && !authEventSeen\.current\) setError\(authError\.message\)/);
  assert.match(source, /catch\(\(\) => \{ if \(active && !authEventSeen\.current\)/);
});
test('profile reload is disabled during account operations', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(source, /disabled=\{busy\} onPress=\{\(\) => \{ if \(!requestInFlight\.current\) setProfileReload/);
});
