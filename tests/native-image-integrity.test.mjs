import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const signature = Buffer.from('89504e470d0a1a0a', 'hex');
function decode(path, channels) {
  const png = readFileSync(new URL('../assets/images/' + path, import.meta.url));
  assert.deepEqual(png.subarray(0, 8), signature);
  let width = 0, height = 0, colorType = -1;
  const compressed = [];
  for (let offset = 8; offset < png.length;) {
    assert.ok(offset + 12 <= png.length, 'complete PNG chunk header');
    const size = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    assert.ok(offset + size + 12 <= png.length, 'complete PNG chunk payload');
    if (type === 'IHDR') {
      width = png.readUInt32BE(offset + 8);
      height = png.readUInt32BE(offset + 12);
      colorType = png[offset + 17];
    }
    if (type === 'IDAT') compressed.push(png.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if (type === 'IEND') break;
  }
  assert.deepEqual([width, height, colorType], [1024, 1024, channels === 4 ? 6 : 2]);
  const raw = inflateSync(Buffer.concat(compressed), { maxOutputLength: 1024 * (1 + 1024 * channels) });
  assert.equal(raw.length, 1024 * (1 + 1024 * channels));
  return raw;
}
test('native icon contains decodable full-resolution RGB pixels', () => {
  const data = decode('social-eyes-icon.png', 3);
  assert.notDeepEqual(data.subarray(1, 4), data.subarray(512, 515));
});
test('adaptive foreground has genuine transparent and visible pixels', () => {
  const data = decode('social-eyes-adaptive-foreground.png', 4);
  let transparent = false, visible = false;
  for (let y = 0; y < 1024; y += 16) {
    const row = y * (1 + 1024 * 4);
    assert.equal(data[row], 0, 'generated PNG uses unfiltered scanlines');
    for (let x = 0; x < 1024; x += 16) {
      const alpha = data[row + 1 + x * 4 + 3];
      if (alpha === 0) transparent = true;
      if (alpha === 255) visible = true;
    }
  }
  assert.ok(transparent && visible, 'foreground must contain transparent background and visible artwork');
});
