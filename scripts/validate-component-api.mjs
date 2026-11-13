#!/usr/bin/env node
/**
 * validate-component-api.mjs
 *
 * Guards website/src/data/component-api.generated.ts, the prop reference the
 * website's /api/mcp route serves verbatim to MCP clients, and its twin
 * website/src/data/component-types.generated.ts, the types those props
 * reference. Three checks:
 *
 *   1. Freshness — regenerates in memory and byte-compares against disk, so
 *      a prop or registry change cannot land without the regenerated file.
 *      (CI also runs a drift guard after the generators.)
 *
 *   2. No leaked details — the file is handed to strangers' agents, so it is
 *      held to the same non-sanctionable leak patterns as the site corpus: a
 *      local path, analytics id, or API key must never appear in it. The
 *      source is JSDoc that already ships in the npm tarball, so a hit here
 *      means the leak is in the published package too — fix the source.
 *
 *   3. A closed contract — every type name a reader meets is defined. Each
 *      PascalCase name in a prop's type string, each `typeRefs` entry and
 *      each `refs` entry of a type is either a key of the entry's `types`
 *      (defined from the source) or of its `externalTypes` (named with the
 *      package that defines it). A single capital letter is a generic's type
 *      parameter (DataTable's `R`) and stands as written. An agent once got
 *      `steps: AgentPlanStep[]` with no AgentPlanStep anywhere; this is the
 *      check that keeps that from coming back.
 *
 *   4. Every optional enum prop says what renders when it is omitted. A
 *      prop typed as a literal union with no default leaves an agent
 *      guessing which member it gets (Button's `variant` fell back to
 *      `primary` in the body, where docgen cannot see it). Write the
 *      default in the destructuring, or as a JSDoc `@default` when the
 *      fallback lives in the body. ENUM_DEFAULT_BACKLOG is the ratchet:
 *      the props that had no documented default when the check landed.
 *      A prop not on it fails, and an entry whose prop now has a default
 *      (or is gone) fails too, so the list only shrinks.
 *
 *   5. Every get_component response fits a client's budget: under
 *      RESPONSE_BUDGET bytes of compact JSON, for the whole entry and for
 *      each export fetched alone with only the types it reaches. An entry
 *      too big whole is in RESPONSE_SANCTIONED with its reason (an entry of
 *      several exports is read one export at a time); a single export over
 *      budget has no sanction. One response once reached 166KB, past where
 *      clients cut it off. The largest responses are printed on success.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync, readFileSync } from 'node:fs';
import {
  assembleComponentApi,
  buildComponentApiFile,
  buildComponentTypesFile,
  outputPath,
  typesOutputPath,
} from './generate-component-api.mjs';
import { repoRoot } from './component-docgen.mjs';

/**
 * Optional enum props with no documented default, as `Component.prop`,
 * found by the MCP audit of 2026-11-13. Each still needs its fallback read
 * from the component body and written as a default; some may turn out to
 * have none on purpose (an unset `align` that inherits), and those want a
 * JSDoc sentence saying so before they leave this list.
 */
const ENUM_DEFAULT_BACKLOG = new Set(['AgentStatus.pattern', 'AgentStatusMark.pattern', 'AiButton.state', 'AlertDialog.tone', 'AppLayout.subNav', 'AppSidebar.layout', 'ArtifactPanel.view', 'ArtifactPanel.defaultView', 'Avatar.fill', 'Avatar.status', 'BentoTile.highlight', 'BentoTileArt.pattern', 'CircularButton.variant', 'CircularButton.tone', 'ContributionGraph.weekStartsOn', 'DataTable.size', 'DataTable.navigation', 'DataTable.defaultSize', 'DatePicker.weekStartsOn', 'DateRangePicker.weekStartsOn', 'EventCalendar.weekStartsOn', 'Heading.tier', 'Heading.align', 'PixelAvatar.ink', 'PromptSuggestions.layout', 'SegmentedControl.tone', 'Spinner.tone', 'SplitButton.tone', 'TableToolbar.size', 'TableToolbar.defaultSize', 'Text.align', 'ThemeToggle.value', 'ThemeToggle.defaultValue', 'TimePicker.hourFormat', 'Timeline.variant', 'ToggleGroup.tone', 'TopAppBar.align', 'TopAppBar.navigation', 'ChatWidget.layout']);

/** The most a get_component response may weigh, in bytes of compact JSON. */
const RESPONSE_BUDGET = 40_000;

/**
 * Entries whose whole response is over budget, with why. Each export of
 * them still has to fit when fetched alone.
 */
const RESPONSE_SANCTIONED = new Map([
  ['ChatWidget', 'eight exports and their types; an agent fetches the one it is building with the export argument'],
  ['DataTable', 'one export whose own props and the types they need (columns, labels, filters, views) are the contract; nothing in it is another component\'s'],
]);

/** The URLs and usage line lookupComponent adds to an entry, as a byte allowance. */
const RESPONSE_OVERHEAD = 600;

const relative = (path) => path.replace(repoRoot + '/', '');
const errors = [];
const fail = (message) => errors.push(message);

let onDisk = null;
let entries = [];

// 1. Freshness, of both files.
try {
  entries = assembleComponentApi();
  const files = [
    [outputPath, buildComponentApiFile(entries)],
    [typesOutputPath, buildComponentTypesFile(entries)],
  ];
  onDisk = '';
  for (const [path, expected] of files) {
    const text = existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null;
    if (text === null) {
      fail(
        `${relative(path)} is missing — run ` +
          `\`node scripts/generate-component-api.mjs\` and commit the result.`
      );
    } else {
      onDisk += text;
      if (text !== expected) {
        fail(
          `${relative(path)} is stale — run ` +
            `\`node scripts/generate-component-api.mjs\` and commit the result.`
        );
      }
    }
  }
} catch (error) {
  fail(`generating the component API failed: ${error.message}`);
}

// 2. Leaked details — the patterns validate-site-corpus.mjs holds its prompt
// files to. The email screen is a hard ban here, stricter than the corpus's
// allowlist: prop JSDoc never reaches the corpus validator, and no
// corpus-facts() mechanism exists to sanction an address in it.
const leakPatterns = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];

if (onDisk !== null) {
  for (const [pattern, what] of leakPatterns) {
    for (const match of onDisk.matchAll(pattern)) {
      fail(
        `The component API contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}). ` +
          `It is served to any MCP client — remove it from the prop JSDoc it came from.`
      );
    }
  }
}

// 3. A closed contract.
const typeNames = (text) =>
  [...text.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""').matchAll(/\b([A-Z][A-Za-z0-9]*)\b/g)]
    .map((match) => match[1])
    .filter((name) => name.length > 1);
for (const entry of entries) {
  const types = entry.types ?? {};
  const known = new Set([...Object.keys(types), ...Object.keys(entry.externalTypes ?? {})]);
  const undefinedName = (name, where) =>
    fail(
      `${entry.name}: ${where} names ${name}, which neither its types nor its externalTypes define. ` +
        `scripts/component-types.mjs should have reached it; if the type is written in a way the walk ` +
        `cannot follow, teach the walk rather than leave the published contract open.`
    );
  for (const exported of entry.exports) {
    for (const prop of exported.props) {
      for (const name of typeNames(prop.type)) {
        if (!known.has(name)) undefinedName(name, `${exported.component}.${prop.name}'s type`);
      }
      for (const name of prop.typeRefs ?? []) {
        if (!(name in types)) undefinedName(name, `${exported.component}.${prop.name}'s typeRefs`);
      }
    }
  }
  for (const [name, type] of Object.entries(types)) {
    for (const ref of type.refs ?? []) {
      if (!(ref in types)) undefinedName(ref, `the type ${name}`);
    }
  }
}

// 4. Optional enum props state their default.
const undocumented = new Set();
for (const entry of entries) {
  for (const exported of entry.exports) {
    for (const prop of exported.props) {
      if (prop.values && !prop.required && prop.defaultValue == null && !prop.deprecated) {
        undocumented.add(`${exported.component}.${prop.name}`);
      }
    }
  }
}
if (entries.length > 0) {
  for (const key of undocumented) {
    if (!ENUM_DEFAULT_BACKLOG.has(key)) {
      fail(
        `${key} is an optional enum with no documented default. Default it in the destructuring, ` +
          `or add a JSDoc @default when the fallback lives in the body.`
      );
    }
  }
  for (const key of ENUM_DEFAULT_BACKLOG) {
    if (!undocumented.has(key)) {
      fail(`${key} now has a default (or is gone): remove it from ENUM_DEFAULT_BACKLOG.`);
    }
  }
}

// 5. Response budget.
const reachable = (entry, refs) => {
  const all = entry.types ?? {};
  const seen = new Set();
  const queue = [...refs];
  while (queue.length > 0) {
    const name = queue.shift();
    if (seen.has(name) || !all[name]) continue;
    seen.add(name);
    queue.push(...(all[name].refs ?? []));
  }
  return Object.fromEntries([...seen].map((name) => [name, all[name]]));
};
const sizes = [];
for (const entry of entries) {
  const whole = JSON.stringify(entry).length + RESPONSE_OVERHEAD;
  sizes.push([entry.name, whole]);
  if (whole > RESPONSE_BUDGET && !RESPONSE_SANCTIONED.has(entry.name)) {
    fail(
      `get_component("${entry.name}") is ${whole} bytes, over the ${RESPONSE_BUDGET} budget. Trim what its types map pulls in ` +
        `(a whole props interface should be a pointer), or sanction it in RESPONSE_SANCTIONED with the reason.`
    );
  }
  if (whole <= RESPONSE_BUDGET && RESPONSE_SANCTIONED.has(entry.name)) {
    fail(`get_component("${entry.name}") is ${whole} bytes, within budget: remove it from RESPONSE_SANCTIONED.`);
  }
  if (entry.exports.length > 1) {
    for (const exported of entry.exports) {
      const types = reachable(entry, exported.props.flatMap((prop) => prop.typeRefs ?? []));
      const one = JSON.stringify({ ...entry, exports: [exported], types }).length + RESPONSE_OVERHEAD;
      if (one > RESPONSE_BUDGET) {
        fail(`get_component("${entry.name}", { export: "${exported.component}" }) is ${one} bytes, over the ${RESPONSE_BUDGET} budget.`);
      }
    }
  }
}
const largest = sizes.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, bytes]) => `${name} ${Math.round(bytes / 1000)}KB`);

if (errors.length > 0) {
  console.error('\n✗ Component API validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log(`✓ Component API and its types are current, closed, within the response budget (largest: ${largest.join(', ')}), and free of leaked details.`);
