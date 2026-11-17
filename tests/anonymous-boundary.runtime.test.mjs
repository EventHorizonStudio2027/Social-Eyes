import test from 'node:test';
import assert from 'node:assert/strict';
import { probeAnonymousBoundary, validatePublicConfig } from '../scripts/verify-anonymous-boundary.mjs';
const url = 'https://abc123.supabase.co/';
const key = 'sb_publishable_valid123';
test('accepts only a publishable key and the expected Supabase origin', () => {
  assert.equal(validatePublicConfig(url, key), 'https://abc123.supabase.co');
  for (const bad of ['http://abc123.supabase.co/', 'https://abc123.supabase.co.evil.test/', 'https://abc123.supabase.co/path', 'https://user@abc123.supabase.co/', 'https://abc123.supabase.co/?x=1']) {
    assert.equal(validatePublicConfig(bad, key), null);
  }
  for (const bad of ['service_role_secret', 'sb_secret_abc', 'eyJhbGciOiJIUzI1NiJ9']) assert.equal(validatePublicConfig(url, bad), null);
});
test('denied anonymous reads pass without reading a response body', async () => {
  for (const status of [401, 403]) {
    let called = false;
    const result = await probeAnonymousBoundary({ url, key, fetchImpl: async (request, options) => {
      called = true;
      assert.equal(request, 'https://abc123.supabase.co/rest/v1/profiles?select=id&limit=1');
      assert.equal(options.headers.apikey, key);
      assert.equal(options.redirect, 'error');
      return { status, ok: false };
    } });
    assert.equal(called, true);
    assert.deepEqual(result, { status: 'passed', httpStatus: status });
  }
});
test('anonymous 200 even with an empty result fails closed', async () => {
  const result = await probeAnonymousBoundary({ url, key, fetchImpl: async () => ({ status: 200, ok: true }) });
  assert.equal(result.status, 'failed');
});
test('network errors are blocked, not counted as security passes', async () => {
  const result = await probeAnonymousBoundary({ url, key, fetchImpl: async () => { throw Error('offline'); } });
  assert.equal(result.status, 'blocked');
});
test('invalid configuration never sends a request', async () => {
  const result = await probeAnonymousBoundary({ url: 'https://evil.test', key, fetchImpl: () => { throw Error('must not run'); } });
  assert.equal(result.status, 'blocked');
});
