import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/passwordConfirmation.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/AccountPanel.tsx', import.meta.url), 'utf8');
test('password confirmation checks minimum and maximum lengths', () => {
  assert.match(source, /password\.length < 8/);
  assert.match(source, /password\.length > 1024/);
});
test('confirmation must match exactly, including whitespace', () => {
  assert.match(source, /password !== confirmation/);
  assert.doesNotMatch(source, /\.trim\(/);
});
test('recovery UI requires confirmation before updating', () => {
  assert.match(component, /validatePasswordConfirmation\(newPassword, confirmPassword\)/);
  assert.match(component, /accessibilityLabel="Confirm new password"/);
  assert.match(component, /secureTextEntry textContentType="newPassword" autoComplete="off"/);
});
test('recovery secret inputs are cleared after attempts and account changes', () => {
  assert.match(component, /finally \{ if \(generation === accountGeneration\.current\) \{ setNewPassword\(''\); setConfirmPassword\(''\);/);
  assert.match(component, /setPassword\(''\); setNewPassword\(''\); setConfirmPassword\(''\);/);
});
