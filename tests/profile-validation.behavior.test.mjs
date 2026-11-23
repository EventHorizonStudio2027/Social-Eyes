import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(import.meta.dirname, '..');
const sourceText = fs.readFileSync(path.join(root, 'src/lib/profileValidation.ts'), 'utf8');
const compiled = ts.transpileModule(sourceText, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const context = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const validate = context.validateProfileDraft;
const validateRecord = context.validateProfileRecord;
test('profile validation trims and allowlists fields', () => {
  const result = validate({ id: 'forged', display_name: '  Alex  ', bio: '  Hello  ', intent: 'friends', admin: true });
  assert.equal(JSON.stringify(result), JSON.stringify({ display_name: 'Alex', bio: 'Hello', intent: 'friends' }));
});
test('profile validation rejects invalid types and intent', () => {
  for (const value of [null, [], {}, { display_name: 'Alex', bio: 7, intent: 'friends' }, { display_name: 'Alex', bio: '', intent: 'admin' }]) assert.throws(() => validate(value));
});
test('profile validation enforces name and bio limits', () => {
  for (const value of [{ display_name: ' A ', bio: '', intent: 'dating' }, { display_name: 'A'.repeat(41), bio: '', intent: 'dating' }, { display_name: 'Alex', bio: 'b'.repeat(281), intent: 'dating' }]) assert.throws(() => validate(value));
  assert.equal(validate({ display_name: 'Alex', bio: 'b'.repeat(280), intent: 'events' }).bio.length, 280);
});
test('profile writes verify current authenticated owner and use allowlisted payload', () => {
  const src = fs.readFileSync(path.join(root, 'src/lib/profiles.ts'), 'utf8');
  assert.match(src, /supabase\.auth\.getUser\(\)/);
  assert.match(src, /identity\.user\.id !== profile\.id/);
  assert.match(src, /id: identity\.user\.id, \.\.\.validated/);
});

test('database profile responses reject wrong owners and malformed fields', () => {
  const valid = { id: 'user-a', display_name: 'Alex', bio: 'Hi', intent: 'friends' };
  assert.equal(validateRecord(valid, 'user-a').id, 'user-a');
  assert.throws(() => validateRecord(valid, 'user-b'));
  assert.throws(() => validateRecord({ ...valid, display_name: ' Alex ' }, 'user-a'));
  assert.throws(() => validateRecord({ ...valid, intent: 'administrator' }, 'user-a'));
});
test('profile reads authenticate owner and validate server response', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/profiles.ts'), 'utf8');
  assert.match(source, /identity\.user\.id !== userId/);
  assert.match(source, /validateProfileRecord\(data, userId\)/);
});
