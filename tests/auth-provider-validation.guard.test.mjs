import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync('src/providers/AuthProvider.tsx', 'utf8');
test('provider validates every authentication entry point before contacting Supabase', () => {
 for (const method of ['signIn', 'signUp']) assert.match(source, new RegExp(method+': async \\(email, password\\) => \\{\\s*const input = validateAuthInput'));
 for (const method of ['resendConfirmation', 'requestPasswordReset']) assert.match(source, new RegExp(method+": async \\(email\\) => \\{\\s*const input = validateRecoveryEmail"));
 assert.match(source, /signInWithPassword\\(\\{ email: input\\.email, password: input\\.password \\}\\)/);
 assert.match(source, /resetPasswordForEmail\\(input\\.email,/);
});
