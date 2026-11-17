import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/profiles.ts', import.meta.url), 'utf8');
test('save verifies owner-visible database state before reporting success', () => {
  const save = source.slice(source.indexOf('export async function saveMyProfile'));
  assert.match(save, /await getMyProfile\(identity\.user\.id\)/);
  assert.match(save, /confirmed\.display_name !== validated\.display_name/);
  assert.match(save, /confirmed\.bio !== validated\.bio/);
  assert.match(save, /confirmed\.intent !== validated\.intent/);
  assert.match(save, /throw new Error\('Profile save could not be verified'\)/);
});
test('canonical-field migration disallows untrimmed profile values', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202611160004_profile_canonical_fields.sql', import.meta.url), 'utf8');
  assert.match(sql, /display_name = btrim\(display_name\)/);
  assert.match(sql, /bio = btrim\(bio\)/);
});
