import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const client = readFileSync(new URL('../src/lib/profileValidation.ts', import.meta.url), 'utf8');
const sql = readFileSync(new URL('../supabase/migrations/202611160005_profile_control_characters.sql', import.meta.url), 'utf8');
test('client rejects control characters in display names and bios', () => {
  assert.match(client, /\\x00-\\x1f\\x7f/i);
  assert.match(client, /\\x00-\\x09\\x0b-\\x1f\\x7f/i);
  assert.match(client, /unsupported control characters/);
});
test('server checks match the client rules and allow bio newlines', () => {
  assert.match(sql, /profiles_display_name_no_controls/);
  assert.match(sql, /profiles_bio_no_controls/);
  assert.match(sql, /translate\(bio, chr\(10\), ''\)/);
  assert.match(sql, /\[:cntrl:\]/);
});
