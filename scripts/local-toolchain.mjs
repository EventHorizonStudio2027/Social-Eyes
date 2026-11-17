#!/usr/bin/env node
/** Non-mutating local toolchain diagnostic; no credentials or environment values emitted. */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
if (args.length > 1 || (args.length && args[0] !== '--json')) {
  console.error('Usage: node scripts/local-toolchain.mjs [--json]');
  process.exit(2);
}
const checks = [];
const add = (name, status, action) => checks.push({ name, status, ...(action ? { action } : {}) });
function version(command, argv, name, minimum) {
  const r = spawnSync(command, argv, { encoding: 'utf8', timeout: 6000, maxBuffer: 2048, env: { PATH: process.env.PATH ?? '' } });
  if (r.error || r.status !== 0) return add(name, 'missing', `Install ${name} on the development machine`);
  const v = (r.stdout ?? '').trim().match(/v?(\d+)\./);
  if (!v) return add(name, 'unknown', `Verify ${name} version manually`);
  add(name, Number(v[1]) >= minimum ? 'ready' : 'outdated', Number(v[1]) >= minimum ? undefined : `Update ${name} to version ${minimum} or newer`);
}
version('node', ['--version'], 'Node.js', 20);
version('npm', ['--version'], 'npm', 10);
version('git', ['--version'], 'Git', 2);
const lock = resolve(root, 'package-lock.json');
if (!existsSync(lock)) add('Dependency lockfile', 'missing', 'On a networked development machine, run npm install --package-lock-only then commit package-lock.json');
else {
  try {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    const data = JSON.parse(readFileSync(lock, 'utf8'));
    add('Dependency lockfile', data.packages?.['']?.name === pkg.name && data.packages?.['']?.version === pkg.version ? 'ready' : 'invalid', 'Regenerate and review the dependency lockfile');
  } catch { add('Dependency lockfile', 'invalid', 'Regenerate and review the dependency lockfile'); }
}
add('Installed dependencies', existsSync(resolve(root, 'node_modules/.bin/tsc')) && existsSync(resolve(root, 'node_modules/.bin/expo')) ? 'ready' : 'missing', 'Run npm ci after generating the lockfile');
const platform = process.platform;
if (platform === 'darwin') {
  const xcode = spawnSync('xcode-select', ['-p'], { encoding: 'utf8', timeout: 6000, maxBuffer: 2048 });
  add('Xcode developer tools', xcode.status === 0 ? 'ready' : 'missing', 'Install Xcode and select its developer tools for iOS builds');
} else add('iOS build host', 'not-applicable', 'Use macOS with Xcode or a supported cloud build service for iOS');
const report = { project: 'Social Eyes', phase: 1, platform, checks, readyForDependencyChecks: checks.filter(c => ['Node.js', 'npm', 'Dependency lockfile', 'Installed dependencies'].includes(c.name)).every(c => c.status === 'ready') };
if (args[0] === '--json') console.log(JSON.stringify(report, null, 2));
else for (const c of checks) console.log(`${c.status.toUpperCase()}: ${c.name}${c.action && c.status !== 'ready' ? ` — ${c.action}` : ''}`);
process.exitCode = report.readyForDependencyChecks ? 0 : 2;
