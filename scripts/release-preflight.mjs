#!/usr/bin/env node
/**
 * Offline Phase 1 release-readiness preflight.
 * This is a source/asset audit, NOT evidence of a successful native build.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const app = readJson('app.json').expo;
const pkg = readJson('package.json');
const checks = [];
const check = (name, passed, detail) => checks.push({ name, status: passed ? 'passed' : 'failed', ...(passed ? {} : { detail }) });
const assetFields = [
  ['icon', app.icon],
  ['ios.icon', app.ios?.icon],
  ['android.adaptiveIcon.foregroundImage', app.android?.adaptiveIcon?.foregroundImage],
  ['android.adaptiveIcon.monochromeImage', app.android?.adaptiveIcon?.monochromeImage],
  ['splash.image', app.splash?.image],
  ['notification.icon', app.notification?.icon],
];
for (const [name, path] of assetFields) {
  if (path === undefined) continue;
  const safe = typeof path === 'string' && !path.startsWith('/') && !path.split('/').includes('..');
  check('asset: ' + name, safe && existsSync(resolve(root, path)), 'Missing or unsafe asset path: ' + String(path));
}
check('package version matches app manifest', pkg.version === app.version, 'package.json and app.json versions differ');
check('dependency lockfile committed', existsSync(resolve(root, 'package-lock.json')), 'Run npm install and commit package-lock.json');
// Local untracked .env files are expected during development; only tracked secrets are a release failure.
const tracked = spawnSync('git', ['ls-files', '--cached', '--', '.env', '.env.local', '.env.production', '.env.development'], { cwd: root, encoding: 'utf8' });
check('no environment secrets tracked by git', tracked.status === 0 && tracked.stdout.trim() === '',
  tracked.status === 0 ? 'Remove tracked environment files from Git' : 'Unable to inspect tracked files; install Git and retry');
check('TypeScript configuration exists', existsSync(resolve(root, 'tsconfig.json')), 'Missing tsconfig.json');
check('Expo Router layout exists', existsSync(resolve(root, 'app/_layout.tsx')), 'Missing app/_layout.tsx');
const report = { project: 'Social Eyes', phase: 1, kind: 'offline-release-preflight', checks,
  passed: checks.every(c => c.status === 'passed'), nativeBuildVerified: false, phase1SignedOff: false };
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else for (const c of checks) console.log(c.status.toUpperCase() + ' ' + c.name + (c.detail ? ': ' + c.detail : ''));
process.exitCode = report.passed ? 0 : 1;
