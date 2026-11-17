import test from 'node:test';
import assert from 'node:assert/strict';
import { run, validateConfig } from '../scripts/verify-two-user-profiles.mjs';
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const env = { SOCIAL_EYES_TEST_URL: 'https://example.supabase.co/', SOCIAL_EYES_TEST_ANON_KEY: 'sb_publishable_example', SOCIAL_EYES_TEST_USER_A_TOKEN: 'tokenA', SOCIAL_EYES_TEST_USER_B_TOKEN: 'tokenB' };
function harness({ leak = false, anonymousLeak = false, badIdentity = false, ownMissing = false, unauthorized = false } = {}) {
  const requests = [];
  const output = [];
  const fetcher = async (url, options) => {
    requests.push({ url, options });
    const token = options.headers.Authorization?.slice(7);
    let data;
    if (url.endsWith('/auth/v1/user')) data = { id: badIdentity ? A : token === 'tokenA' ? A : B };
    else if (!token) data = anonymousLeak ? [{ id: A }] : [];
    else {
      const id = url.includes(A) ? A : B;
      data = (id === (token === 'tokenA' ? A : B)) ? (ownMissing ? [] : [{ id }]) : (leak ? [{ id }] : []);
    }
    return { ok: !unauthorized, status: unauthorized ? 401 : 200, json: async () => data };
  };
  const logger = { log: s => output.push(s), error: s => output.push(s) };
  return { fetcher, requests, output, logger };
}
test('live probe executes seven GETs and passes owner, cross-user and anonymous checks', async () => {
  const h = harness();
  assert.equal(await run(env, h.fetcher, h.logger), 0);
  assert.equal(h.requests.length, 7);
  assert.ok(h.requests.every(r => r.options.method === 'GET' && r.options.redirect === 'error'));
  assert.equal(h.requests.at(-1).options.headers.Authorization, undefined);
  assert.match(h.output.at(-1), /PASS: read-only/);
});
for (const [name, scenario] of Object.entries({ 'cross-user leak': { leak: true }, 'anonymous leak': { anonymousLeak: true }, 'same identity': { badIdentity: true }, 'missing own profile': { ownMissing: true }, 'unauthorized user': { unauthorized: true } })) {
  test(`live probe fails closed on ${name}`, async () => {
    const h = harness(scenario);
    assert.equal(await run(env, h.fetcher, h.logger), 1);
    assert.match(h.output.at(-1), /^FAIL:/);
  });
}
test('live probe does not print upstream response bodies or tokens on HTTP failures', async () => {
  const h = harness();
  h.fetcher = async () => ({ ok: false, status: 500, text: async () => 'tokenA private details' });
  assert.equal(await run(env, h.fetcher, h.logger), 1);
  assert.doesNotMatch(h.output.join(' '), /tokenA|private details/);
});
test('configuration rejects secrets, duplicate tokens, and unsafe origins', () => {
  for (const change of [{ SOCIAL_EYES_TEST_ANON_KEY: 'sb_secret_bad' }, { SOCIAL_EYES_TEST_USER_B_TOKEN: 'tokenA' }, { SOCIAL_EYES_TEST_URL: 'http://example.supabase.co/' }, { SOCIAL_EYES_TEST_URL: 'https://user:pass@example.supabase.co/' }, { SOCIAL_EYES_TEST_URL: 'https://example.supabase.co/?x=1' }]) {
    assert.throws(() => validateConfig({ ...env, ...change }));
  }
});
test('probe rejects malformed URL, control characters and secret-like credentials before network requests', async () => {
  for (const change of [
    { SOCIAL_EYES_TEST_URL: 'not a url' },
    { SOCIAL_EYES_TEST_URL: 'https://example.supabase.co/path' },
    { SOCIAL_EYES_TEST_ANON_KEY: 'SB_SECRET_invalid' },
    { SOCIAL_EYES_TEST_ANON_KEY: 'sb_publishable_test\nInjected: yes' },
    { SOCIAL_EYES_TEST_USER_A_TOKEN: 'tokenA\r\nInjected: yes' },
    { SOCIAL_EYES_TEST_USER_B_TOKEN: ' tokenB ' },
  ]) {
    const h = harness();
    assert.equal(await run({ ...env, ...change }, h.fetcher, h.logger), 1);
    assert.equal(h.requests.length, 0);
    assert.doesNotMatch(h.output.join(' '), /Injected: yes/);
  }
});
