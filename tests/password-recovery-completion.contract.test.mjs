import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const provider = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
const panel = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
test('recovery session is established only by password recovery auth event and cleared at sign out', () => {
  assert.match(provider, /_event === 'PASSWORD_RECOVERY'\) setRecoverySession\(true\)/);
  assert.match(provider, /shouldClearRecoveryForAuthEvent\(_event, recoveryInFlight\.current\)\) setRecoverySession\(false\)/);
});
test('password update requires recovery session and uses Supabase updateUser', () => {
  assert.match(provider, /!supabase \|\| !recoverySession/);
  assert.match(provider, /supabase\.auth\.updateUser\(\{ password \}\)/);
  assert.match(provider, /setRecoverySession\(false\)/);
});
test('recovery form uses a masked input and clears password after attempt', () => {
  assert.match(panel, /recoverySession && session/);
  assert.match(panel, /accessibilityLabel="New password"[^\n]*secureTextEntry/);
  assert.match(panel, /finally \{ if \(generation === accountGeneration\.current\) \{ setNewPassword\(''\)/);
});
