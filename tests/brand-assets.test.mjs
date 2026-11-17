import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
function pngInfo(relative) {
  const b = readFileSync(join(root, relative));
  assert.equal(b.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(b.subarray(12, 16).toString('ascii'), 'IHDR');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25], bytes: b.length };
}
test('official eye branding is configured for native platforms', () => {
  assert.equal(config.name, 'Social Eyes');
  assert.equal(config.icon, './assets/images/social-eyes-icon.png');
  assert.equal(config.ios.icon, config.icon);
  assert.equal(config.android.adaptiveIcon.foregroundImage, './assets/images/social-eyes-adaptive-foreground.png');
  assert.match(config.android.adaptiveIcon.backgroundColor, /^#[0-9a-f]{6}$/i);
});
test('app icon is full-resolution opaque PNG and adaptive foreground supports alpha', () => {
  const icon = pngInfo(config.icon);
  const foreground = pngInfo(config.android.adaptiveIcon.foregroundImage);
  assert.deepEqual([icon.width, icon.height, icon.colorType], [1024, 1024, 2]);
  assert.deepEqual([foreground.width, foreground.height, foreground.colorType], [1024, 1024, 6]);
  assert.ok(icon.bytes > 10000);
  assert.ok(foreground.bytes > 10000);
});
test('in-app brand mark and label remain available', () => {
  const component = readFileSync(join(root, 'src/components/BrandHeader.tsx'), 'utf8');
  assert.match(component, /social-eyes-mark\.png/);
  assert.match(component, /accessibilityLabel="Social Eyes eye logo"/);
});
