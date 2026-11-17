import dns from 'node:dns/promises';
import { execFileSync } from 'node:child_process';

const registry = 'registry.npmjs.org';
console.log(`Node: ${process.version}`);
try {
  console.log(`npm: ${execFileSync('npm', ['--version'], { encoding: 'utf8', timeout: 3000 }).trim()}`);
} catch (error) { console.log(`npm version unavailable: ${error.code ?? error.message}`); }
try {
  const addresses = await dns.lookup(registry, { all: true });
  console.log(`DNS PASS: ${registry} resolves to ${addresses.map(a => a.address).join(', ')}`);
} catch (error) {
  console.error(`DNS BLOCKED: ${registry}: ${error.code ?? error.message}`);
  console.error('Dependency installation cannot be verified until registry DNS/network access works.');
  process.exitCode = 2;
}
