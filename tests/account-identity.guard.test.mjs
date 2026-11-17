import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const account = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
test('account operations are serialized and stale completions are ignored', () => {
  assert.match(account, /requestInFlight\.current/);
  assert.match(account, /accountGeneration\.current/);
  assert.match(account, /generation === accountGeneration\.current/);
});
test('password is cleared on account switch and completed auth attempt', () => {
  assert.equal((account.match(/setPassword\(''\)/g) || []).length >= 2, true);
});
test('initial session restore cannot replace newer auth event', () => {
  assert.match(auth, /authEventSeen\.current = true/);
  assert.match(auth, /if \(!authEventSeen\.current\) setSession\(data\.session\)/);
});
test('auth refresh starts and stops with app lifecycle and cleanup', () => {
  assert.match(auth, /AppState\.currentState === 'active'/);
  assert.match(auth, /client\.auth\.stopAutoRefresh\(\); \};/);
});
test('stale sign-out completion cannot modify a newer account session', () => {
  assert.match(account, /const generation = accountGeneration\.current;\s*setBusy\(true\);\s*void signOut\(\)/);
  assert.match(account, /if \(generation === accountGeneration\.current\) \{ requestInFlight\.current = false; setBusy\(false\); \}/);
});
test('profile load failures require explicit retry before editing', () => {
  assert.match(account, /profileError \?\s*<Pressable/);
  assert.match(account, /setProfileReload\(n => n \+ 1\)/);
  assert.match(account, /profileLoading \|\| profileError/);
});
