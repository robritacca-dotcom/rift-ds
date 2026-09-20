#!/usr/bin/env node
/**
 * Validates that every written chat suggestion fits on a chip.
 *
 * A suggestion — a conversation starter on the chat's welcome screen, or a
 * follow-up question under an answer — renders as a Chip, which never wraps.
 * Past the column width the pill runs off the edge of the docked panel, so the
 * budget is a hard limit rather than a preference. The limit itself lives in
 * website/src/lib/chat-suggestions.ts and is read from there, so this script
 * never restates it.
 *
 * Generated suggestions are held to the same number at runtime (the follow-ups
 * route drops a long one rather than clipping it). What needs a build check is
 * the written copy: a starter is a string a person types, and nothing else
 * would notice it had grown two words too long.
 *
 * Labels built from runtime data are checked as their static skeleton only —
 * a name substituted into one can be any length, which is why starters.ts
 * falls back to the unnamed wording when the named one does not fit.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const budgetPath = join(repoRoot, 'website', 'src', 'lib', 'chat-suggestions.ts');

/** `label: "…"` in any quote style — a suggestion written as an object. */
const LABELLED = /label:\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;

/** A bare string, for suggestions written as a plain array of them. */
const BARE = /(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;

/**
 * Where written suggestions live. `scope` narrows a file to the region that
 * holds them, for files whose other strings are not chips — the playground
 * writes a fictional product's starters inline, beside stage sizes and rail
 * controls that are labelled too, and the sim transport's follow-ups sit in
 * scenarios full of prose.
 */
const SOURCES = [
  { path: join('website', 'src', 'components', 'SiteChat', 'starters.ts') },
  {
    /* The follow-ups' written fallbacks, offered when the generated set
       comes back empty. They render on the same chip row with no runtime
       filter in front of them — written copy, held here. */
    path: join('website', 'src', 'lib', 'chat-followups.ts'),
    scope: /FALLBACK_FOLLOWUPS = \[([\s\S]*?)\]/g,
    pattern: BARE,
  },
  {
    path: join('website', 'src', 'app', 'playground', 'views', 'ChatView.tsx'),
    scope: /starters=\{\[([\s\S]*?)\]\}/g,
  },
  {
    /* The sim transport's scripted follow-ups. These reach the playground's
       Chat view through the same chip row as everything else, and no runtime
       filter stands between them and it: the route's own check only guards
       suggestions a model wrote. Written copy, so this is where they are held. */
    path: join('website', 'src', 'lib', 'chat-sim.ts'),
    scope: /followups:\s*\[([\s\S]*?)\]/g,
    pattern: BARE,
  },
  /* The template screens' mock assistants (TemplateAssistant) render their
     CHAT_SUGGESTIONS through the same non-wrapping chip row, with no runtime
     filter in front of them — written copy, held here like the playground's.
     The list derives from the templates directory so a new screen is covered
     the day it lands; the scope keeps the check off the screens' other
     label: strings (nav items, buttons), which are not chips, and is
     optional because a template without a mock assistant has no chips. */
  ...readdirSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'website', 'src', 'components', 'templates'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory() && entry.name !== 'TemplateAssistant')
    .map((entry) => ({
      path: join('website', 'src', 'components', 'templates', entry.name, `${entry.name}.tsx`),
      scope: /const CHAT_SUGGESTIONS = \[([\s\S]*?)\];/g,
      optional: true,
    })),
];

const errors = [];

/* The budget, read from the module that owns it. */
let maxChars;
try {
  const source = readFileSync(budgetPath, 'utf8');
  const match = source.match(/export const SUGGESTION_MAX_CHARS\s*=\s*(\d+)/);
  if (!match) throw new Error('SUGGESTION_MAX_CHARS not found');
  maxChars = Number(match[1]);
} catch (err) {
  console.error(`✗ Could not read the chip budget from chat-suggestions.ts: ${err.message}`);
  process.exit(1);
}

let checked = 0;

for (const { path: relative, scope, pattern = LABELLED, optional = false } of SOURCES) {
  let source;
  try {
    source = readFileSync(join(repoRoot, relative), 'utf8');
  } catch (err) {
    errors.push(`Could not read ${relative}: ${err.message}`);
    continue;
  }

  if (scope) {
    const regions = [...source.matchAll(scope)].map((match) => match[1]);
    if (regions.length === 0) {
      if (!optional) {
        errors.push(`${relative}: no suggestion region matched — the scope pattern has gone stale.`);
      }
      continue;
    }
    source = regions.join('\n');
  }

  const labels = source.matchAll(pattern);
  for (const match of labels) {
    const label = match[1] ?? match[2] ?? match[3];
    // A `${…}` stands for runtime data of unknown length; measure what is
    // written around it and leave the substitution to the runtime fallback.
    const written = label.replace(/\$\{[^}]*\}/g, '');
    checked += 1;
    if (written.length > maxChars) {
      errors.push(
        `${relative}: "${label}" is ${written.length} characters, over the ${maxChars}-character chip budget.`
      );
    }
  }
}

if (checked === 0) {
  errors.push(
    'No suggestion labels found. The sources in SOURCES have moved or changed shape — this check is now inert.'
  );
}

if (errors.length > 0) {
  console.error('✗ Chat suggestion validation failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ Chat suggestions fit — ${checked} written labels within the ${maxChars}-character chip budget.`
);
