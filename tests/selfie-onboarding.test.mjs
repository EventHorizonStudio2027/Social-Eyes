import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('selfie-first UI offers camera, library and manual creation', () => {
  const html = read('index.html');
  assert.match(html, /id="selfie-camera"[^>]*capture="user"/);
  assert.match(html, /id="selfie-upload"[^>]*type="file"/);
  assert.match(html, /id="selfie-manual"/);
  assert.match(html, /id="manual-avatar-editor"/);
  assert.match(html, /selfie-onboarding\.js/);
});
test('selfie preview is local-only and never misrepresented as AI conversion', () => {
  const js = read('assets/selfie-onboarding.js');
  assert.match(js, /URL\.createObjectURL\(file\)/);
  assert.match(js, /URL\.revokeObjectURL\(objectUrl\)/);
  assert.match(js, /8 \* 1024 \* 1024/);
  assert.match(js, /Cartoon conversion is not connected yet/);
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|FormData|FileReader/);
});
test('selfie controls have visible focus and responsive layout', () => {
  const css = read('assets/app.css');
  assert.match(css, /\.selfie-action-primary:focus-visible/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /\.selfie-preview\[hidden\]/);
});
