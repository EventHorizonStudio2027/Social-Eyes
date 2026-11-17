import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/backendHealth.ts'), 'utf8');
function loadHealth({ configured = true, url = 'https://example.supabase.co/', key = 'public-test-key', fetchImpl = async () => ({ ok: true }), timerImpl } = {}) {
  let code = source.replace(/^import \{[^}]+\} from '@\/lib\/supabase';\s*/m, '');
  code = code.replace(/^export type BackendStatus = .*;\s*/m, '');
  code = code.replace(/: Promise<BackendStatus>/g, '');
  code = code.replace(/: ReturnType<typeof setTimeout> \| undefined/g, '');
  code = code.replace(/new Promise<BackendStatus>/g, 'new Promise');
  code = code.replace(/const request: Promise<BackendStatus>/g, 'const request');
  code = code.replace(/let endpoint: URL;/g, 'let endpoint;');
  code = code.replace(/export async function/g, 'async function');
  const active = new Set();
  const timers = timerImpl ?? {
    setTimeout(callback, duration) { const item = { callback, duration }; active.add(item); return item; },
    clearTimeout(item) { active.delete(item); },
  };
  const context = {
    isBackendConfigured: configured,
    isSafePublicBackendConfig: (u, k) => typeof u === 'string' && typeof k === 'string' && k.length > 0 && !k.startsWith('sb_secret_'),
    process: { env: { EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: key } },
    fetch: fetchImpl,
    AbortController,
    URL,
    setTimeout: timers.setTimeout.bind(timers),
    clearTimeout: timers.clearTimeout.bind(timers),
  };
  vm.runInNewContext(`${code}\n;globalThis.__health = checkBackendHealth;`, context, { timeout: 1000, filename: 'backendHealth.ts' });
  return { check: context.__health, active };
}

test('unconfigured backend does not make network requests', async () => {
  let called = false;
  const { check } = loadHealth({ configured: false, fetchImpl: () => { called = true; } });
  assert.equal(await check(), 'unconfigured');
  assert.equal(called, false);
});

test('missing URL or public key returns unconfigured', async () => {
  assert.equal(await loadHealth({ url: '' }).check(), 'unconfigured');
  assert.equal(await loadHealth({ key: '' }).check(), 'unconfigured');
});

test('health check uses public key and normalized URL, then clears timeout', async () => {
  let captured;
  const { check, active } = loadHealth({ fetchImpl: async (url, options) => { captured = { url, options }; return { ok: true }; } });
  assert.equal(await check(), 'reachable');
  assert.equal(captured.url, 'https://example.supabase.co/auth/v1/health');
  assert.equal(captured.options.headers.apikey, 'public-test-key');
  assert.equal(captured.options.method, 'GET');
  assert.equal(active.size, 0);
});

test('non-2xx HTTP response is unreachable', async () => {
  assert.equal(await loadHealth({ fetchImpl: async () => ({ ok: false }) }).check(), 'unreachable');
});

test('network rejection returns unreachable and clears timeout', async () => {
  const { check, active } = loadHealth({ fetchImpl: async () => { throw new Error('offline'); } });
  assert.equal(await check(), 'unreachable');
  assert.equal(active.size, 0);
});

test('timeout aborts a pending request and reports unreachable', async () => {
  let signal;
  const { check, active } = loadHealth({ fetchImpl: (_, options) => {
    signal = options.signal;
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  } });
  const pending = check();
  assert.equal(active.size, 1);
  await Promise.resolve();
  const [timer] = active;
  assert.equal(timer.duration, 6000);
  timer.callback();
  assert.equal(await pending, 'unreachable');
  assert.equal(signal.aborted, true);
  assert.equal(active.size, 0);
});

test('deadline resolves even when fetch ignores abort forever', async () => {
  const { check, active } = loadHealth({ fetchImpl: () => new Promise(() => {}) });
  const pending = check();
  await Promise.resolve();
  const [timer] = active;
  timer.callback();
  assert.equal(await pending, 'unreachable');
  assert.equal(active.size, 0);
});


test('invalid or insecure backend URLs never receive the project key', async () => {
  for (const url of ['http://example.supabase.co', 'not a URL', 'https://user:pass@example.supabase.co', 'https://example.supabase.co?token=x', 'https://example.supabase.co/#frag']) {
    let called = false;
    const { check } = loadHealth({ url, fetchImpl: () => { called = true; throw new Error('should not fetch'); } });
    assert.equal(await check(), 'unconfigured', url);
    assert.equal(called, false, url);
  }
});

test('secure custom-domain backend is allowed', async () => {
  let captured;
  const { check } = loadHealth({ url: 'https://api.socialeyes.example/', fetchImpl: async (url) => { captured = url; return { ok: true }; } });
  assert.equal(await check(), 'reachable');
  assert.equal(captured, 'https://api.socialeyes.example/auth/v1/health');
});
