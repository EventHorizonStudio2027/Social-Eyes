import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const migrations = path.join(root, 'supabase/migrations');
const initial = fs.readFileSync(path.join(migrations, '202611160001_profiles.sql'), 'utf8');
const trigger = fs.readFileSync(path.join(migrations, '202611160002_profile_updated_at.sql'), 'utf8');
const permissions = fs.readFileSync(path.join(migrations, '202611160003_profile_timestamp_permissions.sql'), 'utf8');

test('profile data is owner-only, with no public read policy', () => {
  assert.match(initial, /alter table public\.profiles enable row level security/i);
  assert.match(initial, /revoke all on public\.profiles from anon/i);
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    assert.match(initial, new RegExp(`create policy[^;]+for ${operation} to authenticated`, 'i'));
  }
  assert.doesNotMatch(initial, /create policy[^;]+to (?:anon|public)/i);
});
test('server sets updated_at and client cannot write either timestamp', () => {
  assert.match(trigger, /new\.updated_at\s*=\s*now\(\)/i);
  assert.match(trigger, /before update on public\.profiles/i);
  assert.match(permissions, /revoke insert, update on table public\.profiles from authenticated/i);
  assert.match(permissions, /grant insert \(id, display_name, bio, intent\)/i);
  assert.match(permissions, /grant update \(id, display_name, bio, intent\)/i);
  assert.match(permissions, /revoke insert \(created_at, updated_at\), update \(created_at, updated_at\)/i);
});
