import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const workflow = readFileSync(new URL('../.github/workflows/phase1.yml', import.meta.url), 'utf8');
test('CI uses read-only GitHub token and does not persist checkout credentials', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.equal((workflow.match(/persist-credentials: false/g) ?? []).length, 3);
});
test('CI jobs are bounded and use the unified offline verifier', () => {
  assert.equal((workflow.match(/timeout-minutes:/g) ?? []).length, 4);
  assert.match(workflow, /npm run verify:phase1/);
  assert.match(workflow, /cancel-in-progress: true/);
});
test('CI installs from lockfile only', () => {
  assert.match(workflow, /test -f package-lock\.json/);
  assert.match(workflow, /npm ci/);
});

test('CI cannot appear fully green when the dependency build was skipped', () => {
  assert.match(workflow, /build-readiness-gate:/);
  assert.match(workflow, /needs: \[offline, detect-lockfile, full-build\]/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /LOCKFILE_EXISTS: \$\{\{ needs\.detect-lockfile\.outputs\.exists \}\}/);
  assert.match(workflow, /BUILD_RESULT: \$\{\{ needs\.full-build\.result \}\}/);
  assert.match(workflow, /if \[\[ "\$LOCKFILE_EXISTS" != 'true' \]\]/);
  assert.match(workflow, /if \[\[ "\$BUILD_RESULT" != 'success' \]\]/);
});
