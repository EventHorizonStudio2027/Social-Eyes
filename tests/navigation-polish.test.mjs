import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('navigation respects reduced motion and active destination accessibility',()=>{
 const js=read('assets/app.js');
 assert.ok(js.includes('prefers-reduced-motion: reduce'));
 assert.ok(js.includes('aria-current'));
});
test('navigation has accessible tap targets and keyboard focus',()=>{
 const css=read('assets/app.css');
 assert.ok(css.includes('min-height:46px'));
 assert.ok(css.includes('.nav button:focus-visible'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
