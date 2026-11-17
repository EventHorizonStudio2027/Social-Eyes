import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, writeFileSync, rmSync, mkdirSync, symlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const python = process.env.PYTHON || 'python3';
const script = 'scripts/extract-source.py';
const packageScript = 'scripts/package-project.py';
function run(file, ...args) { return spawnSync(python, [file, ...args], { encoding: 'utf8' }); }

test('verified source extraction excludes generated package manifest', () => {
  const root = mkdtempSync(join(tmpdir(), 'social-eyes-extract-'));
  try {
    const zip = join(root, 'source.zip');
    const target = join(root, 'source');
    assert.equal(run(packageScript, zip).status, 0);
    const extracted = run(script, zip, target);
    assert.equal(extracted.status, 0, extracted.stderr);
    assert.equal(existsSync(join(target, 'PACKAGE_MANIFEST.json')), false);
    assert.equal(existsSync(join(target, 'package.json')), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('source extraction refuses to overwrite an occupied directory', () => {
  const root = mkdtempSync(join(tmpdir(), 'social-eyes-extract-'));
  try {
    const zip = join(root, 'source.zip');
    const target = join(root, 'source');
    assert.equal(run(packageScript, zip).status, 0);
    mkdirSync(target);
    writeFileSync(join(target, 'keep.txt'), 'unchanged');
    const extracted = run(script, zip, target);
    assert.notEqual(extracted.status, 0);
    assert.match(extracted.stderr, /Destination must be empty/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('source extraction refuses a symlink destination without touching its target', () => {
  const root = mkdtempSync(join(tmpdir(), 'social-eyes-extract-'));
  try {
    const zip = join(root, 'source.zip');
    const target = join(root, 'real');
    const link = join(root, 'link');
    mkdirSync(target);
    writeFileSync(join(target, 'keep.txt'), 'safe');
    const { symlinkSync, readFileSync } = requireFs();
    symlinkSync(target, link);
    assert.equal(run(packageScript, zip).status, 0);
    const result = run(script, zip, link);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(join(target, 'keep.txt'), 'utf8'), 'safe');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
function requireFs() { return { symlinkSync, readFileSync }; }
