import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const auth = readFileSync(new URL('../src/providers/AuthProvider.tsx', import.meta.url), 'utf8');
test('second valid recovery URL is queued rather than dropped', () => {
  assert.match(auth, /if \(recoveryInFlight\.current\) \{\s*queuedRecoveryUrl\.current = incomingUrl;\s*return;/);
  assert.match(auth, /nextUrl = queuedRecoveryUrl\.current;\s*queuedRecoveryUrl\.current = null;/);
});
test('navigation remains gated throughout sequential verifications', () => {
  const start = auth.indexOf('recoveryInFlight.current = true;', auth.indexOf('const handleRecoveryLink'));
  const end = auth.indexOf('recoveryInFlight.current = false;', start);
  const block = auth.slice(start, end);
  assert.match(block, /setRecoveryLinkChecking\(true\)/);
  assert.match(block, /while \(active && nextUrl\)/);
  assert.doesNotMatch(block, /setRecoveryLinkChecking\(false\)/);
});
test('pending URL is cleared during cleanup and after processing', () => {
  assert.match(auth, /finally \{\s*recoveryInFlight\.current = false;\s*queuedRecoveryUrl\.current = null;/);
  assert.match(auth, /active = false; initialLinkPending\.current = false; queuedRecoveryUrl\.current = null; subscription\.unsubscribe/);
});
