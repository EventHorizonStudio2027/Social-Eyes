import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const script = new URL('../scripts/verify-two-user-profiles.mjs', import.meta.url);
test('live probe fails closed without credentials and does not make requests', () => {
  const env = { ...process.env };
  for (const key of ['SOCIAL_EYES_TEST_URL','SOCIAL_EYES_TEST_ANON_KEY','SOCIAL_EYES_TEST_USER_A_TOKEN','SOCIAL_EYES_TEST_USER_B_TOKEN']) delete env[key];
  const result = spawnSync(process.execPath, [script.pathname], { env, encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /NOT RUN: missing/);
});
test('live probe is read-only and verifies cross-account and anonymous reads', () => {
  const source = readFileSync(script, 'utf8');
  assert.match(source, /otherRows\.length !== 0/);
  assert.match(source, /anonymous request exposed profiles/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PATCH|PUT|DELETE)['"]/);
});
test('catalog audit rejects unexpected additional policies and function execution', () => {
  const sql = readFileSync(new URL('../supabase/verification/phase1_profiles_audit.sql', import.meta.url), 'utf8');
  assert.match(sql, /count\(\*\) from pg_policies[^\n]*\) <> 4/);
  assert.match(sql, /has_function_privilege\('authenticated'/);
});
