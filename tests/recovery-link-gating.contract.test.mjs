import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const auth = fs.readFileSync(path.join(root, 'src/providers/AuthProvider.tsx'), 'utf8');
const tabs = fs.readFileSync(path.join(root, 'app/(tabs)/_layout.tsx'), 'utf8');

test('cold-start navigation stays gated until initial URL inspection settles', () => {
  assert.match(auth, /useState\(Boolean\(supabase\)\)/);
  assert.match(auth, /Linking\.getInitialURL\(\)[\s\S]*?\.finally\(\(\) => \{\s*initialLinkPending\.current = false;\s*if \(active && !recoveryInFlight\.current\) setRecoveryLinkChecking\(false\)/);
});
test('incoming valid recovery links close navigation before async OTP verification', () => {
  assert.match(auth, /recoveryInFlight\.current = true;\s*setRecoveryLinkChecking\(true\);[\s\S]*?await client\.auth\.verifyOtp/);
  assert.match(auth, /finally \{\s*recoveryInFlight\.current = false;\s*queuedRecoveryUrl\.current = null;\s*if \(active && !initialLinkPending\.current\) setRecoveryLinkChecking\(false\);/);
});
test('pending recovery links display a blocking screen ahead of the tab navigator', () => {
  assert.match(tabs, /if \(recoveryLinkChecking\) return <Screen>/);
  assert.ok(tabs.indexOf('if (recoveryLinkChecking)') < tabs.indexOf('<Tabs screenOptions='));
  assert.ok(tabs.indexOf('if (recoverySession)') < tabs.indexOf('<Tabs screenOptions='));
});

test('a completed warm-link verification cannot unlock navigation while cold-start inspection is pending', () => {
  assert.match(auth, /const initialLinkPending = useRef\(Boolean\(supabase\)\)/);
  assert.match(auth, /if \(active && !initialLinkPending\.current\) setRecoveryLinkChecking\(false\)/);
  assert.match(auth, /initialLinkPending\.current = false;\s*if \(active && !recoveryInFlight\.current\)/);
});
