import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const app = JSON.parse(read('app.json'));
const settings = read('src/lib/settings.ts');
const provider = read('src/providers/AppProvider.tsx');
const backend = read('src/lib/backendHealth.ts');
const checks = [
  ['manifest versions agree', () => assert.equal(pkg.version, app.expo.version)],
  ['Expo Router entry configured', () => assert.equal(pkg.main, 'expo-router/entry')],
  ['TypeScript check command configured', () => assert.equal(pkg.scripts.typecheck, 'tsc --noEmit')],
  ['privacy-safe defaults in source', () => {
    assert.match(settings, /incognito:\s*true/);
    assert.match(settings, /allowNotifications:\s*false/);
    assert.match(settings, /showIntentions:\s*false/);
  }],
  ['settings stored using AsyncStorage', () => {
    assert.match(settings, /AsyncStorage\.getItem/);
    assert.match(settings, /AsyncStorage\.setItem/);
  }],
  ['settings writes guarded', () => {
    assert.match(provider, /settingsWriteInFlight\.current/);
    assert.match(provider, /settingsLoadSequence\.current/);
  }],
  ['stale backend responses guarded', () => assert.match(provider, /backendRequests\.current\.isCurrent\(sequence\)/)],
  ['backend health timeout and limitation documented', () => {
    assert.match(backend, /AbortController/);
    assert.match(backend, /reachability, not database authorization/);
  }],
  ['background health results invalidated and marked paused', () => {
    assert.match(provider, /backendLifecycleAction\(state\)/);
    assert.match(provider, /backendRequests\.current\.invalidate\(\)/);
    assert.match(provider, /setBackendStatus\('paused'\)/);
  }],
  ['strict-mode effect replay resets mount state', () => {
    assert.match(provider, /useEffect\(\(\) => \{\s*\/\/ React Strict Mode[\s\S]*?mounted\.current = true;/);
    assert.match(provider, /backendRequests\.current\.invalidate\(\)/);
  }],
  ['no committed environment secrets file', () => assert.equal(fs.existsSync(path.join(root, '.env')), false)],
];
let failures = 0;
for (const [label, fn] of checks) {
  try { fn(); console.log(`PASS ${label}`); }
  catch (error) { failures++; console.error(`FAIL ${label}: ${error.message}`); }
}
console.log(`Static source checks: ${checks.length - failures}/${checks.length} passed. These do not establish compilation or runtime correctness.`);
if (failures) process.exitCode = 1;
