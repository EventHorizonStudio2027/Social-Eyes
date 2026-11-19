import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const script = resolve('scripts/local-toolchain.mjs');
test('toolchain diagnostic produces parseable redacted JSON with actionable checks', () => {
  const r = spawnSync(process.execPath, [script, '--json'], { encoding: 'utf8', env: { ...process.env, SOCIAL_EYES_TEST_USER_A_TOKEN: 'do-not-print-token' } });
  assert.ok([0, 2].includes(r.status));
  const report = JSON.parse(r.stdout);
  assert.equal(report.phase, 1);
  assert.ok(report.checks.some(c => c.name === 'Dependency lockfile'));
  assert.equal(report.readyForDependencyChecks, report.checks.filter(c => ['Node.js', 'npm', 'Dependency lockfile', 'Installed dependencies'].includes(c.name)).every(c => c.status === 'ready'));
  assert.doesNotMatch(r.stdout, /do-not-print-token/);
});
test('toolchain diagnostic rejects unknown options without running checks', () => {
  const r = spawnSync(process.execPath, [script, '--unexpected'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Usage:/);
});
