import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const workflow = readFileSync(new URL('../.github/workflows/bootstrap-lockfile.yml', import.meta.url), 'utf8');
test('manual bootstrap cannot silently commit or publish', () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /contents: write|pull_request_target:|push:|npm publish/);
});
test('bootstrap resolves a real lockfile and verifies installed packages', () => {
  assert.match(workflow, /npm install --package-lock-only/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
  assert.match(workflow, /npm run typecheck/);
  assert.match(workflow, /npm run doctor/);
});
test('bootstrap uploads reviewable lockfile without secrets', () => {
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /path: package-lock\.json/);
  assert.doesNotMatch(workflow, /EXPO_PUBLIC_SUPABASE|service_role|sb_secret_/);
});
