#!/usr/bin/env node
/** Read-only preflight for transferring a source-only app into a private repository. */
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const excluded = new Set(['.git','node_modules','.expo','dist','web-build','__pycache__','.pytest_cache']);
const prohibited = /(^|\/)(?:\.env(?:\.(?!example$)[^/]*)?|\.npmrc|\.netrc|credentials(?:\.local)?\.json|google-services\.json|GoogleService-Info\.plist)$|\.(?:pem|p12|pfx|p8|jks|keystore|mobileprovision|key)$/i;
const secrets = [/sb_secret_[A-Za-z0-9_-]{8,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const records = [];
function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir,name), rel = relative(root,path).replaceAll('\\','/');
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw Error(`Refusing symlink: ${rel}`);
    if (stat.isDirectory()) { if (!excluded.has(name)) walk(path); continue; }
    if (!stat.isFile() || name.endsWith('.log') || name === '.DS_Store') continue;
    if (prohibited.test(rel)) throw Error(`Refusing sensitive file: ${rel}`);
    const bytes = readFileSync(path);
    const value = bytes.toString('utf8');
    if (secrets.some(pattern => pattern.test(value))) throw Error(`Refusing possible secret: ${rel}`);
    records.push({ path: rel, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
  }
}
try {
  walk(root);
  for (const required of ['package.json','app.json','.github/workflows/phase1.yml','.github/workflows/bootstrap-lockfile.yml','supabase/migrations/202611160001_profiles.sql']) {
    if (!records.some(item => item.path === required)) throw Error(`Missing required project file: ${required}`);
  }
  const totalBytes = records.reduce((sum, file) => sum + file.bytes, 0);
  const report = { status:'ready-for-private-repository-transfer', files:records.length, totalBytes, lockfilePresent:records.some(file=>file.path==='package-lock.json'), paths:records.map(file=>file.path) };
  console.log(JSON.stringify(report,null,2));
} catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
