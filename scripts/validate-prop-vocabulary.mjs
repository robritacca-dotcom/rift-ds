#!/usr/bin/env node
/**
 * validate-prop-vocabulary.mjs
 *
 * Holds the component props to the house colour vocabulary, and holds the
 * repo's own code to the current spelling of every prop it uses. CLAUDE.md's
 * Component Anatomy section owns the rule; design.md's Components intro owns
 * the details. In short: `variant` is emphasis, `tone` is colour, a status
 * component keeps the five status roles on `variant`, and a replaced value
 * stays as a deprecated alias that renders unchanged.
 *
 *   1. Emphasis and colour do not share a union. A `variant` whose values
 *      hold an emphasis (primary, secondary, tertiary) and a colour
 *      (neutral, destructive, danger) needs a sibling `tone`, and is either
 *      deprecated as a whole or names its colour values in LEGACY_VALUES.
 *   2. The retired prop names stay retired. A prop called `priority`,
 *      `kind` or `intent` whose values are emphasis or colour words must
 *      carry `@deprecated`: `variant` and `tone` replaced them. The same
 *      name with another meaning (AttachmentTile's `kind` is a file kind)
 *      is not this rule's business.
 *   3. `tone` speaks the colour vocabulary. Its values come from
 *      COLOUR_TONES, unless the component is in SANCTIONED_TONES with its
 *      exact value set and the reason it differs. The table is held in both
 *      directions, so an entry cannot outlive the prop it sanctions.
 *   4. Legacy values are real and labelled. Every LEGACY_VALUES entry names
 *      a value its prop still accepts, and the prop's description calls it
 *      legacy, so the published contract (the .d.ts, Storybook, and the
 *      component API that /api/mcp serves) says which spelling to use.
 *   5. No internal caller uses a retired spelling. Every JSX element in
 *      src/ and website/src/ that renders a library component is read from
 *      the syntax tree; passing a prop marked `@deprecated`, or a literal
 *      LEGACY_VALUES value, fails. A component's own folder is exempt: its
 *      implementation reads the alias in order to honour it, and its stories
 *      may show it. SANCTIONED_DEPRECATED_USES records the one deliberate
 *      survivor, `state` drawing a static hover or active look on the
 *      showcase pages, and only that use: `state="default"` (a no-op) and
 *      any `"disabled"` (use `disabled`) still fail. This is the check that would have caught AlertDialog
 *      calling Button with the deprecated `priority` after the tone split
 *      shipped. ESLint's no-deprecated rule was tried for this and rejected:
 *      it also flags a component reading its own deprecated props and every
 *      third-party deprecation, which buries the one case that matters.
 *      Limits: an attribute whose value is an expression is checked only
 *      when it is a string literal, and props passed through an object
 *      (ButtonGroup's entries, a spread) are not seen.
 *
 * Runs in the validate-registry chain, after generate-component-api.mjs: it
 * reads source through the shared docgen parse (scripts/component-docgen.mjs)
 * and nothing a build produces.
 */
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { parseLibrary, repoRoot } from './component-docgen.mjs';

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

const EMPHASIS = new Set(['primary', 'secondary', 'tertiary']);
const COLOUR_WORDS = new Set(['neutral', 'destructive', 'danger']);
const COLOUR_TONES = new Set(['default', 'neutral', 'destructive']);
const RETIRED_PROP_NAMES = ['priority', 'kind', 'intent'];

/** Components whose `tone` deliberately speaks another vocabulary, with why. */
const SANCTIONED_TONES = {
  Gauge: {
    values: ['accent', 'error', 'neutral', 'positive', 'warning'],
    reason: 'a data reading coloured by status role, with the chart accent as its default',
  },
  Sparkline: {
    values: ['accent', 'error', 'negative', 'neutral', 'positive'],
    reason: 'a trend line coloured by status role, with the chart accent as its default',
  },
  Spinner: {
    values: ['default', 'inherit', 'neutral'],
    reason: '`inherit` draws in currentColor so the spinner matches the control it sits in',
  },
};

/** Deprecated props whose remaining use is deliberate, with why. */
const SANCTIONED_DEPRECATED_USES = {
  Button: { state: 'the documentation affordance for drawing a static hover or active state; only its disabled use is deprecated' },
  CircularButton: { state: 'the documentation affordance for drawing a static hover or active state; only its disabled use is deprecated' },
};

/** Single values a prop still accepts only as aliases for a newer spelling. */
const LEGACY_VALUES = {
  Button: { variant: ['destructive', 'neutral'] },
  CircularButton: { variant: ['neutral'] },
  SplitButton: { variant: ['neutral'] },
  Sparkline: { tone: ['negative'] },
};

const literalValues = (prop) =>
  (prop?.type?.value ?? [])
    .map((v) => (typeof v.value === 'string' ? v.value.replace(/^"|"$/g, '') : null))
    .filter(Boolean);

const parsed = parseLibrary();
const byName = new Map(parsed.map((c) => [c.displayName, c]));
const errors = [];

for (const component of parsed) {
  const name = component.displayName;
  const props = component.props ?? {};
  const where = `${display(component.filePath ?? '')} — ${name}`;

  /* ── 1. Emphasis and colour do not share a union ── */
  const variant = props.variant;
  if (variant) {
    const values = literalValues(variant);
    const colours = values.filter((v) => COLOUR_WORDS.has(v));
    if (values.some((v) => EMPHASIS.has(v)) && colours.length > 0) {
      if (!props.tone) {
        errors.push(
          `${where}: \`variant\` mixes emphasis and colour (${colours.join(', ')}) with no sibling ` +
            '`tone`. Move the colour onto `tone` and keep the old values as deprecated aliases.'
        );
      } else if (!variant.tags?.deprecated) {
        const listed = LEGACY_VALUES[name]?.variant ?? [];
        const unlisted = colours.filter((v) => !listed.includes(v));
        if (unlisted.length > 0) {
          errors.push(
            `${where}: \`variant\` still accepts colour value(s) ${unlisted.join(', ')}. List them in ` +
              'LEGACY_VALUES in scripts/validate-prop-vocabulary.mjs and call them legacy in the prop description.'
          );
        }
      }
    }
  }

  /* ── 2. The retired prop names stay retired ── */
  for (const retired of RETIRED_PROP_NAMES) {
    const values = literalValues(props[retired]);
    const speaksColour = values.some((v) => EMPHASIS.has(v) || COLOUR_WORDS.has(v));
    if (props[retired] && speaksColour && !props[retired].tags?.deprecated) {
      errors.push(
        `${where}: \`${retired}\` is a retired prop name. Use \`variant\` (emphasis) or \`tone\` ` +
          `(colour), and keep \`${retired}\` only as a deprecated alias with an @deprecated tag.`
      );
    }
  }

  /* ── 3. `tone` speaks the colour vocabulary ── */
  if (props.tone) {
    const values = literalValues(props.tone).sort();
    const sanctioned = SANCTIONED_TONES[name];
    if (sanctioned) {
      if (values.join('|') !== [...sanctioned.values].sort().join('|')) {
        errors.push(
          `${where}: \`tone\` is ${values.join(' | ')}, but SANCTIONED_TONES records ` +
            `${sanctioned.values.join(' | ')}. Update the entry (and its reason) or the prop.`
        );
      }
    } else {
      const strays = values.filter((v) => !COLOUR_TONES.has(v));
      if (strays.length > 0) {
        errors.push(
          `${where}: \`tone\` value(s) ${strays.join(', ')} are outside the colour vocabulary ` +
            `(${[...COLOUR_TONES].join(', ')}). Use those, or sanction the set in SANCTIONED_TONES with a reason.`
        );
      }
    }
  }
}

for (const name of Object.keys(SANCTIONED_TONES)) {
  if (!byName.get(name)?.props?.tone) {
    errors.push(`SANCTIONED_TONES names ${name}, which has no \`tone\` prop. Remove the entry.`);
  }
}

/* ── 4. Legacy values are real and labelled ── */
for (const [name, propsMap] of Object.entries(LEGACY_VALUES)) {
  const component = byName.get(name);
  if (!component) {
    errors.push(`LEGACY_VALUES names ${name}, which is not a parsed component.`);
    continue;
  }
  for (const [propName, legacy] of Object.entries(propsMap)) {
    const prop = component.props?.[propName];
    const accepted = literalValues(prop);
    for (const value of legacy) {
      if (!accepted.includes(value)) {
        errors.push(`LEGACY_VALUES lists ${name}.${propName}="${value}", which the prop no longer accepts. Remove it.`);
      }
    }
    if (prop && !/legacy/i.test(prop.description ?? '')) {
      errors.push(
        `${display(component.filePath)} — ${name}: \`${propName}\` has legacy values (${legacy.join(', ')}) ` +
          'but its description never says so. Name them as legacy and give the current spelling.'
      );
    }
  }
}

/* ── 5. No internal caller uses a retired spelling ── */
const deprecatedProps = new Map();
const ownFolders = new Map();
for (const component of parsed) {
  const names = Object.entries(component.props ?? {})
    .filter(([, prop]) => prop.tags?.deprecated)
    .map(([propName]) => propName);
  if (names.length > 0) deprecatedProps.set(component.displayName, new Set(names));
  if (component.filePath) {
    ownFolders.set(component.displayName, component.filePath.slice(0, component.filePath.lastIndexOf(sep) + 1));
  }
}
const watched = new Set([...deprecatedProps.keys(), ...Object.keys(LEGACY_VALUES)]);

const tracked = execFileSync('git', ['ls-files', 'src', 'website/src'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.tsx$/.test(f) && !f.includes('.generated.'));

let callSites = 0;
for (const file of tracked) {
  const path = join(repoRoot, file);
  const text = read(path);
  if (![...watched].some((n) => text.includes(`<${n}`))) continue;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (watched.has(tag) && !path.startsWith(ownFolders.get(tag) ?? '\0')) {
        callSites += 1;
        for (const attr of node.attributes.properties) {
          if (!ts.isJsxAttribute(attr)) continue;
          const propName = attr.name.getText(source);
          const line = source.getLineAndCharacterOfPosition(attr.getStart(source)).line + 1;
          if (deprecatedProps.get(tag)?.has(propName)) {
            const valueText = attr.initializer ? attr.initializer.getText(source) : '';
            const sanctioned =
              SANCTIONED_DEPRECATED_USES[tag]?.[propName] &&
              valueText !== '"default"' &&
              !valueText.includes('"disabled"');
            if (sanctioned) continue;
            errors.push(`${file}:${line} — <${tag} ${propName}>: \`${propName}\` is deprecated. Use its replacement (the prop's @deprecated tag names it).`);
            continue;
          }
          const legacy = LEGACY_VALUES[tag]?.[propName];
          if (!legacy || !attr.initializer) continue;
          let literal = null;
          if (ts.isStringLiteral(attr.initializer)) literal = attr.initializer.text;
          else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression && ts.isStringLiteral(attr.initializer.expression)) {
            literal = attr.initializer.expression.text;
          }
          if (literal && legacy.includes(literal)) {
            errors.push(`${file}:${line} — <${tag} ${propName}="${literal}">: a legacy value. Use the current spelling (the prop's description names it).`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (errors.length > 0) {
  console.error('✗ Prop vocabulary validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Prop vocabulary — ${parsed.length} components hold emphasis and colour apart, ` +
    `and ${callSites} internal call sites of components with deprecated spellings use the current ones.`
);
