import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const auditScript = fs.readFileSync(path.join(root, 'scripts/security-and-package-audit.mjs'), 'utf8');
function fixture(extra) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-eyes-audit-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(path.join(dir, 'scripts/security-and-package-audit.mjs'), auditScript);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({name:'social-eyes-mobile',version:'0.3.0',private:true,main:'expo-router/entry',scripts:{typecheck:'tsc --noEmit','audit:static':'node x','audit:syntax':'node x','test:foundation':'node x'}}));
  extra(dir);
  return dir;
}
function run(dir) { return spawnSync(process.execPath, ['scripts/security-and-package-audit.mjs'], {cwd:dir,encoding:'utf8'}); }
test('security audit rejects nested environment secrets', () => {
  const dir = fixture(d => { fs.mkdirSync(path.join(d,'config')); fs.writeFileSync(path.join(d,'config/.env.production'),'PRIVATE=1'); });
  try { const result = run(dir); assert.notEqual(result.status, 0); assert.match(result.stderr, /Private environment file/); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('security audit allows nested .env.example templates', () => {
  const dir = fixture(d => { fs.mkdirSync(path.join(d,'config')); fs.writeFileSync(path.join(d,'config/.env.example'),'EXAMPLE=placeholder'); });
  try { assert.equal(run(dir).status,0); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('security audit rejects symlinks that might expose external files', () => {
  const dir = fixture(d => fs.symlinkSync(path.join(d,'package.json'),path.join(d,'linked-config.json')));
  try { const result=run(dir); assert.notEqual(result.status,0); assert.match(result.stderr,/Symlink is not allowed/); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('security audit rejects private key files', () => {
  const dir = fixture(d => fs.writeFileSync(path.join(d,'signing.key'),'secret'));
  try { assert.notEqual(run(dir).status,0); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('security audit rejects npm authentication configuration files', () => {
  const dir = fixture(d => fs.writeFileSync(path.join(d,'.npmrc'),'//registry.npmjs.org/:_authToken=placeholder'));
  try { const result = run(dir); assert.notEqual(result.status,0); assert.match(result.stderr,/Potential private key file/); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('security audit rejects mobile signing material', () => {
  const dir = fixture(d => fs.writeFileSync(path.join(d,'release.keystore'),'placeholder'));
  try { assert.notEqual(run(dir).status,0); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
