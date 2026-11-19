import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const script = resolve(root, 'scripts/bootstrap-dependencies.mjs');
const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
test('bootstrap refuses unsupported flags before network calls', () => {
  const r = run('--malicious'); assert.equal(r.status, 2); assert.match(r.stderr, /Usage:/);
});
test('bootstrap refuses duplicate flags', () => {
  const r = run('--verify', '--verify'); assert.equal(r.status, 2);
});
test('bootstrap refuses lockfile regeneration when the committed lockfile exists', () => {
  const r = run('--generate-lockfile'); assert.equal(r.status, 2); assert.match(r.stderr, /lockfile already exists/i);
});
test('bootstrap uses npm ci, never npm install for locked installation', () => {
  const source = readFileSync(script, 'utf8');
  assert.match(source, /run\('npm', \['ci'/);
  assert.match(source, /--package-lock-only/);
  assert.match(source, /run\('node', \['scripts\/verify-lockfile\.mjs'\]\)/);
  assert.match(source, /run\('npm', \['run', 'typecheck'\]/);
  assert.match(source, /run\('npm', \['run', 'doctor'\]/);
});
