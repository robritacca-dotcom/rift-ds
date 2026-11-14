#!/usr/bin/env node
/**
 * Holds the library to one locale rule: a component never formats in the
 * runtime's default locale (src/behaviors/locale.ts owns the rule and its
 * reason). The runtime default differs between the server and the browser,
 * so a number written with it can print `1,234` in the server's HTML and
 * `1.234` in a German browser, which breaks hydration, and the consumer
 * could not choose it either way. Every locale comes from the component's
 * `locale` prop, the nearest LocaleProvider, or `DEFAULT_LOCALE`.
 *
 * Fails, in the shipped source (src/components, src/chat, src/behaviors; not
 * stories or tests), on:
 *   1. `toLocaleString`, `toLocaleDateString` or `toLocaleTimeString` called
 *      with no locale (no argument, or `undefined` first).
 *   2. An `Intl` constructor (`NumberFormat`, `DateTimeFormat`,
 *      `RelativeTimeFormat`, `PluralRules`, `Collator`, `ListFormat`,
 *      `DisplayNames`, `Segmenter`) called with no locale.
 *   3. `localeCompare` with one argument, which compares in the runtime's
 *      locale.
 *   4. A hand-written month or weekday name, which hard-codes English where
 *      `Intl` would write the locale's (`weekdayNamesIn` in
 *      src/behaviors/locale.ts, or `Intl.DateTimeFormat` for months).
 *   5. A file without 'use client' calling `useLocale`: a provider is React
 *      context, which a Server Component cannot read, so a server-renderable
 *      component takes `locale` as a prop with DEFAULT_LOCALE behind it
 *      (the same split LinkProvider makes).
 * Each check honours SANCTIONED, keyed by file and check with the reason, and
 * a sanction that no longer matches anything fails too, so the table never
 * outlives the code it excuses.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { display, fromRoot, read, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';
import { blankJsComments, lineOf } from './lib/text.mjs';

/** File (repo-relative) → check → why the hand-written form is right there. */
const SANCTIONED = {
  'src/components/DatePicker/calendar.ts': {
    names: 'the two-letter English weekday headers DatePicker and DateRangePicker share ("Su" to "Sa") have no Intl width; every other language reads Intl',
  },
};

const INTL = ['NumberFormat', 'DateTimeFormat', 'RelativeTimeFormat', 'PluralRules', 'Collator', 'ListFormat', 'DisplayNames', 'Segmenter'];
const TO_LOCALE = /\.(toLocaleString|toLocaleDateString|toLocaleTimeString)\(/g;
const INTL_CALL = new RegExp(`\\bIntl\\.(${INTL.join('|')})\\(`, 'g');
const LOCALE_COMPARE = /\.localeCompare\(/g;
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const WEEKDAYS = 'Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday';
const NAMES = new RegExp(
  `['"\`](?:${MONTHS}|${WEEKDAYS})['"\`]|\\[\\s*['"\`](?:Su|Sun|Mo|Mon)['"\`]\\s*,\\s*['"\`](?:Mo|Mon|Tu|Tue)['"\`]|\\[\\s*['"\`](?:Jan)['"\`]\\s*,\\s*['"\`]Feb['"\`]`,
  'g',
);

/** The text between the call's parentheses, from `start` (just past the open paren). */
function argsOf(src, start) {
  let depth = 1;
  for (let i = start; i < src.length; i += 1) {
    const c = src[i];
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(start, i);
    }
  }
  return src.slice(start);
}

/** How many arguments a call's text holds, counting only top-level commas. */
function argCount(args) {
  if (args.trim() === '') return 0;
  let depth = 0;
  let count = 1;
  for (const c of args) {
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') depth -= 1;
    else if (c === ',' && depth === 0) count += 1;
  }
  return count;
}

const noLocale = (args) => argCount(args) === 0 || /^\s*undefined\s*(,|$)/.test(args);

/** Source modules, without stories and tests. */
const isSource = (name) => /\.tsx?$/.test(name) && !/\.(stories|test)\.tsx?$/.test(name);

const errors = [];
const matched = new Set();
let scanned = 0;

const report = (path, check, line, message) => {
  if (SANCTIONED[path]?.[check]) {
    matched.add(`${path}#${check}`);
    return;
  }
  errors.push(`${path}:${line} ${message}`);
};

for (const dir of ['components', 'chat', 'behaviors']) {
  for (const file of walk(fromRoot('src', dir), isSource)) {
    scanned += 1;
    const path = display(file);
    const raw = read(file);
    const src = blankJsComments(raw);

    for (const m of src.matchAll(TO_LOCALE)) {
      if (noLocale(argsOf(src, m.index + m[0].length))) {
        report(path, 'format', lineOf(src, m.index), `calls ${m[1]}() without a locale. Pass the resolved locale (useLocale(localeProp) in a client component, the \`locale\` prop with DEFAULT_LOCALE in a server one).`);
      }
    }
    for (const m of src.matchAll(INTL_CALL)) {
      if (noLocale(argsOf(src, m.index + m[0].length))) {
        report(path, 'format', lineOf(src, m.index), `constructs Intl.${m[1]} without a locale, which takes the runtime's default. Pass the resolved locale.`);
      }
    }
    for (const m of src.matchAll(LOCALE_COMPARE)) {
      if (argCount(argsOf(src, m.index + m[0].length)) < 2) {
        report(path, 'compare', lineOf(src, m.index), `calls localeCompare without a locale. Pass the resolved locale, use an Intl.Collator built with it, or compare code points when the order is not shown to anyone.`);
      }
    }
    const useLocaleCall = src.search(/\buseLocale\(/);
    if (useLocaleCall !== -1 && !/^\s*['"]use client['"]/.test(raw) && !path.endsWith('LocaleProvider.tsx')) {
      report(path, 'server', lineOf(src, useLocaleCall), `calls useLocale() without 'use client': it can render on the server, where no LocaleProvider can be read. Take \`locale\` as a prop with DEFAULT_LOCALE behind it.`);
    }
    for (const m of src.matchAll(NAMES)) {
      report(path, 'names', lineOf(src, m.index), `writes a month or weekday name by hand (${m[0].trim()}). Read it from Intl in the resolved locale (weekdayNamesIn in src/behaviors/locale.ts, or Intl.DateTimeFormat), or sanction it in SANCTIONED with the reason.`);
    }
  }
}

for (const [path, checks] of Object.entries(SANCTIONED)) {
  for (const check of Object.keys(checks)) {
    if (!matched.has(`${path}#${check}`)) {
      errors.push(`SANCTIONED excuses "${check}" in ${path}, but the file has no such case: remove the entry.`);
    }
  }
}

finish(
  '✗ Locale formatting validation failed:',
  errors,
  `✓ Every locale is the consumer's — ${scanned} files scanned, ${matched.size} sanctioned hand-written forms`
);
