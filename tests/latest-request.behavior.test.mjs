import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Execute the implementation itself, stripping only TypeScript type annotations.
const source = fs.readFileSync(path.resolve(import.meta.dirname, '../src/lib/latestRequest.ts'), 'utf8');
const js = source.replace('export class LatestRequest', 'class LatestRequest')
  .replace(/private generation/g, 'generation')
  .replace(/private disposed/g, 'disposed')
  .replace(/begin\(\): number/g, 'begin()')
  .replace(/isCurrent\(generation: number\): boolean/g, 'isCurrent(generation)')
  .replace(/invalidate\(\): void/g, 'invalidate()')
  .replace(/dispose\(\): void/g, 'dispose()');
const ctx = {};
vm.runInNewContext(`${js}\nglobalThis.LatestRequest = LatestRequest;`, ctx);
const LatestRequest = ctx.LatestRequest;

test('newer backend check supersedes older result even if it finishes first', () => {
  const tracker = new LatestRequest();
  const old = tracker.begin();
  const recent = tracker.begin();
  assert.equal(tracker.isCurrent(old), false);
  assert.equal(tracker.isCurrent(recent), true);
});

test('invalidation blocks in-flight results before next request', () => {
  const tracker = new LatestRequest();
  const pending = tracker.begin();
  tracker.invalidate();
  assert.equal(tracker.isCurrent(pending), false);
});

test('unmount disposal rejects all pending and future responses', () => {
  const tracker = new LatestRequest();
  const pending = tracker.begin();
  tracker.dispose();
  assert.equal(tracker.isCurrent(pending), false);
  assert.equal(tracker.isCurrent(tracker.begin()), false);
});

test('a new tracker is independent of an old disposed instance', () => {
  const old = new LatestRequest();
  old.dispose();
  const fresh = new LatestRequest();
  assert.equal(fresh.isCurrent(fresh.begin()), true);
});


test('out-of-order asynchronous completions publish only the latest result', async () => {
  const tracker = new LatestRequest();
  let finishOld;
  let finishNew;
  const oldRequest = new Promise(resolve => { finishOld = resolve; });
  const newRequest = new Promise(resolve => { finishNew = resolve; });
  const statuses = [];
  const run = async task => {
    const generation = tracker.begin();
    const status = await task;
    if (tracker.isCurrent(generation)) statuses.push(status);
  };
  const old = run(oldRequest);
  const recent = run(newRequest);
  finishNew('reachable');
  await recent;
  finishOld('unreachable');
  await old;
  assert.deepEqual(statuses, ['reachable']);
});

test('late asynchronous completion after disposal cannot publish', async () => {
  const tracker = new LatestRequest();
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const results = [];
  const generation = tracker.begin();
  const operation = pending.then(value => { if (tracker.isCurrent(generation)) results.push(value); });
  tracker.dispose();
  finish('reachable');
  await operation;
  assert.deepEqual(results, []);
});
