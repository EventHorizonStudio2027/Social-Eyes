import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');

const root = path.resolve(import.meta.dirname, '..');

// Compile the real TypeScript and mock only the native storage boundary.
function loadStorageModule(file, storage) {
  const source = fs.readFileSync(path.join(root, 'src/lib', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  const mockRequire = name => {
    if (name !== '@react-native-async-storage/async-storage') throw new Error('Unexpected import: ' + name);
    return storage;
  };
  vm.runInNewContext(compiled, { exports, require: mockRequire, JSON, Error }, { filename: file, timeout: 1000 });
  return exports;
}

function memoryStorage() {
  const data = new Map();
  return {
    data,
    async getItem(key) { return data.get(key) ?? null; },
    async setItem(key, value) { data.set(key, value); },
    async removeItem(key) { data.delete(key); },
  };
}

test('new users default to invisible and notifications off', async () => {
  const { loadSettings } = loadStorageModule('settings.ts', memoryStorage());
  assert.deepEqual(JSON.parse(JSON.stringify(await loadSettings())), {
    incognito: true, allowNotifications: false, showIntentions: false,
  });
});

test('saved preferences persist across independent module instances', async () => {
  const storage = memoryStorage();
  const first = loadStorageModule('settings.ts', storage);
  await first.saveSettings({ incognito: false, allowNotifications: true, showIntentions: true });
  const second = loadStorageModule('settings.ts', storage);
  assert.deepEqual(JSON.parse(JSON.stringify(await second.loadSettings())), {
    incognito: false, allowNotifications: true, showIntentions: true,
  });
});

test('malformed, partial and invalid saved settings are reported as unverified', async () => {
  const storage = memoryStorage();
  const { loadSettings } = loadStorageModule('settings.ts', storage);
  const key = 'social-eyes:settings:v1';
  for (const raw of ['{broken', 'null', '[]', '{"incognito":"false","showIntentions":1}', '{}']) {
    storage.data.set(key, raw);
    await assert.rejects(loadSettings(), /Stored privacy settings/, raw);
  }
});

test('read and write storage failures propagate to caller', async () => {
  const failing = {
    async getItem() { throw new Error('read unavailable'); },
    async setItem() { throw new Error('write unavailable'); },
  };
  const { loadSettings, saveSettings } = loadStorageModule('settings.ts', failing);
  await assert.rejects(loadSettings(), /read unavailable/);
  await assert.rejects(saveSettings({ incognito: true, allowNotifications: false, showIntentions: false }), /write unavailable/);
});

test('onboarding is persisted and can be reset', async () => {
  const storage = memoryStorage();
  const { hasCompletedWelcome, markWelcomeComplete, resetWelcomeForTesting } = loadStorageModule('preferences.ts', storage);
  assert.equal(await hasCompletedWelcome(), false);
  await markWelcomeComplete();
  assert.equal(await hasCompletedWelcome(), true);
  await resetWelcomeForTesting();
  assert.equal(await hasCompletedWelcome(), false);
});

test('failed onboarding save does not report success', async () => {
  const storage = memoryStorage();
  storage.setItem = async () => { throw new Error('disk full'); };
  const { markWelcomeComplete, hasCompletedWelcome } = loadStorageModule('preferences.ts', storage);
  await assert.rejects(markWelcomeComplete(), /disk full/);
  assert.equal(await hasCompletedWelcome(), false);
});

test('empty stored value is invalid rather than a new installation', async () => {
  const storage = memoryStorage();
  storage.data.set('social-eyes:settings:v1', '');
  await assert.rejects(loadStorageModule('settings.ts', storage).loadSettings(), /Stored privacy settings/);
});

test('valid explicit privacy choices remain intact', async () => {
  const storage = memoryStorage();
  storage.data.set('social-eyes:settings:v1', JSON.stringify({ incognito: false, allowNotifications: true, showIntentions: true }));
  assert.deepEqual(JSON.parse(JSON.stringify(await loadStorageModule('settings.ts', storage).loadSettings())), {
    incognito: false, allowNotifications: true, showIntentions: true,
  });
});


test('write validation rejects malformed settings without touching storage', async () => {
  const storage = memoryStorage();
  const { saveSettings } = loadStorageModule('settings.ts', storage);
  for (const value of [null, [], {}, { incognito: 'false', allowNotifications: false, showIntentions: false },
    { incognito: true, allowNotifications: false }]) {
    await assert.rejects(saveSettings(value), /Privacy settings/);
  }
  assert.equal(storage.data.size, 0);
});

test('settings writes serialize only approved fields', async () => {
  const storage = memoryStorage();
  const { saveSettings } = loadStorageModule('settings.ts', storage);
  await saveSettings({ incognito: true, allowNotifications: false, showIntentions: false, unknown: 'unsafe' });
  assert.deepEqual(JSON.parse(storage.data.get('social-eyes:settings:v1')),
    { incognito: true, allowNotifications: false, showIntentions: false });
});

test('settings patch validation rejects unknown fields, empty updates, and nonboolean values', () => {
  const { validateSettingsPatch } = loadStorageModule('settings.ts', memoryStorage());
  for (const value of [null, [], {}, { unknown: true }, { incognito: 0 }, { incognito: false, unknown: true }]) {
    assert.throws(() => validateSettingsPatch(value), /Privacy settings patch/);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(validateSettingsPatch({ incognito: false }))), { incognito: false });
});

test('failed writes preserve the previous serialized record', async () => {
  const storage = memoryStorage();
  const { saveSettings, loadSettings } = loadStorageModule('settings.ts', storage);
  await saveSettings({ incognito: true, allowNotifications: false, showIntentions: false });
  const before = storage.data.get('social-eyes:settings:v1');
  await assert.rejects(saveSettings({ incognito: 'off', allowNotifications: true, showIntentions: true }), /Privacy settings/);
  assert.equal(storage.data.get('social-eyes:settings:v1'), before);
  assert.equal((await loadSettings()).incognito, true);
});

test('read validation tolerates future nonprivacy metadata without activating it', async () => {
  const storage = memoryStorage();
  storage.data.set('social-eyes:settings:v1', JSON.stringify({ incognito: true, allowNotifications: false, showIntentions: false, schema: 2 }));
  const result = await loadStorageModule('settings.ts', storage).loadSettings();
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { incognito: true, allowNotifications: false, showIntentions: false });
});

test('write rejection does not mutate caller settings', async () => {
  const storage = memoryStorage();
  const { saveSettings } = loadStorageModule('settings.ts', storage);
  const settings = { incognito: false, allowNotifications: true, showIntentions: true };
  await saveSettings(settings);
  assert.deepEqual(settings, { incognito: false, allowNotifications: true, showIntentions: true });
});

test('reloading after malformed settings recovers once valid storage is restored', async () => {
  const storage = memoryStorage();
  const { loadSettings, saveSettings } = loadStorageModule('settings.ts', storage);
  storage.data.set('social-eyes:settings:v1', '{broken');
  await assert.rejects(loadSettings(), /Stored privacy settings/);
  await saveSettings({ incognito: true, allowNotifications: false, showIntentions: false });
  assert.equal((await loadSettings()).incognito, true);
});

test('storage write failures do not turn into false success', async () => {
  const storage = memoryStorage();
  storage.setItem = async () => { throw new Error('storage unavailable'); };
  const { saveSettings } = loadStorageModule('settings.ts', storage);
  await assert.rejects(saveSettings({ incognito: true, allowNotifications: false, showIntentions: false }), /storage unavailable/);
  assert.equal(storage.data.size, 0);
});


test('validated patches are independent snapshots, not caller-owned objects', () => {
  const { validateSettingsPatch } = loadStorageModule('settings.ts', memoryStorage());
  const input = { incognito: false };
  const result = validateSettingsPatch(input);
  input.incognito = true;
  assert.equal(result.incognito, false);
});

test('inherited privacy properties are not written as own patch fields', () => {
  const { validateSettingsPatch } = loadStorageModule('settings.ts', memoryStorage());
  const input = Object.create({ showIntentions: true });
  input.incognito = false;
  const result = validateSettingsPatch(input);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { incognito: false });
});

test('storage that writes then rejects is treated as ambiguous, not successful', async () => {
  const storage = memoryStorage();
  const original = storage.setItem.bind(storage);
  storage.setItem = async (key, value) => { await original(key, value); throw new Error('commit unconfirmed'); };
  const { saveSettings, loadSettings } = loadStorageModule('settings.ts', storage);
  await assert.rejects(saveSettings({ incognito: false, allowNotifications: true, showIntentions: true }), /commit unconfirmed/);
  assert.equal((await loadSettings()).incognito, false);
  // The provider must lock edits on this error: the rejected write MAY have committed.
});

test('read errors can recover on a subsequent successful read', async () => {
  const storage = memoryStorage();
  const original = storage.getItem.bind(storage);
  let fail = true;
  storage.getItem = async key => { if (fail) throw new Error('temporary read failure'); return original(key); };
  const { loadSettings } = loadStorageModule('settings.ts', storage);
  await assert.rejects(loadSettings(), /temporary read failure/);
  fail = false;
  assert.equal((await loadSettings()).incognito, true);
});


test('full settings validation rejects inherited required fields', async () => {
  const storage = memoryStorage();
  const { saveSettings } = loadStorageModule('settings.ts', storage);
  const inherited = Object.create({ incognito: true });
  inherited.allowNotifications = false;
  inherited.showIntentions = false;
  await assert.rejects(saveSettings(inherited), /Privacy settings/);
  assert.equal(storage.data.size, 0);
});

test('symbol-only and symbol-augmented patches are rejected', () => {
  const { validateSettingsPatch } = loadStorageModule('settings.ts', memoryStorage());
  const symbol = Symbol('hidden');
  assert.throws(() => validateSettingsPatch({ [symbol]: true }), /Privacy settings patch/);
  assert.throws(() => validateSettingsPatch({ incognito: false, [symbol]: true }), /Privacy settings patch/);
});

test('loaded privacy records are isolated from unexpected metadata', async () => {
  const storage = memoryStorage();
  storage.data.set('social-eyes:settings:v1', JSON.stringify({ incognito: true, allowNotifications: false, showIntentions: false, other: { incognito: false } }));
  const { loadSettings } = loadStorageModule('settings.ts', storage);
  const loaded = await loadSettings();
  assert.deepEqual(Object.keys(loaded).sort(), ['allowNotifications', 'incognito', 'showIntentions']);
});
