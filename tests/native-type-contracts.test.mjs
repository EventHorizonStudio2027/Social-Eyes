import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('profile types come from one canonical module', () => {
  const profiles = read('src/lib/profiles.ts');
  assert.match(profiles, /import type \{ PublicProfile, SocialIntent \} from '@\/lib\/profileTypes'/);
  assert.match(profiles, /export type \{ PublicProfile, SocialIntent \}/);
});

test('backend state includes lifecycle states shown by the native profile screen', () => {
  const health = read('src/lib/backendHealth.ts');
  for (const state of ['unconfigured', 'checking', 'paused', 'reachable', 'unreachable'])
    assert.ok(health.includes("'" + state + "'"), 'missing ' + state);
});

test('device privacy settings keep typed fail-closed defaults', () => {
  const settings = read('src/lib/settings.ts');
  assert.match(settings, /defaultSettings: Readonly<PrivacySettings>/);
  assert.match(settings, /incognito: true/);
  assert.match(settings, /showIntentions: false/);
  assert.match(settings, /allowNotifications: false/);
});
