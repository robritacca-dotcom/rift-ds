/**
 * lib/text.mjs
 *
 * Source-text helpers the scanners share. Each one is the body several
 * validators used to carry as a local copy.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */

/** CSS with every comment replaced by spaces, so offsets and line numbers hold. */
export const blankCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** JS or TS with block and line comments replaced by spaces, so offsets and line numbers hold. */
export const blankJsComments = (src) =>
  blankCssComments(src).replace(/\/\/.*$/gm, (m) => ' '.repeat(m.length));

/** The 1-based line an offset falls on. */
export const lineOf = (text, index) => text.slice(0, index).split('\n').length;
