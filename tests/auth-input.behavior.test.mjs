import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/authInput.ts'), 'utf8');
const executable = source
  .replace(/^export type .*;\s*$/gm, '')
  .replace(/^export type AuthInputResult = .*;\s*$/gm, '')
  .replace(/export function validateAuthInput\(email: string, password: string, mode: AuthMode\): AuthInputResult/, 'function validateAuthInput(email, password, mode)')
  .replace(/export function validateRecoveryEmail\(email: string\): \{ ok: true; email: string \} \| \{ ok: false; message: string \}/, 'function validateRecoveryEmail(email)')
  + '\nthis.validateAuthInput = validateAuthInput;';
const context = vm.createContext({});
vm.runInContext(executable, context);
const validate = context.validateAuthInput;
test('auth input normalizes only email, never password', () => {
  const result = validate('  user@example.com  ', '  six chars  ', 'sign-in');
  assert.equal(result.ok, true);
  assert.equal(result.email, 'user@example.com');
  assert.equal(result.password, '  six chars  ');
});
test('rejects malformed, control-containing, or oversized email before authentication', () => {
  for (const email of ['', 'abc', 'a@b', 'a@@b.com', 'a b@c.com', 'a\nb@c.com', `${'a'.repeat(250)}@b.com`]) {
    assert.equal(validate(email, '123456', 'sign-in').ok, false, email);
  }
});
test('enforces bounded password length without changing it', () => {
  assert.equal(validate('a@b.com', '12345', 'sign-up').ok, false);
  assert.equal(validate('a@b.com', 'x'.repeat(1025), 'sign-up').ok, false);
  assert.equal(validate('a@b.com', '123456', 'sign-up').ok, true);
});
test('rejects invalid mode', () => {
  assert.equal(validate('a@b.com', '123456', 'reset').ok, false);
});
test('account form disables mode changes and editing while a request is in flight', () => {
  const account = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(account, /validateAuthInput\(email, password, mode\)/);
  assert.equal((account.match(/editable=\{!busy\}/g) || []).length, 4);
  assert.equal((account.match(/editable=\{!busy && !profileLoading\}/g) || []).length, 2);
  assert.match(account, /selected: mode === 'sign-in', disabled: busy/);
  assert.match(account, /selected: mode === 'sign-up', disabled: busy/);
});
