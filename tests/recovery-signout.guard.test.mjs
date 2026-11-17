import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
const panel = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
test('successful recovery invalidates its temporary authenticated session', () => {
  const body = auth.split('updateRecoveryPassword: async (password) => {')[1].split('signIn: async')[0];
  assert.match(body, /await supabase\.auth\.updateUser\(\{ password \}\)/);
  assert.match(body, /await supabase\.auth\.signOut\(\)/);
  assert.ok(body.indexOf('auth.updateUser') < body.indexOf('auth.signOut'));
  assert.match(body, /if \(signOutError\) \{[\s\S]*?return false;/);
  assert.match(body, /setSession\(null\)/);
});
test('successful password change tells the user to sign in again', () => {
  assert.match(panel, /Password updated\. Sign in again with your new password\./);
});
