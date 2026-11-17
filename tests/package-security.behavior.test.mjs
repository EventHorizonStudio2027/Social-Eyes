import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
test('package/security audit executes successfully', () => {
  const result = spawnSync(process.execPath, ['scripts/security-and-package-audit.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /PASS: package\/security source audit/);
});
