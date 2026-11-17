import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/supabase.ts'), 'utf8');
const start = source.indexOf('export function isSafePublicBackendConfig(');
const end = source.indexOf('/** This only validates public client configuration', start);
assert.ok(start >= 0 && end > start);
const fn = source.slice(start, end)
  .replace('export function', 'function')
  .replace('url: unknown, key: unknown', 'url, key')
  .replace('): boolean {', ') {');
const context = { URL };
vm.runInNewContext(`${fn}\nthis.validate = isSafePublicBackendConfig;`, context);
const validate = context.validate;

test('accepts only hosted Supabase HTTPS URL and modern publishable key', () => {
  assert.equal(validate('https://project.supabase.co/', 'sb_publishable_example'), true);
  assert.equal(validate('https://project.supabase.co', 'sb_publishable_publicexample'), true);
});
test('rejects unsafe URL origins and credential exfiltration destinations', () => {
  for (const url of [
    'http://project.supabase.co', 'invalid', 'https://user:pass@project.supabase.co/',
    'https://project.supabase.co/other', 'https://project.supabase.co/?key=x',
    'https://project.supabase.co/#secret', 'https://project.supabase.co.evil.example/',
    'https://api.socialeyes.example/', 'https://project.supabase.co:8443/',
    ' https://project.supabase.co/'
  ]) assert.equal(validate(url, 'sb_publishable_publicexample'), false, url);
});
test('rejects missing, legacy, unknown, or secret credentials', () => {
  for (const key of [null, undefined, '', '   ', 'sb_secret_example',
    ' sb_publishable_example', 'sb_publishable_example ', 'sb_unknown_credential',
    'anon-key', 'eyJhbGciOiJIUzI1NiJ9.example.signature'
  ]) assert.equal(validate('https://project.supabase.co/', key), false, String(key));
});
test('rejects malformed configuration types', () => {
  assert.equal(validate({}, 'sb_publishable_example'), false);
  assert.equal(validate('https://project.supabase.co/', {}), false);
});
