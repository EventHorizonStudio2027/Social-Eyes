/** Execute the actual TypeScript service with a mocked Supabase boundary. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); } catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
const root = path.resolve(import.meta.dirname, '..');
function loadTS(filename, imports) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(`(function(require, exports) { ${js}\n})`, { Error, Object, Set, String })(name => {
    if (!(name in imports)) throw new Error(`Unexpected dependency: ${name}`);
    return imports[name];
  }, exports);
  return exports;
}
function service({ owner = 'owner-1', record = null, authError = null, readError = null, writeError = null, ownerSequence = null, writeBarrier = null } = {}) {
  const calls = [];
  let storedRecord = record;
  let authCalls = 0;
  const supabase = {
    auth: { getUser: async () => {
      const activeOwner = ownerSequence ? ownerSequence[Math.min(authCalls, ownerSequence.length - 1)] : owner;
      authCalls++;
      return { data: { user: activeOwner ? { id: activeOwner } : null }, error: authError };
    } },
    from: table => {
      calls.push(['table', table]);
      return {
        select: columns => ({ eq: (field, value) => ({ maybeSingle: async () => {
          calls.push(['read', columns, field, value]);
          return { data: storedRecord, error: readError };
        } }) }),
        upsert: async (payload, options) => { calls.push(['write', payload, options]); if (writeBarrier) await writeBarrier; if (!writeError) storedRecord = payload; return { error: writeError }; },
      };
    },
  };
  const validation = loadTS('src/lib/profileValidation.ts', {});
  const api = loadTS('src/lib/profiles.ts', { '@/lib/supabase': { supabase }, '@/lib/profileValidation': validation });
  return { ...api, calls };
}
const valid = { id: 'owner-1', display_name: 'Alex', bio: 'Hi', intent: 'friends' };
test('profile read validates owner and server data', async () => {
  const api = service({ record: valid });
  assert.equal((await api.getMyProfile('owner-1')).display_name, 'Alex');
  assert.deepEqual(api.calls.map(c => c[0]), ['table', 'read']);
  assert.equal(await service().getMyProfile('owner-1'), null);
  await assert.rejects(service({ record: { ...valid, intent: 'admin' } }).getMyProfile('owner-1'));
});
test('profile read refuses mismatched or missing authenticated owner before querying', async () => {
  for (const owner of ['other-user', null]) {
    const api = service({ owner, record: valid });
    await assert.rejects(api.getMyProfile('owner-1'), /Profile owner mismatch/);
    assert.equal(api.calls.length, 0);
  }
});
test('profile write strips forged columns and uses authenticated owner', async () => {
  const api = service();
  await api.saveMyProfile({ ...valid, display_name: ' Alex ', role: 'admin', is_visible: true });
  const write = api.calls.find(c => c[0] === 'write');
  assert.equal(JSON.stringify(write[1]), JSON.stringify({ id: 'owner-1', display_name: 'Alex', bio: 'Hi', intent: 'friends' }));
  assert.equal(write[2].onConflict, 'id');
});
test('profile write rejects forged identity or invalid draft before database write', async () => {
  for (const draft of [{ ...valid, id: 'other-user' }, { ...valid, intent: 'admin' }, { ...valid, display_name: 'x' }]) {
    const api = service();
    await assert.rejects(api.saveMyProfile(draft));
    assert.equal(api.calls.length, 0);
  }
});
test('profile service propagates database and auth errors', async () => {
  await assert.rejects(service({ authError: new Error('auth offline') }).getMyProfile('owner-1'));
  await assert.rejects(service({ readError: new Error('read offline') }).getMyProfile('owner-1'), /read offline/);
  await assert.rejects(service({ writeError: new Error('write offline') }).saveMyProfile(valid), /write offline/);
});

test('profile write rejects read-back failure instead of reporting a false save', async () => {
  const api = service({ readError: new Error('verification offline') });
  await assert.rejects(api.saveMyProfile(valid), /verification offline/);
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 1);
});

test('profile read rejects account switch while query is in flight', async () => {
  const api = service({ record: valid, ownerSequence: ['owner-1', 'other-user'] });
  await assert.rejects(api.getMyProfile('owner-1'), /Profile owner changed during request/);
  assert.equal(api.calls.filter(c => c[0] === 'read').length, 1);
});
test('profile read rejects sign-out while query is in flight', async () => {
  const api = service({ record: valid, ownerSequence: ['owner-1', null] });
  await assert.rejects(api.getMyProfile('owner-1'), /Profile owner changed during request/);
});
test('profile write cannot report success after account switch during verification', async () => {
  const api = service({ ownerSequence: ['owner-1', 'owner-1', 'owner-1', 'other-user'] });
  await assert.rejects(api.saveMyProfile(valid), /Profile owner changed during request/);
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 1);
});


test('profile write rejects account switch before mutation', async () => {
  const api = service({ ownerSequence: ['owner-1', 'other-user'] });
  await assert.rejects(api.saveMyProfile(valid), /Profile owner changed before write/);
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 0);
});
test('profile write rejects sign-out before mutation', async () => {
  const api = service({ ownerSequence: ['owner-1', null] });
  await assert.rejects(api.saveMyProfile(valid), /Profile owner changed before write/);
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 0);
});


test('concurrent saves for the same profile fail closed without a second mutation', async () => {
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  const api = service({ writeBarrier: barrier });
  const first = api.saveMyProfile(valid);
  // The first write is held in flight; no second write may begin.
  await assert.rejects(api.saveMyProfile({ ...valid, bio: 'new' }), /already in progress/);
  for (let i = 0; i < 8 && !api.calls.some(c => c[0] === 'write'); i++) await Promise.resolve();
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 1);
  release();
  await first;
  await api.saveMyProfile({ ...valid, bio: 'new' });
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 2);
});

test('failed saves release their in-flight guard so the user can retry', async () => {
  const api = service({ writeError: new Error('offline') });
  await assert.rejects(api.saveMyProfile(valid), /offline/);
  await assert.rejects(api.saveMyProfile(valid), /offline/);
  assert.equal(api.calls.filter(c => c[0] === 'write').length, 2);
});
