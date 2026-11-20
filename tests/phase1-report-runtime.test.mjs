import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const script = new URL('../scripts/phase1-verify.mjs', import.meta.url);
function invoke(...args) {
  return spawnSync(process.execPath, [script.pathname, ...args], { encoding: 'utf8', timeout: 180000, maxBuffer: 1024 * 1024 });
}
test('offline JSON report executes actual checks and disclaims native/live verification', () => {
  const p = invoke('--json');
  assert.equal(p.status, 0, p.stderr);
  const report = JSON.parse(p.stdout);
  assert.equal(report.mode, 'offline');
  assert.equal(report.phase1SignedOff, false);
  assert.equal(report.results.length, 4);
  assert.ok(report.results.every(x => x.status === 'passed'));
  assert.ok(report.outstanding.includes('iOS native build'));
  assert.ok(report.outstanding.includes('two-user live RLS probe'));
  assert.ok(report.results.every(x => !('details' in x)));
});
test('full JSON report reflects real dependency readiness without assuming a missing lockfile', () => {
  const p = invoke('--full', '--json');
  assert.ok([0, 1, 2].includes(p.status), p.stderr);
  const report = JSON.parse(p.stdout);
  assert.equal(report.mode, 'dependency-checks');
  assert.equal(typeof report.prerequisites.lockfile, 'boolean');
  assert.equal(typeof report.prerequisites.installed, 'boolean');
  const dependent = report.results.slice(-2);
  assert.equal(dependent.length, 2);
  if (!report.prerequisites.lockfile || !report.prerequisites.installed) {
    assert.deepEqual(dependent.map(x => x.status), ['blocked', 'blocked']);
    assert.equal(p.status, 2);
  } else {
    assert.ok(dependent.every(x => ['passed', 'failed'].includes(x.status)));
    assert.equal(p.status, report.passed ? 0 : 1);
  }
  assert.equal(report.phase1SignedOff, false);
});
test('duplicate CLI switches fail closed', () => {
  const p = invoke('--json', '--json');
  assert.equal(p.status, 2);
  assert.match(p.stderr, /Usage:/);
});
