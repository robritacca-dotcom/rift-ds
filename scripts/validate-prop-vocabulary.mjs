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
 *   5. No internal caller uses a retired spelling. Every tracked .ts and
 *      .tsx file in src/ and website/src/ is read from the syntax tree, and
 *      every call site of a library component in it is checked: passing a
 *      prop marked `@deprecated`, or a LEGACY_VALUES value, fails. A call
 *      site is a JSX element; a story's `args` (for the component its
 *      `typeof X` type, a sibling `component:` or the meta names); an object
 *      literal declared as `XProps`, `XProps[]` or `Array<XProps>` (array
 *      elements and the object a `.map(() => ({ ... }))` returns included);
 *      and the entries handed to a prop typed as another component's props
 *      (ButtonGroup's and Nav's `buttons: ButtonProps[]`), followed through a
 *      local constant. A value counts as every literal it can take, so a
 *      conditional's string branches are each checked
 *      (`state={x ? "active" : "default"}` fails on "default"). A component's
 *      implementation files are exempt, because they read the alias in order
 *      to honour it; its stories are not, because stories teach the API.
 *      SANCTIONED_DEPRECATED_USES records the deliberate survivors with their
 *      exact values: `state` drawing a static hover or active look, and
 *      Button's `text={false}` for an icon-only button until the next major.
 *      `state="default"` (a no-op), any `"disabled"` (use `disabled`) and
 *      `text` (true, the default) still fail. This is the check that would
 *      have caught AlertDialog calling Button with the deprecated `priority`
 *      after the tone split shipped. ESLint's no-deprecated rule was tried
 *      for this and rejected: it also flags a component reading its own
 *      deprecated props and every third-party deprecation, which buries the
 *      one case that matters. Limits: an expression that is not a literal or
 *      a conditional of literals (an identifier, a member access) is unknown
 *      and passes; a spread is not followed; an object literal is a call
 *      site only through the typed contexts above; and a deprecated field of
 *      a data type rather than a component prop (ThreadPanelThread's
 *      `unread`) is outside docgen's props, so it is not seen.
 *   6. State a consumer can own comes in a controlled/uncontrolled pair:
 *      a prop with a change callback also takes its `default*` partner,
 *      unless it is deprecated, the component's native props are a form
 *      element's (the native default reaches it), or
 *      SANCTIONED_CONTROLLED_ONLY records why it is controlled by design.
 *   7. Sizes speak the density vocabulary (default, compact), unless
 *      SANCTIONED_SIZES records a real scale of the component's own.
 *   8. A `variant` that is neither emphasis nor the status roles picks the
 *      component's form, and SANCTIONED_FORM_VARIANTS records its values.
 *
 * Runs in the validate-registry chain, after generate-component-api.mjs: it
 * reads source through the shared docgen parse (scripts/component-docgen.mjs)
 * and nothing a build produces.
 */
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
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

/**
 * Deprecated props whose remaining use is deliberate: the exact values that
 * stay sanctioned, with why. Any other literal fails, a bare attribute
 * included (it means `true`). An expression the syntax cannot evaluate
 * (`state={row.state}`) passes, but its literal branches are still checked.
 * Held in both directions: an entry whose prop is no longer deprecated fails.
 */
const STATIC_STATE = {
  values: ['hover', 'active'],
  reason:
    'the documentation affordance for drawing a static hover or active state, which also marks the current page ' +
    'in a nav button set; "disabled" is the `disabled` prop and "default" a no-op',
};
const SANCTIONED_DEPRECATED_USES = {
  Button: {
    state: STATIC_STATE,
    text: {
      values: [false],
      reason:
        'an icon-only button has no other spelling until `label` loses its default in the next major; ' +
        '`text` (true) is already the default and never needs passing',
    },
  },
  CircularButton: { state: STATIC_STATE },
};

/** Single values a prop still accepts only as aliases for a newer spelling. */
const LEGACY_VALUES = {
  Button: { variant: ['destructive', 'neutral'] },
  CircularButton: { variant: ['neutral'] },
  SplitButton: { variant: ['neutral'] },
  Sparkline: { tone: ['negative'] },
  AgentStatus: { size: ['sm', 'md'] },
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
    // Compare on forward slashes: docgen hands back `/` paths on every
    // platform, so slicing on the native separator found no folder on
    // Windows and every file then counted as the component's own.
    const filePath = component.filePath.replaceAll('\\', '/');
    ownFolders.set(component.displayName, filePath.slice(0, filePath.lastIndexOf('/') + 1));
  }
}
const watched = new Set([...deprecatedProps.keys(), ...Object.keys(LEGACY_VALUES)]);
for (const [name, propsMap] of Object.entries(SANCTIONED_DEPRECATED_USES)) {
  for (const propName of Object.keys(propsMap)) {
    if (!deprecatedProps.get(name)?.has(propName)) {
      errors.push(`SANCTIONED_DEPRECATED_USES names ${name}.${propName}, which is not a deprecated prop. Remove the entry.`);
    }
  }
}

/*
 * A prop whose type is another component's props (ButtonGroup's and Nav's
 * `buttons: ButtonProps[]`) hands that component its entries, so an array of
 * object literals passed there is checked as that component's call sites.
 * Read from the docgen type name; a Pick<> or Omit<> of the props is not
 * followed.
 */
const PROPS_TYPE = /^(?:(?:Readonly)?Array<)?([A-Z]\w*?)Props(\[\]|>)?$/;
const componentOfPropsType = (typeText) => {
  const match = PROPS_TYPE.exec(typeText.replace(/\s+/g, ''));
  if (!match || !byName.has(match[1])) return null;
  return { component: match[1], array: Boolean(match[2]) };
};
const nestedProps = new Map();
for (const component of parsed) {
  for (const [propName, prop] of Object.entries(component.props ?? {})) {
    const nested = componentOfPropsType(prop.type?.name ?? '');
    if (nested) {
      if (!nestedProps.has(component.displayName)) nestedProps.set(component.displayName, new Map());
      nestedProps.get(component.displayName).set(propName, nested);
    }
  }
}
// Every component whose call sites can reach a watched one, directly or
// through a nested props array.
const relevant = new Set(watched);
for (let grew = true; grew; ) {
  grew = false;
  for (const [name, map] of nestedProps) {
    if (!relevant.has(name) && [...map.values()].some((n) => relevant.has(n.component))) {
      relevant.add(name);
      grew = true;
    }
  }
}

const tracked = execFileSync('git', ['ls-files', 'src', 'website/src'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.d.ts') && !f.includes('.generated.'));

/** Strip the wrappers that do not change a value: parentheses, `as`, `satisfies`, `!`. */
const unwrap = (node) => {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isTypeAssertionExpression(node))
  ) {
    node = node.expression;
  }
  return node;
};

/**
 * The literal values an expression can take, as far as the syntax says:
 * a string, `true` or `false`, or every branch of a conditional (so
 * `state={x ? "active" : "default"}` yields both). `known` is false when some
 * branch is not a literal (an identifier, a call), whose value is unknown.
 */
const literalsOf = (expression) => {
  const node = unwrap(expression);
  if (!node) return { values: [], known: false };
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return { values: [node.text], known: true };
  if (node.kind === ts.SyntaxKind.TrueKeyword) return { values: [true], known: true };
  if (node.kind === ts.SyntaxKind.FalseKeyword) return { values: [false], known: true };
  if (ts.isConditionalExpression(node)) {
    const a = literalsOf(node.whenTrue);
    const b = literalsOf(node.whenFalse);
    return { values: [...a.values, ...b.values], known: a.known && b.known };
  }
  if (ts.isIdentifier(node) && node.text === 'undefined') return { values: [], known: true };
  return { values: [], known: false };
};

const show = (value) => (typeof value === 'string' ? `"${value}"` : `{${value}}`);

let callSites = 0;
for (const file of tracked) {
  const path = join(repoRoot, file);
  const text = read(path);
  if (![...relevant].some((n) => text.includes(n))) continue;
  const isTsx = file.endsWith('.tsx');
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const posix = path.replaceAll('\\', '/');
  // Stories teach the API, so only a component's implementation files are
  // exempt from reading their own deprecated props, never its stories.
  const isStory = /\.stories\.tsx?$/.test(file);
  const ownFile = (tag) => !isStory && posix.startsWith(ownFolders.get(tag) ?? '\0');
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  // Local constants, so `buttons: siteNavButtons` can be followed to its
  // array literal. A name declared twice in the file is ambiguous and skipped.
  const locals = new Map();
  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      locals.set(node.name.text, locals.has(node.name.text) ? null : node.initializer);
    }
    ts.forEachChild(node, collect);
  };
  collect(source);
  const resolve = (expression) => {
    let node = unwrap(expression);
    for (let hops = 0; node && ts.isIdentifier(node) && locals.get(node.text) && hops < 4; hops += 1) {
      node = unwrap(locals.get(node.text));
    }
    return node;
  };

  /**
   * One call site: the props `tag` receives, as [name, value expression or
   * null for a bare JSX attribute, node for the line]. `label` renders the
   * site in an error.
   */
  const checkProps = (tag, entries, label) => {
    if (!relevant.has(tag)) return;
    callSites += 1;
    const own = ownFile(tag);
    for (const [propName, value, node] of entries) {
      const line = lineOf(node);
      const where = `${file}:${line} — ${label(propName)}`;
      const literals = value ? literalsOf(value) : { values: [true], known: true };
      if (!own && deprecatedProps.get(tag)?.has(propName)) {
        const sanction = SANCTIONED_DEPRECATED_USES[tag]?.[propName];
        const sanctioned = sanction && literals.values.every((v) => sanction.values.includes(v)) &&
          (literals.values.length > 0 || !literals.known);
        if (!sanctioned) {
          const offending = sanction ? literals.values.filter((v) => !sanction.values.includes(v)) : [];
          errors.push(
            sanction
              ? `${where}: ${offending.map(show).join(' | ') || 'this value'} is a deprecated use; only ` +
                  `${sanction.values.map(show).join(' | ')} stay sanctioned (SANCTIONED_DEPRECATED_USES). ` +
                  "Use the replacement the prop's @deprecated tag names, or drop a no-op."
              : `${where}: \`${propName}\` is deprecated. Use its replacement (the prop's @deprecated tag names it).`
          );
        }
        continue;
      }
      const legacy = LEGACY_VALUES[tag]?.[propName];
      if (!own && legacy) {
        for (const literal of literals.values) {
          if (legacy.includes(literal)) {
            errors.push(`${where}: ${show(literal)} is a legacy value. Use the current spelling (the prop's description names it).`);
          }
        }
      }
      const nested = nestedProps.get(tag)?.get(propName);
      if (nested && value) checkPropsValue(nested, value);
    }
  };

  /** Check an object literal of props for `component`, or an array of them. */
  const checkPropsValue = ({ component, array }, expression) => {
    const node = resolve(expression);
    if (!node) return;
    if (array && ts.isArrayLiteralExpression(node)) {
      for (const element of node.elements) checkPropsValue({ component, array: false }, element);
      return;
    }
    // `links.map((link) => ({ ... }))`: the object each entry becomes.
    if (array && ts.isCallExpression(node) && node.arguments.length > 0) {
      const callback = unwrap(node.arguments[0]);
      if (ts.isArrowFunction(callback) && !ts.isBlock(callback.body)) {
        checkPropsValue({ component, array: false }, callback.body);
      }
      return;
    }
    if (!array && ts.isObjectLiteralExpression(node)) checkObject(component, node);
  };

  const checkObject = (component, object) => {
    const entries = [];
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name;
      const propName = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : null;
      if (propName) entries.push([propName, property.initializer, property]);
    }
    checkProps(component, entries, (propName) => `${component} props \`${propName}\``);
  };

  // A story file's default component: the meta's `component:`.
  let metaComponent = null;
  if (isStory) {
    const findMeta = (node) => {
      if (metaComponent) return;
      if (
        ts.isPropertyAssignment(node) &&
        node.name.getText(source) === 'component' &&
        ts.isIdentifier(node.initializer) &&
        byName.has(node.initializer.text)
      ) {
        metaComponent = node.initializer.text;
        return;
      }
      ts.forEachChild(node, findMeta);
    };
    findMeta(source);
  }

  /** The component a story's `args` belong to: its own `typeof X` type, a sibling `component:`, or the meta's. */
  const storyComponent = (argsProperty) => {
    const sibling = argsProperty.parent.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === 'component' && ts.isIdentifier(p.initializer),
    );
    if (sibling && byName.has(sibling.initializer.text)) return sibling.initializer.text;
    for (let node = argsProperty.parent; node; node = node.parent) {
      if (ts.isVariableDeclaration(node)) {
        const init = node.initializer;
        const typeText = [node.type, init && ts.isSatisfiesExpression(init) ? init.type : null]
          .filter(Boolean)
          .map((t) => t.getText(source))
          .join(' ');
        const named = /typeof\s+(\w+)/.exec(typeText)?.[1];
        if (named && byName.has(named)) return named;
        break;
      }
    }
    return metaComponent;
  };

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      const entries = [];
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const value = !attr.initializer
          ? null
          : ts.isJsxExpression(attr.initializer)
            ? attr.initializer.expression
            : attr.initializer;
        entries.push([attr.name.getText(source), value, attr]);
      }
      checkProps(tag, entries, (propName) => `<${tag} ${propName}>`);
    } else if (ts.isVariableDeclaration(node) && node.type && node.initializer) {
      // `const buttons: ButtonProps[] = [...]`: entries typed as a component's props.
      const typed = componentOfPropsType(node.type.getText(source));
      if (typed && relevant.has(typed.component)) checkPropsValue(typed, node.initializer);
    } else if (
      isStory &&
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === 'args' &&
      ts.isObjectLiteralExpression(unwrap(node.initializer)) &&
      ts.isObjectLiteralExpression(node.parent)
    ) {
      const component = storyComponent(node);
      if (component) checkObject(component, unwrap(node.initializer));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}


/* ── 6. State a consumer can own comes in a controlled/uncontrolled pair ── */

/*
 * CLAUDE.md's pair convention: a prop `x` with a change callback (`onXChange`,
 * or `onValueChange` / `onCheckedChange` / `onValuesChange` for `value` /
 * `checked` / `values`) is state the consumer can own, so it also takes
 * `defaultX` and works with `x` omitted. Before 2026-10-21 a dozen form
 * controls only worked controlled. Exempt:
 *   - a deprecated prop (an alias of a pair that exists under the new name);
 *   - a component whose native props are an <input>, <textarea> or <select>
 *     element's: the native `defaultValue` / `defaultChecked` reach the
 *     element through the rest spread, so uncontrolled use already works;
 *   - SANCTIONED_CONTROLLED_ONLY, the components fully controlled by design,
 *     each with the reason (its design.md spec says the same).
 */
const SANCTIONED_CONTROLLED_ONLY = {
  Dialog: 'a modal is opened by the host; it has no trigger of its own to hold open state for',
  Drawer: 'a modal is opened by the host; it has no trigger of its own to hold open state for',
  AlertDialog: 'a modal is opened by the host; it has no trigger of its own to hold open state for',
  Lightbox: 'a modal is opened by the host; it has no trigger of its own to hold open state for',
  AttachmentViewer: 'a modal is opened by the host; it has no trigger of its own to hold open state for',
  CommandPalette: 'a modal opened by the host or its own hotkey, which reports through onOpenChange for the host to hold',
  InterruptCard: 'fully controlled and stateless by design: the host owns the decision it records (design.md)',
  QuestionCard: 'fully controlled by design: the answers belong to the chat turn the host keeps (design.md)',
  ThreadPanel: 'fully controlled and stateless by design: the host owns selection, expansion and rename state (design.md)',
  RadioButton: "a radio's checked state belongs to its group, and RadioGroup carries the uncontrolled pair (design.md)",
  PromptSuggestions: 'value records a choice the host already acted on; the row never latches one itself (design.md)',
  ArtifactPanel: "the host owns the seat's size; expanded only names the toggle (design.md)",
  AgentRail: 'fully controlled and hook-free by design, so a rail with static panes renders from a Server Component (design.md)',
  ChatArtifactPane: "the widget owns the seat's size and passes expanded straight to ArtifactPanel (design.md)",
};
const capital = (name) => name[0].toUpperCase() + name.slice(1);
const NATIVE_FORM_ELEMENT = /ComponentPropsWithoutRef<'(input|textarea|select)'>/;
const callbacksFor = (name) =>
  [`on${capital(name)}Change`].concat(
    name === 'value' ? ['onValueChange'] : name === 'checked' ? ['onCheckedChange'] : name === 'values' ? ['onValuesChange'] : [],
  );
let statePairs = 0;
const usedControlledOnly = new Set();
for (const component of parsed) {
  const props = component.props ?? {};
  const names = new Set(Object.keys(props));
  const source = component.filePath ? read(component.filePath) : '';
  for (const [name, prop] of Object.entries(props)) {
    if (/^(on|default)[A-Z]/.test(name)) continue;
    if (!callbacksFor(name).some((cb) => names.has(cb))) continue;
    if (prop.tags && 'deprecated' in prop.tags) continue;
    statePairs += 1;
    if (names.has(`default${capital(name)}`)) continue;
    if (NATIVE_FORM_ELEMENT.test(source)) continue;
    if (SANCTIONED_CONTROLLED_ONLY[component.displayName]) {
      usedControlledOnly.add(component.displayName);
      continue;
    }
    errors.push(
      `${component.displayName}.${name} is state a consumer can own (it has a change callback) but has no ` +
        `\`default${capital(name)}\`, so the component only works controlled. Add the uncontrolled half ` +
        `(CLAUDE.md, Component Anatomy: the controlled/uncontrolled pair convention), or, when it is fully ` +
        `controlled by design, say so in its design.md spec and in SANCTIONED_CONTROLLED_ONLY.`
    );
  }
}
for (const name of Object.keys(SANCTIONED_CONTROLLED_ONLY)) {
  if (!usedControlledOnly.has(name)) {
    errors.push(`SANCTIONED_CONTROLLED_ONLY lists ${name}, which no longer has a controlled-only prop: remove the entry.`);
  }
}

/* ── 7. Sizes speak the density vocabulary ── */

/*
 * The library's size axis is density: `default` and `compact`, the pair
 * the theme's density lever and every form control share. A component with a
 * real scale of its own (an avatar ladder, a panel width, a platform's own
 * app-bar sizes) keeps it, sanctioned here with its exact values and why; the
 * table is held in both directions. Legacy values in LEGACY_VALUES are exempt.
 */
const SIZE_VOCABULARY = new Set(['default', 'compact']);
const SANCTIONED_SIZES = {
  Avatar: { values: ['sm', 'md', 'lg'], reason: 'a ladder of mark sizes, not density' },
  AvatarGroup: { values: ['sm', 'md', 'lg'], reason: "matches Avatar's ladder" },
  PixelAvatar: { values: ['sm', 'md', 'lg', 'xl'], reason: "Avatar's ladder plus a hero step" },
  StatusDot: { values: ['xs', 'sm', 'md', 'lg'], reason: 'a ladder of dot sizes, not density' },
  Dialog: { values: ['sm', 'md', 'lg'], reason: 'panel widths, not density' },
  Drawer: { values: ['sm', 'md', 'lg'], reason: 'panel widths, not density' },
  Spinner: { values: ['sm', 'md', 'lg'], reason: 'glyph sizes, not density' },
  Chip: { values: ['large'], reason: 'one step beyond default for a prominent filter, alongside default and compact' },
  Stat: { values: ['large'], reason: 'a hero figure, one step beyond default' },
  Prose: { values: ['sm'], reason: 'a smaller reading measure for asides, alongside default' },
  TopAppBar: { values: ['small', 'medium', 'large'], reason: "the platform's own app-bar sizes, restated for fidelity (design.md's platform exception)" },
};
let sizeProps = 0;
const usedSizes = new Set();
for (const component of parsed) {
  const prop = component.props?.size;
  if (!prop || (prop.tags && 'deprecated' in prop.tags)) continue;
  const values = literalValues(prop);
  if (values.length === 0) continue; // a number (Gauge's diameter) is a measurement, not a vocabulary
  sizeProps += 1;
  const legacy = new Set(LEGACY_VALUES[component.displayName]?.size ?? []);
  const outside = values.filter((v) => !SIZE_VOCABULARY.has(v) && !legacy.has(v));
  const sanction = SANCTIONED_SIZES[component.displayName];
  if (sanction) usedSizes.add(component.displayName);
  if (outside.length === 0) {
    if (sanction) errors.push(`${component.displayName}.size now speaks default/compact only: remove its SANCTIONED_SIZES entry.`);
    continue;
  }
  const allowed = new Set(sanction?.values ?? []);
  const unsanctioned = outside.filter((v) => !allowed.has(v));
  if (unsanctioned.length > 0) {
    errors.push(
      `${component.displayName}.size uses ${unsanctioned.map((v) => `"${v}"`).join(', ')}, outside the density vocabulary ` +
        `(default, compact). Use those, or sanction a real scale of its own in SANCTIONED_SIZES with the reason.`
    );
  }
  for (const v of allowed) {
    if (!outside.includes(v)) errors.push(`SANCTIONED_SIZES lists "${v}" for ${component.displayName}, which its size no longer accepts.`);
  }
}
for (const name of Object.keys(SANCTIONED_SIZES)) {
  if (!usedSizes.has(name)) errors.push(`SANCTIONED_SIZES lists ${name}, which has no literal size prop: remove the entry.`);
}

/* ── 8. A variant outside emphasis and status is a recorded form ── */

/*
 * `variant` carries emphasis, or a status-bearing component's five roles
 * (design.md's Components intro). A component with no emphasis to express
 * may use it for its form instead (a bordered or plain chrome, a list or a
 * floating layout), and SANCTIONED_FORM_VARIANTS records each with its exact
 * values, held in both directions, so a new one is a decision rather than a
 * drift. Legacy values in LEGACY_VALUES are exempt.
 */
const EMPHASIS_VALUES = new Set(['default', ...EMPHASIS]);
const STATUS_VALUES = new Set(['default', 'info', 'positive', 'warning', 'error', 'neutral']);
const FORM = 'picks the component\'s form, which it has instead of an emphasis';
const SANCTIONED_FORM_VARIANTS = {
  AgentStatus: { values: ['inline', 'bar'], reason: FORM },
  AnchorNav: { values: ['list', 'floating'], reason: FORM },
  Card: { values: ['default', 'case-study'], reason: FORM },
  EmptyState: { values: ['plain', 'bordered'], reason: FORM },
  PixelAvatar: { values: ['plain', 'tile'], reason: FORM },
  QuestionSummary: { values: ['plain', 'card'], reason: FORM },
  Quote: { values: ['default', 'pull'], reason: FORM },
  Skeleton: { values: ['text', 'circular', 'rectangular'], reason: 'the placeholder\'s shape, which it has instead of an emphasis' },
  Sparkline: { values: ['area', 'line'], reason: 'the chart form, which it has instead of an emphasis' },
  Timeline: { values: ['default', 'company'], reason: FORM },
  Toolbar: { values: ['default', 'floating'], reason: FORM },
};
const usedForms = new Set();
for (const component of parsed) {
  const prop = component.props?.variant;
  if (!prop || (prop.tags && 'deprecated' in prop.tags)) continue;
  const legacy = new Set(LEGACY_VALUES[component.displayName]?.variant ?? []);
  const values = literalValues(prop).filter((v) => !legacy.has(v));
  if (values.length === 0 || values.every((v) => EMPHASIS_VALUES.has(v)) || values.every((v) => STATUS_VALUES.has(v))) {
    if (SANCTIONED_FORM_VARIANTS[component.displayName]) {
      errors.push(`${component.displayName}.variant is emphasis or status now: remove its SANCTIONED_FORM_VARIANTS entry.`);
    }
    continue;
  }
  const sanction = SANCTIONED_FORM_VARIANTS[component.displayName];
  if (sanction) usedForms.add(component.displayName);
  const same = sanction && sanction.values.length === values.length && sanction.values.every((v) => values.includes(v));
  if (!same) {
    errors.push(
      `${component.displayName}.variant is ${values.map((v) => `"${v}"`).join(' | ')}: neither emphasis nor the status roles. ` +
        `If it picks the component's form, record its exact values in SANCTIONED_FORM_VARIANTS; if it is colour, it belongs on \`tone\`.`
    );
  }
}
for (const name of Object.keys(SANCTIONED_FORM_VARIANTS)) {
  if (!usedForms.has(name) && !errors.some((e) => e.startsWith(`${name}.variant`))) {
    errors.push(`SANCTIONED_FORM_VARIANTS lists ${name}, which no longer has a form variant: remove the entry.`);
  }
}

if (errors.length > 0) {
  console.error('✗ Prop vocabulary validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Prop vocabulary — ${parsed.length} components hold emphasis and colour apart, ` +
    `${callSites} internal call sites of components with deprecated spellings use the current ones, ` +
    `${statePairs} pieces of ownable state each come in a controlled/uncontrolled pair or are sanctioned, ` +
    `and ${sizeProps} size props speak the density pair or a sanctioned scale.`
);
