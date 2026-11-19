import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('local color suggestion is deterministic, bounded and editable',()=>{
  const context={};vm.runInNewContext(read('assets/photo-palette.js'),context);
  const pixels=new Uint8ClampedArray(128*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;const c=y<32?[48,35,35]:[218,154,117];pixels.set([...c,255],i);}
  const result=context.SocialEyesPhotoPalette.suggest(pixels,128,128);
  assert.equal(result.version,1);assert.equal(result.method,'simple-region-colors');
  assert.ok(result.values['Skin tone']>=0&&result.values['Skin tone']<10);
  assert.ok(result.values['Hair color']>=0&&result.values['Hair color']<10);
  assert.equal(result.editable,true);assert.equal(result.confidence,'unverified');
  assert.deepEqual(JSON.parse(JSON.stringify(result)),JSON.parse(JSON.stringify(context.SocialEyesPhotoPalette.suggest(pixels,128,128))));
});
test('invalid samples fail closed',()=>{const c={};vm.runInNewContext(read('assets/photo-palette.js'),c);assert.throws(()=>c.SocialEyesPhotoPalette.suggest(new Uint8ClampedArray(4),128,128),/Invalid image/);assert.throws(()=>c.SocialEyesPhotoPalette.suggest(new Uint8ClampedArray(128*128*4),128,128),/opaque/);});
test('explicit suggestion action maps into undoable avatar editor, no image upload',()=>{
  const html=read('index.html'),js=read('assets/selfie-onboarding.js'),editor=read('assets/app.js');
  assert.match(html,/id="selfie-suggest"[^>]*disabled/);
  assert.match(js,/suggest\.addEventListener\('click'/);
  assert.match(js,/SocialEyesPhotoPalette\.suggest/);
  assert.match(js,/SocialEyesApplyPhotoSuggestions\(proposal\)/);
  assert.match(editor,/window\.SocialEyesApplyPhotoSuggestions=function/);
  assert.match(editor,/recordCreatorChange\(\);for\(const \[key,value\]/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|FormData/);
});

test('photo preview guards against stale image loads and preserves portrait aspect ratio',()=>{
  const js=read('assets/selfie-onboarding.js');
  assert.match(js,/let selectionId = 0/);
  assert.match(js,/activeSelection !== selectionId/);
  assert.match(js,/image\.onload = null/);
  assert.match(js,/image\.onerror = null/);
  assert.match(js,/const square = Math\.min\(width, height\)/);
  assert.match(js,/\(width - square\) \/ 2, \(height - square\) \/ 2/);
});
test('photo onboarding communicates low-confidence sampling and manual control',()=>{
  const html=read('index.html');
  const sampler=read('assets/photo-palette.js');
  assert.match(html,/Photo tip/);
  assert.match(html,/Colors are only suggestions/);
  assert.match(sampler,/warning:'Colors are approximate/);
  assert.match(html,/Create manually/);
});
