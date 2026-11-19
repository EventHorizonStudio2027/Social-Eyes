import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('user-supplied approved Social Eyes eye asset is embedded for offline preview',()=>{
 const svg=read('assets/brand-approved-eye.svg');
 const html=read('index.html');
 assert.match(svg,/data:image\/webp;base64,/);
 assert.match(html,/class="brand-symbol"><img src="\.\/assets\/brand-approved-eye\.svg"/);
 assert.match(html,/class="hero-eye"[^>]*><img src="\.\/assets\/brand-approved-eye\.svg"/);
});
test('brand eye remains fully visible and not cropped in small or hero placements',()=>{
 const css=read('assets/app.css');
 assert.match(css,/\.brand-symbol img\{[^}]*object-fit:contain/);
 assert.match(css,/\.hero-eye img\{[^}]*object-fit:contain/);
});

test('browser favicon uses the approved uploaded logo and never the mistaken original asset',()=>{
 const html=read('index.html');
 assert.match(html,/<link rel="icon" type="image\/svg\+xml" href="\.\/assets\/brand-approved-eye\.svg">/);
 assert.ok(!html.includes('brand-original-eye.svg'));
});
