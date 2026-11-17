import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const script = resolve(root, 'scripts/verify-lockfile.mjs');
function fixture(change = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), 'social-eyes-lock-test-'));
  mkdirSync(join(dir, 'scripts'));
  copyFileSync(script, join(dir, 'scripts/verify-lockfile.mjs'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'social-eyes-mobile', version: '0.3.0', dependencies: { expo: '~58.0.25' }, devDependencies: { typescript: '~5.9.0' } }));
  const lock = { name: 'social-eyes-mobile', version: '0.3.0', lockfileVersion: 3, packages: { '': { name: 'social-eyes-mobile', version: '0.3.0', dependencies: { expo: '~58.0.25' }, devDependencies: { typescript: '~5.9.0' } }, 'node_modules/expo': { version: '58.0.25', resolved: 'https://registry.npmjs.org/expo/-/expo-58.0.25.tgz' } } };
  change(lock);
  writeFileSync(join(dir, 'package-lock.json'), JSON.stringify(lock));
  return dir;
}
function check(change) {
  const dir = fixture(change);
  try { return spawnSync('node', ['scripts/verify-lockfile.mjs'], { cwd: dir, encoding: 'utf8' }); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
test('valid generated npm lockfile is accepted', () => assert.equal(check().status, 0));
test('project name mismatch is rejected', () => assert.notEqual(check(lock => { lock.name = 'other'; }).status, 0));
test('project version mismatch is rejected', () => assert.notEqual(check(lock => { lock.packages[''].version = '9.9.9'; }).status, 0));
test('dependency mismatch is rejected', () => assert.notEqual(check(lock => { lock.packages[''].dependencies.expo = '1.0.0'; }).status, 0));
test('untrusted dependency registry is rejected', () => assert.notEqual(check(lock => { lock.packages['node_modules/expo'].resolved = 'https://attacker.example/expo.tgz'; }).status, 0));
test('insecure HTTP registry is rejected', () => assert.notEqual(check(lock => { lock.packages['node_modules/expo'].resolved = 'http://registry.npmjs.org/expo.tgz'; }).status, 0));
test('bootstrap workflow keeps lockfile artifact on typecheck failure', () => {
  const yaml = readFileSync(resolve(root, '.github/workflows/bootstrap-lockfile.yml'), 'utf8');
  assert.match(yaml, /if: always\(\)/);
  assert.match(yaml, /npm run typecheck/);
  assert.match(yaml, /npm run doctor/);
  assert.match(yaml, /npm ci --no-audit --no-fund/);
  assert.match(yaml, /node scripts\/verify-lockfile\.mjs/);
});
