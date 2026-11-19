import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
test('Expo SDK 58 native configuration excludes rejected Android schema fields', () => {
  const app = load('app.json').expo;
  assert.equal(app.android.edgeToEdgeEnabled, undefined);
  assert.ok(app.android.adaptiveIcon.foregroundImage.endsWith('.png'));
  assert.equal(app.ios.supportsTablet, false);
});
test('Expo font is declared directly and TypeScript matches SDK 58', () => {
  const pkg = load('package.json');
  assert.equal(pkg.dependencies['expo-font'], '~58.0.12');
  assert.equal(pkg.devDependencies.typescript, '~6.0.3');
  assert.equal(pkg.dependencies.react, pkg.dependencies['react-dom']);
});
test('Expo dependencies and toolchain match committed lockfile', () => {
  const pkg = load('package.json');
  const lock = load('package-lock.json');
  for (const key of ['expo-font', 'react', 'react-dom']) {
    assert.equal(lock.packages[''].dependencies[key], pkg.dependencies[key], key + ' dependency drift');
    assert.ok(lock.packages['node_modules/' + key], key + ' missing resolved package');
  }
  assert.equal(lock.packages[''].devDependencies.typescript, pkg.devDependencies.typescript);
});
