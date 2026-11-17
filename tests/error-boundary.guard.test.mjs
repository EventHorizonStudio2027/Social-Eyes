import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const boundary = fs.readFileSync(path.join(root, 'src/components/AppErrorBoundary.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/_layout.tsx'), 'utf8');
const account = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
test('root navigation and providers are protected by a crash boundary', () => {
  assert.match(layout, /<AppErrorBoundary><AuthProvider><AppProvider>/);
  assert.match(layout, /<\/AppProvider><\/AuthProvider><\/AppErrorBoundary>/);
});
test('crash fallback never renders raw error messages and offers recovery', () => {
  assert.match(boundary, /getDerivedStateFromError/);
  assert.match(boundary, /onPress={this.retry}/);
  assert.match(boundary, /key={this.state.attempts}/);
  assert.doesNotMatch(boundary, /\{(?:this\.)?(?:state\.)?(?:error|info)\.message\}/);
});
test('credential inputs limit length and disable unwanted email correction', () => {
  assert.match(account, /accessibilityLabel="Email"[^\n]*maxLength=\{254\} autoCorrect=\{false\}/);
  assert.match(account, /accessibilityLabel="Password"[^\n]*maxLength=\{1024\}/);
});
test('profile save and sign-out expose their disabled states to assistive technology', () => {
  assert.match(account, /accessibilityLabel="Save profile" accessibilityState=\{\{ disabled:/);
  assert.match(account, /accessibilityLabel="Sign out" accessibilityState=\{\{ disabled: busy \}\}/);
});
