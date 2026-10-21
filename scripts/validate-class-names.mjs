#!/usr/bin/env node
/**
 * validate-class-names.mjs
 *
 * Holds CLAUDE.md's class naming rule: a component's base class is `ds-` plus
 * its name in kebab case (`ds-button`, `ds-segmented-control`), with modifiers
 * as `--modifier` and parts as `__part`. Class names are a styling hook a
 * consumer may target, so a root class that strays cannot be renamed later
 * without breaking them; the time to catch one is when it is written.
 *
 * Checks every component in src/components/registry.json: its `.tsx` must
 * write its expected base class as a string (`'ds-tag-input'`, or the start
 * of a template or modifier). A component that predates the rule or shares a
 * family class is listed in SANCTIONED with the class it uses and why; the
 * table is held in both directions, so an entry goes stale the moment the
 * component adopts the expected name.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(join(repoRoot, path), 'utf8').replace(/\r\n/g, '\n');

const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const RUN_TOGETHER = 'written before the naming rule; consumers may target the class, so renaming would break them';
const CHART_FAMILY = 'the shared recharts card: one class and one stylesheet for the whole Chart/ set (design.md)';

/** Component → the base class it uses instead, and why. */
const SANCTIONED = {
  AreaChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  BarChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  ComboChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  LineChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  PieChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  RadarChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  RadialChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  ScatterChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  StackedBarChart: { uses: 'ds-chart', reason: CHART_FAMILY },
  Treemap: { uses: 'ds-chart', reason: CHART_FAMILY },
  GanttChart: { uses: 'ds-gantt', reason: 'named for the pattern (design.md: ds-gantt), with the shared ds-chart card around it' },
  CodeDiff: { uses: 'ds-codediff', reason: RUN_TOGETHER },
  ColorPicker: { uses: 'ds-colorpicker', reason: RUN_TOGETHER },
  NumberInput: { uses: 'ds-numberinput', reason: RUN_TOGETHER },
  PinInput: { uses: 'ds-pininput', reason: RUN_TOGETHER },
  TagInput: { uses: 'ds-taginput', reason: RUN_TOGETHER },
  TimePicker: { uses: 'ds-timepicker', reason: RUN_TOGETHER },
  TreeView: { uses: 'ds-treeview', reason: RUN_TOGETHER },
  RadioButton: { uses: 'ds-radio', reason: RUN_TOGETHER },
};

const writesClass = (source, cls) => new RegExp(`['"\`]${cls}(['"\` ]|--|__|\\$)`).test(source);

const registry = JSON.parse(read('src/components/registry.json'));
const errors = [];
for (const c of registry.components) {
  const source = read(`src/components/${c.folder ?? c.name}/${c.name}.tsx`);
  const expected = `ds-${kebab(c.name)}`;
  const sanction = SANCTIONED[c.name];
  if (writesClass(source, expected)) {
    if (sanction) errors.push(`${c.name} now uses ${expected}: remove its SANCTIONED entry in scripts/validate-class-names.mjs.`);
    continue;
  }
  if (sanction && writesClass(source, sanction.uses)) continue;
  errors.push(
    `${c.name} does not use its expected base class ${expected} (CLAUDE.md, Component Anatomy: ds-{component}). ` +
      (sanction ? `Its SANCTIONED class ${sanction.uses} is not in the file either.` : 'Name the root class after the component.')
  );
}
for (const name of Object.keys(SANCTIONED)) {
  if (!registry.components.some((c) => c.name === name)) errors.push(`SANCTIONED lists ${name}, which is not a registered component.`);
}

if (errors.length > 0) {
  console.error('✗ Class name validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Class names follow ds-{component} — ${registry.components.length - Object.keys(SANCTIONED).length} by rule, ` +
    `${Object.keys(SANCTIONED).length} sanctioned`
);
