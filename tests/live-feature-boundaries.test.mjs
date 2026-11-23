import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const radar = readFileSync('app/(tabs)/radar.tsx', 'utf8');
const eyes = readFileSync('app/(tabs)/eyes.tsx', 'utf8');
test('radar explicitly states its data and zones are not live', () => {
 assert.match(radar, /Live presence is not available yet/);
 assert.match(radar, /illustrative layout, not a live map/);
 assert.match(radar, /Live radar is disabled/);
});
test('Eyes explicitly states that matching and notifications are inactive', () => {
 assert.match(eyes, /Live Eyes are not connected yet/);
 assert.match(eyes, /Matching is not active yet/);
 assert.match(eyes, /cannot send an Eye or notify anyone/);
});
test('preview boundaries preserve opt-in and mutuality requirements', () => {
 assert.match(radar, /opt-in, approximate zones/);
 assert.match(eyes, /both people to independently opt in/);
});
