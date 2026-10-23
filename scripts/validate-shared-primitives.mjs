#!/usr/bin/env node
/**
 * validate-shared-primitives.mjs — the small things every component draws
 * are drawn once.
 *
 * On 2026-10-23 a consistency audit found the library redrawing the same
 * few things in many places: SelectionCard had copied Checkbox's box,
 * RadioButton's circle and ToggleSwitch's track into its own CSS (and the
 * copies had drifted on focus, motion and colour); QuestionCard stood a
 * font glyph in for a checkbox; InspectorToggleSwitch copied the switch's
 * DOM by hand; seven list and menu components each styled their own
 * "chosen" check, in three colours; twenty-one stylesheets carried the same
 * visually-hidden recipe; and three overlays drew their own close button
 * beside a CircularButton that already existed for it. design.md's
 * Components intro ("Shared primitives, never redrawn") now names the one
 * drawing of each, and this script holds the library to it:
 *
 *   1. No font glyph stands in for a form control. `check_box`,
 *      `check_box_outline_blank`, `radio_button_checked`,
 *      `radio_button_unchecked`, `toggle_on` and `toggle_off` do not appear
 *      in a component module: a host that offers a choice draws
 *      CheckboxIndicator, RadioIndicator or SwitchIndicator.
 *   2. An indicator's classes are written only by its owning module. The
 *      box, circle, dot, track and thumb classes appear in no other `.tsx`
 *      and are styled by no other `.css` — a host references the indicator
 *      by component, and lights it on hover through `ds-control-host`,
 *      never by reaching into its classes.
 *   3. No copied control shape. A rule whose selector ends in a part name
 *      that only a form control owns (`__radio`, `__radio-dot`,
 *      `__checkbox`, `__check-icon`, `__toggle`, `__toggle-thumb`,
 *      `__toggle-icon`) or in a per-component chosen mark (`__check`,
 *      `__option-check`) fails outside the owning modules: the chosen mark
 *      is ChosenMark, from the Dropdown module.
 *   4. One visually-hidden recipe. `clip: rect(0, 0, 0, 0)` and
 *      `clip-path: inset(50%)` live in src/behaviors/visually-hidden.css
 *      and nowhere else; components use `ds-visually-hidden`.
 *   5. No self-drawn close button. A `<button>` carrying a `__close` class
 *      fails: a header's close is a compact tertiary CircularButton.
 *   6. No hand-built radiogroup. `role="radiogroup"` is written by
 *      RadioButton's group and SelectionCard; a set of exclusive pills is a
 *      SegmentedControl.
 *
 * Deliberate departures live in SANCTIONED below, each with its file, the
 * text it allows and the reason; an entry that no longer matches anything
 * fails too, so the table cannot carry dead exceptions. The scope is the
 * published library, `src/components` and `src/chat`, stories excluded
 * (a story may show a glyph as a glyph). What this script cannot see — a
 * surface that takes a token outside its family's convention, a hover that
 * disagrees with its siblings — is the `component-consistency-audit`
 * skill's review.
 *
 * Runs as part of `npm run validate-registry` (every build, both
 * `prebuild` hooks and CI).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(import.meta.url), '..', '..');
const SCOPE = ['src/components', 'src/chat'];
const VISUALLY_HIDDEN_SHEET = 'src/behaviors/visually-hidden.css';

/** The indicator classes and the one module that may write each. */
const INDICATOR_OWNERS = {
  'ds-checkbox__box': 'src/components/Checkbox/Checkbox',
  'ds-checkbox__icon': 'src/components/Checkbox/Checkbox',
  'ds-radio__circle': 'src/components/RadioButton/RadioButton',
  'ds-radio__dot': 'src/components/RadioButton/RadioButton',
  'ds-toggle-switch__track': 'src/components/ToggleSwitch/ToggleSwitch',
  'ds-toggle-switch__thumb': 'src/components/ToggleSwitch/ToggleSwitch',
};

/** Part names only a form control owns, and the chosen mark's old spellings. */
const CONTROL_PART_SUFFIXES = [
  '__radio',
  '__radio-dot',
  '__checkbox',
  '__check-icon',
  '__toggle-track',
  '__toggle-thumb',
  '__toggle-icon',
  '__check',
  '__option-check',
];
// `__toggle` alone is not in the list: an expand/collapse button (AppSidebar,
// NavList, CodeBlock, ThreadPanel, BentoTile) is a toggle too, and none of
// them draws a switch.

const GLYPH_STAND_INS =
  /\b(check_box_outline_blank|check_box|radio_button_checked|radio_button_unchecked|toggle_on|toggle_off)\b/g;

/**
 * Deliberate departures. `file` is repo-relative, `match` is the text the
 * check would report (a selector, a class, a glyph), `reason` says why it
 * stays. Every entry must still match something.
 */
const SANCTIONED = [
  {
    file: 'src/components/Inspector/Inspector.css',
    match: '.ds-inspector-segmented-control__radio',
    reason:
      'the hidden native <input type="radio"> that makes a segment a real radio; it is never drawn, so it is not a copied control',
  },
  {
    file: 'src/components/FileInput/FileInput.css',
    match: '.ds-file-input__native',
    reason:
      'a hidden native file input that must stay focusable and clickable through its label, so it keeps its own recipe rather than ds-visually-hidden',
  },
  {
    file: 'src/components/ThreadTabs/ThreadTabs.tsx',
    match: '__close',
    reason:
      'a 24px close seated inside a 32px tab, geometry-stable and fading in with the tab; CircularButton\'s compact size is the tab\'s whole height',
  },
  {
    file: 'src/components/Lightbox/Lightbox.tsx',
    match: '__close',
    reason:
      'one of the lightbox\'s media controls (close, prev, next), which share a translucent treatment over the image that no CircularButton variant carries',
  },
  {
    file: 'src/components/Rating/Rating.tsx',
    match: 'role="radiogroup"',
    reason: 'the stars are a radiogroup by ARIA\'s own pattern for a rating, not a set of pills',
  },
  {
    file: 'src/components/Inspector/InspectorSegmentedControl.tsx',
    match: 'role="radiogroup"',
    reason:
      'the Inspector family\'s own segmented control, built on hidden native radios so a form reset and a name attribute work; it is the panel-scale SegmentedControl, not a copy beside it',
  },
  {
    file: 'src/components/BottomNav/BottomNav.css',
    match: '.ds-bottom-nav--ios.ds-bottom-nav--minimized .ds-bottom-nav__label',
    reason:
      'a label hidden by a state modifier on the bar, not a static hidden span: the recipe is applied by the minimised selector, where a class the host toggles would say the same thing twice',
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (p) => relative(repoRoot, p).split(sep).join('/');

const files = SCOPE.flatMap((d) => walk(join(repoRoot, d)))
  .map(rel)
  .filter((f) => (f.endsWith('.tsx') || f.endsWith('.css')) && !f.includes('.stories.'));

const errors = [];
const sanctionHits = new Set();

function report(file, match, message) {
  const sanction = SANCTIONED.find((s) => s.file === file && match.includes(s.match));
  if (sanction) {
    sanctionHits.add(sanction);
    return;
  }
  errors.push(`${file}: ${message}`);
}

/** Every selector in a stylesheet, one per rule, comments stripped. */
function selectorsOf(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /(^|[}\n])\s*([^{}]+?)\s*\{/g;
  let m;
  while ((m = re.exec(stripped))) {
    const sel = m[2].trim();
    if (!sel.startsWith('@')) out.push(...sel.split(',').map((s) => s.trim()));
  }
  return out;
}

for (const file of files) {
  const text = readFileSync(join(repoRoot, file), 'utf8');
  const isCss = file.endsWith('.css');
  const module = file.replace(/\.(tsx|css)$/, '');

  if (!isCss) {
    // 1. Glyph stand-ins.
    for (const hit of text.match(GLYPH_STAND_INS) ?? []) {
      report(file, hit, `draws the font glyph "${hit}" where a form control belongs — render CheckboxIndicator, RadioIndicator or SwitchIndicator instead (design.md, Components intro: Shared primitives).`);
    }
    // 2. Indicator classes written outside their owner (the owner's folder:
    //    the owner's stylesheet and stories sit beside it).
    for (const [cls, owner] of Object.entries(INDICATOR_OWNERS)) {
      const ownerFolder = owner.slice(0, owner.lastIndexOf('/') + 1);
      if (!file.startsWith(ownerFolder) && text.includes(cls)) {
        report(file, cls, `writes the indicator class "${cls}", which only ${owner}.tsx may — render the indicator component and let ds-control-host carry the hover.`);
      }
    }
    // 5. Self-drawn close buttons.
    for (const m of text.matchAll(/<button\b[^>]*__close/g)) {
      report(file, m[0], 'draws its own close <button> — the header close is a compact tertiary CircularButton (Dialog is the reference).');
    }
    // 6. Hand-built radiogroups.
    if (
      text.includes('role="radiogroup"') &&
      !['src/components/RadioButton/RadioButton', 'src/components/SelectionCard/SelectionCard'].includes(module)
    ) {
      report(file, 'role="radiogroup"', 'builds its own role="radiogroup" — a set of exclusive pills is a SegmentedControl, and a labelled set of radios is RadioGroup.');
    }
    continue;
  }

  // 2 (css half). Indicator classes styled outside their owner.
  const selectors = selectorsOf(text);
  for (const [cls, owner] of Object.entries(INDICATOR_OWNERS)) {
    if (module === owner) continue;
    for (const sel of selectors) {
      if (sel.includes(`.${cls}`)) {
        report(file, sel, `styles "${sel}", reaching into ${owner}.css's indicator — a host lights the indicator through ds-control-host and never restyles it.`);
      }
    }
  }
  // 3. Copied control shapes and per-component chosen marks.
  for (const sel of selectors) {
    const last = sel.split(/[\s>+~]+/).pop() ?? '';
    const cls = last.match(/^\.([a-z0-9_-]+)/)?.[1];
    if (!cls) continue;
    const suffix = CONTROL_PART_SUFFIXES.find((s) => cls.endsWith(s));
    if (!suffix) continue;
    const owned =
      (suffix.startsWith('__toggle') && module === 'src/components/ToggleSwitch/ToggleSwitch') ||
      (suffix === '__radio' && module === 'src/components/RadioButton/RadioButton') ||
      (suffix === '__checkbox' && module === 'src/components/Checkbox/Checkbox');
    if (owned) continue;
    const advice =
      suffix === '__check' || suffix === '__option-check'
        ? 'the chosen mark is ChosenMark (exported beside Dropdown), one class and one colour for every list and menu row'
        : 'a host draws CheckboxIndicator, RadioIndicator or SwitchIndicator rather than a copy of the control';
    report(file, sel, `styles "${sel}", a second drawing of a control part — ${advice}.`);
  }
  // 4. A second visually-hidden recipe.
  if (file !== VISUALLY_HIDDEN_SHEET && /clip:\s*rect\(0|clip-path:\s*inset\(50%\)/.test(text)) {
    const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /(^|[}\n])\s*([^{}]+?)\s*\{[^}]*(clip:\s*rect\(0|clip-path:\s*inset\(50%\))/g;
    let m;
    while ((m = re.exec(stripped))) {
      report(file, m[2].trim(), `"${m[2].trim()}" repeats the visually-hidden recipe — use the ds-visually-hidden class from ${VISUALLY_HIDDEN_SHEET}.`);
    }
  }
}

// Stale sanctions.
for (const s of SANCTIONED) {
  if (!sanctionHits.has(s)) {
    errors.push(`SANCTIONED lists ${s.file} (${s.match}), which no longer matches anything — remove the entry from scripts/validate-shared-primitives.mjs.`);
  }
}

if (errors.length) {
  console.error('✗ Shared primitives validation failed:');
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `✓ Shared primitives drawn once — ${files.length} library modules checked; ${SANCTIONED.length} sanctioned departures, each still in use.`,
);
