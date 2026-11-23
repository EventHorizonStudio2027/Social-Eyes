import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const profiles = readFileSync('src/lib/profiles.ts', 'utf8');
const recovery = readFileSync('src/lib/recoveryLinks.ts', 'utf8');
test('profile reads and writes recheck identity after network responses', () => {
 assert.match(profiles, /Account changed during profile read/);
 assert.match(profiles, /Account changed during profile save/);
 assert.equal((profiles.match(/await supabase\.auth\.getUser\(\)/g)||[]).length, 4);
});
test('recovery links reject additional query parameter names', () => {
 assert.match(recovery, /params\.some\(\(\[name\]\) => name !== 'token_hash' && name !== 'type'\)/);
});
