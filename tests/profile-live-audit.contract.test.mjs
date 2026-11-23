import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const sql = readFileSync(new URL('../supabase/verification/phase1_profiles_audit.sql', import.meta.url), 'utf8');
test('read-only SQL audit checks RLS, permissions, owner policies, and timestamp trigger', () => {
  assert.match(sql, /relrowsecurity/);
  assert.match(sql, /has_table_privilege\('anon'/);
  assert.match(sql, /has_column_privilege\('authenticated'/);
  assert.match(sql, /foreach operation in array array\['SELECT','INSERT','UPDATE','DELETE'\]/);
  assert.match(sql, /auth[.]uid/);
  assert.match(sql, /pg_trigger/);
  assert.doesNotMatch(sql, /\b(?:insert\s+into|update\s+public\.profiles|delete\s+from|drop\s+table|alter\s+table)\b/i);
});
