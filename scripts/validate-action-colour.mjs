#!/usr/bin/env node
/**
 * validate-action-colour.mjs
 *
 * Holds the library's uses of the action colour, `--color-action-primary-bg`,
 * to the roles design.md reserves it for: primary CTAs, focus rings, active
 * input borders, the checked or on state of a form control, and the selected
 * item of a mutually exclusive set (plus the one data-viz exception, which
 * reaches charts through `--color-chart-series-1`, never the action token
 * directly). The colour only means "click here" while nothing else wears it;
 * the 2026-10-02 drift audit found six components spending it on decoration
 * (a badge dot, link text, a spinner arc, a progress fill), every one of them
 * legal CSS that no other check could see.
 *
 * Checks, over every .css, .ts and .tsx file under src/components (stories
 * excluded — they demo, they do not ship):
 *   1. A reference in an `outline*` declaration passes on its own: that is
 *      the focus ring, the one use every interactive component shares.
 *   2. Any other reference must sit in a component listed in SANCTIONED
 *      below, which names the role that component uses the colour for.
 *      A component that starts using the action colour fails until someone
 *      decides, in this file, which role the use plays.
 *   3. Every SANCTIONED entry must still use the colour, so the table cannot
 *      outlive the uses it sanctions.
 *
 * The table is per component, not per selector: it guards against a new
 * consumer, not against a decorative use added inside a component already
 * listed. That residue is the token-audit and design-qa skills' job.
 * Only the fill token itself is tracked; its `-hover`/`-active` steps and the
 * rest of the action family only ever appear beside it.
 *
 * Runs in the validate-registry chain: it reads source only.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(repoRoot, 'src', 'components');

/** Component folder → the design.md role its non-focus uses play. */
export const SANCTIONED = {
  BottomNav: 'selected item (the active destination)',
  Button: 'primary CTA',
  Carousel: 'selected item (the active slide dot)',
  Checkbox: 'checked state of a form control',
  Chip: 'selected item (a filter chip toggled on)',
  CircularButton: 'primary CTA',
  Combobox: 'checked state (the selected-option check)',
  DatePicker: 'selected item (the chosen day)',
  Dropdown: 'checked state (the selected-option check)',
  EventCalendar: 'selected item (the selected day)',
  FilterBar: 'selected item (an active filter) and its option checks',
  Pagination: 'selected item (the current page)',
  RadioButton: 'checked state of a form control',
  RichDropdown: 'checked state (the selected-option check)',
  SegmentedControl: 'selected item (the active segment)',
  SelectionCard: 'checked state of its radio, checkbox and toggle indicators',
  Slider: 'on state of a form control (the filled track and thumb)',
  Stepper: 'selected item (the active step)',
  Tabs: 'selected item (the active tab)',
  ThreadPanel: 'active input border (the inline rename field)',
  TimePicker: 'checked state (the selected-option check)',
  ToggleGroup: 'selected item (the active option)',
  ToggleSwitch: 'on state of a form control',
};

const TOKEN = /--color-action-primary-bg(?![\w-])/;

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** Blank comments in place, keeping line numbers. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

const files = readdirSync(componentsDir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && /\.(css|tsx?)$/.test(e.name) && !/\.stories\./.test(e.name))
  .map((e) => join(e.parentPath ?? e.path, e.name));

const errors = [];
const used = new Set();
let checked = 0;

for (const file of files) {
  const rel = relative(repoRoot, file).replaceAll('\\', '/');
  const component = relative(componentsDir, file).replaceAll('\\', '/').split('/')[0];
  const lines = stripComments(read(file)).split('\n');
  lines.forEach((line, i) => {
    if (!TOKEN.test(line)) return;
    checked += 1;
    // 1. The focus ring: an outline declaration on the same line.
    if (/^\s*outline[\w-]*\s*:/.test(line)) return;
    used.add(component);
    // 2. Every other use needs a sanctioned role.
    if (!(component in SANCTIONED)) {
      errors.push(
        `${rel}:${i + 1} — ${component} uses --color-action-primary-bg outside a focus outline. ` +
          `Use a neutral, status or chart role instead, or, if the use is a primary CTA, an active input border, ` +
          `the checked/on state of a form control or the selected item of a mutually exclusive set, ` +
          `add ${component} to SANCTIONED in scripts/validate-action-colour.mjs with that role.`
      );
    }
  });
}

// 3. No stale entries.
for (const component of Object.keys(SANCTIONED)) {
  if (!used.has(component)) {
    errors.push(
      `SANCTIONED lists ${component}, which no longer uses --color-action-primary-bg outside a focus outline — ` +
        `remove the entry from scripts/validate-action-colour.mjs.`
    );
  }
}

if (errors.length) {
  console.error('✗ Action colour validation failed:');
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `✓ Action colour reserved — ${checked} references checked; every non-focus use sits in one of ${Object.keys(SANCTIONED).length} components with a sanctioned role.`
);
