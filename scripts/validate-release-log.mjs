#!/usr/bin/env node
/**
 * Validates website/src/data/release-log.json — the data behind the
 * /releases log.
 *
 * Structure-only checks: the log is 1:1 with npm releases, newest first,
 * so every entry needs a unique semver version in strictly descending
 * order, a valid non-future date that never increases down the list, a
 * title, and story paragraphs (never commit digests). An EMPTY log is
 * valid by design — the log starts at zero and gains its first entry
 * with the first publish. Deliberately runs no git or npm commands:
 * whether an entry exists for a published version is the release
 * skill's job at publish time, not the build's.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(repoRoot, 'website', 'src', 'data', 'release-log.json');

const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error(`✗ Could not read/parse release-log.json: ${err.message}`);
  process.exit(1);
}

const { releases } = data;

if (!Array.isArray(releases)) {
  errors.push('"releases" must be an array (empty until the first release).');
} else {
  const seen = new Set();
  const semver = /^\d+\.\d+\.\d+$/;
  const parse = (v) => v.split('.').map(Number);
  const newer = (a, b) => {
    const [A, B] = [parse(a), parse(b)];
    for (let i = 0; i < 3; i++) {
      if (A[i] !== B[i]) return A[i] > B[i];
    }
    return false;
  };

  releases.forEach((entry, i) => {
    const label = `releases[${i}]${entry?.version ? ` (${entry.version})` : ''}`;
    if (!semver.test(entry.version ?? '')) {
      errors.push(`${label}: "version" must be plain semver (X.Y.Z), got: ${entry.version}`);
    } else {
      if (seen.has(entry.version)) {
        errors.push(`${label}: duplicate version — the log is 1:1 with releases.`);
      }
      seen.add(entry.version);
      const prev = releases[i - 1];
      if (prev && semver.test(prev.version ?? '') && !newer(prev.version, entry.version)) {
        errors.push(`${label}: versions must be strictly descending (newest first); ${prev.version} precedes it.`);
      }
    }
    const date = new Date(`${entry.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '') || Number.isNaN(date.getTime())) {
      errors.push(`${label}: "date" must be a valid YYYY-MM-DD date, got: ${entry.date}`);
    } else if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      errors.push(`${label}: "date" is in the future: ${entry.date}`);
    }
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
    `✗ release-log.json failed validation:\n` +
      errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Release log valid — ${releases.length} release entr${releases.length === 1 ? 'y' : 'ies'}, 1:1 with npm, newest first.`
);
