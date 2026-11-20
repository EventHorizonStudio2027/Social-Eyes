const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('assets/app.css', 'utf8');
const images = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)];
assert.equal(images.length, 5, 'App icon, Apple icon, wordmark, hero, and mono logo must be embedded');
assert.equal(new Set(images.map(x => x[1])).size, 4, 'Four distinct official logo images must be embedded');
assert.ok(Math.max(...images.map(x => x[1].length)) > 20000, 'Original wordmark is too compressed');
assert.ok(Math.min(...images.map(x => x[1].length)) > 6500, 'A logo has been reduced to an unacceptable thumbnail');
const expectedDimensions = [[226,229],[226,229],[684,335],[298,286],[241,241]];
for (const [index, [, encoded]] of images.entries()) {
  const binary = Buffer.from(encoded, 'base64');
  assert.equal(binary.subarray(0,4).toString(), 'RIFF', 'Embedded logo must be valid WebP RIFF');
  assert.equal(binary.subarray(8,12).toString(), 'WEBP', 'Embedded logo must be WebP');
  assert.ok(binary.length > 100, 'Embedded logo must not be empty');
  assert.equal(binary.subarray(12,16).toString(), 'VP8 ', 'Unexpected WebP encoding; update dimension validator');
  const width = binary.readUInt16LE(26) & 0x3fff;
  const height = binary.readUInt16LE(28) & 0x3fff;
  assert.deepEqual([width,height], expectedDimensions[index], 'Original image dimensions changed: logo '+index);
}
assert.match(html, /class="brand-wordmark"/, 'Official wordmark missing');
assert.match(html, /class="hero-eye"/, 'Official hero eye missing');
assert.match(html, /rel="icon"/, 'App icon missing');
assert.match(html, /class="brand-wordmark"[^>]*fetchpriority="high"/, 'Wordmark should load early');
assert.match(html, /class="hero-eye"[^>]*role="img"/, 'Hero image needs accessible image semantics');
assert.match(html, /brand-mono-signature/, 'Monochrome brand mark missing');
assert.match(css, /\.brand-wordmark/, 'Wordmark styles missing');
assert.match(html, /class="skip-to-content"/, 'Keyboard skip link missing');
assert.match(html, /id="main-content"/, 'Skip target missing');
assert.match(html, /<noscript>/, 'No-JavaScript fallback missing');
assert.match(css, /object-fit:contain/, 'Brand image containment missing');
assert.match(html, /build-brand[^>]*official-social-eyes-four-logos/, 'Public build marker missing');
for (const [, url] of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
  assert.ok(fs.existsSync(url.slice(2)), 'Missing referenced asset: ' + url);
}
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
assert.equal(manifest.name, 'Social Eyes');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some(icon => icon.type === 'image/webp'));
assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
assert.match(html, /rel="apple-touch-icon"/);
const app = fs.readFileSync('assets/app.js', 'utf8');
assert.match(app, /data-reset-discover/, 'Discovery empty-state recovery action missing');
assert.match(app, /function closeVenueDetails\(\)/, 'Venue dialog needs centralized close logic');
assert.match(app, /e\.key==="Escape"/, 'Search should clear with Escape');
assert.match(css, /#results \.empty/, 'Discovery empty-state design missing');
console.log('PASS: native-resolution logos, branded manifest, public assets and discovery recovery action');
