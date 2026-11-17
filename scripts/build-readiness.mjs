import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const checks = [
  ['lockfile', fs.existsSync(path.join(root, 'package-lock.json'))],
  ['node_modules directory', fs.existsSync(path.join(root, 'node_modules'))],
  ['local TypeScript executable', fs.existsSync(path.join(root, 'node_modules/.bin/tsc'))],
  ['local Expo executable', fs.existsSync(path.join(root, 'node_modules/.bin/expo'))],
];
for (const [label, ok] of checks) console.log(`${ok ? 'READY' : 'BLOCKED'} ${label}`);
console.log(`Node ${process.version}; project ${pkg.version}`);
if (checks.some(([, ok]) => !ok)) {
  console.error('Full build checks cannot be claimed until installation prerequisites exist.');
  process.exitCode = 2;
}
