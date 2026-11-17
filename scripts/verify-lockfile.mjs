#!/usr/bin/env node
/** Offline validation of npm's generated lockfile; does not fetch or install packages. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
function fail(message) { console.error(`FAIL: ${message}`); process.exit(1); }
let pkg, lock;
try {
  pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
} catch { fail('package.json or package-lock.json missing or invalid JSON'); }
if (!Number.isInteger(lock.lockfileVersion) || lock.lockfileVersion < 2) fail('Unsupported lockfile version');
if (lock.name !== pkg.name || lock.version !== pkg.version) fail('Lockfile project identity mismatch');
const rootEntry = lock.packages?.[''];
if (!rootEntry || rootEntry.name !== pkg.name || rootEntry.version !== pkg.version) fail('Lockfile root package mismatch');
for (const field of ['dependencies', 'devDependencies']) {
  const a = pkg[field] ?? {};
  const b = rootEntry[field] ?? {};
  if (Object.keys(a).length !== Object.keys(b).length || Object.entries(a).some(([key, value]) => b[key] !== value)) {
    fail(`Lockfile ${field} differ from package.json`);
  }
}
for (const [name, entry] of Object.entries(lock.packages)) {
  if (!name || !entry?.resolved) continue;
  let url;
  try { url = new URL(entry.resolved); } catch { fail(`Invalid dependency URL at ${name}`); }
  if (url.protocol !== 'https:' || !['registry.npmjs.org', 'registry.yarnpkg.com'].includes(url.hostname)) {
    fail(`Untrusted dependency registry at ${name}`);
  }
}
console.log(`PASS: lockfile identity, root dependencies and registry sources verified (${Object.keys(lock.packages).length} package entries)`);
