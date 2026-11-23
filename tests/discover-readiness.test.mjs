import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const screen = readFileSync('app/(tabs)/index.tsx', 'utf8');
test('Discover never claims live backend verification from configuration alone', () => {
 assert.match(screen, /live connection not yet verified/);
 assert.match(screen, /backend not connected/);
});
test('Discover makes unavailable presence features and privacy explicit', () => {
 assert.match(screen, /Live venue discovery is not available yet/);
 assert.match(screen, /Your presence is not shared by this screen/);
 assert.match(screen, /remain disabled until backend permissions/);
});
test('Discover status is accessible and fits smaller screens', () => {
 assert.match(screen, /accessibilityRole="text"/);
 assert.match(screen, /accessibilityLabel=\{isBackendConfigured/);
 assert.match(screen, /statusText: \{ flexShrink: 1/);
});
