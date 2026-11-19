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

test('route changes move keyboard focus to a focusable page without scrolling unexpectedly',()=>{
 const js=read('assets/app.js');
 const html=read('index.html');
 assert.ok(js.includes('focus?.({preventScroll:true})'));
 for(const page of ['home','discover','radar','connections','profile']){
  assert.ok(new RegExp('id="'+page+'-page"[^>]*tabindex="-1"').test(html),page+' must be focusable');
 }
});
test('share previews describe the app and do not expose the wrong logo name',()=>{
 const html=read('index.html');
 assert.ok(html.includes('property="og:title"'));
 assert.ok(!html.includes('Original Social Eyes eye logo'));
});
