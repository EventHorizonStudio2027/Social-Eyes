import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const provider = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
const panel = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
test('confirmation resend uses Supabase signup resend, not a new signup', () => {
  assert.match(provider, /auth\.resend\(\{ type: 'signup', email: email\.trim\(\) \}\)/);
  assert.match(provider, /resendConfirmation: \(email: string\) => Promise<boolean>/);
});
test('resend requires pending confirmation and is rate-limited locally', () => {
  assert.match(panel, /!awaitingConfirmation \|\| Date\.now\(\) < confirmationCooldownUntil/);
  assert.match(panel, /setConfirmationCooldownUntil\(Date\.now\(\) \+ 60000\)/);
  assert.match(panel, /setTimeout\(\(\) => setConfirmationClock/);
});
test('resend does not use editable email field and avoids revealing account status', () => {
  assert.match(panel, /resendConfirmation\(awaitingConfirmation\)/);
  assert.match(panel, /If confirmation is still needed, another email will arrive shortly/);
  assert.doesNotMatch(provider, /resendError\.message/);
});
test('pending confirmation state is cleared on account transition and mode switch', () => {
  assert.match(panel, /setAwaitingConfirmation\(null\); setConfirmationCooldownUntil\(0\)/);
  assert.match(panel, /setMode\('sign-in'\); setAwaitingConfirmation\(null\)/);
  assert.match(panel, /setMode\('sign-up'\); setAwaitingConfirmation\(null\)/);
});
