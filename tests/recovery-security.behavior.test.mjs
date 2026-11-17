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
const { parseRecoveryLink } = exports;
const valid = `socialeyes://auth/recover?token_hash=${'b'.repeat(64)}&type=recovery`;
test('rejects URL path normalization and backslash authority confusion', () => {
  for (const input of [
    valid.replace('/recover?', '/other/../recover?'),
    valid.replace('/recover?', '/%72ecover?'),
    valid.replace('socialeyes://auth/', 'socialeyes:\\\\auth/'),
    valid + '\n',
    valid.replace('socialeyes://auth/', 'socialeyes://user@auth/'),
  ]) assert.equal(parseRecoveryLink(input), null, input);
});
test('accepts exact dedicated recovery URL and case-insensitive hex token', () => {
  assert.deepEqual(parseRecoveryLink(valid), { tokenHash: 'b'.repeat(64), type: 'recovery' });
});
test('canceling recovery invalidates its authenticated session', () => {
  const provider = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
  const panel = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(provider, /cancelRecovery: async \(\) => \{[\s\S]*?supabase\.auth\.signOut\(\)/);
  assert.match(panel, /Cancel recovery and sign out/);
  assert.match(panel, /cancelRecovery\(\)/);
});
test('recovery password cleanup is guarded by current account generation', () => {
  const panel = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(panel, /finally \{ if \(generation === accountGeneration\.current\) \{ setNewPassword\(''\); setConfirmPassword\(''\)/);
});
