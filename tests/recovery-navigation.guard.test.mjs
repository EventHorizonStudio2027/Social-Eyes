import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); } catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('recovery session gates the full tab navigator before rendering any tabs', () => {
  const source = read('app/(tabs)/_layout.tsx');
  const parsed = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(parsed.parseDiagnostics.length, 0);
  assert.match(source, /const \{ recoverySession, recoveryLinkChecking \} = useAuth\(\)/);
  assert.match(source, /if \(recoverySession\)\s*\{[\s\S]*?<AccountPanel \/>[\s\S]*?return \(/);
  assert.match(source, /<Tabs screenOptions=/);
});

test('account profile loader skips reads during recovery and reloads after recovery changes', () => {
  const source = read('src/components/AccountPanel.tsx');
  assert.match(source, /if \(!session \|\| recoverySession\) \{ setProfileLoading\(false\);/);
  assert.match(source, /\[session\?\.user\.id, recoverySession, profileReload\]/);
});
