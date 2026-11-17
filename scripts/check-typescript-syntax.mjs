/** Offline TypeScript/TSX parser. This does NOT perform typechecking. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch {
  try { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
  catch { console.error('TypeScript parser unavailable; syntax check NOT run'); process.exit(2); }
}
const root = path.resolve(import.meta.dirname, '..');
const dirs = ['app', 'src'];
const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(ent.name)) files.push(p);
  }
}
for (const dir of dirs) walk(path.join(root, dir));
files.push(path.join(root, 'expo-env.d.ts'));
let errors = 0;
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const d of source.parseDiagnostics) {
    const pos = source.getLineAndCharacterOfPosition(d.start ?? 0);
    console.error(`${path.relative(root,file)}:${pos.line+1}:${pos.character+1} TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
    errors++;
  }
}
console.log(`Parsed ${files.length} TS/TSX files; ${errors} syntax errors. Type checking and module resolution NOT performed.`);
process.exitCode = errors ? 1 : 0;
