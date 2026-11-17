import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); } catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
const root = path.resolve(import.meta.dirname, '..');
const helperPath = path.join(root, 'src/lib/recoveryEvents.ts');
const helperSource = fs.readFileSync(helperPath, 'utf8');
const compiled = ts.transpileModule(helperSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleObject = { exports: {} };
new Function('module', 'exports', compiled)(moduleObject, moduleObject.exports);
const { shouldClearRecoveryForAuthEvent } = moduleObject.exports;
const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
test('a verified recovery login event cannot clear the recovery gate while OTP verification is pending', () => {
  assert.equal(shouldClearRecoveryForAuthEvent('SIGNED_IN', true), false);
  assert.equal(shouldClearRecoveryForAuthEvent('SIGNED_IN', false), true);
});
test('updating a password does not clear recovery restrictions before signout', () => {
  assert.equal(shouldClearRecoveryForAuthEvent('USER_UPDATED', false), false);
  assert.equal(shouldClearRecoveryForAuthEvent('USER_UPDATED', true), false);
});
test('signout always clears recovery gate and unrelated events cannot clear it', () => {
  assert.equal(shouldClearRecoveryForAuthEvent('SIGNED_OUT', true), true);
  assert.equal(shouldClearRecoveryForAuthEvent('SIGNED_OUT', false), true);
  assert.equal(shouldClearRecoveryForAuthEvent('TOKEN_REFRESHED', false), false);
  assert.equal(shouldClearRecoveryForAuthEvent('INITIAL_SESSION', false), false);
});
test('auth provider wires the event policy to the verification-in-flight guard', () => {
  assert.match(auth, /shouldClearRecoveryForAuthEvent\(_event, recoveryInFlight\.current\)/);
  assert.match(auth, /if \(signOutError\) \{\s*setRecoverySession\(true\)/);
});
