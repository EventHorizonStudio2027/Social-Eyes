import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = (() => { try { return require('typescript'); } catch { return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); } })();
const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/recoveryLinks.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const { parseRecoveryLink, RECOVERY_REDIRECT_URL } = exports;
const hash = 'a'.repeat(64);
test('accepts only a recovery token_hash on the registered app callback', () => {
  assert.equal(RECOVERY_REDIRECT_URL, 'socialeyes://auth/recover');
  assert.deepEqual(parseRecoveryLink(`${RECOVERY_REDIRECT_URL}?token_hash=${hash}&type=recovery`), { tokenHash: hash, type: 'recovery' });
});
test('rejects foreign origins, other callbacks, fragments and legacy bearer tokens', () => {
  for (const link of [
    `https://auth/recover?token_hash=${hash}&type=recovery`,
    `socialeyes://evil/recover?token_hash=${hash}&type=recovery`,
    `socialeyes://auth/other?token_hash=${hash}&type=recovery`,
    `socialeyes://auth/recover#access_token=${hash}&refresh_token=${hash}`,
    `socialeyes://auth/recover?token_hash=${hash}&type=signup`,
    `socialeyes://auth/recover?token_hash=${hash}&type=recovery&token_hash=${hash}`,
    `socialeyes://auth/recover?token_hash=${hash}&type=recovery&unexpected=1`,
    `socialeyes://auth/recover?token_hash=bad&type=recovery`,
    'not-a-url',
  ]) assert.equal(parseRecoveryLink(link), null, link);
});
test('auth provider verifies the callback via OTP and listens to cold and warm links', () => {
  const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
  assert.match(auth, /Linking\.getInitialURL\(\)/);
  assert.match(auth, /Linking\.addEventListener\('url'/);
  assert.match(auth, /auth\.verifyOtp\(\{ token_hash: link\.tokenHash, type: link\.type \}\)/);
  assert.match(auth, /linkListener\.remove\(\)/);
});
