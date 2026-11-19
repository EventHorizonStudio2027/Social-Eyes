import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all four user-uploaded cropped official logos are embedded offline',()=>{
 for(const name of ['wordmark','app','enlarged','mono']){
  const svg=read('assets/brand-official-'+name+'.svg');
  assert.match(svg,/data:image\/webp;base64,/);
 }
});
test('official branding appears in sidebar, hero, favicon and subtle signature',()=>{
 const html=read('index.html');
 for(const name of ['wordmark','app','enlarged','mono'])assert.ok(html.includes('./assets/brand-official-'+name+'.svg'));
 assert.ok(!html.includes('brand-original-eye.svg'));
});
test('brand images remain fully visible',()=>{
 const css=read('assets/app.css');
 assert.ok(css.includes('.brand-wordmark'));
 assert.ok(css.includes('.hero-eye img'));
});
