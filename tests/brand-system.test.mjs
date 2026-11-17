import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
test('approved identity and tagline remain documented', () => {
  const tokens = read('src/branding/tokens.ts');
  assert.match(tokens, /Discover\. Connect\. Belong\./);
  assert.match(tokens, /social-eyes-icon\.png/);
  assert.match(read('docs/BRAND_SYSTEM.md'), /approved visual direction/);
});
test('brand background assets are PNG and kept compact', () => {
  for (const name of ['aurora', 'violet-haze', 'cyan-depth']) {
    const url = new URL(`assets/images/brand/${name}.png`, root);
    const data = readFileSync(url);
    assert.equal(data.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    assert.ok(statSync(url).size < 500_000, `${name} exceeds size budget`);
  }
});
