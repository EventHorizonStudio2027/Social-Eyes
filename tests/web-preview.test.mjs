import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('web preview publishes only public browser files and has restricted permissions',()=>{
 const yaml=read('.github/workflows/web-preview.yml');
 assert.match(yaml,/pages: write/);
 assert.match(yaml,/id-token: write/);
 assert.match(yaml,/cp index.html _web-preview\/index.html/);
 assert.match(yaml,/cp -R assets _web-preview\/assets/);
 assert.match(yaml,/path: _web-preview/);
 assert.doesNotMatch(yaml,/path: \.(?:\n|$)/);
});
test('static preview uses project-relative browser asset URLs',()=>{
 const html=read('index.html');
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const url=match[1];
  if(url.startsWith('#')||url.startsWith('data:image/webp;base64,'))continue;
  assert.match(url,/^\.\/assets\//,'Non-portable URL: '+url);
 }
});

test('preview rejects missing approved brand asset and deprecated incorrect branding',()=>{
 const yaml=read('.github/workflows/web-preview.yml');
 assert.ok(yaml.includes('brand-official-${logo}.svg'));
 assert.ok(yaml.includes('Deprecated mistaken logo'));
 const html=read('index.html');
 assert.ok(!html.includes('brand-original-eye.svg'));
});
