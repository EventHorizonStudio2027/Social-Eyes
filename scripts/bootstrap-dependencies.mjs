#!/usr/bin/env node
/** Explicit network-enabled handoff. No credentials, no fake lockfiles, no shell interpolation. */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const usage = 'Usage: node scripts/bootstrap-dependencies.mjs [--generate-lockfile] [--verify]';
if (args.some(arg => !['--generate-lockfile', '--verify'].includes(arg)) || new Set(args).size !== args.length) {
  console.error(usage); process.exit(2);
}
const generate = args.includes('--generate-lockfile');
const verify = args.includes('--verify');
const lockPath = resolve(root, 'package-lock.json');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
function run(command, params) {
  const result = spawnSync(command, params, { cwd: root, stdio: 'inherit', timeout: 300000,
    env: { ...process.env, npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' } });
  if (result.error || result.status !== 0) {
    console.error(`BLOCKED: ${command} ${params.join(' ')} failed; no build success claimed.`);
    process.exit(result.status || 2);
  }
}
if (generate && existsSync(lockPath)) {
  console.error('BLOCKED: lockfile already exists; use npm ci without regenerating it.'); process.exit(2);
}
if (generate) {
  console.log('Generating genuine npm lockfile from registry metadata...');
  run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']);
}
if (!existsSync(lockPath)) {
  console.error('BLOCKED: package-lock.json missing. Run with --generate-lockfile on a network-enabled machine.');
  process.exit(2);
}
console.log('Validating npm lockfile metadata and dependency sources...');
run('node', ['scripts/verify-lockfile.mjs']);
console.log('Installing exactly the locked dependency tree...');
run('npm', ['ci', '--no-audit', '--no-fund']);
if (verify) {
  run('npm', ['run', 'typecheck']);
  run('npm', ['run', 'doctor']);
}
console.log('PASS: dependency bootstrap completed. Native builds and live backend tests remain separate gates.');
