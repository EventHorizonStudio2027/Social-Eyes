import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const expo = readFileSync('.github/workflows/deploy-web.yml', 'utf8');
const publicSite = readFileSync('.github/workflows/publish-social-eyes.yml', 'utf8');
test('Expo preview is manual-only while native assets are missing', () => {
 assert.match(expo, /^on:\s*\n\s*workflow_dispatch:/m);
 assert.doesNotMatch(expo, /^\s*push:/m);
 assert.match(expo, /assets\/images\/social-eyes-icon\.png/);
 assert.match(expo, /assets\/images\/social-eyes-adaptive-foreground\.png/);
});
test('public website remains separately publishable from main', () => {
 assert.match(publicSite, /branches: \[main\]/);
 assert.match(publicSite, /index\.html/);
 assert.match(publicSite, /actions\/deploy-pages@v4/);
});
test('Expo preview has distinct concurrency from the public site', () => {
 assert.match(expo, /group: social-eyes-expo-preview/);
 assert.match(publicSite, /group: social-eyes-web-preview/);
});
