import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const profile = readFileSync('app/(tabs)/profile.tsx', 'utf8');
test('health reachability is not presented as authentication or RLS verification', () => {
 assert.match(profile, /Backend endpoint reachable\. Authentication, private profile access and live security rules have not been verified/);
 assert.match(profile, /Tests reachability only, not account or privacy security/);
});
test('privacy controls stay disabled until device settings are readable', () => {
 assert.match(profile, /settingsSaving \|\| !settingsStorageAvailable/g);
 assert.match(profile, /Preferences are locked until device storage can be read/);
});
test('retry and backend controls expose disabled state to accessibility services', () => {
 assert.match(profile, /accessibilityState=\{\{ disabled: settingsSaving \}\}/);
 assert.match(profile, /accessibilityState=\{\{ disabled: backendStatus === 'checking' \|\| backendStatus === 'paused' \}\}/);
});
