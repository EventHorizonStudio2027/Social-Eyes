import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const run = () => spawnSync(process.execPath, ['scripts/github-handoff.mjs'], {cwd:new URL('..',import.meta.url).pathname,encoding:'utf8'});
test('private GitHub handoff preflight succeeds without changing files', () => {
 const result=run(); assert.equal(result.status,0,result.stderr);
 const report=JSON.parse(result.stdout); assert.equal(report.status,'ready-for-private-repository-transfer');
 assert.ok(report.files>90); assert.ok(report.paths.includes('package.json'));
 assert.ok(report.paths.includes('.github/workflows/phase1.yml'));
 assert.equal(report.paths.some(path=>path.startsWith('.env.')&&path!=='.env.example'),false);
});
test('GitHub handoff does not print source content or credentials', () => {
 const result=run(); assert.equal(result.status,0,result.stderr);
 assert.doesNotMatch(result.stdout,/sb_publishable_|sb_secret_|PRIVATE KEY/);
});
