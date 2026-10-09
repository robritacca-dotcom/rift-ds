#!/usr/bin/env node
/**
 * Reads the shadcn registry's download tally from the live Redis and prints
 * it: totals per client family, per item, and per day.
 *
 *   npm run registry-downloads            every day on record
 *   npm run registry-downloads -- 30      the last 30 days
 *
 * The counts are written by `website/src/lib/registry-downloads.ts`, which
 * owns the key shape (`registry:downloads:<date>`, fields `<item>:<client>`);
 * the prefix below restates it because this file cannot import TypeScript.
 *
 * Read-only by construction: it sends SCAN and HGETALL and nothing else, and
 * prefers the read-only token. Credentials come from `website/.env.local`,
 * where they are usually commented out so local dev fails open, so the lines
 * are read either way and never exported into the environment.
 *
 * Not part of any build: it needs production credentials and the network.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PREFIX = 'registry:downloads:';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const envPath = path.join(root, 'website', '.env.local');

function readEnv(name) {
  if (process.env[name]) return process.env[name];
  let text;
  try {
    text = readFileSync(envPath, 'utf8');
  } catch {
    return undefined;
  }
  const match = text.match(new RegExp(`^\\s*#?\\s*${name}\\s*=\\s*(.+)$`, 'm'));
  return match?.[1].trim().replace(/^["']|["']$/g, '');
}

const url = readEnv('KV_REST_API_URL');
const token = readEnv('KV_REST_API_READ_ONLY_TOKEN') ?? readEnv('KV_REST_API_TOKEN');

if (!url || !token) {
  console.error('No KV_REST_API_URL and token found in the environment or website/.env.local.');
  process.exit(1);
}

async function command(...args) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const body = await response.json();
  if (!response.ok || body.error) {
    throw new Error(`${args[0]} failed: ${body.error ?? response.status}`);
  }
  return body.result;
}

const keys = [];
let cursor = '0';
do {
  const [next, batch] = await command('SCAN', cursor, 'MATCH', `${PREFIX}*`, 'COUNT', '500');
  keys.push(...batch);
  cursor = String(next);
} while (cursor !== '0');

const dayLimit = Number(process.argv[2]);
const days = keys
  .map((key) => key.slice(PREFIX.length))
  .sort()
  .slice(Number.isInteger(dayLimit) && dayLimit > 0 ? -dayLimit : 0);

if (days.length === 0) {
  console.log('No registry downloads on record.');
  process.exit(0);
}

const byClient = new Map();
const byItem = new Map();
const byDay = new Map();
const add = (map, key, n) => map.set(key, (map.get(key) ?? 0) + n);

for (const day of days) {
  const flat = await command('HGETALL', `${PREFIX}${day}`);
  for (let i = 0; i < flat.length; i += 2) {
    const [item, client] = flat[i].split(':');
    const count = Number(flat[i + 1]);
    add(byClient, client, count);
    add(byDay, day, count);
    // A crawler reading the JSON is not an install, so items rank on the rest.
    if (client !== 'bot') add(byItem, item, count);
  }
}

const table = (title, map, sort) => {
  console.log(`\n${title}`);
  const rows = [...map].sort(sort);
  const width = Math.max(...rows.map(([key]) => key.length));
  for (const [key, count] of rows) console.log(`  ${key.padEnd(width)}  ${count}`);
};
const byCount = (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]);

console.log(`Registry fetches, ${days[0]} to ${days.at(-1)} (days on record: ${days.length})`);
table('By client', byClient, byCount);
table('By item, crawlers excluded', byItem, byCount);
table('By day', byDay, (a, b) => a[0].localeCompare(b[0]));

console.log(
  '\nOne install fetches several items: the component, each registry dependency, and base.' +
    '\nSo base, not the sum, is the closest figure to installs; registry is the index being read.'
);
