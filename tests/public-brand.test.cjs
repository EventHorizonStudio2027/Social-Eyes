const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('assets/app.css', 'utf8');
const images = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)];
assert.equal(images.length, 4, 'Four official logo images must be embedded in the public HTML');
for (const [, encoded] of images) {
  const binary = Buffer.from(encoded, 'base64');
  assert.equal(binary.subarray(0,4).toString(), 'RIFF', 'Embedded logo must be valid WebP RIFF');
  assert.equal(binary.subarray(8,12).toString(), 'WEBP', 'Embedded logo must be WebP');
  assert.ok(binary.length > 100, 'Embedded logo must not be empty');
}
assert.match(html, /class="brand-wordmark"/, 'Official wordmark missing');
assert.match(html, /class="hero-eye"/, 'Official hero eye missing');
assert.match(html, /rel="icon"/, 'App icon missing');
assert.match(html, /class="brand-wordmark"[^>]*fetchpriority="high"/, 'Wordmark should load early');
assert.match(html, /class="hero-eye"[^>]*role="img"/, 'Hero image needs accessible image semantics');
assert.match(html, /brand-mono-signature/, 'Monochrome brand mark missing');
assert.match(css, /\.brand-wordmark/, 'Wordmark styles missing');
assert.match(css, /object-fit:contain/, 'Brand image containment missing');
assert.match(html, /build-brand[^>]*official-social-eyes-four-logos/, 'Public build marker missing');
for (const [, url] of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
  assert.ok(fs.existsSync(url.slice(2)), 'Missing referenced asset: ' + url);
}
console.log('PASS: four WebP logos and all relative public assets are present');
