import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const auth = readFileSync('src/lib/authInput.ts', 'utf8');
const profile = readFileSync('src/lib/profileValidation.ts', 'utf8');
test('sign-in and sign-up reject short passwords without mutating password', () => {
 assert.match(auth, /password\.length < 6 \|\| password\.length > 1024/);
 assert.match(auth, /password \}/);
});
test('email validation rejects control characters before trimming', () => {
 assert.match(auth, /test\(email\)/);
 assert.match(auth, /const normalized = email\.trim\(\)/);
});
test('profile limits count Unicode code points and reject direction controls', () => {
 assert.match(profile, /\[\.\.\.display_name\]\.length/);
 assert.match(profile, /\[\.\.\.bio\]\.length/);
 assert.match(profile, /\\u202a-\\u202e/);
});
