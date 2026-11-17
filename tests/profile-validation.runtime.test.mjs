import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
const source = readFileSync(new URL('../src/lib/profileValidation.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { validateProfileDraft, validateProfileRecord } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const valid = { display_name: '  Taylor  ', bio: '  Hello\nworld  ', intent: 'friends' };
const owner = 'a-valid-owner-id';
test('normalizes valid profile fields and preserves bio line breaks', () => {
  assert.deepEqual(validateProfileDraft(valid), { display_name: 'Taylor', bio: 'Hello\nworld', intent: 'friends' });
});
test('rejects malformed and unsupported profile inputs', () => {
  for (const input of [null, [], {}, { ...valid, intent: 'admin' }, { ...valid, bio: null }, { ...valid, display_name: 123 }]) {
    assert.throws(() => validateProfileDraft(input));
  }
});
test('rejects control characters but permits ordinary bio newlines', () => {
  for (const display_name of ['T\tay', 'T\nay', 'T\r ay', 'T\u007fay']) {
    assert.throws(() => validateProfileDraft({ ...valid, display_name }));
  }
  for (const bio of ['Hello\rworld', 'Hello\tworld', 'Hello\u0000world', 'Hello\u007fworld']) {
    assert.throws(() => validateProfileDraft({ ...valid, bio }));
  }
  assert.equal(validateProfileDraft({ ...valid, bio: 'line1\nline2' }).bio, 'line1\nline2');
});
test('enforces Unicode code-point length limits rather than UTF-16 code units', () => {
  assert.equal(Array.from(validateProfileDraft({ ...valid, display_name: '😀'.repeat(40), bio: '🌎'.repeat(280) }).display_name).length, 40);
  for (const display_name of ['a', '😀'.repeat(41), ' '.repeat(4)]) assert.throws(() => validateProfileDraft({ ...valid, display_name }));
  assert.throws(() => validateProfileDraft({ ...valid, bio: '🌎'.repeat(281) }));
});
test('validates ownership and rejects uncanonical server responses', () => {
  assert.deepEqual(validateProfileRecord({ id: owner, display_name: 'Taylor', bio: 'Hello', intent: 'events' }, owner),
    { id: owner, display_name: 'Taylor', bio: 'Hello', intent: 'events' });
  for (const row of [{ id: 'another', display_name: 'Taylor', bio: '', intent: 'friends' },
    { id: owner, display_name: ' Taylor ', bio: '', intent: 'friends' },
    { id: owner, display_name: 'Taylor', bio: ' bio ', intent: 'friends' },
    { id: owner, display_name: 'Taylor', bio: '', intent: 'unexpected' }]) {
    assert.throws(() => validateProfileRecord(row, owner));
  }
});
