import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const ignored = new Set(['node_modules', '.git', '.expo', 'dist', 'web-build']);
const files = [];
const privateNames = new Set(['.npmrc', '.netrc', '.pypirc', 'google-services.json', 'GoogleService-Info.plist', 'credentials.json', 'credentials.local.json']);
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isSymbolicLink()) errors.push(`Symlink is not allowed in source package: ${path.relative(root, full)}`);
    else if (item.isDirectory()) walk(full);
    else if (item.isFile()) files.push(path.relative(root, full));
  }
}
walk(root);
for (const name of files) {
  if (/(?:^|\/)\.env(?:$|\.)/.test(name) && path.basename(name) !== '.env.example') errors.push(`Private environment file present: ${name}`);
  if (privateNames.has(path.basename(name)) || /\.(pem|p12|pfx|key|p8|jks|keystore|mobileprovision)$/i.test(name)) errors.push(`Potential private key file: ${name}`);
  if (name === 'PACKAGE_MANIFEST.json') errors.push('Reserved manifest filename present in source tree');
  if (!/\.(ts|tsx|js|mjs|json|md|sql|example)$/.test(name)) continue;
  const content = fs.readFileSync(path.join(root, name), 'utf8');
  // Never print secret material, including in error messages.
  if (/sb_secret_[A-Za-z0-9_-]{8,}/.test(content) && !name.includes('test') && !name.endsWith('supabase.ts')) errors.push(`Potential Supabase secret key in ${name}`);
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) errors.push(`Private key content in ${name}`);
}
if (pkg.private !== true) errors.push('package.json must remain private');
if (pkg.main !== 'expo-router/entry') errors.push('Expo Router entrypoint changed');
const scripts = pkg.scripts || {};
for (const key of ['typecheck', 'audit:static', 'audit:syntax', 'test:foundation']) if (!scripts[key]) errors.push(`Missing script: ${key}`);
const lock = path.join(root, 'package-lock.json');
if (fs.existsSync(lock)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(lock, 'utf8'));
    if (parsed.packages?.['']?.version !== pkg.version) errors.push('Lockfile root version differs from package.json');
    if (parsed.packages?.['']?.name !== pkg.name) errors.push('Lockfile root name differs from package.json');
  } catch { errors.push('Unreadable package-lock.json'); }
} else {
  console.log('BLOCKED: package-lock.json is missing; npm ci cannot run reproducibly');
}
if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exitCode = 1;
} else console.log(`PASS: package/security source audit (${files.length} files examined)`);
