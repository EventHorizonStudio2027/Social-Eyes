#!/usr/bin/env node
/** Phase 1 evidence runner. Offline checks are always local; --full never installs dependencies. */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const allowed = new Set(['--full', '--json']);
if (args.some(x => !allowed.has(x)) || new Set(args).size !== args.length) {
  console.error('Usage: node scripts/phase1-verify.mjs [--full] [--json]');
  process.exit(2);
}
const full = args.includes('--full');
const json = args.includes('--json');
const steps = [
  ['static audit', ['run', 'audit:static']],
  ['syntax parser', ['run', 'audit:syntax']],
  ['package security', ['run', 'audit:package']],
  ['foundation tests', ['run', 'test:foundation']],
];
const results = [];
function execute(name, command) {
  const result = spawnSync('npm', command, {
    cwd: root, encoding: 'utf8', timeout: 180000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, npm_config_update_notifier: 'false' },
  });
  const passed = result.status === 0 && !result.error;
  // Never include raw command output in machine-readable reports: it may contain secrets.
  const entry = { name, status: passed ? 'passed' : 'failed', exitCode: result.status, ...(result.error ? { errorCode: result.error.code ?? 'PROCESS_ERROR' } : {}) };
  results.push(entry);
  if (!json) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
}
for (const [name, command] of steps) execute(name, command);
const lockfile = existsSync(resolve(root, 'package-lock.json'));
const installed = existsSync(resolve(root, 'node_modules/.bin/tsc')) && existsSync(resolve(root, 'node_modules/.bin/expo'));
if (full) {
  for (const [name, command] of [['TypeScript typecheck', ['run', 'typecheck']], ['Expo Doctor', ['run', 'doctor']]]) {
    if (!lockfile || !installed) {
      results.push({ name, status: 'blocked', reason: !lockfile ? 'Missing package-lock.json' : 'Local TypeScript/Expo dependencies not installed' });
      if (!json) console.log(`BLOCKED ${name}`);
    } else execute(name, command);
  }
}
// Native builds and live backend verification are never silently implied by --full.
const outstanding = ['iOS native build', 'Android native build', 'two-user live RLS probe'];
const report = {
  project: 'Social Eyes', phase: 1, mode: full ? 'dependency-checks' : 'offline',
  prerequisites: { lockfile, installed }, results, outstanding,
  passed: results.every(r => r.status === 'passed'),
  phase1SignedOff: false,
};
if (json) console.log(JSON.stringify(report, null, 2));
process.exitCode = results.some(r => r.status === 'failed') ? 1 : report.passed ? 0 : 2;
