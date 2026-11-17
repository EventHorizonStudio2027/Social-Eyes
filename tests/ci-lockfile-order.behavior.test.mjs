import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const workflow = readFileSync(new URL('../.github/workflows/phase1.yml', import.meta.url), 'utf8');
test('CI validates a lockfile before enabling npm dependency cache', () => {
  const fullBuild = workflow.split('  full-build:')[1];
  assert.ok(fullBuild, 'full-build job is required');
  const lockCheck = workflow.indexOf('test -f package-lock.json');
  assert.match(fullBuild, /needs: detect-lockfile/);
  assert.match(fullBuild, /if: needs\.detect-lockfile\.outputs\.exists == 'true'/);
  const cache = fullBuild.indexOf('cache: npm');
  const install = fullBuild.indexOf('run: npm ci');
  assert.ok(lockCheck >= 0 && cache >= 0 && install > cache);
  assert.match(fullBuild, /node scripts\/verify-lockfile\.mjs/);
});
test('CI has one automatic Phase 1 workflow and one manual bootstrap workflow', () => {
  assert.deepEqual(readdirSync(new URL('../.github/workflows/', import.meta.url)).filter(x => /\.ya?ml$/.test(x)).sort(), ['bootstrap-lockfile.yml', 'phase1.yml']);
  const bootstrap = readFileSync(new URL('../.github/workflows/bootstrap-lockfile.yml', import.meta.url), 'utf8');
  assert.match(bootstrap, /workflow_dispatch:/);
  assert.doesNotMatch(bootstrap, /^  push:|^  pull_request:/m);
});
