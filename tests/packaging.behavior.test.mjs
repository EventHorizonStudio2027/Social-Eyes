import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'social-eyes-package-'));
const script = path.join(root, 'scripts/package-project.py');
const verify = path.join(root, 'scripts/verify-package.py');
test('complete source package passes independent manifest verification', () => {
  const dest = path.join(tmp, 'one.zip');
  execFileSync('python3', [script, dest]);
  assert.match(execFileSync('python3', [verify, dest], {encoding:'utf8'}), /PASS/);
});
test('source package is byte-for-byte reproducible', () => {
  const a = path.join(tmp, 'one.zip');
  const b = path.join(tmp, 'two.zip');
  execFileSync('python3', [script, a]);
  execFileSync('python3', [script, b]);
  assert.deepEqual(fs.readFileSync(a), fs.readFileSync(b));
});
test('verification fails for modified archive bytes', () => {
  const original = path.join(tmp, 'one.zip');
  execFileSync('python3', [script, original]);
  const modified = path.join(tmp, 'corrupt.zip');
  const bytes = fs.readFileSync(original);
  // Corrupt the ZIP local-file signature deterministically, not an arbitrary byte
  // that might land in unused metadata or a compressed stream with no effect.
  bytes[0] ^= 0xff;
  fs.writeFileSync(modified, bytes);
  const result = spawnSync('python3', [verify, modified], {encoding:'utf8'});
  assert.notEqual(result.status, 0);
});

test('packager refuses credential-bearing npm configuration', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-eyes-sensitive-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.copyFileSync(script, path.join(dir, 'scripts/package-project.py'));
    fs.writeFileSync(path.join(dir, '.npmrc'), '//registry.npmjs.org/:_authToken=placeholder');
    const result = spawnSync('python3', [path.join(dir,'scripts/package-project.py'),path.join(tmp,'sensitive.zip')], {encoding:'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Sensitive configuration/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('packager rejects source files colliding with reserved manifest name', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-eyes-reserved-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.copyFileSync(script, path.join(dir, 'scripts/package-project.py'));
    fs.writeFileSync(path.join(dir, 'PACKAGE_MANIFEST.json'), '{}');
    const result = spawnSync('python3', [path.join(dir,'scripts/package-project.py'),path.join(tmp,'reserved.zip')], {encoding:'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Reserved manifest filename/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
