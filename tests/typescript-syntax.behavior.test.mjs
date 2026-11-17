import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
test('all app TypeScript and TSX files parse successfully offline', () => {
  const output = execFileSync(process.execPath, [path.join(root, 'scripts/check-typescript-syntax.mjs')], { encoding: 'utf8' });
  assert.match(output, /Parsed \d+ TS\/TSX files; 0 syntax errors/);
  assert.match(output, /Type checking and module resolution NOT performed/);
});
