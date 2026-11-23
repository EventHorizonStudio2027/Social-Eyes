import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const app = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const welcome = readFileSync('app/welcome.tsx', 'utf8');
test('native entry screen has no unresolved local image import', () => {
 assert.doesNotMatch(welcome, /require\(['"]\.\.\/assets\/images\/social-eyes-mark\.png['"]\)/);
 assert.match(welcome, /Ionicons/);
 assert.match(welcome, /accessibilityLabel="Social Eyes eye emblem"/);
});
test('configured Expo icon paths must exist', () => {
 const paths = [app.icon, app.ios?.icon, app.android?.adaptiveIcon?.foregroundImage].filter(Boolean);
 for (const file of paths) assert.ok(existsSync(file.replace(/^\.\//, '')), `Missing native icon: ${file}`);
});
test('welcome still blocks progression until onboarding is saved', () => {
 assert.match(welcome, /await markWelcomeComplete\(\)/);
 assert.match(welcome, /router\.replace\('\/\(tabs\)'\)/);
 assert.match(welcome, /disabled=\{saving\}/);
});
