import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/authInput.ts'), 'utf8');
const start = source.indexOf('export function validateRecoveryEmail(');
assert.ok(start >= 0, 'recovery validation function exists');
const executable = source.slice(start).replace(/export function validateRecoveryEmail\(email: string\): \{ ok: true; email: string \} \| \{ ok: false; message: string \}/, 'function validateRecoveryEmail(email)');
const context = vm.createContext({});
vm.runInContext(executable + '\nthis.validate = validateRecoveryEmail;', context);
test('recovery request accepts and normalizes valid email only', () => {
  const value = context.validate('  person@example.com ');
  assert.equal(value.ok, true);
  assert.equal(value.email, 'person@example.com');
});
test('recovery request rejects malformed or control-character email', () => {
  for (const email of ['', 'person', 'a@@b.com', 'a b@c.com', 'a\nb@c.com', 'x'.repeat(255) + '@b.com']) {
    assert.equal(context.validate(email).ok, false, email);
  }
});
test('recovery uses Supabase email reset with app callback, without embedding passwords', () => {
  const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
  assert.match(auth, /supabase\.auth\.resetPasswordForEmail\(email, \{ redirectTo: RECOVERY_REDIRECT_URL \}\)/);
  assert.doesNotMatch(auth, /resetPasswordForEmail\(email,\s*\{[^}]*password/);
  assert.match(auth, /Unable to request a reset email/);
});
test('account recovery shares the request-in-flight guard and does not reveal account existence', () => {
  const account = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(account, /if \(requestInFlight\.current \|\| busy\) return;/);
  assert.match(account, /requestPasswordReset\(input\.email\)/);
  assert.match(account, /If this address has an account/);
  assert.match(account, /Request password reset email/);
});
