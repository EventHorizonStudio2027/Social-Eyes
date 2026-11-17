import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('app.json'));

test('manifest and package versions match', () => {
  assert.equal(manifest.expo.version, pkg.version);
});
test('application uses Expo Router entry', () => {
  assert.equal(pkg.main, 'expo-router/entry');
  assert.ok(fs.existsSync(path.join(root, 'app', '_layout.tsx')));
});
test('private server secrets are not bundled in source configuration', () => {
  const env = read('.env.example');
  assert.doesNotMatch(env, /SERVICE_ROLE|SECRET_KEY/);
  assert.equal(fs.existsSync(path.join(root, '.env')), false);
});
test('privacy defaults require explicit visibility opt-in', () => {
  const settings = read('src/lib/settings.ts');
  assert.match(settings, /incognito:\s*true/);
  assert.match(settings, /showIntentions:\s*false/);
});
test('backend health is not treated as authenticated access', () => {
  const health = read('src/lib/backendHealth.ts');
  assert.match(health, /reachability, not database authorization/);
  assert.match(health, /AbortController/);
});
test('app includes guarded settings persistence', () => {
  const provider = read('src/providers/AppProvider.tsx');
  assert.match(provider, /settingsWriteInFlight\.current/);
  assert.match(provider, /settingsLoadSequence\.current/);
});

test('failed settings writes fail closed and require a storage reload', () => {
  const provider = read('src/providers/AppProvider.tsx');
  assert.match(provider, /Could not confirm that your preference was saved/);
  assert.match(provider, /setSettingsStorageAvailable\(false\)/);
  assert.match(provider, /setSettings\(\{ \.\.\.defaultSettings \}\)/);
});
