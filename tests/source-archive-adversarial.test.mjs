import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const python = process.env.PYTHON || 'python3';
const verify = 'scripts/verify-package.py';
const extract = 'scripts/extract-source.py';
const generator = String.raw`
import hashlib, json, sys, zipfile
path, attack = sys.argv[1:]
content = b'safe'
name = 'social-eyes-mobile/README.md'
manifest = {'schema':1, 'files':{'README.md':hashlib.sha256(content).hexdigest()}}
with zipfile.ZipFile(path, 'w') as z:
    z.writestr(name, content)
    if attack == 'duplicate': z.writestr(name, content)
    if attack == 'traversal': z.writestr('social-eyes-mobile/../outside.txt', b'bad')
    if attack == 'symlink':
        info = zipfile.ZipInfo('social-eyes-mobile/link')
        info.create_system = 3
        info.external_attr = 0o120777 << 16
        z.writestr(info, b'outside')
        manifest['files']['link'] = hashlib.sha256(b'outside').hexdigest()
    if attack == 'mismatch': manifest['files']['README.md'] = '0'*64
    if attack == 'missing': manifest['files']['ghost.txt'] = '0'*64
    z.writestr('social-eyes-mobile/PACKAGE_MANIFEST.json', json.dumps(manifest))
`;
for (const attack of ['duplicate','traversal','symlink','mismatch','missing']) {
  test(`adversarial ${attack} archive is rejected before extraction`, () => {
    const root = mkdtempSync(join(tmpdir(), 'social-eyes-attack-'));
    try {
      const zip = join(root, 'attack.zip');
      const dest = join(root, 'restored');
      const generated = spawnSync(python, ['-c', generator, zip, attack], { encoding: 'utf8' });
      assert.equal(generated.status, 0, generated.stderr);
      const checked = spawnSync(python, [verify, zip], { encoding: 'utf8' });
      assert.notEqual(checked.status, 0, `verification accepted ${attack}`);
      const extracted = spawnSync(python, [extract, zip, dest], { encoding: 'utf8' });
      assert.notEqual(extracted.status, 0, `extraction accepted ${attack}`);
      assert.equal(existsSync(dest), false, 'rejected archive must not create destination');
      assert.equal(existsSync(join(root, 'outside.txt')), false, 'no path traversal writes');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}
