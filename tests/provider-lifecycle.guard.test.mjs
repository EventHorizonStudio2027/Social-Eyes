import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const provider = fs.readFileSync(path.resolve(import.meta.dirname, '../src/providers/AppProvider.tsx'), 'utf8');
const profile = fs.readFileSync(path.resolve(import.meta.dirname, '../app/(tabs)/profile.tsx'), 'utf8');

// Source-contract tests. These do NOT mount React Native components.
const contracts = [
  ['mount lifecycle is tracked', 'const mounted = useRef(true);'],
  ['app active lifecycle is tracked', "const appActive = useRef(AppState.currentState === 'active');"],
  ['effect cleanup invalidates request tracker without permanently disposing it', 'backendRequests.current.invalidate()'],
  ['strict-mode effect replay restores mounted state', 'mounted.current = true;'],
  ['unmount invalidates settings reads', '++settingsLoadSequence.current;'],
  ['duplicate active lifecycle events are ignored', 'if (nextActive === appActive.current) return;'],
  ['startup checks only explicitly active state', "AppState.currentState === 'active' ? 'checking' : 'paused'"],
  ['privacy failure does not claim server visibility changed', 'saved and server-side visibility cannot be verified'],
  ['manual refresh refuses background work', 'if (!mounted.current || !appActive.current) return;'],
  ['backend results require mounted and active', 'if (mounted.current && appActive.current && backendRequests.current.isCurrent(sequence))'],
  ['settings writes refuse unmounted provider', 'if (!mounted.current || !settingsReady || !settingsStorageAvailable'],
  ['settings load completion requires mounted provider', 'if (mounted.current && sequence === settingsLoadSequence.current) setSettingsReady(true);'],
  ['settings save completion checks mounted provider', 'if (mounted.current && writeGeneration === mountGeneration.current) {'],
  ['profile explicitly warns preferences are local', 'Privacy preferences stay on this device.'],
];
for (const [name, snippet] of contracts) test(name, () => assert.ok(provider.includes(snippet) || profile.includes(snippet)));
