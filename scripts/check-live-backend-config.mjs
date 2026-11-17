import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const file = process.env.SOCIAL_EYES_ENV_FILE || path.join(root, '.env');
if (!fs.existsSync(file)) { console.error('BLOCKED: create .env with public Supabase URL and publishable key'); process.exit(1); }
const entries = Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => { const at = line.indexOf('='); return at < 1 ? ['', ''] : [line.slice(0, at), line.slice(at + 1)]; }));
const url = entries.EXPO_PUBLIC_SUPABASE_URL;
const key = entries.EXPO_PUBLIC_SUPABASE_ANON_KEY;
let valid = false;
try { const u = new URL(url); valid = u.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname) && u.pathname === '/' && !u.port && !u.username && !u.password && !u.search && !u.hash && /^sb_publishable_[A-Za-z0-9_-]+$/.test(key); } catch {}
if (!valid) { console.error('FAIL: backend config must contain a valid Supabase HTTPS project URL and publishable key'); process.exit(1); }
console.log('PASS: local public Supabase configuration is structurally valid (no network connection tested)');
