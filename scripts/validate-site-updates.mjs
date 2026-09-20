#!/usr/bin/env node
/**
 * Validates website/src/data/site-updates.json — the curated data behind
 * the /site-updates timeline.
 *
 * Structure-only checks: every entry must be a complete story (meta,
 * title, non-empty body paragraphs) and the asOf bookmark must be a
 * plausible commit sha + date. Deliberately runs NO git commands:
 * freshness is the site-updates skill's job on its biweekly loop, not
 * the build's — new commits must never fail a build, and Vercel has no
 * full git history anyway.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(repoRoot, 'website', 'src', 'data', 'site-updates.json');

const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error(`✗ Could not read/parse site-updates.json: ${err.message}`);
  process.exit(1);
}

const { asOf, entries } = data;

if (!asOf || typeof asOf !== 'object') {
  errors.push('Missing "asOf" bookmark object.');
} else {
  if (!/^[0-9a-f]{40}$/.test(asOf.commit ?? '')) {
    errors.push(`"asOf.commit" must be a full 40-char sha, got: ${asOf.commit}`);
  }
  const date = new Date(`${asOf.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf.date ?? '') || Number.isNaN(date.getTime())) {
    errors.push(`"asOf.date" must be a valid YYYY-MM-DD date, got: ${asOf.date}`);
  } else if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    errors.push(`"asOf.date" is in the future: ${asOf.date}`);
  }
}

if (!Array.isArray(entries) || entries.length === 0) {
  errors.push('"entries" must be a non-empty array.');
} else {
  entries.forEach((entry, i) => {
    const label = `entries[${i}]${entry?.title ? ` ("${entry.title}")` : ''}`;
    if (!entry.meta?.trim()) errors.push(`${label}: missing "meta" date range.`);
    if (!entry.title?.trim()) errors.push(`${label}: missing "title".`);
    if (
      !Array.isArray(entry.body) ||
      entry.body.length === 0 ||
      entry.body.some((p) => typeof p !== 'string' || !p.trim())
    ) {
      errors.push(`${label}: "body" must be a non-empty array of paragraphs.`);
    }
    if (/\b[0-9a-f]{7,40}\b/.test(entry.body?.join(' ') ?? '')) {
      errors.push(`${label}: body contains what looks like a commit hash — entries are stories, not commit digests.`);
    }
  });
}

if (errors.length > 0) {
  console.error(
    `✗ site-updates.json failed validation:\n` +
      errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Site updates valid — ${entries.length} entries, curated through ${asOf.date}.`
);
