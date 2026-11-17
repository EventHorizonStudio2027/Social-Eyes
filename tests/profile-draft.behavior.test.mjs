import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const ts = fs.readFileSync(path.join(root, 'src/lib/profileDraft.ts'), 'utf8');
const source = ts.replace(/^import .*\n/gm, '')
  .replace('export type ProfileDraft = { display_name: string; bio: string; intent: SocialIntent };', '')
  .replace('export function hasProfileChanges(current: ProfileDraft, saved: ProfileDraft | null): boolean', 'function hasProfileChanges(current, saved)')
  .replace("export function savedProfileSnapshot(input: ProfileDraft): Omit<PublicProfile, 'id'>", 'function savedProfileSnapshot(input)');
const context = { validateProfileDraft: x => ({ display_name: x.display_name.trim(), bio: x.bio.trim(), intent: x.intent }) };
vm.runInNewContext(`${source}\nthis.changed = hasProfileChanges; this.snapshot = savedProfileSnapshot;`, context);
const original = { display_name: 'Alex', bio: 'Hello', intent: 'friends' };
test('unchanged profile does not need a network write', () => assert.equal(context.changed(original, original), false));
test('cosmetic whitespace does not count as a profile change', () => assert.equal(context.changed({ ...original, display_name: ' Alex ', bio: 'Hello ' }, original), false));
test('actual name, bio, and intent changes are detected', () => {
  for (const draft of [{ ...original, display_name: 'Sam' }, { ...original, bio: 'Updated' }, { ...original, intent: 'events' }]) assert.equal(context.changed(draft, original), true);
});
test('new profiles track meaningful changes and canonicalize snapshots', () => {
  assert.equal(context.changed({ display_name: '', bio: '', intent: 'friends' }, null), false);
  assert.equal(context.changed({ display_name: 'Alex', bio: '', intent: 'friends' }, null), true);
  assert.equal(context.snapshot({ ...original, display_name: ' Alex ' }).display_name, 'Alex');
});
test('account UI prevents accidental sign-out without warning on unsaved edits', () => {
  const ui = fs.readFileSync(path.join(root, 'src/components/AccountPanel.tsx'), 'utf8');
  assert.match(ui, /if \(dirty\) \{ Alert\.alert\('Discard profile changes\?'/);
  assert.match(ui, /profileExists && !dirty/);
  assert.match(ui, /setSavedProfile\(snapshot\)/);
});
