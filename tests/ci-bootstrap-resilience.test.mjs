import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const bootstrap = readFileSync(new URL('../.github/workflows/bootstrap-lockfile.yml', import.meta.url), 'utf8');
const main = readFileSync(new URL('../.github/workflows/phase1.yml', import.meta.url), 'utf8');
test('bootstrap preserves lockfile even after a compiler or doctor failure', () => {
  assert.match(bootstrap, /id: typecheck\s+continue-on-error: true/);
  assert.match(bootstrap, /id: doctor\s+continue-on-error: true/);
  assert.match(bootstrap, /Upload lockfile even if compilation fails\s+if: always\(\)/);
  assert.match(bootstrap, /steps\.typecheck\.outcome/);
  assert.match(bootstrap, /steps\.doctor\.outcome/);
  assert.match(bootstrap, /exit 1/);
});
test('normal workflow skips dependency build without a lockfile but fails its readiness gate', () => {
  assert.match(main, /- run: npm run verify:phase1/);
  assert.match(main, /detect-lockfile:/);
  assert.match(main, /if: needs\.detect-lockfile\.outputs\.exists == 'true'/);
  assert.match(main, /node scripts\/verify-lockfile\.mjs/);
  assert.match(main, /build-readiness-gate:/);
});
test('both workflows retain read-only permissions and checkout without stored credentials', () => {
  for (const workflow of [bootstrap, main]) {
    assert.match(workflow, /permissions:\s*\n\s*contents: read/);
    assert.match(workflow, /persist-credentials: false/);
  }
});
