import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const source = fs.readFileSync(path.resolve(import.meta.dirname, '../src/lib/backendLifecycle.ts'), 'utf8');
const executable = source.replace('export function', 'function')
  .replace('state: string', 'state')
  .replace(": 'refresh' | 'invalidate'", '');
const context = {};
vm.runInNewContext(`${executable}\nglobalThis.action = backendLifecycleAction;`, context);
const action = context.action;

for (const state of ['background', 'inactive', 'unknown']) {
  test(`${state} invalidates backend reachability`, () => assert.equal(action(state), 'invalidate'));
}
test('active requests a new connectivity check', () => assert.equal(action('active'), 'refresh'));

test('background invalidation rejects a late successful response', async () => {
  const trackerSource = fs.readFileSync(path.resolve(import.meta.dirname, '../src/lib/latestRequest.ts'), 'utf8');
  const trackerJS = trackerSource.replace('export class LatestRequest', 'class LatestRequest')
    .replace(/private generation/g, 'generation').replace(/private disposed/g, 'disposed')
    .replace(/begin\(\): number/g, 'begin()')
    .replace(/isCurrent\(generation: number\): boolean/g, 'isCurrent(generation)')
    .replace(/invalidate\(\): void/g, 'invalidate()')
    .replace(/dispose\(\): void/g, 'dispose()');
  const trackerContext = {};
  vm.runInNewContext(`${trackerJS}\nglobalThis.Tracker = LatestRequest;`, trackerContext);
  const tracker = new trackerContext.Tracker();
  const id = tracker.begin();
  let finish;
  const request = new Promise(resolve => { finish = resolve; });
  const published = [];
  const processing = request.then(status => {
    if (tracker.isCurrent(id)) published.push(status);
  });
  if (action('background') === 'invalidate') tracker.invalidate();
  finish('reachable');
  await processing;
  assert.deepEqual(published, []);
});
