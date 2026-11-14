/**
 * lib/screens.mjs
 *
 * The two screens every published text surface is held to, in one place.
 * Seven validators used to carry their own copy of the leak patterns and
 * two their own copy of the hole patterns, and the copies had drifted.
 *
 * Leaks: details that must never reach a stranger's agent or a visitor. A
 * local absolute path (which carries a machine username), an analytics
 * property id, an API key, an email address. A caller words its own error
 * and decides what a hit means: the site corpus sanctions an address a
 * page deliberately publishes through corpus-facts(), and nothing else
 * sanctions anything.
 *
 * Holes: the punctuation a dropped inline value leaves behind ("save it at
 * your project root as ."). INLINE_VALUES in
 * scripts/generate-site-corpus.mjs owns the rules that prevent one; this
 * is the backstop on the text itself.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */

/** [id, pattern, what it is]. The id lets a caller treat one kind apart. */
export const LEAK_PATTERNS = [
  ['path', /\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  // One backslash in plain text, two where the text is a JSON string.
  ['drive', /[A-Za-z]:\\{1,2}Users\\/g, 'local absolute path (drive letter)'],
  ['analytics', /property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  ['key', /sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  ['email', /\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];

/**
 * Every leak in `text`, in pattern order: `{ id, what, text, shown }`,
 * where `shown` is the match quoted and cut short for an error message.
 * `skip` names pattern ids a caller does not hold its surface to.
 */
export function leaksIn(text, { skip = [] } = {}) {
  const found = [];
  for (const [id, pattern, what] of LEAK_PATTERNS) {
    if (skip.includes(id)) continue;
    for (const match of text.matchAll(pattern)) {
      found.push({ id, what, text: match[0], shown: JSON.stringify(match[0].slice(0, 40)) });
    }
  }
  return found;
}

const HOLE_PATTERNS = [/[\w)\]`'"’] [,.;:](?=\s|$)/g, /: [,.;](?=\s|$)/g];

/** Every hole in `text`, as the quoted run of text around it. */
export function holesIn(text) {
  const found = [];
  for (const pattern of HOLE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      found.push(JSON.stringify(text.slice(Math.max(0, match.index - 50), match.index + 10)));
    }
  }
  return found;
}
