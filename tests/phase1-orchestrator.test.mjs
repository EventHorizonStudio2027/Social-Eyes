import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const script = new URL('../scripts/phase1-verify.mjs', import.meta.url);
test('phase 1 orchestrator refuses unknown arguments before running commands', () => {
  const p = spawnSync(process.execPath, [script.pathname, '--unexpected'], { encoding: 'utf8' });
  assert.equal(p.status, 2);
  assert.match(p.stderr, /Usage:/);
});
test('phase 1 orchestrator only runs full checks on explicit opt-in', () => {
  const source = readFileSync(script, 'utf8');
  assert.match(source, /const full = args\.includes\('--full'\)/);
  assert.match(source, /if \(full\)/);
  assert.match(source, /package-lock\.json/);
  assert.match(source, /spawnSync\('npm'/);
  assert.doesNotMatch(source, /shell:\s*true/);
});
