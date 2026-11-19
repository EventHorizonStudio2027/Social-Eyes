import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all four user-uploaded logo crops are embedded directly as browser-displayable WebP',()=>{
 const html=read('index.html');
 const images=[...html.matchAll(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g)];
 assert.ok(images.length>=4,'wordmark, favicon, hero and monochrome logo must all be embedded');
 assert.ok(html.includes('class="brand-wordmark"'));
 assert.ok(html.includes('class="hero-eye"'));
 assert.ok(html.includes('class="brand-mono-signature"'));
 assert.ok(html.includes('type="image/webp"'));
});
test('old logo paths cannot be used by HTML',()=>{
 const html=read('index.html');
 assert.ok(!html.includes('brand-original-eye.svg'));
 assert.ok(!html.includes('brand-approved-eye.svg'));
 assert.ok(!html.includes('brand-official-wordmark.svg'));
});
test('brand images retain dedicated sizing and no cropping',()=>{
 const css=read('assets/app.css');
 assert.ok(css.includes('.brand-wordmark'));
 assert.ok(css.includes('.hero-eye img'));
 assert.ok(css.includes('object-fit:contain'));
});
